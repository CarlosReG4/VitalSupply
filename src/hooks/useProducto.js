// src/hooks/useProducto.js
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export const useProducto = (sku) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variantes, setVariantes] = useState([]);

  useEffect(() => {
    if (!sku) return;

    const fetchProductoYVariantes = async () => {
      setLoading(true);
      setError(null); // Limpiamos cualquier error previo (mejora del socio)
      try {
        // 1. Buscamos el producto principal
        const { data: productoData, error: productoError } = await supabase
          .from('productos_medicos_v2')
          .select('*')
          .eq('mi_sku', sku)
          .maybeSingle();

        if (productoError) throw productoError;

        if (productoData) {
          setProducto(productoData);

          // 2. Variantes: agrupamos por `grupo_variantes` (NO por nombre ni url).
          //    Cada grupo_variantes distinto = una página de producto separada.
          //    Filas con grupo_variantes NULL = producto individual (sin hermanos).
          //    Traemos '*' para que cada variante fije su mi_sku/precio/imagen/
          //    variante_nombre/variantes_imagenes al seleccionarla in-situ.
          if (productoData.grupo_variantes) {
            const { data: variantesData, error: variantesError } = await supabase
              .from('productos_medicos_v2')
              .select('*')
              .eq('grupo_variantes', productoData.grupo_variantes)
              .neq('mi_sku', sku);

            if (variantesError) throw variantesError;
            setVariantes(variantesData || []);
          } else {
            setVariantes([]);
          }
        } else {
          setProducto(null);
          setVariantes([]);
        }
      } catch (err) {
        console.error("Error al cargar el producto o variantes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductoYVariantes();
  }, [sku]);

  return { producto, variantes, loading, error };
};
