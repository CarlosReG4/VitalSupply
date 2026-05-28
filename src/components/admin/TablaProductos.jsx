import React, { useEffect, useState } from 'react';
import { buscarProductos, toggleProductoDestacado, eliminarProducto, toggleProductoNuevo } from '../../api/productos';

export default function TablaProductos({ onEdit, vista = 'catalogo' }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; 
  const [totalProducts, setTotalProducts] = useState(0);
  const [busqueda, setBusqueda] = useState('');

  const fetchProducts = async (page, termino = '') => {
    setIsLoading(true);
    try {
      const response = await buscarProductos(termino, page, itemsPerPage, vista);
      let listado = response.productos || [];
      
      // Solo ordenamos por destacados si estamos en el catálogo general
      if (vista === 'catalogo') {
        listado.sort((a, b) => {
          if (a.destacado === b.destacado) return 0;
          return a.destacado ? -1 : 1;
        });
      }

      setProducts(listado);
      setTotalProducts(response.total || 0);
    } catch (err) {
      console.error("Error loading products:", err);
      // Limpiamos en caso de error para evitar información fantasma
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setProducts([]); // Limpiamos rápido visualmente al cambiar de pestaña
    fetchProducts(currentPage, busqueda);
  }, [currentPage, vista]); 

  const handleBuscar = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, busqueda);
  };

  const handleToggleDestacado = async (prod) => {
    try {
      const nuevoEstado = !prod.destacado;
      setProducts(prev => {
        const nuevos = prev.map(p => p.mi_sku === prod.mi_sku ? { ...p, destacado: nuevoEstado } : p);
        return nuevos.sort((a, b) => (a.destacado === b.destacado ? 0 : a.destacado ? -1 : 1));
      });
      await toggleProductoDestacado(prod.mi_sku, prod.destacado);
    } catch (error) {
      console.error("Error cambiando destacado", error);
      fetchProducts(currentPage, busqueda);
    }
  };

  const handleEliminar = async (prod) => {
    const confirmar = window.confirm(`¿Seguro que quieres ELIMINAR este producto?\n\n${prod.nombre}\nSKU: ${prod.mi_sku}`);
    if (!confirmar) return;
    try {
      setProducts(prev => prev.filter(p => p.mi_sku !== prod.mi_sku));
      setTotalProducts(prev => Math.max(0, prev - 1));
      await eliminarProducto(prod.mi_sku);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      fetchProducts(currentPage, busqueda);
    }
  };

  const handleQuitarNuevo = async (prod) => {
    try {
      // Lo quitamos visualmente de inmediato de esta tabla
      setProducts(prev => prev.filter(p => p.mi_sku !== prod.mi_sku));
      setTotalProducts(prev => Math.max(0, prev - 1));
      
      // Actualizamos la base de datos (pasamos true porque estaba activado)
      await toggleProductoNuevo(prod.mi_sku, true);
    } catch (error) {
      console.error("Error quitando el producto de nuevos:", error);
      fetchProducts(currentPage, busqueda);
    }
  };

  return (
    <div className="bg-white">
      
      {/* EL BUSCADOR AHORA SOLO SE MUESTRA SI LA VISTA ES 'CATALOGO' */}
      {vista === 'catalogo' && (
        <form onSubmit={handleBuscar} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Buscar por SKU, nombre o competencia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
            Buscar
          </button>
        </form>
      )}

      {isLoading && products.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider bg-gray-50">
                  
                  {vista === 'catalogo' && (
                    <th className="py-3 px-4 font-semibold text-center w-20">Destacado</th>
                  )}
                  
                  {vista === 'nuevos' && (
                    <th className="py-3 px-4 font-semibold text-center w-24">Selección</th>
                  )}

                  <th className="py-3 px-4 font-semibold">Imagen</th>
                  <th className="py-3 px-4 font-semibold">SKU / Modelo</th>
                  <th className="py-3 px-4 font-semibold">Nombre del Producto</th>
                  <th className="py-3 px-4 font-semibold">Precio</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No hay productos para mostrar en esta vista.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.mi_sku} className="hover:bg-blue-50 transition-colors">
                      
                      {vista === 'catalogo' && (
                        <td className="py-2 px-4 text-center">
                          <button 
                            type="button"
                            onClick={() => handleToggleDestacado(prod)}
                            className={`text-xl transition-transform hover:scale-110 ${prod.destacado ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200 hover:text-yellow-200'}`}
                            title={prod.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        </td>
                      )}

                      {vista === 'nuevos' && (
                        <td className="py-2 px-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={true} 
                            onChange={() => handleQuitarNuevo(prod)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            title="Desmarcar para quitar de Novedades"
                          />
                        </td>
                      )}

                      <td className="py-2 px-4">
                        <img src={prod.imagen_url || 'https://via.placeholder.com/40'} alt={prod.nombre} className="w-10 h-10 object-contain bg-white rounded border border-gray-200" />
                      </td>
                      <td className="py-2 px-4 font-mono text-xs text-blue-600 font-medium">{prod.mi_sku}</td>
                      <td className="py-2 px-4 font-medium text-gray-800"><span className="line-clamp-1">{prod.nombre}</span></td>
                      <td className="py-2 px-4 font-semibold text-slate-900">${prod.precio}</td>
                      <td className="py-2 px-4 text-right space-x-1">
                        <button onClick={() => onEdit(prod)} className="text-gray-400 hover:text-blue-600 p-2 rounded" title="Editar">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleEliminar(prod)} className="text-gray-400 hover:text-red-600 p-2 rounded" title="Eliminar">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Mostrando {products.length} de {totalProducts} componentes</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded text-xs font-semibold">Anterior</button>
              <span className="px-3 py-1 text-xs font-bold text-gray-700 bg-white border rounded">Pág {currentPage}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={products.length < itemsPerPage} className="px-3 py-1 bg-white border rounded text-xs font-semibold">Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}