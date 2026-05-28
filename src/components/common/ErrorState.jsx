// src/components/common/ErrorState.jsx
import React from 'react';

export default function ErrorState({ mensaje = "Ocurrió un problema de conexión al cargar los datos.", reintentar }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-red-100 shadow-sm mx-auto w-full max-w-2xl mt-8">
      <div className="bg-red-50 text-red-500 rounded-full w-20 h-20 flex items-center justify-center mb-6">
        <i className="fas fa-wifi text-3xl"></i> {/* Usamos el ícono de wifi para dar a entender un problema de red */}
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter">
        ¡Ups! Algo salió mal
      </h3>
      <p className="text-gray-500 mb-8 max-w-md text-sm">
        {mensaje}
      </p>
      
      {reintentar && (
        <button 
          onClick={reintentar}
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 flex items-center gap-2"
        >
          <i className="fas fa-sync-alt"></i> Volver a intentar
        </button>
      )}
    </div>
  );
}