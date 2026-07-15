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

          // 2. Buscamos variantes SOLO si el producto tiene URL (evita tronar
          //    con productos creados a mano que no tienen URL).
          if (productoData.url) {
            // IMPORTANTE: incluimos precio_venta_sugerido para que las variantes
            // muestren el precio correcto (fix del bug de precios).
            // '*' (solo en detalle) para que cada variante hermana traiga todas
            // las columnas: al seleccionar una variante in-situ podemos fijar su
            // mi_sku/precio/imagen/nombre y agregar el SKU correcto al carrito.
            const { data: variantesData, error: variantesError } = await supabase
              .from('productos_medicos_v2')
              .select('*')
              .eq('url', productoData.url)
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
