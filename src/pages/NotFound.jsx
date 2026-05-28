// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="bg-blue-50 text-blue-600 rounded-full w-24 h-24 flex items-center justify-center mb-8">
        <i className="fas fa-plug text-4xl"></i>
      </div>

      <p className="text-7xl font-black text-blue-900 tracking-tighter mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Page not found</h1>
      <p className="text-gray-500 max-w-md mb-10 text-sm">
        The page you're looking for doesn't exist or the product was moved. Check the link or go back home to keep browsing the catalog.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <i className="fas fa-home"></i> Go home
        </Link>
        <Link
          to="/tienda"
          className="bg-white border-2 border-blue-900 text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <i className="fas fa-store"></i> View shop
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
