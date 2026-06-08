// src/hooks/useProductos.js
import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { fetchProductosPorSubcategoriaAvanzado } from '../api/productos';

=======
import { supabase } from '../api/supabase';

// ✅ Exportación nombrada
>>>>>>> 53b4523e379b789749bcb5db9b16088b73afbfbd
export const useProductos = (subcategoriaId, filtrosSeleccionados = {}, paginaActual = 1) => {

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(0);

<<<<<<< HEAD
  // Convertimos el objeto a texto para que el useEffect lo compare correctamente
  const filtrosString = JSON.stringify(filtrosSeleccionados);

  useEffect(() => {
=======
  useEffect(() => {
    // Si no hay subcategoría, no hacemos nada (y dejamos de cargar)
>>>>>>> 53b4523e379b789749bcb5db9b16088b73afbfbd
    if (!subcategoriaId) {
      setProductos([]);
      setTotalPaginas(0);
      setLoading(false);
      return;
    }

<<<<<<< HEAD
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const itemsPorPagina = 12;
        // Llamamos a la API centralizada en lugar de consultar a Supabase aquí
        const { data, count } = await fetchProductosPorSubcategoriaAvanzado(
          subcategoriaId,
          paginaActual,
          itemsPorPagina,
          JSON.parse(filtrosString)
        );

        setProductos(data);
        setTotalPaginas(Math.ceil(count / itemsPorPagina));
=======
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
>>>>>>> 53b4523e379b789749bcb5db9b16088b73afbfbd
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductos([]);
        setTotalPaginas(0);
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
    cargarProductos();

  }, [subcategoriaId, filtrosString, paginaActual]);
=======
    fetchProductos();

  // Se vuelve a ejecutar si cambia la subcategoría, los filtros o la página.
  }, [subcategoriaId, filtrosSeleccionados, paginaActual]);
>>>>>>> 53b4523e379b789749bcb5db9b16088b73afbfbd

  return { productos, loading, totalPaginas };
};