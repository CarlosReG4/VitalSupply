import React, { useEffect, useState } from 'react';
// Asegúrate de que la ruta a tu cliente de Supabase sea correcta
import { supabase } from '../api/supabase'; 

export default function Tienda() {
  const [accesorios, setAccesorios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerAccesorios() {
      // Jalamos todos los datos (incluyendo imagen_url)
      const { data, error } = await supabase
        .from('ecg_accessories') // Revisa que este sea el nombre exacto de tu tabla
        .select('*');

      if (error) {
        console.error("Hubo un error de conexión:", error);
      } else {
        setAccesorios(data);
      }
      setCargando(false);
    }

    obtenerAccesorios();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Catálogo de Accesorios ECG</h1>
      
      {cargando ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">Loading medical catalog...</p>
        </div>
      ) : accesorios.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
           <p className="text-xl text-gray-600">No products found in this category.</p>
        </div>
      ) : (
        // Grilla optimizada
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {accesorios.map((item, index) => (
            // Tarjeta con flexbox para alinear contenido
            <div key={index} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              
              {/* --- CONTENEDOR DE IMAGEN --- */}
              <div className="w-full h-48 flex items-center justify-center mb-4 overflow-hidden rounded-lg bg-gray-100 border">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    // 'object-contain' asegura que la imagen médica se vea completa sin recortarse
                    className="max-w-full max-h-full object-contain p-2" 
                    // Manejo de error si la URL de la imagen está rota
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = '/sin-imagen.svg';
                    }}
                  />
                ) : (
                  // Placeholder si no hay URL en la base de datos
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* --- DETALLES TEXTUALES --- */}
              <div className="flex-grow mb-4">
                {/* Nombre (limitado a 2 líneas para uniformidad) */}
                <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2 h-14">
                  {item.nombre || "Producto sin nombre"}
                </h2>
                {/* SKU */}
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-medium text-gray-700">SKU:</span> {item.sku}
                </p>
              </div>

              {/* --- PRECIO Y BOTÓN (Al fondo de la tarjeta) --- */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                {item.precio && (
                  // Nota: Quité el '$' manual porque asumimos que item.precio ya lo trae (según la captura anterior)
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {item.precio}
                  </p>
                )}
                
                <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}