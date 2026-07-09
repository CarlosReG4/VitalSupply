// src/pages/Mayoristas.jsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Mayoristas() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">{t('wholesalePage.title')}</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          {t('wholesalePage.subtitle')}
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-blue-600 text-3xl mb-3"><i className="fas fa-tags"></i></div>
            <h3 className="font-bold text-lg mb-2">{t('wholesalePage.volumePricingTitle')}</h3>
            <p className="text-gray-600 text-sm">{t('wholesalePage.volumePricingBody')}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-blue-600 text-3xl mb-3"><i className="fas fa-truck-fast"></i></div>
            <h3 className="font-bold text-lg mb-2">{t('wholesalePage.prioritySupplyTitle')}</h3>
            <p className="text-gray-600 text-sm">{t('wholesalePage.prioritySupplyBody')}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-blue-600 text-3xl mb-3"><i className="fas fa-headset"></i></div>
            <h3 className="font-bold text-lg mb-2">{t('wholesalePage.dedicatedSupportTitle')}</h3>
            <p className="text-gray-600 text-sm">{t('wholesalePage.dedicatedSupportBody')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-black text-blue-900 mb-3">{t('wholesalePage.ctaTitle')}</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            {t('wholesalePage.ctaBody')}
          </p>
          <Link to="/contacto" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            {t('wholesalePage.ctaButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
