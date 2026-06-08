import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '../store/cartStore';
import { Link, useSearchParams } from 'react-router-dom';
import { mainCategories } from '../utils/constants';
import { useProductosCategoria } from '../hooks/useProductosCategoria';

import Paginacion from '../components/common/Paginacion';
import CardProducto from '../components/common/CardProducto';
import SidebarCategorias from '../components/categorias/SidebarCategorias';
import FiltroProductos from '../components/categorias/FiltroProductos';
import ErrorState from '../components/common/ErrorState';

function Categorias() {
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito);
  const [searchParams] = useSearchParams();
  
  const tipoURL = (searchParams.get('tipo') || 'SpO2').toLowerCase().trim();
  
  const categoriaPrincipal = useMemo(() => {
    let cat = mainCategories.find((c) => c.nombre.toLowerCase() === tipoURL);
    if (!cat) cat = mainCategories.find((c) => tipoURL.includes(c.nombre.toLowerCase()));
    return cat?.nombre || 'SpO2';
  }, [tipoURL]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [filtros, setFiltros] = useState({}); // 👈 NUEVO: estado de filtros
  const ITEMS_POR_PAGINA = 30;

  const { productos: productosPagina, total: totalProductos, cargando, error, reintentar } = 
    useProductosCategoria(categoriaPrincipal, paginaActual, filtros);

  // Resetear página al cambiar categoría O filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [categoriaPrincipal, filtros]);

  // Resetear filtros al cambiar de categoría
  useEffect(() => {
    setFiltros({});
  }, [categoriaPrincipal]);

  const totalPaginas = useMemo(
    () => Math.max(1, Math.ceil((totalProductos || 0) / ITEMS_POR_PAGINA)),
    [totalProductos]
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        
        {/* BARRA LATERAL */}
        <SidebarCategorias categoriaPrincipal={categoriaPrincipal} />

        {/* SECCIÓN PRINCIPAL */}
        <main className="flex-1">
          {/* Encabezado SIEMPRE visible */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <nav className="flex text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 gap-2">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <span className="text-blue-900">{categoriaPrincipal}</span>
              </nav>
              <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">{categoriaPrincipal}</h2>
            </div>
            <p className="text-gray-400 font-bold text-sm bg-gray-100 px-4 py-2 rounded-full h-fit">
              {totalProductos} Productos
            </p>
          </div>

          {/* 👇 NUEVO: Filtro de productos */}
          <FiltroProductos
            categoria={categoriaPrincipal}
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />

          {/* Lista de productos */}
          {cargando ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm flex-col gap-4">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
              <p className="text-xl text-gray-500 font-bold animate-pulse">Loading catalog...</p>
            </div>
          ) : error ? (
            <ErrorState mensaje={error} reintentar={reintentar} />
          ) : (
            <>
              {(!productosPagina || productosPagina.length === 0) ? (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
                  <i className="fas fa-box-open text-6xl text-gray-200 mb-4 block"></i>
                  <h3 className="text-xl font-bold text-gray-800">No products match the filters</h3>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting or clearing the filters</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {productosPagina.map((producto, index) => (
                      <CardProducto 
                        key={index} 
                        producto={producto} 
                        agregarAlCarrito={agregarAlCarrito} 
                      />
                    ))}
                  </div>

                  <Paginacion 
                    paginaActual={paginaActual} 
                    totalPaginas={totalPaginas} 
                    cambiarPagina={cambiarPagina} 
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Categorias;
