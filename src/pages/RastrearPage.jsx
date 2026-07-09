// src/pages/RastrearPage.jsx
// Rastreo público de pedidos SIN necesidad de cuenta:
// el cliente ingresa su número de orden (VS-XXXX) + el correo de la compra.
// Ruta sugerida: /rastrear

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../api/supabase';

const ESTADOS_ORDEN = ['pagada', 'preparando', 'enviada', 'entregada'];

const urlRastreo = (paqueteria, guia) => {
  if (!paqueteria || !guia) return null;
  const p = paqueteria.toLowerCase();
  if (p.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${guia}`;
  if (p.includes('dhl')) return `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${guia}`;
  if (p.includes('estafeta')) return `https://www.estafeta.com/Herramientas/Rastreo?guias=${guia}`;
  if (p.includes('ups')) return `https://www.ups.com/track?tracknum=${guia}`;
  if (p.includes('paquetexpress')) return `https://www.paquetexpress.com.mx/rastreo/${guia}`;
  return null;
};

export default function RastrearPage() {
  const { t } = useTranslation();
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const buscar = async () => {
    if (!numero.trim() || !email.trim()) {
      setError(t('trackPage.errorEmpty'));
      return;
    }
    setBuscando(true); setError(null); setOrden(null);
    const { data, error: err } = await supabase.rpc('rastrear_orden', {
      p_numero: numero,
      p_email: email,
    });
    setBuscando(false);
    if (err || !data || data.error) {
      setError(t('trackPage.errorNotFound'));
      return;
    }
    setOrden(data);
  };

  const input = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const pasoActual = orden ? ESTADOS_ORDEN.indexOf(orden.estado) : -1;
  const linkPaqueteria = orden ? urlRastreo(orden.paqueteria, orden.numero_guia) : null;

  return (
    <div className="min-h-[60vh] bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-black text-gray-800 mb-1">
            <i className="fas fa-truck mr-2 text-blue-600"></i>{t('trackPage.title')}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {t('trackPage.subtitle')}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input className={input} placeholder={t('trackPage.orderPlaceholder')}
              value={numero} onChange={(e) => setNumero(e.target.value)} />
            <input className={input} type="email" placeholder={t('trackPage.emailPlaceholder')}
              value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()} />
          </div>
          <button onClick={buscar} disabled={buscando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
            {buscando ? t('trackPage.searching') : t('trackPage.searchBtn')}
          </button>
          {error && <p className="text-red-500 text-sm font-medium mt-4">{error}</p>}
        </div>

        {orden && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-gray-800 text-lg">{orden.numero_orden}</h2>
              <span className="text-sm text-gray-400">
                {new Date(orden.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Línea de tiempo */}
            {orden.estado === 'cancelada' ? (
              <p className="text-red-600 font-bold mb-6"><i className="fas fa-times-circle mr-2"></i>{t('trackPage.orderCanceled')}</p>
            ) : orden.estado === 'pendiente' ? (
              <p className="text-yellow-600 font-bold mb-6"><i className="fas fa-clock mr-2"></i>{t('trackPage.status.pendiente')}</p>
            ) : (
              <div className="flex items-center mb-8">
                {ESTADOS_ORDEN.map((e, i) => (
                  <React.Fragment key={e}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                        ${i <= pasoActual ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {i < pasoActual ? <i className="fas fa-check"></i> : i + 1}
                      </div>
                      <span className={`text-[10px] mt-1 font-bold uppercase tracking-wide text-center w-20
                        ${i <= pasoActual ? 'text-blue-600' : 'text-gray-400'}`}>
                        {t(`trackPage.status.${e}`)}
                      </span>
                    </div>
                    {i < ESTADOS_ORDEN.length - 1 && (
                      <div className={`flex-1 h-1 mx-1 rounded ${i < pasoActual ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Items */}
            <ul className="text-sm text-gray-600 mb-4">
              {(orden.items || []).map((it, i) => (
                <li key={i}>• {it.cantidad ?? 1} × {it.nombre}</li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-50">
              <span className="font-bold text-gray-800">{t('cart.total')}: ${Number(orden.total_usd).toFixed(2)} USD</span>
              {orden.numero_guia ? (
                <div className="text-sm">
                  <span className="text-gray-500">{orden.paqueteria} · {t('trackPage.guide')} <b>{orden.numero_guia}</b></span>
                  {linkPaqueteria && (
                    <a href={linkPaqueteria} target="_blank" rel="noreferrer"
                      className="ml-3 text-blue-600 font-bold hover:underline">
                      {t('trackPage.viewCarrier')} <i className="fas fa-external-link-alt text-xs"></i>
                    </a>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400">{t('trackPage.guidePending')}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
