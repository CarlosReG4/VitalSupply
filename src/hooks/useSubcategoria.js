// src/hooks/useSubcategoria.js
import { useState, useEffect } from 'react';
import { obtenerProductosPorSubcategoria } from '../api/productos';

export const useSubcategoria = (subcategoriaDb, paginaActual = 1, filtros = {}) => {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intentos, setIntentos] = useState(0);

  const filtrosKey = JSON.stringify(filtros);

  useEffect(() => {
    if (!subcategoriaDb) return;
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const { productos: data, total: count } = await obtenerProductosPorSubcategoria(
          subcategoriaDb,
          paginaActual,
          30,
          filtros
        );
        setProductos(data);
        setTotal(count || 0);
      } catch (e) {
        console.error('Error cargando productos:', e);
        setError('No pudimos conectar con la base de datos. Revisa tu conexión o intenta de nuevo.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategoriaDb, paginaActual, filtrosKey, intentos]);

  const reintentar = () => setIntentos(prev => prev + 1);

  return { productos, total, cargando, error, reintentar };
};