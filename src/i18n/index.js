// src/i18n/index.js
// Internacionalización ES/EN con react-i18next.
// - Español es el idioma por defecto y de fallback.
// - Detecta el idioma del navegador la primera vez.
// - La elección manual del usuario se guarda en localStorage.
//
// Instalación (una vez):
//   npm install react-i18next i18next i18next-browser-languagedetector

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

i18n
  .use(LanguageDetector) // detecta el idioma del navegador automáticamente
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',          // español como idioma por defecto y de fallback
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true, // es-MX, es-AR, en-US, etc. → es / en
    detection: {
      // Orden: 1° elección manual guardada, 2° idioma del navegador
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // persiste la elección manual
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
