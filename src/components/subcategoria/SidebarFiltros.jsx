// src/components/subcategoria/SidebarFiltros.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { mainCategories, MAPA_SUBCATEGORIAS } from '../../utils/constants';
import { useSubcategoriasDisponibles } from '../../hooks/useSubcategoriasDisponibles';

export default function SidebarFiltros({ infoCategoriaActual, subId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { subcategoriasConProductos } = useSubcategoriasDisponibles();
  const debeFiltrar = subcategoriasConProductos.size > 0;

  return (
    <aside className="w-full lg:w-1/4 h-fit">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div className="bg-blue-900 p-4 shrink-0 rounded-t-2xl">
          <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">{t('catalog.navigation')}</h3>
        </div>
        
        <nav className="p-3">
          {mainCategories.map((cat) => {
            const estaActiva = (infoCategoriaActual.main || '').toLowerCase() === cat.nombre.toLowerCase();
            const subsDeEsteMenu = MAPA_SUBCATEGORIAS
              .filter(sub => sub.main.toLowerCase() === cat.nombre.toLowerCase())
              .filter(sub => !debeFiltrar || subcategoriasConProductos.has(sub.db));
            
            return (
              <div key={cat.nombre} className="mb-1">
                <button
                  onClick={() => navigate(`/categorias?tipo=${cat.nombre}`)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                    estaActiva ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`${cat.icon} w-5 text-center ${estaActiva ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'}`}></i>
                    <span className={`text-sm font-bold ${estaActiva ? 'text-blue-900' : ''}`}>{cat.nombre}</span>
                  </div>
                  <i className={`fas fa-chevron-right text-[10px] transition-transform duration-300 ${estaActiva ? 'rotate-90 text-blue-600' : 'text-gray-300'}`}></i>
                </button>

                {estaActiva && (
                  <ul className="mt-1 ml-9 space-y-1 border-l-2 border-blue-100 pl-2 py-2 h-auto">
                    <li>
                      <Link
                        to={`/categorias?tipo=${cat.nombre}`}
                        className="w-full block text-left px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                      >
                        • {t('catalog.viewAll')} {cat.nombre}
                      </Link>
                    </li>
                    
                    {subsDeEsteMenu.map(sub => {
                      const isSubActivo = sub.url === subId || sub.db === subId;
                      return (
                        <li key={sub.db}>
                          <Link
                            to={`/subcategoria/${sub.url}`}
                            className={`w-full block text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isSubActivo ? 'text-blue-600 bg-blue-100/50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50/50'
                            }`}
                          >
                            • {sub.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
