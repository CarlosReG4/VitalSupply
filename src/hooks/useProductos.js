// src/hooks/useProductos.js
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

// ✅ Exportación nombrada
export const useProductos = (subcategoriaId, filtrosSeleccionados = {}, paginaActual = 1) => {

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(0);

  useEffect(() => {
    // Si no hay subcategoría, no hacemos nada (y dejamos de cargar)
    if (!subcategoriaId) {
      setProductos([]);
      setTotalPaginas(0);
      setLoading(false);
      return;
    }

    const fetchProductos = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('productos_medicos_v2')
          .select('*', { count: 'exact' })
          .eq('subcategoria', subcategoriaId);

        // Aplicamos los filtros JSONB si existen
        if (filtrosSeleccionados && Object.keys(filtrosSeleccionados).length > 0) {
          query = query.contains('especificaciones', filtrosSeleccionados);
        }

        // Lógica de paginación
        const itemsPorPagina = 12;
        const desde = (paginaActual - 1) * itemsPorPagina;
        const hasta = desde + itemsPorPagina - 1;

        const { data, error, count } = await query
          .order('precio', { ascending: true })
          .range(desde, hasta);

        if (error) throw error;

        setProductos(data || []);
        setTotalPaginas(Math.ceil((count || 0) / itemsPorPagina));
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductos([]);
        setTotalPaginas(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();

  // Se vuelve a ejecutar si cambia la subcategoría, los filtros o la página.
  }, [subcategoriaId, filtrosSeleccionados, paginaActual]);

  return { productos, loading, totalPaginas };
};