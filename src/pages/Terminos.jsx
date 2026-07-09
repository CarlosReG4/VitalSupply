// src/pages/Terminos.jsx
import { useTranslation } from 'react-i18next';

export default function Terminos() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">{t('termsPage.title')}</h1>
        <p className="max-w-2xl mx-auto text-blue-100">{t('termsPage.lastUpdated')}</p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">{t('termsPage.section1Title')}</h2>
            <p>
              {t('termsPage.section1Body')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">{t('termsPage.section2Title')}</h2>
            <p>
              {t('termsPage.section2Body')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">{t('termsPage.section3Title')}</h2>
            <p>
              {t('termsPage.section3Body')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">{t('termsPage.section4Title')}</h2>
            <p>
              {t('termsPage.section4Body')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">{t('termsPage.section5Title')}</h2>
            <p>
              {t('termsPage.section5Body')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">{t('termsPage.section6Title')}</h2>
            <p>
              {t('termsPage.section6Body')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">{t('termsPage.section7Title')}</h2>
            <p>
              {t('termsPage.section7Body1')} <a href="mailto:sales@vitalsupply.site" className="text-blue-600 hover:underline">sales@vitalsupply.site</a> {t('termsPage.section7Body2')}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
