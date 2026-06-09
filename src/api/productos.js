import { supabase } from './supabase';
import { productoSchema } from '../schemas/productoSchema.js';

// Parseo robusto de una lista: valida cada producto por separado. Si uno falla
// el schema, lo deja pasar tal cual en vez de tirar toda la lista.
function parsearLista(lista) {
  return (lista || []).map((p) => {
    // --- NUEVA LÓGICA DE PRECIOS ---
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
  });

  if (error) {
    console.error('[fetchProductos] RPC error:', error);
    throw error;
  }

  // La RPC devuelve un ARRAY con un elemento: [{ productos, total }].
  // Hay que tomar data[0], no data, o todo sale vacío.
  const row = (data && data[0]) || { productos: [], total: 0 };

  // Parseo robusto: un producto raro no tumba toda la categoría.
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

// --- AQUÍ ESTÁ EL CAMBIO PRINCIPAL ---
// Agregamos el parámetro "vista" y el filtro "es_nuevo"
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

  // MAGIA AQUÍ: Filtramos para que la pestaña de Nuevos SOLO muestre los nuevos
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

// NUEVA FUNCIÓN: Para el checkbox de productos nuevos
export const toggleProductoNuevo = async (sku, estadoActual) => {
  const { data, error } = await supabase
    .from('productos_medicos_v2')
    .update({ es_nuevo: !estadoActual })
    .eq('mi_sku', sku)
    .select(); // <-- AGREGADO

  if (error) throw error;
  return data;
};

// NUEVA FUNCIÓN: Para insertar productos con TODOS los campos
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
        es_nuevo: true // Todo producto que crees desde el panel, nacerá como "nuevo"
      }
    ])
    .select(); // <-- AGREGADO

  if (error) throw error;
  return data;
};

// NUEVA FUNCIÓN: Para actualizar con TODOS los campos
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
    .eq('mi_sku', sku)
    .select(); // <-- AGREGADO

  if (error) throw error;
  return data;
};

// NUEVA FUNCIÓN: Para el checkbox (estrella) de productos destacados
export const toggleProductoDestacado = async (sku, estadoActual) => {
  const { data, error } = await supabase
    .from('productos_medicos_v2')
    .update({ destacado: !estadoActual })
    .eq('mi_sku', sku)
    .select(); // <-- AGREGADO

  if (error) throw error;
  return data;
};

// NUEVA FUNCIÓN: Eliminar un producto por su SKU
export const eliminarProducto = async (sku) => {
  const { error } = await supabase
    .from('productos_medicos_v2')
    .delete()
    .eq('mi_sku', sku);

  if (error) throw error;
  return true;

  // NUEVA FUNCIÓN: Extraída del hook useProductos para centralizar la base de datos
export const fetchProductosPorSubcategoriaAvanzado = async (subcategoriaId, paginaActual = 1, itemsPorPagina = 12, filtrosSeleccionados = {}) => {
  let query = supabase
    .from('productos_medicos_v2')
    .select('*', { count: 'exact' })
    .eq('subcategoria', subcategoriaId);

  // Aplicamos los filtros JSONB si existen
  if (filtrosSeleccionados && Object.keys(filtrosSeleccionados).length > 0) {
    query = query.contains('especificaciones', filtrosSeleccionados);
  }

  const desde = (paginaActual - 1) * itemsPorPagina;
  const hasta = desde + itemsPorPagina - 1;

  const { data, error, count } = await query
    .order('precio', { ascending: true })
    .range(desde, hasta);

  if (error) throw error;

  return { 
    data: data || [], 
    count: count || 0 
  };
};
};