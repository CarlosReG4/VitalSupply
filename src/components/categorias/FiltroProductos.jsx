// src/components/categorias/FiltroProductos.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFiltrosCategoria } from '../../hooks/useFiltrosCategoria';

/**
 * Cuatro dropdowns: OEM Part, Manufacturer, Model (con cascading bidireccional)
 * y Price (filtro de rango independiente sobre la columna de precio).
 * Textos internacionalizados con react-i18next (ES/EN).
 */
export default function FiltroProductos({ categoria, subcategoria, filtros, onFiltrosChange }) {
  const { t } = useTranslation();

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

  // Price es un filtro de rango: setea precioMin/precioMax además de precioRango
  const handlePrecio = (v) => {
    const rangos = {
      '1': { precioMin: 0, precioMax: 49.99 },
      '2': { precioMin: 50, precioMax: 99.99 },
      '3': { precioMin: 100, precioMax: 199.99 },
      '4': { precioMin: 200, precioMax: 999999 },
    };
    const nuevo = { ...filtros };
    delete nuevo.precioMin;
    delete nuevo.precioMax;
    delete nuevo.precioRango;
    if (v && rangos[v]) {
      nuevo.precioRango = v;
      nuevo.precioMin = rangos[v].precioMin;
      nuevo.precioMax = rangos[v].precioMax;
    }
    onFiltrosChange(nuevo);
  };

  const limpiar = () => onFiltrosChange({});
  const hayFiltrosActivos = manufacturer || model || oemPart || filtros.precioRango;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
          <i className="fas fa-filter mr-2 text-blue-600"></i>
          {t('catalog.filterBy')}
        </h3>
        {hayFiltrosActivos && (
          <button
            onClick={limpiar}
            className="text-[11px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
          >
            <i className="fas fa-times mr-1"></i> {t('catalog.clearFilters')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OEM Part # */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {t('catalog.oemPart')}
          </label>
          <select
            value={oemPart}
            onChange={(e) => handleChange('oemPart', e.target.value)}
            disabled={cargando}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">{t('catalog.all')}</option>
            {oems.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Manufacturer */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {t('catalog.manufacturer')}
          </label>
          <select
            value={manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
            disabled={cargando}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">{t('catalog.all')}</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {t('catalog.model')}
          </label>
          <select
            value={model}
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={cargando}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">{t('catalog.all')}</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {t('catalog.price')}
          </label>
          <select
            value={filtros.precioRango || ''}
            onChange={(e) => handlePrecio(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">{t('catalog.all')}</option>
            <option value="1">$10 - $49</option>
            <option value="2">$50 - $99</option>
            <option value="3">$100 - $199</option>
            <option value="4">$200+</option>
          </select>
        </div>
      </div>

      {cargando && (
        <p className="text-[11px] text-gray-400 mt-3">
          <i className="fas fa-spinner fa-spin mr-1"></i> {t('catalog.loadingOptions')}
        </p>
      )}
    </div>
  );
}
