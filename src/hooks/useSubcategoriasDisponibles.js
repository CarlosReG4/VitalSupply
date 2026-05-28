// src/hooks/useSubcategoriasDisponibles.js
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

/**
 * Lee la vista 'subcategorias_disponibles' en Supabase, que devuelve cada
 * subcategoría única con su conteo de productos. La vista está creada en
 * la base de datos y se actualiza automáticamente cuando agregas/quitas
 * productos — no hay que mantener nada en el frontend.
 *
 * Si la query falla, devuelve un Set vacío. El consumidor debe decidir
 * qué hacer en ese caso (recomendado: no filtrar nada).
 */
export const useSubcategoriasDisponibles = () => {
  const [subcategoriasConProductos, setSubcategoriasConProductos] = useState(new Set());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from('subcategorias_disponibles')
          .select('subcategoria');

        if (error) {
          console.error('[useSubcategoriasDisponibles] Error:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.warn('[useSubcategoriasDisponibles] La vista devolvió 0 filas');
          return;
        }

        const set = new Set(data.map((row) => row.subcategoria).filter(Boolean));
        setSubcategoriasConProductos(set);
      } catch (e) {
        console.error('[useSubcategoriasDisponibles] Excepción:', e);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  return { subcategoriasConProductos, cargando };
};