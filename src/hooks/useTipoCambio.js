// src/hooks/useTipoCambio.js
// Lee el tipo de cambio USD->MXN de la tabla public.config (clave 'tipo_cambio_mxn').
// Fallback 18.0 si no se puede leer. Mismo origen que usa el cotizador del admin,
// para que tienda y cotizaciones nunca se contradigan.
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export function useTipoCambio(fallback = 18.0) {
  const [tc, setTc] = useState(fallback);

  useEffect(() => {
    let activo = true;
    supabase
      .from('config')
      .select('valor')
      .eq('clave', 'tipo_cambio_mxn')
      .single()
      .then(({ data, error }) => {
        if (!activo || error) return;
        const n = Number(data?.valor);
        if (Number.isFinite(n) && n > 0) setTc(n);
      });
    return () => { activo = false; };
  }, []);

  return tc;
}
