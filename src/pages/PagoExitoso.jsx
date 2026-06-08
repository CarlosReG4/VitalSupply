// src/pages/PagoExitoso.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

function PagoExitoso() {
  const limpiarCarrito = useCartStore((state) => state.limpiarCarrito);

  // Al confirmar el pago, vaciamos el carrito.
  useEffect(() => {
    limpiarCarrito();
  }, [limpiarCarrito]);

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="bg-green-50 text-green-600 rounded-full w-24 h-24 flex items-center justify-center mb-8">
        <i className="fas fa-check text-4xl"></i>
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">Payment received!</h1>
      <p className="text-gray-500 max-w-md mb-10 text-sm">
        Thank you for your purchase. You'll receive an order confirmation by email. Our team will prepare it and contact you about shipping.
      </p>

      <Link
        to="/"
        className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg flex items-center gap-2"
      >
        <i className="fas fa-home"></i> Back to home
      </Link>
    </div>
  );
}

export default PagoExitoso;
