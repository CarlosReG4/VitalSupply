// supabase/functions/crear-orden-paypal/index.ts
// Crea una orden de PayPal. Los PRECIOS se leen de la base de datos
// (nunca del navegador) para que no se puedan manipular.
// Mismo patrón y misma fuente de precios que crear-checkout (Stripe).

import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Cliente con service_role: lee precios y escribe en `ordenes` saltando RLS.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PAYPAL_API = Deno.env.get("PAYPAL_API_BASE") ?? "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET")!;

// Token OAuth de PayPal (client_credentials).
async function getAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

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

    // Precios REALES de la base. Solo productos surtibles. (Igual que crear-checkout.)
    const { data: productos, error } = await supabase
      .from("productos_medicos_v2")
      .select("mi_sku, nombre, precio, precio_venta_sugerido, tiene_proveedor")
      .in("mi_sku", skus)
      .eq("tiene_proveedor", true);

    if (error) throw error;
    if (!productos || productos.length === 0) {
      return json({ error: "Ningún producto del carrito está disponible para compra." }, 400);
    }

    const ppItems: unknown[] = [];
    const itemsOrden: unknown[] = [];
    let totalCents = 0;

    for (const p of productos) {
      const cantidad = cantidadPorSku.get(p.mi_sku) ?? 1;
      const precio = Number(p.precio_venta_sugerido ?? p.precio ?? 0);
      if (precio <= 0) continue; // saltamos precios inválidos

      const unitCents = Math.round(precio * 100);
      totalCents += unitCents * cantidad;

      itemsOrden.push({
        mi_sku: p.mi_sku,
        nombre: p.nombre,
        cantidad,
        precio_unitario: unitCents / 100,
      });

      ppItems.push({
        name: String(p.nombre).slice(0, 127),
        quantity: String(cantidad),
        sku: String(p.mi_sku).slice(0, 127),
        unit_amount: { currency_code: "USD", value: (unitCents / 100).toFixed(2) },
      });
    }

    if (ppItems.length === 0) {
      return json({ error: "No hay productos con precio válido para cobrar." }, 400);
    }

    const totalValue = (totalCents / 100).toFixed(2);
    const token = await getAccessToken();

    // Creamos la orden de PayPal (intent CAPTURE).
    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: totalValue,
            breakdown: { item_total: { currency_code: "USD", value: totalValue } },
          },
          items: ppItems,
        }],
        application_context: {
          brand_name: "VitalSupply",
          shipping_preference: "GET_FROM_FILE", // usa la dirección que el comprador tiene en PayPal
          user_action: "PAY_NOW",
        },
      }),
    });

    const order = await orderRes.json();
    if (!orderRes.ok || !order.id) {
      console.error("PayPal create order error:", order);
      return json({ error: "No se pudo crear la orden de PayPal." }, 500);
    }

    // Guardamos la orden como pendiente. Se marca "pagada" al capturar.
    await supabase.from("ordenes").insert({
      paypal_order_id: order.id,
      metodo_pago: "paypal",
      estado: "pendiente",
      total_usd: Number(totalValue),
      items: itemsOrden,
    });

    return json({ orderId: order.id });
  } catch (err) {
    console.error("crear-orden-paypal error:", err);
    return json({ error: "No se pudo iniciar el pago." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
