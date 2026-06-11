import { supabase } from './supabase';
import { productoSchema } from '../schemas/productoSchema.js';

// Parseo robusto de una lista: valida cada producto por separado. Si uno falla
// el schema, lo deja pasar tal cual en vez de tirar toda la lista.
function parsearLista(lista) {
  return (lista || []).map((p) => {
    // Si el producto tiene un precio_venta_sugerido válido y mayor a 0,
    // lo usamos; de lo contrario, conservamos el precio normal.
    const productoModificado = {
      ...p,
      precio: p.precio_venta_sugerido && parseFloat(p.precio_venta_sugerido) > 0
        ? parseFloat(p.precio_venta_sugerido)
        : p.precio
    };

    const r = productoSchema.safeParse(productoModificado);
    return r.success ? r.data : productoModificado;
  });
}

async function _fetchProductos({ categoria = null, subcategoria = null, filtros = {}, pagina = 1, limite = 30 }) {
  const { data, error } = await supabase.rpc('get_productos_filtrados', {
    p_categoria: categoria,
    p_subcategoria: subcategoria,
    p_manufacturer: filtros.manufacturer || null,
    p_model: filtros.model || null,
    p_oem_part: filtros.oemPart || null,
    p_pagina: pagina,
    p_limite: limite,
    p_precio_min: filtros.precioMin != null ? Number(filtros.precioMin) : null,
    p_precio_max: filtros.precioMax != null ? Number(filtros.precioMax) : null,
  });

  if (error) {
    console.error('[fetchProductos] RPC error:', error);
    throw error;
  }

  // La RPC devuelve un ARRAY con un elemento: [{ productos, total }].
  const row = (data && data[0]) || { productos: [], total: 0 };

  return {
    productos: parsearLista(row.productos),
    total: Number(row.total) || 0
  };
}

export const obtenerProductosCategoria = (categoria, pagina = 1, limite = 30, filtros = {}) =>
  _fetchProductos({ categoria, pagina, limite, filtros });

export const obtenerProductosPorSubcategoria = (subcategoria, pagina = 1, limite = 30, filtros = {}) =>
  _fetchProductos({ subcategoria, pagina, limite, filtros });

// Función para conectarse directamente a la base de datos (RPC) para buscar en el JSON
export const buscarPorCompatibilidad = async (marca, modelo, pagina = 1, limite = 30) => {
  const from = (pagina - 1) * limite;
  const to = from + limite - 1;

  const { data, error, count } = await supabase
    .rpc('buscar_compatibles', {
      marca_query: marca,
      modelo_query: modelo
    }, { count: 'exact' })
    .range(from, to);

  if (error) {
    console.error("Error en Supabase al buscar compatibilidad:", error);
    throw error;
  }

  return {
    productos: parsearLista(data),
    total: count || 0
  };
};

// Búsqueda por texto con soporte de pestaña "nuevos"
export const buscarProductos = async (terminoBusqueda = '', pagina = 1, limite = 30, vista = 'catalogo') => {
  const from = (pagina - 1) * limite;
  const to = from + limite - 1;
  const busquedaLimpia = String(terminoBusqueda || '').trim();

  let query = supabase
    .from('productos_medicos_v2')
    .select('*', { count: 'exact' });

  if (busquedaLimpia) {
    query = query.or(`nombre.ilike.%${busquedaLimpia}%,mi_sku.ilike.%${busquedaLimpia}%,sku_competencia.ilike.%${busquedaLimpia}%`);
  }

  if (vista === 'nuevos') {
    query = query.eq('es_nuevo', true);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error en Supabase al buscar:", error);
    throw error;
  }

  return {
    productos: parsearLista(data),
    total: count || 0
  };
};

// Checkbox de productos nuevos
export const toggleProductoNuevo = async (sku, estadoActual) => {
  const { data, error } = await supabase
    .from('productos_medicos_v2')
    .update({ es_nuevo: !estadoActual })
    .eq('mi_sku', sku);

  if (error) throw error;
  return data;
};

// Insertar producto con TODOS los campos
export const crearProducto = async (nuevo) => {
  const { data, error } = await supabase
    .from('productos_medicos_v2')
    .insert([
      {
        mi_sku: nuevo.mi_sku,
        nombre: nuevo.nombre,
        precio: parseFloat(nuevo.precio) || 0,
        precio_venta_sugerido: nuevo.precio_venta_sugerido ?? null,
        tiene_proveedor: nuevo.tiene_proveedor ?? true,
        tipo: nuevo.tipo,
        url: nuevo.url,
        descripcion: nuevo.descripcion,
        categoria: nuevo.categoria,
        subcategoria: nuevo.subcategoria,
        sku_competencia: nuevo.sku_competencia,
        disponible: nuevo.disponible,
        imagen_url: nuevo.imagen_url,
        imagen_url_2: nuevo.imagen_url_2,
        imagen_url_3: nuevo.imagen_url_3,
        imagen_url_4: nuevo.imagen_url_4,
        imagen_url_5: nuevo.imagen_url_5,
        imagen_url_6: nuevo.imagen_url_6,
        compatibility: nuevo.compatibility,
        especificaciones: nuevo.especificaciones,
        oemcross: nuevo.oemcross,
        es_nuevo: true
      }
    ]);

  if (error) throw error;
  return data;
};

// Actualizar con TODOS los campos
export const actualizarProducto = async (sku, actualizado) => {
  const { data, error } = await supabase
    .from('productos_medicos_v2')
    .update({
        nombre: actualizado.nombre,
        precio: parseFloat(actualizado.precio) || 0,
        precio_venta_sugerido: actualizado.precio_venta_sugerido ?? null,
        tiene_proveedor: actualizado.tiene_proveedor ?? true,
        tipo: actualizado.tipo,
        url: actualizado.url,
        descripcion: actualizado.descripcion,
        categoria: actualizado.categoria,
        subcategoria: actualizado.subcategoria,
        sku_competencia: actualizado.sku_competencia,
        disponible: actualizado.disponible,
        imagen_url: actualizado.imagen_url,
        imagen_url_2: actualizado.imagen_url_2,
        imagen_url_3: actualizado.imagen_url_3,
        imagen_url_4: actualizado.imagen_url_4,
        imagen_url_5: actualizado.imagen_url_5,
        imagen_url_6: actualizado.imagen_url_6,
        compatibility: actualizado.compatibility,
        especificaciones: actualizado.especificaciones,
        oemcross: actualizado.oemcross
    })
    .eq('mi_sku', sku);

  if (error) throw error;
  return data;
};

// Checkbox (estrella) de productos destacados
export const toggleProductoDestacado = async (sku, estadoActual) => {
  const { data, error } = await supabase
    .from('productos_medicos_v2')
    .update({ destacado: !estadoActual })
    .eq('mi_sku', sku);

  if (error) throw error;
  return data;
};

// Eliminar un producto por su SKU
export const eliminarProducto = async (sku) => {
  const { error } = await supabase
    .from('productos_medicos_v2')
    .delete()
    .eq('mi_sku', sku);

  if (error) throw error;
  return true;
};

// Paginación y filtros por subcategoría (usada por useProductos)
// Usa la RPC get_productos_filtrados: filtra por manufacturer/model/oem (compatibility) y por precio.
export const fetchProductosPorSubcategoriaAvanzado = async (subcategoriaId, paginaActual = 1, itemsPorPagina = 12, filtrosSeleccionados = {}) => {
  const f = filtrosSeleccionados || {};

  const { data, error } = await supabase.rpc('get_productos_filtrados', {
    p_categoria: null,
    p_subcategoria: subcategoriaId,
    p_manufacturer: f.manufacturer || null,
    p_model: f.model || null,
    p_oem_part: f.oemPart || null,
    p_pagina: paginaActual,
    p_limite: itemsPorPagina,
    p_precio_min: f.precioMin != null ? Number(f.precioMin) : null,
    p_precio_max: f.precioMax != null ? Number(f.precioMax) : null,
  });

  if (error) throw error;

  const row = (data && data[0]) || { productos: [], total: 0 };
  return {
    data: row.productos || [],
    count: Number(row.total) || 0
  };
};