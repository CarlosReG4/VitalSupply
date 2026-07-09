// src/pages/Returns.jsx
import { useTranslation } from 'react-i18next';

export default function Returns() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">{t('returnsPage.title')}</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          {t('returnsPage.subtitle')}
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-8">

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-calendar-days text-blue-500 mr-2"></i>{t('returnsPage.section1Title')}</h2>
            <p className="text-gray-600">
              {t('returnsPage.section1Body')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-box text-blue-500 mr-2"></i>{t('returnsPage.section2Title')}</h2>
            <p className="text-gray-600">
              {t('returnsPage.section2Body')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-truck text-blue-500 mr-2"></i>{t('returnsPage.section3Title')}</h2>
            <p className="text-gray-600">
              {t('returnsPage.section3Body')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-rotate-left text-blue-500 mr-2"></i>{t('returnsPage.section4Title')}</h2>
            <p className="text-gray-600">
              {t('returnsPage.section4Body')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-money-bill-wave text-blue-500 mr-2"></i>{t('returnsPage.section5Title')}</h2>
            <p className="text-gray-600">
              {t('returnsPage.section5Body')}
            </p>
          </section>

          <div className="bg-blue-50 rounded-lg p-5 text-center">
            <p className="text-gray-700 mb-3 text-sm">{t('returnsPage.questions')}</p>
            <a href="https://wa.me/528717821161" target="_blank" rel="noopener noreferrer"
               className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm">
              {t('returnsPage.contactWhatsapp')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
