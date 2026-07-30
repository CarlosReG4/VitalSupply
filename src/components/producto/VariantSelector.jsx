import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";

/**
 * Tarjetas de variantes (estilo tabla de la competencia).
 * - Consulta hermanos por grupo_variantes
 * - Dedupe por variante_nombre (hay SKUs duplicados en la BD)
 * - Tocar una variante navega a la página de ese producto
 */
export default function VariantSelector({ producto }) {
  const [variantes, setVariantes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!producto?.grupo_variantes) return;
    let activo = true;

    supabase
      .from("productos_medicos_v2")
      .select("mi_sku, variante_nombre, precio, precio_venta_sugerido, disponible, imagen_url")
      .eq("grupo_variantes", producto.grupo_variantes)
      .eq("disponible", true)
      .order("precio", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error cargando variantes:", error.message);
          return;
        }
        // DEDUPE: una tarjeta por variante_nombre.
        // Prioridad: producto actual > con imagen > primero encontrado.
        const porNombre = {};
        for (const v of data ?? []) {
          const k = v.variante_nombre;
          if (!k) continue;
          const actual = porNombre[k];
          if (
            !actual ||
            v.mi_sku === producto.mi_sku ||
            (actual.mi_sku !== producto.mi_sku && !actual.imagen_url && v.imagen_url)
          ) {
            porNombre[k] = v;
          }
        }
        if (activo) setVariantes(Object.values(porNombre));
      });

    return () => { activo = false; };
  }, [producto?.grupo_variantes, producto?.mi_sku]);

  if (!producto?.grupo_variantes || variantes.length < 2) return null;

  return (
    <section className="mt-6" aria-label="Variantes disponibles">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Elige tu variante
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variantes.map((v) => {
          const activa = v.mi_sku === producto.mi_sku;
          const precio = v.precio_venta_sugerido ?? v.precio;
          return (
            <button
              key={v.mi_sku}
              type="button"
              onClick={() => !activa && navigate(`/producto/${v.mi_sku}`)}
              aria-pressed={activa}
              className={`text-left rounded-lg border px-4 py-3 transition
                ${activa
                  ? "border-yellow-500 ring-1 ring-yellow-500 bg-yellow-50 cursor-default"
                  : "border-gray-300 hover:border-blue-500 hover:shadow-sm"}`}
            >
              <span className="block font-medium text-gray-900">
                {v.variante_nombre}
              </span>
              <span className={`block text-sm mt-1 ${activa ? "text-yellow-700 font-semibold" : "text-gray-600"}`}>
                ${Number(precio).toFixed(2)} USD
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
