import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const categorias = [
  { nombre: 'SpO2', icon: 'fas fa-fingerprint' },
  { nombre: 'ECG Cables', icon: 'fas fa-wave-square' },
  { nombre: 'EKG Cables', icon: 'fas fa-heartbeat' },
  { nombre: 'NIBP', icon: 'fas fa-stethoscope' },
  { nombre: 'IBP Cables', icon: 'fas fa-tint' },
  { nombre: 'Temperature', icon: 'fas fa-thermometer-half' },
  { nombre: 'Fetal', icon: 'fas fa-baby' },
  { nombre: 'Oxygen Sensors', icon: 'fas fa-lungs' },
  { nombre: 'Veterinary', icon: 'fas fa-paw' },
];

function CategoriasPrincipales() {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              {t('home.categories.title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t('home.categories.subtitle')}</p>
          </div>
          <Link to="/categorias" className="hidden sm:flex text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors items-center">
            {t('home.categories.viewAllCatalog')} <i className="fas fa-arrow-right ml-1.5"></i>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categorias.map((cat, index) => (
            <Link 
              key={index}
              to={`/categorias?tipo=${cat.nombre}`}
              // Aplicamos rounded-xl y shadow-soft
              className="bg-white p-8 text-center border border-slate-100 rounded-xl shadow-soft hover:shadow-soft-hover hover:border-blue-100 transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                <i className={`${cat.icon} text-2xl text-slate-400 group-hover:text-blue-600 transition-colors`}></i>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-slate-900">{cat.nombre}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriasPrincipales;