// src/pages/Shipping.jsx
import { useTranslation } from 'react-i18next';

export default function Shipping() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">{t('shippingPage.title')}</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          {t('shippingPage.subtitle')}
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Banner envío gratis */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-6 text-center mb-8 shadow-sm">
          <p className="text-2xl font-black">{t('shippingPage.freeShippingTitle')}</p>
          <p className="text-blue-100 text-sm mt-1">{t('shippingPage.freeShippingNote')}</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-8">

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-gears text-blue-500 mr-2"></i>{t('shippingPage.section1Title')}</h2>
            <p className="text-gray-600">
              {t('shippingPage.section1Body')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-flag text-blue-500 mr-2"></i>{t('shippingPage.section2Title')}</h2>
            <p className="text-gray-600">
              {t('shippingPage.section2Body')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-earth-americas text-blue-500 mr-2"></i>{t('shippingPage.section3Title')}</h2>
            <p className="text-gray-600">
              {t('shippingPage.section3Body')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-location-crosshairs text-blue-500 mr-2"></i>{t('shippingPage.section4Title')}</h2>
            <p className="text-gray-600">
              {t('shippingPage.section4Body')}
            </p>
          </section>

          <div className="bg-blue-50 rounded-lg p-5 text-center">
            <p className="text-gray-700 mb-3 text-sm">{t('shippingPage.questions')}</p>
            <a href="https://wa.me/528717821161" target="_blank" rel="noopener noreferrer"
               className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm">
              {t('shippingPage.contactWhatsapp')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
