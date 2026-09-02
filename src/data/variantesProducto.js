// src/data/variantesProducto.js
// Registro de variantes por SKU padre. El catálogo vive en Supabase (filas),
// así que este archivo es un OVERLAY: si un producto tiene config aquí, la
// página de producto muestra un selector de variante en la misma URL/SKU
// canónico, sin tocar la base de datos ni otros productos.
import konsungScn39 from './konsung-scn39.json';

export const VARIANTES_PRODUCTO = {
  [konsungScn39.sku]: konsungScn39,
};

// Devuelve la config de variantes de un SKU padre, o null si no tiene.
export const getVariantesConfig = (sku) => VARIANTES_PRODUCTO[sku] || null;
