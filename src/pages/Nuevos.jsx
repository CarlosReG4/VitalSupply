import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useCartStore } from '../store/cartStore';
import { formatearPrecio } from '../utils/helpers';

function Nuevos() {
  const { t } = useTranslation();
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito);

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function obtenerNuevos() {
      setCargando(true);
      try {
        // MAGIA AQUÍ: Ahora solo traemos los que marcaste en el panel (es_nuevo = true)
        const { data, error } = await supabase
          .from('productos_medicos_v2')
          .select('*')
          .eq('tiene_proveedor', true)
          .eq('es_nuevo', true) // <-- Este es el filtro que conecta con tu checkbox
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProductos(data || []);
      } catch (err) {
        console.error('Error cargando productos nuevos:', err);
        setError(err);
      } finally {
        setCargando(false);
      }
    }
    obtenerNuevos();
  }, []);

  // Precio a mostrar: sugerido con fallback al viejo
  const precioDe = (p) => p.precio_venta_sugerido ?? p.precio;

  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen flex flex-col">

      {/* Banner de Título */}
      <div className="bg-teal-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            {t('newPage.titleNew')} <span className="text-teal-300">{t('newPage.titleReleases')}</span>
          </h1>
          <p className="mt-2 text-teal-100">{t('newPage.subtitle')}</p>
        </div>
      </div>

      {/* Contenedor Principal (Sin el buscador lateral) */}
      <main className="flex-grow container mx-auto px-4 py-12">

        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <i className="fas fa-spinner fa-spin text-3xl text-teal-600"></i>
            <p className="text-gray-500 font-bold">{t('newPage.loading')}</p>
          </div>
        )}

        {!cargando && error && (
          <div className="text-center py-20">
            <p className="text-gray-700 font-bold text-lg">{t('newPage.errorTitle')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('newPage.errorDesc')}</p>
          </div>
        )}

        {/* Estado Vacío Mejorado */}
        {!cargando && !error && productos.length === 0 && (
          <div className="text-center py-20 max-w-lg mx-auto">
            <div className="inline-block p-6 bg-white rounded-full shadow-sm mb-4">
               <i className="fas fa-box-open text-4xl text-gray-300"></i>
            </div>
            <p className="text-gray-700 font-bold text-xl">{t('newPage.emptyTitle')}</p>
            <p className="text-gray-500 mt-2">{t('newPage.emptyDesc')}</p>
          </div>
        )}

        {/* Cuadrícula a todo el ancho */}
        {!cargando && !error && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.mi_sku}
                className="bg-white border rounded p-6 relative hover:shadow-lg transition-shadow group border-t-4 border-t-teal-500 flex flex-col"
              >
                {/* Etiqueta "NUEVO" */}
                <div className="absolute top-4 right-4 bg-teal-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest z-10 shadow-sm">
                  {t('newPage.badgeNew')}
                </div>

                <Link to={`/producto/${producto.mi_sku}`} className="flex flex-col flex-1 cursor-pointer">
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-4 overflow-hidden p-2">
                    <img
                      src={producto.imagen_url || '/sin-imagen.svg'}
                      alt={producto.nombre}
                      className="max-h-full max-w-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h4 className="font-bold text-sm mb-1 uppercase text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {producto.nombre}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    SKU: <span className="text-teal-600 font-bold">{producto.mi_sku}</span>
                  </p>
                </Link>

                <div className="text-teal-700 font-black text-lg mb-4 mt-auto">
                  ${formatearPrecio(precioDe(producto))}
                </div>

                <button
                  onClick={() => agregarAlCarrito(producto)}
                  className="w-full bg-white border-2 border-teal-700 text-teal-700 py-2 text-xs font-bold uppercase tracking-widest hover:bg-teal-700 hover:text-white transition-colors"
                >
                  {t('product.addToCart')}
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default Nuevos;