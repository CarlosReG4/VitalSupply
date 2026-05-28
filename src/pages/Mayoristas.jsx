// src/pages/Mayoristas.jsx
import { Link } from 'react-router-dom';

export default function Mayoristas() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Wholesale Program</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          Special pricing for hospitals, clinics, distributors, and biomedical service companies.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-blue-600 text-3xl mb-3"><i className="fas fa-tags"></i></div>
            <h3 className="font-bold text-lg mb-2">Volume Pricing</h3>
            <p className="text-gray-600 text-sm">The more you order, the better the price. Tiered discounts for recurring buyers.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-blue-600 text-3xl mb-3"><i className="fas fa-truck-fast"></i></div>
            <h3 className="font-bold text-lg mb-2">Priority Supply</h3>
            <p className="text-gray-600 text-sm">Stock reservation and priority logistics so you never run out of critical parts.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-blue-600 text-3xl mb-3"><i className="fas fa-headset"></i></div>
            <h3 className="font-bold text-lg mb-2">Dedicated Support</h3>
            <p className="text-gray-600 text-sm">A specialized advisor to help you find compatible parts for your equipment.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-black text-blue-900 mb-3">Ready to get wholesale pricing?</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Tell us about your business and the products you need most. Our team will prepare a custom quote for you.
          </p>
          <Link to="/contacto" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Request a quote
          </Link>
        </div>
      </div>
    </div>
  );
}
