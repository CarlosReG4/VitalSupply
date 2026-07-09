// src/pages/Blogs.jsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Artículos de ejemplo. Más adelante esto puede venir de la base de datos.
const articulos = [
  {
    id: 'how-to-choose-spo2-sensor',
    tituloKey: 'blogsPage.article1Title',
    extractoKey: 'blogsPage.article1Excerpt',
    categoriaKey: 'blogsPage.article1Category',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'reusable-vs-disposable',
    tituloKey: 'blogsPage.article2Title',
    extractoKey: 'blogsPage.article2Excerpt',
    categoriaKey: 'blogsPage.article2Category',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'extend-cable-life',
    tituloKey: 'blogsPage.article3Title',
    extractoKey: 'blogsPage.article3Excerpt',
    categoriaKey: 'blogsPage.article3Category',
    color: 'bg-amber-100 text-amber-700',
  },
];

export default function Blogs() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">{t('blogsPage.title')}</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          {t('blogsPage.subtitle')}
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          {articulos.map((a) => (
            <article key={a.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              {/* Imagen de cabecera (placeholder) */}
              <div className="h-44 bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
                <i className="fas fa-heart-pulse text-white/40 text-5xl"></i>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className={`text-xs font-bold px-3 py-1 rounded-full self-start mb-3 ${a.color}`}>{t(a.categoriaKey)}</span>
                <h2 className="font-bold text-lg text-gray-900 mb-2 leading-snug">{t(a.tituloKey)}</h2>
                <p className="text-gray-600 text-sm flex-grow">{t(a.extractoKey)}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t('blogsPage.comingSoon')}</span>
                  <span className="text-blue-600 text-sm font-semibold">{t('blogsPage.readMore')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-gray-500 mb-4">{t('blogsPage.moreSoon')}</p>
          <Link to="/tienda" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            {t('blogsPage.browseCatalog')}
          </Link>
        </div>
      </div>
    </div>
  );
}
