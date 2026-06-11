// src/components/layout/LanguageSwitcher.jsx
// Botón ES/EN para el header. La elección se guarda sola (localStorage)
// gracias a la config de detection.caches en i18n.js.

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const actual = i18n.language?.startsWith('es') ? 'es' : 'en';

  const cambiar = (lng) => i18n.changeLanguage(lng);

  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      <button
        onClick={() => cambiar('es')}
        className={`px-2 py-1 rounded transition-colors ${
          actual === 'es'
            ? 'bg-blue-600 text-white'
            : 'text-gray-500 hover:text-blue-600'
        }`}
        aria-label="Español"
      >
        ES
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => cambiar('en')}
        className={`px-2 py-1 rounded transition-colors ${
          actual === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-500 hover:text-blue-600'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
