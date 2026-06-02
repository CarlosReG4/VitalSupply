function Nosotros() {
  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen flex flex-col">
      {/* Encabezado */}
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Sobre VitalSupply</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          Soluciones médicas confiables para hospitales, clínicas y profesionales de la salud en toda Latinoamérica.
        </p>
      </div>

      <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
        {/* Quiénes somos */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-black text-blue-900 mb-4 uppercase tracking-tight">¿Quiénes somos?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            VitalSupply es una empresa mexicana con base en Torreón, Coahuila, dedicada a la distribución de sensores, cables y accesorios médicos compatibles con los principales monitores del mercado (Mindray, Philips, GE, Nellcor, Masimo y más).
          </p>
          <p className="text-gray-700 leading-relaxed">
            Trabajamos directamente con fabricantes certificados en China para ofrecer productos de calidad OEM a precios competitivos, con envíos a todo México y al extranjero.
          </p>
        </section>

        {/* Pilares / Valores */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-blue-600 text-3xl mb-3"><i className="fas fa-shield-alt"></i></div>
            <h3 className="font-bold text-gray-900 mb-2">Calidad Certificada</h3>
            <p className="text-sm text-gray-500">Productos compatibles con especificaciones OEM y estándares de calidad internacionales.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-green-600 text-3xl mb-3"><i className="fas fa-truck-fast"></i></div>
            <h3 className="font-bold text-gray-900 mb-2">Envíos Confiables</h3>
            <p className="text-sm text-gray-500">Enviamos a todo México vía Estafeta y DHL. Envíos internacionales bajo solicitud.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-amber-600 text-3xl mb-3"><i className="fas fa-headset"></i></div>
            <h3 className="font-bold text-gray-900 mb-2">Atención Personalizada</h3>
            <p className="text-sm text-gray-500">Soporte técnico para encontrar la parte exacta que necesita su equipo.</p>
          </div>
        </section>

        {/* Llamado a la acción */}
        <section className="bg-blue-900 text-white rounded-xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-3">¿Necesita una cotización?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Atendemos hospitales, clínicas, distribuidores y profesionales independientes. Pregunte por nuestros precios de mayoreo.
          </p>
          <a 
            href="/contacto"
            className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
          >
            Contáctenos
          </a>
        </section>
      </main>
    </div>
  );
}

export default Nosotros;
