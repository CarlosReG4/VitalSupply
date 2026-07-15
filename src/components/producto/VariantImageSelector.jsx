/**
 * Selector de imagen por variante (autocontenido en un solo producto).
 *
 * Lee producto.variantes_imagenes (jsonb): [{ tipo, sku_ref, imagen }].
 * Al tocar una variante cambia SOLO la imagen principal del detalle
 * (setImagenActiva), con fallback obligatorio a producto.imagen_url
 * cuando la entrada no trae imagen. No navega ni toca precio/carrito.
 *
 * La galería de thumbnails (imagen_url_2..6) no se altera: esto solo
 * cambia cuál imagen se muestra como principal.
 */
export default function VariantImageSelector({ producto, imagenActiva, setImagenActiva }) {
  const variantes = Array.isArray(producto?.variantes_imagenes)
    ? producto.variantes_imagenes.filter((v) => v && v.tipo)
    : [];

  if (variantes.length < 2) return null;

  return (
    <div className="mt-5">
      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Ver variante
      </h4>
      <div className="flex flex-wrap gap-2">
        {variantes.map((v) => {
          const imagen = v.imagen || producto.imagen_url;
          const activa = imagenActiva === imagen;
          return (
            <button
              key={v.sku_ref || v.tipo}
              type="button"
              onClick={() => setImagenActiva(v.imagen ?? producto.imagen_url)}
              aria-pressed={activa}
              title={v.sku_ref || v.tipo}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                activa
                  ? "border-yellow-500 bg-yellow-50 text-yellow-800 font-semibold"
                  : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              {v.tipo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
