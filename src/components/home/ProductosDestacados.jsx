import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';

function ProductosDestacados() {
  const [prodActive, setProdActive] = useState(0);
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito);
  
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerDestacados() {
      try {
        // Traemos SOLO los productos marcados como destacados desde el panel de admin.
        const { data, error } = await supabase
          .from('productos_medicos_v2')
          .select('*')
          .eq('destacado', true)
          .limit(6);

        if (error) throw error;

        if (data && data.length > 0) {
          setProductosDestacados(data);
        } else {
          // Respaldo: si aún no hay destacados marcados, mostramos algunos surtibles
          const { data: respaldo } = await supabase
            .from('productos_medicos_v2')
            .select('*')
            .eq('tiene_proveedor', true)
            .limit(6);
          setProductosDestacados(respaldo || []);
        }
      } catch (error) {
        console.error("Error cargando productos recomendados:", error);
      }
      setCargando(false);
    }

    obtenerDestacados();
  }, []);

  // Animación del slider
  useEffect(() => {
    const prodInterval = setInterval(() => {
      setProdActive((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(prodInterval);
  }, []);

  const primerBloque = productosDestacados.slice(0, 3);
  const segundoBloque = productosDestacados.slice(3, 6);

  if (cargando) {
    return (
      <section className="py-16 bg-white overflow-hidden text-center">
        <p className="text-gray-500 animate-pulse font-bold">Loading recommendations...</p>
      </section>
    );
  }

  if (productosDestacados.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden border-t border-gray-100">
      <div className="container mx-auto px-4">
        {/* TÍTULO CAMBIADO AL INGLÉS */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-blue-900">
            You Might Also Like
          </h2>
          <p className="text-sm text-gray-500 mt-2">Essential consumables for your everyday clinical needs</p>
        </div>
        
        <div className="relative">
          <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${prodActive * 100}%)` }}>
            
            {/* --- DIAPOSITIVA 1 --- */}
            <div className="min-w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {primerBloque.map((producto) => (
                <div key={producto.mi_sku} className="border p-6 rounded-2xl hover:shadow-xl transition-shadow bg-white flex flex-col group border-gray-100">
                  <Link to={`/producto/${producto.mi_sku}`} className="flex flex-col flex-1 cursor-pointer">
                    <img 
                      src={producto.imagen_url || '/sin-imagen.svg'}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/sin-imagen.svg'; }}
                      
                      alt={producto.nombre} 
                      className="h-40 w-full object-contain mb-4 rounded transform group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                    />
                    <h4 className="font-bold text-sm mb-1 uppercase group-hover:text-blue-600 transition-colors line-clamp-2">{producto.nombre}</h4>
                    <p className="text-xs text-gray-400 mb-2 font-medium">SKU: <span className="text-gray-600">{producto.mi_sku}</span></p>
                  </Link>
                  
                  {/* Se agregó un formateo condicional para el precio si no viene con signo de dólar */}
                  <p className="text-blue-900 font-black text-lg mb-4 mt-auto">
                    {(() => { const p = producto.precio_venta_sugerido ?? producto.precio; return String(p).includes('$') ? p : `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`; })()}
                  </p>
                  
                  <button 
                    onClick={() => agregarAlCarrito(producto)}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-md"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* --- DIAPOSITIVA 2 --- */}
            <div className="min-w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {segundoBloque.map((producto) => (
                <div key={producto.mi_sku} className="border p-6 rounded-2xl hover:shadow-xl transition-shadow bg-white flex flex-col group border-gray-100">
                  <Link to={`/producto/${producto.mi_sku}`} className="flex flex-col flex-1 cursor-pointer">
                    <img 
                      src={producto.imagen_url || '/sin-imagen.svg'}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/sin-imagen.svg'; }}
                      
                      alt={producto.nombre} 
                      className="h-40 w-full object-contain mb-4 rounded transform group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                    />
                    <h4 className="font-bold text-sm mb-1 uppercase group-hover:text-blue-600 transition-colors line-clamp-2">{producto.nombre}</h4>
                    <p className="text-xs text-gray-400 mb-2 font-medium">SKU: <span className="text-gray-600">{producto.mi_sku}</span></p>
                  </Link>
                  
                  <p className="text-blue-900 font-black text-lg mb-4 mt-auto">
                    {(() => { const p = producto.precio_venta_sugerido ?? producto.precio; return String(p).includes('$') ? p : `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`; })()}
                  </p>
                  
                  <button 
                    onClick={() => agregarAlCarrito(producto)}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-md"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductosDestacados;