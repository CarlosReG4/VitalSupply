// src/pages/Contacto.jsx
export default function Contacto() {
  const whatsapp = '528717821161';
  const email = 'sales@vitalsupply.site';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Contact Us</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          Need a volume quote or help finding a compatible part? We're here for you 24/7.
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
                <p className="text-gray-500 text-sm mt-1">Fastest way to reach us.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="text-blue-600 text-2xl"><i className="fas fa-envelope"></i></div>
              <div>
                <h3 className="font-bold mb-1">Email</h3>
                <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="text-blue-600 text-2xl"><i className="fas fa-location-dot"></i></div>
              <div>
                <h3 className="font-bold mb-1">Location</h3>
                <p className="text-gray-600">Torreón, Coahuila, México</p>
                <p className="text-gray-500 text-sm mt-1">We ship worldwide.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="text-blue-600 text-2xl"><i className="fas fa-clock"></i></div>
              <div>
                <h3 className="font-bold mb-1">Hours</h3>
                <p className="text-gray-600">24 hours a day, 7 days a week</p>
              </div>
            </div>
          </div>

          {/* Llamado a la acción por WhatsApp */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center text-center">
            <div className="text-green-500 text-5xl mb-4"><i className="fab fa-whatsapp"></i></div>
            <h2 className="text-2xl font-black text-blue-900 mb-3">Let's talk</h2>
            <p className="text-gray-600 mb-6">
              Send us the part number or model you're looking for and we'll get you a quote right away.
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
