// src/pages/PagoCancelado.jsx
import { Link } from 'react-router-dom';

function PagoCancelado() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="bg-yellow-50 text-yellow-600 rounded-full w-24 h-24 flex items-center justify-center mb-8">
        <i className="fas fa-exclamation text-4xl"></i>
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">Payment canceled</h1>
      <p className="text-gray-500 max-w-md mb-10 text-sm">
        No charge was made. Your cart is still saved in case you want to try again or request a quote via WhatsApp.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/tienda"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <i className="fas fa-store"></i> Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default PagoCancelado;
