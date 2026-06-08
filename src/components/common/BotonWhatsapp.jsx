// src/components/common/BotonWhatsapp.jsx
import { useCartStore } from '../../store/cartStore';

function BotonWhatsapp() {
  // 1. Extraemos el carrito de Zustand
  const { carrito } = useCartStore();

  // 2. Número de WhatsApp de ventas (con código de país México, sin signos +)
  const numeroWhatsApp = "528717821161";

  // 3. Función que arma el "ticket"
  const generarMensaje = () => {
    // Si el carrito está vacío, mandamos un mensaje de contacto general
    if (carrito.length === 0) {
      return encodeURIComponent("Hello VitalSupply team, I would like to receive more information.");
    }

    // Si hay productos, armamos el listado
    let mensaje = "Hello VitalSupply team, I want to finalize the following order:\n\n";
    let total = 0;

    carrito.forEach((item) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      // Usamos el nombre del producto, o el SKU si el nombre no está disponible en la vista
      const nombreProducto = item.nombre || item.mi_sku;
      mensaje += `- ${item.cantidad}x ${nombreProducto} ($${item.precio} each)\n`;
    });

    mensaje += `\nTotal estimated: $${total.toFixed(2)} USD\n\n`;
    mensaje += "I am waiting to coordinate the payment method and shipping.";

    // encodeURIComponent convierte los espacios y saltos de línea para que WhatsApp los lea bien
    return encodeURIComponent(mensaje);
  };

  // 4. Armamos el enlace final
  const link = `https://wa.me/${numeroWhatsApp}?text=${generarMensaje()}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-8 left-8 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl hover:bg-green-600 hover:scale-110 transition-all z-[100]"
    >
      <i className="fab fa-whatsapp"></i>
    </a>
  );
}

export default BotonWhatsapp;
