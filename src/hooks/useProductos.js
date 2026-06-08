// src/hooks/useProductos.js
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export const useProductos = (subcategoriaId, filtrosSeleccionados = {}, paginaActual = 1) => {

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Convertimos el objeto a texto para que el useEffect lo compare correctamente
  const filtrosString = JSON.stringify(filtrosSeleccionados);

  useEffect(() => {
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

        // Aquí seguimos usando el objeto original, ya que a Supabase sí le sirve como objeto
        if (filtrosSeleccionados && Object.keys(filtrosSeleccionados).length > 0) {
          query = query.contains('especificaciones', filtrosSeleccionados);
        }

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

  // Reemplazamos filtrosSeleccionados por filtrosString
  }, [subcategoriaId, filtrosString, paginaActual]);

  return { productos, loading, totalPaginas };
};