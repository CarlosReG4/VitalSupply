// src/i18n.js
// Configuración de internacionalización ES/EN con detección automática
// del idioma del navegador. El usuario puede cambiar manualmente y su
// elección se guarda en localStorage.
//
// Instalación (una vez):
//   npm install react-i18next i18next i18next-browser-languagedetector

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      // ── Navegación ──
      nav: {
        home: 'Inicio',
        categories: 'Categorías',
        others: 'Otros',
        about: 'Nosotros',
        account: 'Cuenta',
        cart: 'Tu carrito',
        searchPlaceholder: 'Busca por número de parte (SKU), modelo o marca...',
      },
      // ── Catálogo ──
      catalog: {
        navigation: 'Navegación del catálogo',
        products: 'Productos',
        product: 'Producto',
        viewAll: 'Ver todo',
        filterBy: 'Filtrar por',
        clearFilters: 'Limpiar filtros',
        all: '— Todos —',
        manufacturer: 'Fabricante',
        model: 'Modelo',
        oemPart: 'No. de parte OEM (opcional)',
        patientSize: 'Talla de paciente',
        armCircumference: 'Circunferencia de brazo',
        price: 'Precio (USD)',
        loadingOptions: 'Cargando opciones...',
        noResults: 'No se encontraron productos con esos filtros',
        compatibility: 'Compatibilidad',
        specifications: 'Especificaciones',
        partNumber: 'Número de parte',
      },
      // ── Producto / compra ──
      product: {
        addToCart: 'Agregar al carrito',
        price: 'Precio',
        quantity: 'Cantidad',
        inStock: 'Disponible',
        outOfStock: 'Agotado',
        savings: 'HASTA 60% DE AHORRO',
        savingsDesc: 'Los compatibles de calidad te ahorran dinero',
        guaranteed: '100% COMPATIBILIDAD GARANTIZADA',
        guaranteedDesc: 'Funciona como el OEM o te devolvemos tu dinero',
        shipping: 'ENVÍO RÁPIDO',
        shippingDesc: 'Ordena ahora, enviamos en cuanto esté disponible',
        returns: 'DEVOLUCIONES FÁCILES',
        returnsDesc: 'Política de devolución de 30 días sin complicaciones',
      },
      // ── Carrito / checkout ──
      cart: {
        title: 'Tu carrito',
        empty: 'Tu carrito está vacío',
        subtotal: 'Subtotal',
        total: 'Total',
        checkout: 'Proceder al pago',
        remove: 'Eliminar',
        continueShopping: 'Seguir comprando',
        payWith: 'Pagar con',
      },
      // ── Genéricos ──
      common: {
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        retry: 'Reintentar',
        contactUs: 'Contáctanos',
        whatsapp: 'Escríbenos por WhatsApp',
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        categories: 'Categories',
        others: 'Others',
        about: 'About Us',
        account: 'Account',
        cart: 'Your cart',
        searchPlaceholder: 'Search by part number (SKU), model or brand...',
      },
      catalog: {
        navigation: 'Catalog navigation',
        products: 'Products',
        product: 'Product',
        viewAll: 'View all',
        filterBy: 'Filter by',
        clearFilters: 'Clear filters',
        all: '— All —',
        manufacturer: 'Manufacturer',
        model: 'Model',
        oemPart: 'OEM Part # (Optional)',
        patientSize: 'Patient Size',
        armCircumference: 'Arm Circumference',
        price: 'Price (USD)',
        loadingOptions: 'Loading options...',
        noResults: 'No products found with those filters',
        compatibility: 'Compatibility',
        specifications: 'Specifications',
        partNumber: 'Part Number',
      },
      product: {
        addToCart: 'Add to Cart',
        price: 'Price',
        quantity: 'Quantity',
        inStock: 'In stock',
        outOfStock: 'Out of stock',
        savings: 'UP TO 60% SAVINGS',
        savingsDesc: 'Quality compatibles save you money',
        guaranteed: '100% GUARANTEED COMPATIBLE',
        guaranteedDesc: 'Works like the OEM or your money back',
        shipping: 'EXPEDITED SHIPPING',
        shippingDesc: 'Order now, ships when available',
        returns: 'EASY RETURNS',
        returnsDesc: 'Hassle-free 30 day return policy',
      },
      cart: {
        title: 'Your cart',
        empty: 'Your cart is empty',
        subtotal: 'Subtotal',
        total: 'Total',
        checkout: 'Proceed to checkout',
        remove: 'Remove',
        continueShopping: 'Continue shopping',
        payWith: 'Pay with',
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        contactUs: 'Contact us',
        whatsapp: 'Message us on WhatsApp',
      },
    },
  },
};

i18n
  .use(LanguageDetector) // detecta el idioma del navegador automáticamente
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',          // si el idioma no es es/en, usa inglés
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true, // es-MX, es-AR, etc. → es
    detection: {
      // Orden: 1° elección manual guardada, 2° idioma del navegador
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // guarda la elección manual
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
