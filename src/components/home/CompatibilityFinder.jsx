import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Importamos el JSON que generaste
import compatibilidadData from '../../data/compatibilidad.json';

// --- SUB-COMPONENTE: Dropdown Personalizado con Buscador ---
function CustomDropdown({ options, value, onChange, placeholder, disabled }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Cierra el menú si haces clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar las opciones según lo que el usuario escriba
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Botón Principal */}
      <div
        className={`block w-full pl-4 pr-10 py-4 text-base border rounded-xl font-semibold flex items-center justify-between transition-colors ${
          disabled 
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
            : 'bg-white border-slate-300 hover:border-blue-400 cursor-pointer text-slate-800'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate">{value || placeholder}</span>
        <i className={`fas fa-chevron-down text-sm transition-transform duration-200 text-slate-500 ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      {/* Lista Desplegable con Scroll Seguro */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Barra de Búsqueda Interna */}
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('home.compatibility.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Opciones con Scroll amigable para Touchpad */}
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt}
                  className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm font-medium text-slate-700 transition-colors"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm(''); // Limpiar buscador al seleccionar
                  }}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-slate-500 text-center">{t('home.compatibility.noResults')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
// -----------------------------------------------------------


export default function CompatibilityFinder() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const brands = Object.keys(compatibilidadData);
  const modelosDisponibles = brand ? compatibilidadData[brand] : [];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/buscar?marca=${encodeURIComponent(brand)}&modelo=${encodeURIComponent(model)}`);
  };

  return (
    <section id="compatibility-finder" className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-slate-100 mt-12 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h2 className="text-blue-500 font-bold tracking-widest text-sm uppercase mb-2">{t('home.compatibility.eyebrow')}</h2>
          <p className="text-3xl font-bold text-slate-900">{t('home.compatibility.title')}</p>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
            {t('home.compatibility.description')}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 md:p-8 shadow-inner border border-slate-200 max-w-4xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Dropdown 1: Brand */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('home.compatibility.selectBrandLabel')}</label>
                <CustomDropdown
                  options={brands}
                  value={brand}
                  placeholder={t('home.compatibility.chooseBrandPlaceholder')}
                  onChange={(selectedValue) => {
                    setBrand(selectedValue);
                    setModel(''); // Limpiar el modelo si cambian la marca
                  }}
                  disabled={false}
                />
              </div>

              {/* Dropdown 2: Model */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('home.compatibility.monitorModelLabel')}</label>
                <CustomDropdown
                  options={modelosDisponibles}
                  value={model}
                  placeholder={!brand ? t('home.compatibility.selectBrandFirstPlaceholder') : t('home.compatibility.chooseModelPlaceholder')}
                  onChange={(selectedValue) => setModel(selectedValue)}
                  disabled={!brand || modelosDisponibles.length === 0}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={!brand || !model}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-3"
              >
                <i className="fas fa-search"></i>
                {t('home.compatibility.findButton')}
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}