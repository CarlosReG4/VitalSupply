// src/components/categorias/FiltroProductos.jsx
import React from 'react';
import { useFiltrosCategoria } from '../../hooks/useFiltrosCategoria';

/**
 * Tres dropdowns con cascading bidireccional.
 * Las opciones de cada dropdown se actualizan considerando los OTROS filtros activos.
 */
export default function FiltroProductos({ categoria, subcategoria, filtros, onFiltrosChange }) {
  // 👇 Pasamos los filtros activos para que el hook recalcule las opciones
  const { cargando, manufacturers, models, oems } = useFiltrosCategoria(
    { categoria, subcategoria },
    filtros
  );

  const manufacturer = filtros.manufacturer || '';
  const model = filtros.model || '';
  const oemPart = filtros.oemPart || '';

  const handleChange = (campo, valor) => {
    const nuevo = { ...filtros, [campo]: valor || undefined };
    Object.keys(nuevo).forEach(k => { if (!nuevo[k]) delete nuevo[k]; });
    onFiltrosChange(nuevo);
  };

  const limpiar = () => onFiltrosChange({});
  const hayFiltrosActivos = manufacturer || model || oemPart;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
          <i className="fas fa-filter mr-2 text-blue-600"></i>
          Filtrar por
        </h3>
        {hayFiltrosActivos && (
          <button
            onClick={limpiar}
            className="text-[11px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
          >
            <i className="fas fa-times mr-1"></i> Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* OEM Part # */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            OEM Part # (Optional)
          </label>
          <select
            value={oemPart}
            onChange={(e) => handleChange('oemPart', e.target.value)}
            disabled={cargando}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">— Todos —</option>
            {oems.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Manufacturer */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Manufacturer
          </label>
          <select
            value={manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
            disabled={cargando}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">— Todos —</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={cargando}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">— Todos —</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {cargando && (
        <p className="text-[11px] text-gray-400 mt-3">
          <i className="fas fa-spinner fa-spin mr-1"></i> Cargando opciones...
        </p>
      )}
    </div>
  );
}
