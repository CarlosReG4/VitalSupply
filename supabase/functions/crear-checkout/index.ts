// supabase/functions/crear-checkout/index.ts
// Crea una sesión de Stripe Checkout. Los PRECIOS se leen de la base de datos
// (nunca del navegador) para que no se puedan manipular.

import Stripe from "npm:stripe@16";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

// Cliente con service_role: puede leer precios y escribir en `ordenes` saltando RLS.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { items } = await req.json(); // [{ mi_sku, cantidad }]

    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "El carrito está vacío." }, 400);
    }

    // Normalizamos: SKU único + cantidad mínima 1
    const cantidadPorSku = new Map<string, number>();
    for (const it of items) {
      const sku = String(it?.mi_sku ?? "").trim();
      const cant = Math.max(1, Number(it?.cantidad) || 1);
      if (sku) cantidadPorSku.set(sku, (cantidadPorSku.get(sku) ?? 0) + cant);
    }
    const skus = [...cantidadPorSku.keys()];
    if (skus.length === 0) return json({ error: "SKUs inválidos." }, 400);

    // Traemos precios REALES de la base. Solo productos surtibles.
    const { data: productos, error } = await supabase
      .from("productos_medicos_v2")
      .select("mi_sku, nombre, precio, precio_venta_sugerido, tiene_proveedor")
      .in("mi_sku", skus)
      .eq("tiene_proveedor", true);

    if (error) throw error;
    if (!productos || productos.length === 0) {
      return json({ error: "Ningún producto del carrito está disponible para compra." }, 400);
    }

    const line_items = [];
    const itemsOrden = [];
    let totalUsd = 0;

    for (const p of productos) {
      const cantidad = cantidadPorSku.get(p.mi_sku) ?? 1;
      const precio = Number(p.precio_venta_sugerido ?? p.precio ?? 0);
      if (precio <= 0) continue; // saltamos precios inválidos

      totalUsd += precio * cantidad;
      itemsOrden.push({
        mi_sku: p.mi_sku,
        nombre: p.nombre,
        cantidad,
        precio_unitario: precio,
      });

      line_items.push({
        quantity: cantidad,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(precio * 100), // Stripe usa centavos
          product_data: { name: p.nombre, metadata: { mi_sku: p.mi_sku } },
        },
      });
    }

    if (line_items.length === 0) {
      return json({ error: "No hay productos con precio válido para cobrar." }, 400);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Pide y valida la dirección de envío en el checkout de Stripe.
      shipping_address_collection: {
        allowed_countries: ["MX", "US"],
      },
      // Pide el teléfono (útil para coordinar la entrega).
      phone_number_collection: { enabled: true },
      success_url: `${SITE_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pago-cancelado`,
    });

    // Guardamos la orden como pendiente. Se marca "pagada" en el webhook.
    await supabase.from("ordenes").insert({
      stripe_session_id: session.id,
      estado: "pendiente",
      total_usd: Number(totalUsd.toFixed(2)),
      items: itemsOrden,
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("crear-checkout error:", err);
    return json({ error: "No se pudo iniciar el pago." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}