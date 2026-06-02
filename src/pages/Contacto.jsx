// src/pages/Contacto.jsx
export default function Contacto() {
  const whatsapp = '528717821161';
  const email = 'sales@vitalsupply.site';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Contáctenos</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          ¿Necesita una cotización por volumen o ayuda para encontrar una parte compatible? Estamos a sus órdenes las 24 horas.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Datos de contacto */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="text-green-600 text-2xl"><i className="fab fa-whatsapp"></i></div>
              <div>
                <h3 className="font-bold mb-1">WhatsApp</h3>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  +52 871 782 1161
                </a>
                <p className="text-gray-500 text-sm mt-1">La forma más rápida de contactarnos.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="text-blue-600 text-2xl"><i className="fas fa-envelope"></i></div>
              <div>
                <h3 className="font-bold mb-1">Correo</h3>
                <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="text-blue-600 text-2xl"><i className="fas fa-location-dot"></i></div>
              <div>
                <h3 className="font-bold mb-1">Ubicación</h3>
                <p className="text-gray-600">Torreón, Coahuila, México</p>
                <p className="text-gray-500 text-sm mt-1">Enviamos a todo el mundo.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="text-blue-600 text-2xl"><i className="fas fa-clock"></i></div>
              <div>
                <h3 className="font-bold mb-1">Horario</h3>
                <p className="text-gray-600">24 horas, los 7 días de la semana</p>
              </div>
            </div>
          </div>

          {/* Llamado a la acción por WhatsApp */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center text-center">
            <div className="text-green-500 text-5xl mb-4"><i className="fab fa-whatsapp"></i></div>
            <h2 className="text-2xl font-black text-blue-900 mb-3">Conversemos</h2>
            <p className="text-gray-600 mb-6">
              Envíenos el número de parte o el modelo que busca y le daremos una cotización al instante.
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Chatear por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
