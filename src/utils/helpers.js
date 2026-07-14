export const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined || precio === '') return '$0.00';
  
  const textoLimpio = String(precio).replace(/[^0-9.]/g, '');
  const numero = Number(textoLimpio);
  
  if (isNaN(numero)) {
    return String(precio).includes('$') ? String(precio) : `$${precio}`;
  }
  
  return '$' + numero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Nombre/descripción del producto según el idioma activo de i18n.
// En español usa la columna *_es; si viene vacía o NULL, cae al inglés original.
export const nombreProducto = (p, lang) =>
  (lang === 'es' && p?.nombre_es && String(p.nombre_es).trim())
    ? p.nombre_es
    : (p?.nombre || '');

export const descripcionProducto = (p, lang) =>
  (lang === 'es' && p?.descripcion_es && String(p.descripcion_es).trim())
    ? p.descripcion_es
    : (p?.descripcion || '');