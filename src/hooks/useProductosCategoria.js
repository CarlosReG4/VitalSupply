import { useState, useEffect } from 'react';
import { obtenerProductosCategoria } from '../api/productos';

export const useProductosCategoria = (categoriaPrincipal, paginaActual = 1, filtros = {}) => {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Convertir filtros a string para usar como dependencia estable de useEffect
  const filtrosKey = JSON.stringify(filtros);

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setError(null);
      try {
        const { productos: data, total: count } = await obtenerProductosCategoria(
          categoriaPrincipal,
          paginaActual,
          30,
          filtros
        );
        setProductos(data);
        setTotal(count || 0);
      } catch (errorGeneral) {
        console.error('Error al descargar el catálogo:', errorGeneral);
        setError(errorGeneral.message || 'Error al cargar productos');
      } finally {
        setCargando(false);
      }
    }

    if (categoriaPrincipal) cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaPrincipal, paginaActual, filtrosKey]);

  const reintentar = () => {
    if (categoriaPrincipal) {
      setCargando(true);
      // forzar recarga
      setError(null);
    }
  };

  return { productos, total, cargando, error, reintentar };
};
