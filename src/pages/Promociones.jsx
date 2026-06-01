import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { useCartStore } from '../store/cartStore';

function Promociones() {
  const [promosData, setPromosData] = useState([]);
  const [loading, setLoading] = useState(true);

  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito || state.addToCart);

  useEffect(() => {
    fetchPromociones();
  }, []);

  const fetchPromociones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('en_promocion', true);

    if (!error && data) {
      setPromosData(data);
    } else {
      console.error("Error loading promotions:", error);
    }
    setLoading(false);
  };

  const handleAgregarCarrito = (producto) => {
    if (agregarAlCarrito) {
      agregarAlCarrito({
        ...producto,
        precio: producto.precio_promocion
      });
      alert(`¡${producto.nombre} added to cart at promotional price!`);
    }
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen flex flex-col">

      {/* Banner */}
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Offers & <span className="text-blue-400">Promotions</span>
          </h1>
          <p className="mt-2 text-blue-200">Exclusive discounts on medical supplies for a limited time.</p>
        </div>
      </div>

      {/* Main Container (Full width, no sidebar) */}
      <main className="flex-grow container mx-auto px-4 py-12">
        
        <section className="w-full">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-900"></i>
            </div>
          ) : promosData.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center max-w-2xl mx-auto">
              <i className="fas fa-tags text-4xl text-gray-300 mb-3"></i>
              <h3 className="text-lg font-bold text-gray-600">No Active Promotions</h3>
              <p className="text-gray-400 mt-2 text-sm">We currently have no offers. Check back soon for new discounts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {promosData.map((promo) => {
                const precioNormal = Number(promo.precio_venta_sugerido ?? promo.precio ?? 0).toFixed(2);
                const precioRebajado = Number(promo.precio_promocion ?? 0).toFixed(2);

                return (
                  <div key={promo.id} className="bg-white border rounded p-6 relative hover:shadow-lg transition-shadow group flex flex-col h-full">
                    
                    {/* Discount Badge */}
                    {promo.porcentaje_descuento && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest z-10 shadow-sm">
                        -{promo.porcentaje_descuento}%
                      </div>
                    )}
                    
                    {/* Image Container */}
                    <div className="h-40 bg-white border border-gray-100 flex items-center justify-center mb-4 p-2 rounded relative overflow-hidden">
                      {promo.imagen_url ? (
                        <img 
                          src={promo.imagen_url} 
                          alt={promo.nombre} 
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <img 
                          src="/sin-imagen.svg" 
                          alt="No image" 
                          className="w-16 h-16 opacity-30" 
                        />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm mb-1 text-gray-800 line-clamp-2">
                        {promo.nombre}
                      </h4>
                      {promo.mi_sku && (
                        <p className="text-[10px] text-gray-400 font-mono mb-3">
                          SKU: {promo.mi_sku}
                        </p>
                      )}
                      
                      {promo.descripcion_promocion && (
                        <p className="text-[11px] text-blue-600 italic mb-2">
                          {promo.descripcion_promocion}
                        </p>
                      )}
                    </div>
                    
                    {/* Prices */}
                    <div className="flex items-center space-x-2 mb-4 mt-auto">
                      <span className="text-gray-400 line-through text-xs font-bold">
                        ${precioNormal}
                      </span>
                      <span className="text-red-600 font-black text-lg">
                        ${precioRebajado}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleAgregarCarrito(promo)}
                      className="w-full bg-white border-2 border-blue-900 text-blue-900 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-900 hover:text-white transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default Promociones;