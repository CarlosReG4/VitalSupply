import React from 'react';

// Las marcas líderes globales en conectividad y monitoreo médico
const brands = [
  { name: 'Masimo', specialty: 'SpO2 Innovation' },
  { name: 'Nellcor', specialty: 'Pulse Oximetry' },
  { name: 'Philips', specialty: 'Patient Monitoring' },
  { name: 'GE Healthcare', specialty: 'Clinical Systems' },
  { name: 'Mindray', specialty: 'Patient Care Solutions' },
  { name: 'Dräger', specialty: 'Critical Care Ventilation' },
  { name: 'Nihon Kohden', specialty: 'Cardiology & EEG' },
  { name: 'Welch Allyn', specialty: 'Vital Signs Devices' },
  { name: 'Schiller', specialty: 'Cardiopulmonary Diagnostics' },
  { name: 'Datex-Ohmeda', specialty: 'Anesthesia Monitoring' }
];

export default function CarruselMarcas() {
  // Duplicamos el arreglo para asegurar un bucle infinito perfectamente fluido y sin cortes
  const infiniteBrands = [...brands, ...brands];

  return (
    <section className="bg-slate-50 py-14 overflow-hidden border-y border-slate-200">
      {/* Encabezado en Inglés */}
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center sm:text-left">
        <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Compatible Ecosystems
        </h2>
        <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
          Supported OEM & Compatible Brands
        </p>
      </div>

      {/* Contenedor del Carrusel Marquee */}
      <div className="relative flex w-full items-center">
        {/* Degradados laterales para dar un efecto de desvanecido elegante */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        {/* Track de Animación Continua */}
        <div className="flex gap-6 animate-marquee whitespace-nowrap min-w-full items-center">
          {infiniteBrands.map((brand, index) => (
            <div
              key={index}
              className="inline-flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl px-10 py-6 min-w-[220px] shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-300 group select-none cursor-default"
            >
              {/* Representación tipográfica minimalista de alta calidad (Premium Badge) */}
              <span className="text-xl font-black tracking-tighter text-slate-700 group-hover:text-blue-600 transition-colors duration-300">
                {brand.name}
              </span>
              {/* Especialidad de la marca en letras pequeñas */}
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 group-hover:text-slate-500 mt-1.5 transition-colors duration-300">
                {brand.specialty}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inyección local de Keyframes para evitar configuraciones extras en tailwind.config.js */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}