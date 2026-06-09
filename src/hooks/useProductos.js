// src/hooks/useProductos.js
import { useState, useEffect } from 'react';
import { fetchProductosPorSubcategoriaAvanzado } from '../api/productos';

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

    const cargarProductos = async () => {
      setLoading(true);
      try {
        const itemsPorPagina = 12;
        
        // Llamamos a la API centralizada
        const { data, count } = await fetchProductosPorSubcategoriaAvanzado(
          subcategoriaId,
          paginaActual,
          itemsPorPagina,
          JSON.parse(filtrosString)
        );

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

    cargarProductos();
  }, [subcategoriaId, filtrosString, paginaActual]);

  return { productos, loading, totalPaginas };
};