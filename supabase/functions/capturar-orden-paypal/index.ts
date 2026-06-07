// supabase/functions/capturar-orden-paypal/index.ts
// Captura el pago de una orden de PayPal ya aprobada por el comprador y
// marca la orden como "pagada". Cumple el mismo rol que stripe-webhook:
// el estado "pagada" NUNCA se decide en el navegador, solo aquí en el servidor.

import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PAYPAL_API = Deno.env.get("PAYPAL_API_BASE") ?? "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET")!;

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
    const { orderId } = await req.json();
    if (!orderId) return json({ error: "Falta orderId." }, 400);

    const token = await getAccessToken();

    // Capturamos el pago. Solo funciona si el comprador ya aprobó la orden,
    // y el monto es el que fijamos en el servidor al crearla (no manipulable).
    const capRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await capRes.json();

    if (!capRes.ok || capture.status !== "COMPLETED") {
      console.error("PayPal capture error:", capture);
      return json({ error: "El pago no se pudo completar.", status: capture?.status ?? null }, 400);
    }

    // Datos del comprador y envío (normalizados al mismo formato que guarda Stripe,
    // para que tu panel de pedidos los lea igual).
    const pu = capture.purchase_units?.[0];
    const shipping = pu?.shipping;
    const a = shipping?.address;
    const direccion = a
      ? {
        line1: a.address_line_1 ?? null,
        line2: a.address_line_2 ?? null,
        city: a.admin_area_2 ?? null,
        state: a.admin_area_1 ?? null,
        postal_code: a.postal_code ?? null,
        country: a.country_code ?? null,
      }
      : null;

    const payer = capture.payer;
    const nombreArmado = [payer?.name?.given_name, payer?.name?.surname]
      .filter(Boolean)
      .join(" ");
    const nombre = shipping?.name?.full_name ?? (nombreArmado || null);

    const { error } = await supabase
      .from("ordenes")
      .update({
        estado: "pagada",
        email_cliente: payer?.email_address ?? null,
        nombre_cliente: nombre,
        telefono_cliente: payer?.phone?.phone_number?.national_number ?? null,
        direccion_envio: direccion,
        updated_at: new Date().toISOString(),
      })
      .eq("paypal_order_id", orderId);

    if (error) console.error("Error actualizando orden:", error);

    return json({ status: "COMPLETED" });
  } catch (err) {
    console.error("capturar-orden-paypal error:", err);
    return json({ error: "No se pudo completar el pago." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
