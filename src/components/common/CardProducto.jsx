import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatearPrecio, nombreProducto } from '../../utils/helpers';

export default function CardProducto({ producto, agregarAlCarrito }) {
  const { t, i18n } = useTranslation();
  const nombre = nombreProducto(producto, i18n.language);
  return (
    <div className="group bg-white border border-slate-100 rounded-xl p-5 shadow-soft hover:shadow-soft-hover transition-all duration-300 flex flex-col relative overflow-hidden">
      
      <Link to={`/producto/${producto.mi_sku}`} className="flex flex-col flex-1">
        {/* Contenedor de imagen más limpio */}
        <div className="h-48 w-full bg-slate-50/50 rounded-lg mb-5 flex items-center justify-center p-4 overflow-hidden group-hover:bg-slate-50 transition-colors">
          <img 
            src={producto.imagen_url || '/sin-imagen.svg'}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/sin-imagen.svg'; }}
            
            alt={nombre}
            className="max-h-full max-w-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        {/* Tipografía más profesional */}
        <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-relaxed">
          {nombre}
        </h3>
        
        {/* SKU con fuente monoespaciada */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded tracking-wider">
            {t('card.skuLabel')} {producto.mi_sku}
          </span>
        </div>
      </Link>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <span className="text-xl font-black text-slate-900 tracking-tight">
          {formatearPrecio(producto.precio)}
        </span>
        <button 
          onClick={() => agregarAlCarrito(producto)}
          className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          title={t('card.addToCart')}
        >
          <i className="fas fa-cart-plus text-sm"></i>
        </button>
      </div>
    </div>
  );
}