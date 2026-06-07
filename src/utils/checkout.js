// src/utils/checkout.js
import { supabase } from '../api/supabase';

// Calcula el total del carrito (USD)
export const calcularTotal = (carrito) =>
  carrito.reduce((total, item) => total + Number(item.precio) * (item.cantidad || 1), 0);

// --- OPCIÓN 1: Pago real con Stripe ---
// Manda solo SKUs + cantidades a la Edge Function (los precios se validan en el servidor)
// y redirige a la página de pago de Stripe.
export const iniciarPagoStripe = async (carrito) => {
  const items = carrito.map((item) => ({
    mi_sku: item.mi_sku,
    cantidad: item.cantidad || 1,
  }));

  const { data, error } = await supabase.functions.invoke('crear-checkout', {
    body: { items },
  });

  if (error) throw error;
  if (!data?.url) throw new Error(data?.error || 'No se recibió el enlace de pago.');

  window.location.href = data.url; // redirige a Stripe Checkout
};

// --- OPCIÓN 2: Cotización por WhatsApp ---
export const construirUrlWhatsapp = (carrito, numero) => {
  const lineas = carrito.map((item) => {
    const precio = Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const cant = item.cantidad || 1;
    return `• ${item.nombre} (SKU: ${item.mi_sku}) — ${cant} x $${precio} USD`;
  });

  const total = calcularTotal(carrito).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const mensaje =
    `¡Hola! Me interesa cotizar el siguiente pedido:\n\n` +
    `${lineas.join('\n')}\n\n` +
    `Total estimado: $${total} USD\n\n` +
    `¿Me pueden confirmar disponibilidad y tiempo de entrega?`;

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
};

// --- OPCIÓN 3: Pago con PayPal ---
// Crea la orden en el servidor (los precios se validan en la Edge Function,
// igual que con Stripe) y devuelve el orderId de PayPal para el botón.
export const crearOrdenPaypal = async (carrito) => {
  const items = carrito.map((item) => ({
    mi_sku: item.mi_sku,
    cantidad: item.cantidad || 1,
  }));

  const { data, error } = await supabase.functions.invoke('crear-orden-paypal', {
    body: { items },
  });

  if (error) throw error;
  if (!data?.orderId) throw new Error(data?.error || 'No se pudo crear la orden de PayPal.');

  return data.orderId;
};

// Captura el pago una vez que el comprador aprobó en PayPal.
// Marca la orden como "pagada" del lado del servidor.
export const capturarOrdenPaypal = async (orderId) => {
  const { data, error } = await supabase.functions.invoke('capturar-orden-paypal', {
    body: { orderId },
  });

  if (error) throw error;
  if (data?.status !== 'COMPLETED') throw new Error(data?.error || 'El pago no se completó.');

  return data;
};
