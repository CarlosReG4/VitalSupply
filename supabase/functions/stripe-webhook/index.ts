// supabase/functions/stripe-webhook/index.ts
// Stripe llama aquí cuando un pago se completa. Verificamos la firma y
// marcamos la orden como "pagada". NO se confía en el navegador para esto.

import Stripe from "npm:stripe@16";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error("Firma de webhook inválida:", err);
    return new Response("Firma inválida", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Stripe guarda la dirección de envío en collected_information (API nueva)
    // o en shipping_details (API previa). Tomamos la que exista.
    const envio =
      (session as any).collected_information?.shipping_details ??
      (session as any).shipping_details ??
      null;

    const { error } = await supabase
      .from("ordenes")
      .update({
        estado: "pagada",
        email_cliente: session.customer_details?.email ?? null,
        nombre_cliente: envio?.name ?? session.customer_details?.name ?? null,
        telefono_cliente: session.customer_details?.phone ?? null,
        direccion_envio: envio?.address ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", session.id);

    if (error) console.error("Error actualizando orden:", error);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});