import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
// Importamos tu store del carrito para poder agregar los productos
import { useCartStore } from '../store/cartStore';

function Promociones() {
  const [promosData, setPromosData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extraemos la función para agregar al carrito (ajusta el nombre si es diferente en tu cartStore.js)
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito || state.addToCart);

  useEffect(() => {
    fetchPromociones();
  }, []);

  const fetchPromociones = async () => {
    setLoading(true);
    // Buscamos solo los productos que tú o tu socio hayan marcado en promoción desde el panel admin
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('en_promocion', true);

    if (!error && data) {
      setPromosData(data);
    } else {
      console.error("Error al cargar promociones:", error);
    }
    setLoading(false);
  };

  const handleAgregarCarrito = (producto) => {
    if (agregarAlCarrito) {
      // Clave: Modificamos temporalmente el objeto para que el carrito tome el precio rebajado
      agregarAlCarrito({
        ...producto,
        precio: producto.precio_promocion // Sobrescribimos el precio normal por el de oferta
      });
      // Aquí podrías agregar un Toast o notificación más visual en lugar del alert
      alert(`¡${producto.nombre} agregado al carrito con precio de promoción!`);
    }
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen flex flex-col">

      {/* Banner de Título */}
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Ofertas y <span className="text-blue-400">Promotions</span>
          </h1>
          <p className="mt-2 text-blue-200">Descuentos exclusivos en consumibles médicos por tiempo limitado.</p>
        </div>
      </div>

      {/* Contenedor Principal */}
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* BARRA LATERAL (Filtros técnicos) */}
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-6 border rounded shadow-sm sticky top-24">
            <h3 className="font-black uppercase tracking-widest text-sm mb-6 border-b pb-2">Filter Products</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Pieza OEM (Num. Parte)</label>
              <input type="text" placeholder="Ej. M1191B" className="w-full border-2 border-gray-100 rounded py-2 px-3 focus:border-blue-500 outline-none text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Fabricante de Equipo</label>
              <select className="w-full border-2 border-gray-100 rounded py-2 px-3 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer">
                <option>All manufacturers</option>
                <option>Philips</option>
                <option>Mindray</option>
                <option>GE Medical</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Monitor Model</label>
              <select className="w-full border-2 border-gray-100 rounded py-2 px-3 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer">
                <option>Select a model...</option>
                <option>IntelliVue MP50</option>
                <option>BeneVision N12</option>
              </select>
            </div>

            <button className="w-full bg-blue-600 text-white font-bold py-2 rounded text-xs uppercase tracking-widest hover:bg-blue-700">
              Aplicar Filtros
            </button>
          </div>
        </aside>

        {/* CUADRÍCULA DE PRODUCTOS */}
        <section className="w-full md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-900"></i>
            </div>
          ) : promosData.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
              <i className="fas fa-tags text-4xl text-gray-300 mb-3"></i>
              <h3 className="text-lg font-bold text-gray-600">Sin promociones activas</h3>
              <p className="text-gray-400 mt-2 text-sm">Actualmente no tenemos ofertas. Vuelve pronto para ver nuevos descuentos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promosData.map((promo) => {
                // Aseguramos que los precios sean números válidos para evitar errores de renderizado
                const precioNormal = Number(promo.precio_venta_sugerido ?? promo.precio ?? 0).toFixed(2);
                const precioRebajado = Number(promo.precio_promocion ?? 0).toFixed(2);

                return (
                  <div key={promo.id} className="bg-white border rounded p-6 relative hover:shadow-lg transition-shadow group flex flex-col h-full">
                    
                    {/* Etiqueta de Descuento Visual */}
                    {promo.porcentaje_descuento && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest z-10 shadow-sm">
                        -{promo.porcentaje_descuento}%
                      </div>
                    )}
                    
                    {/* Contenedor de Imagen usando el archivo público que ya tienen */}
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
                          alt="Sin imagen" 
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
                      
                      {/* Descripción de promoción si existe */}
                      {promo.descripcion_promocion && (
                        <p className="text-[11px] text-blue-600 italic mb-2">
                          {promo.descripcion_promocion}
                        </p>
                      )}
                    </div>
                    
                    {/* Precios tachados y nuevos */}
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
                      Agregar
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