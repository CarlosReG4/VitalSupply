// src/components/common/Paginacion.jsx
import React from 'react';

// 👇 AQUÍ ESTÁ LA CLAVE: "export default"
export default function Paginacion({ paginaActual, totalPaginas, cambiarPagina }) {
  if (totalPaginas <= 1) return null;

  const obtenerPaginas = () => {
    const paginas = [];
    if (totalPaginas <= 5) return Array.from({ length: totalPaginas }, (_, i) => i + 1);

    if (paginaActual <= 3) {
      for (let i = 1; i <= 4; i++) paginas.push(i);
      paginas.push('...');
      paginas.push(totalPaginas);
      return paginas;
    }

    if (paginaActual >= totalPaginas - 2) {
      paginas.push(1);
      paginas.push('...');
      for (let i = totalPaginas - 3; i <= totalPaginas; i++) paginas.push(i);
      return paginas;
    }

    paginas.push(1);
    paginas.push('...');
    paginas.push(paginaActual - 1);
    paginas.push(paginaActual);
    paginas.push(paginaActual + 1);
    paginas.push('...');
    paginas.push(totalPaginas);
    return paginas;
  };

  return (
    <div className="flex justify-center items-center gap-3 mt-16 bg-white p-4 rounded-2xl shadow-sm border w-fit mx-auto">
      <button 
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border hover:bg-gray-50 disabled:opacity-20"
      >
        <i className="fas fa-chevron-left text-xs"></i>
      </button>
      
      <div className="flex gap-2">
        {obtenerPaginas().map((num, index) => (
          <button
            key={index}
            onClick={() => typeof num === 'number' && cambiarPagina(num)}
            disabled={num === '...'}
            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
              paginaActual === num 
                ? 'bg-blue-900 text-white shadow-lg' 
                : num === '...' 
                  ? 'text-gray-400 cursor-default border-transparent' 
                  : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 border'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <button 
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="w-10 h-10 flex items-center justify-center rounded-xl border hover:bg-gray-50 disabled:opacity-20"
      >
        <i className="fas fa-chevron-right text-xs"></i>
      </button>
    </div>
  );
}   