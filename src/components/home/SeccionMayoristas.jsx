import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SeccionMayoristas() {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-8 md:mb-0 max-w-xl text-balance">
          <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter italic">{t('home.wholesale.title')}</h2>
          <p className="text-blue-200">{t('home.wholesale.description')}</p>
        </div>
        <Link to="/contacto" className="bg-white text-blue-900 px-12 py-4 rounded font-black hover:bg-blue-50 transition-all uppercase tracking-widest">{t('home.wholesale.requestQuote')}</Link>
      </div>
    </section>
  );
}
export default SeccionMayoristas;
