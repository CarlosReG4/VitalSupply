import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-900 text-slate-300 font-sans py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Columna 1: Logo e Información de Contacto */}
          <div className="lg:col-span-3 space-y-6">
            <Link to="/" className="text-white font-black text-2xl tracking-tight flex items-center gap-2 mb-8">
              <span className="text-blue-500">■</span> VitalSupply
            </Link>
            
            <div className="flex items-start gap-4">
              <i className="fas fa-headset text-3xl text-slate-100 mt-1"></i>
              <div>
                <h4 className="text-white font-bold text-[11px] tracking-widest uppercase">{t('footer.gotQuestions')}</h4>
                <p className="text-white font-bold mt-1">+52 871 782 1161</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <span className="block text-white font-bold text-[11px] tracking-widest uppercase mb-1">{t('footer.emailLabel')}</span>
                <a href="mailto:sales@vitalsupply.site" className="text-sm font-semibold hover:text-blue-400 transition-colors">sales@vitalsupply.site</a>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <i className="fab fa-whatsapp text-lg"></i>
                <span className="text-white">{t('footer.whatsappLabel')}</span>
                <a href="https://wa.me/528717821161" className="hover:text-blue-400 transition-colors">+52 871 782 1161</a>
              </div>
            </div>
          </div>

          {/* Columna 2: Pagos Seguros */}
          <div className="lg:col-span-3 space-y-6 pt-4 lg:pt-16">
             <div className="flex items-start gap-4">
              <i className="fas fa-shield-alt text-3xl text-slate-100 mt-1"></i>
              <div>
                <h4 className="text-white font-bold text-[11px] tracking-widest uppercase">{t('footer.securePayments')}</h4>
              </div>
            </div>
            
            <div className="pt-4">
                <span className="block text-white font-bold text-[11px] tracking-widest uppercase mb-3">{t('footer.securedBy')}</span>
                <div className="flex items-center gap-3 text-slate-300 text-3xl">
                    <i className="fab fa-cc-visa hover:text-white transition-colors cursor-pointer"></i>
                    <i className="fab fa-cc-mastercard hover:text-white transition-colors cursor-pointer"></i>
                    <i className="fab fa-cc-paypal hover:text-white transition-colors cursor-pointer"></i>
                </div>
            </div>
          </div>

          {/* Columna 3: Navegación Rápida (Abarca 2 subcolumnas) */}
          <div className="lg:col-span-4 lg:pt-4">
            <h3 className="text-white font-bold text-[11px] tracking-widest uppercase mb-6">{t('footer.findItFast')}</h3>
            <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-3 text-sm font-semibold">
                  <li><Link to="/" className="hover:text-blue-400 transition-colors">{t('footer.home')}</Link></li>
                  <li><Link to="/categorias?tipo=SpO2" className="hover:text-blue-400 transition-colors">SpO2 Sensors</Link></li>
                  <li><Link to="/categorias?tipo=ECG" className="hover:text-blue-400 transition-colors">ECG Cables</Link></li>
                  <li><Link to="/categorias?tipo=EKG" className="hover:text-blue-400 transition-colors">EKG Cables</Link></li>
                  <li><Link to="/categorias?tipo=NIBP" className="hover:text-blue-400 transition-colors">NIBP Cuffs</Link></li>
                  <li><Link to="/categorias?tipo=Oxygen%20Sensors" className="hover:text-blue-400 transition-colors">EtCO2 Sensors</Link></li>
                  <li><Link to="/categorias?tipo=IBP" className="hover:text-blue-400 transition-colors">IBP Cables</Link></li>
                </ul>
                <ul className="space-y-3 text-sm font-semibold">
                  <li><Link to="/categorias?tipo=Temperature" className="hover:text-blue-400 transition-colors">Temperature Probes</Link></li>
                  <li><Link to="/categorias?tipo=Fetal" className="hover:text-blue-400 transition-colors">Fetal Probes</Link></li>
                  <li><Link to="/tienda" className="hover:text-blue-400 transition-colors">Patient Monitors</Link></li>
                  <li><Link to="/tienda" className="hover:text-blue-400 transition-colors">Medical Accessories</Link></li>
                  <li><Link to="/tienda" className="hover:text-blue-400 transition-colors">Veterinary Accessories</Link></li>
                  <li><Link to="/tienda" className="hover:text-blue-400 transition-colors">ESU Accessories</Link></li>
                  <li><Link to="/categorias?tipo=Oxygen%20Sensors" className="hover:text-blue-400 transition-colors">Oxygen Sensors</Link></li>
                </ul>
            </div>
          </div>

          {/* Columna 4: Servicio al Cliente */}
          <div className="lg:col-span-2 lg:border-l lg:border-slate-700 lg:pl-8 lg:pt-4">
            <h3 className="text-white font-bold text-[11px] tracking-widest uppercase mb-6">{t('footer.customerService')}</h3>
            <ul className="space-y-3 text-sm font-semibold">
              <li><Link to="/nosotros" className="hover:text-blue-400 transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contacto" className="hover:text-blue-400 transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/returns" className="hover:text-blue-400 transition-colors">{t('footer.returnsExchanges')}</Link></li>
              <li><Link to="/mayoristas" className="hover:text-blue-400 transition-colors">{t('footer.wholesaleProgram')}</Link></li>
              <li><Link to="/shipping" className="hover:text-blue-400 transition-colors">{t('footer.shippingPolicy')}</Link></li>
              <li><Link to="/blogs" className="hover:text-blue-400 transition-colors">{t('footer.blogs')}</Link></li>
              <li><Link to="/terminos" className="hover:text-blue-400 transition-colors">{t('footer.termsOfService')}</Link></li>
            </ul>
          </div>

        </div>
      </div>
      
      {/* Copyright final */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-semibold">
        <p>&copy; {t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <p className="mt-2 md:mt-0">{t('footer.builtWith')}</p>
      </div>
    </footer>
  );
}