// src/hooks/useFiltrosCategoria.js
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

/**
 * Carga opciones de filtro con cascading bidireccional.
 * Cuando cambian los filtros activos, recalcula las opciones de cada dropdown
 * considerando los OTROS filtros (sin considerar su propio filtro).
 *
 * Uso:
 *   useFiltrosCategoria({ categoria: 'SpO2' }, { manufacturer: 'Masimo' })
 */
export const useFiltrosCategoria = (
  { categoria = null, subcategoria = null } = {},
  filtrosActivos = {}
) => {
  const [opciones, setOpciones] = useState({ manufacturers: [], models: [], oems: [] });
  const [cargando, setCargando] = useState(true);

  // Estabilizamos la clave de los filtros para el useEffect
  const filtrosKey = JSON.stringify(filtrosActivos);

  useEffect(() => {
    if (!categoria && !subcategoria) return;
    let cancelado = false;
    setCargando(true);

    async function cargar() {
      try {
        const { data, error } = await supabase.rpc('get_filter_options', {
          p_categoria: categoria,
          p_subcategoria: subcategoria,
          p_manufacturer: filtrosActivos.manufacturer || null,
          p_model: filtrosActivos.model || null,
          p_oem_part: filtrosActivos.oemPart || null,
        });
        if (error) {
          console.error('[useFiltrosCategoria] Error:', error);
          return;
        }
        if (!cancelado && data) {
          setOpciones({
            manufacturers: data.manufacturers || [],
            models: data.models || [],
            oems: data.oems || [],
          });
        }
      } catch (e) {
        console.error('[useFiltrosCategoria] Excepción:', e);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria, subcategoria, filtrosKey]);

  return {
    cargando,
    manufacturers: opciones.manufacturers,
    models: opciones.models,
    oems: opciones.oems,
  };
};
