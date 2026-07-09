import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useBusqueda } from '../hooks/useBusqueda.js';

// COMPONENTES REUTILIZABLES
import Paginacion from '../components/common/Paginacion';
import CardProducto from '../components/common/CardProducto';
import ErrorState from '../components/common/ErrorState';

export default function Busqueda() {
  const { t } = useTranslation();
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito);
  const [searchParams] = useSearchParams();
  
  // Capturamos los tres posibles parámetros de la URL
  const q = searchParams.get('q') || '';
  const marca = searchParams.get('marca') || '';
  const modelo = searchParams.get('modelo') || '';

  // Agrupamos los parámetros para que el useEffect reaccione a ellos
  const parametrosBusqueda = useMemo(() => ({ q, marca, modelo }), [q, marca, modelo]);

  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 30;

  const { productos: productosPagina, total: totalProductos, cargando, error, reintentar } = useBusqueda(parametrosBusqueda, paginaActual);

  useEffect(() => {
    setPaginaActual(1);
  }, [parametrosBusqueda]);

  const totalPaginas = useMemo(() => Math.max(1, Math.ceil((totalProductos || 0) / ITEMS_POR_PAGINA)), [totalProductos]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generador de título dinámico
  const tituloMostrar = (marca && modelo)
    ? <><span className="text-gray-900">{t('searchPage.compatibleWith')}</span> <span className="text-blue-600">{marca} {modelo}</span></>
    : <><span className="text-gray-900">{t('searchPage.resultsFor')}</span> <span className="text-blue-600">"{q}"</span></>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Encabezado de Resultados */}
        <div className="mb-8">
          <nav className="flex text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 gap-2">
            <Link to="/" className="hover:text-blue-600">{t('nav.home')}</Link>
            <span>/</span>
            <span className="text-blue-900">{t('searchPage.breadcrumb')}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              {tituloMostrar}
            </h1>
            {!cargando && !error && (
              <p className="text-gray-400 font-bold text-sm bg-white border px-4 py-2 rounded-full h-fit shadow-sm">
                {totalProductos} {t('searchPage.resultsFound')}
              </p>
            )}
          </div>
        </div>

        {/* Controles de Estado */}
        {cargando ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm flex-col gap-4">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
            <p className="text-xl text-gray-500 font-bold animate-pulse">{t('searchPage.searching')}</p>
          </div>
        ) : error ? (
          <ErrorState mensaje={error} reintentar={reintentar} />
        ) : totalProductos === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center shadow-sm max-w-3xl mx-auto mt-12">
            <i className="fas fa-search text-6xl text-gray-200 mb-6 block"></i>
            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tighter">{t('searchPage.noAccessoriesTitle')}</h3>
            <p className="text-gray-500">{t('searchPage.noResultsDesc')}</p>
            <Link to="/" className="mt-6 inline-block bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
              {t('searchPage.backHome')}
            </Link>
          </div>
        ) : (
          <>
            {/* Grid Reutilizable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosPagina.map((producto, index) => (
                <CardProducto 
                  key={index} 
                  producto={producto} 
                  agregarAlCarrito={agregarAlCarrito} 
                />
              ))}
            </div>

            {/* Paginación Reutilizable */}
            <Paginacion 
              paginaActual={paginaActual} 
              totalPaginas={totalPaginas} 
              cambiarPagina={cambiarPagina} 
            />
          </>
        )}
      </div>
    </div>
  );
}