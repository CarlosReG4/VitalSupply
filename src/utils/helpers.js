export const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined || precio === '') return '$0.00';
  
  const textoLimpio = String(precio).replace(/[^0-9.]/g, '');
  const numero = Number(textoLimpio);
  
  if (isNaN(numero)) {
    return String(precio).includes('$') ? String(precio) : `$${precio}`;
  }
  
  return '$' + numero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};