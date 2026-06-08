import { useState, useEffect } from 'react';
import { buscarProductos, buscarPorCompatibilidad } from '../api/productos.js';

export const useBusqueda = (parametros, paginaActual = 1) => {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intentos, setIntentos] = useState(0);

  const paramsObj = typeof parametros === 'string' 
    ? { q: parametros, marca: '', modelo: '' } 
    : (parametros || {});

  const q = paramsObj.q || '';
  const marca = paramsObj.marca || '';
  const modelo = paramsObj.modelo || '';

  const reintentar = () => setIntentos(prev => prev + 1);

  useEffect(() => {
    async function cargarResultados() {
      if (!q && !marca && !modelo) {
        setProductos([]);
        setTotal(0);
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);
      
      try {
        let data, count;

        if (marca && modelo) {
          // MODO 1: Usamos la nueva función directa a la tabla
          const response = await buscarPorCompatibilidad(marca, modelo, paginaActual, 30);
          data = response.productos;
          count = response.total;
        } else {
          // MODO 2: Búsqueda de texto general normal
          const response = await buscarProductos(q, paginaActual, 30);
          data = response.productos;
          count = response.total;
        }

        setProductos(data);
        setTotal(count || 0);
      } catch (errorGeneral) {
        console.error("Error en la búsqueda:", errorGeneral);
        setError("Hubo un problema al realizar la búsqueda. Revisa tu conexión e intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    }
    
    cargarResultados();
  }, [q, marca, modelo, paginaActual, intentos]);

  return { productos, total, cargando, error, reintentar };
};