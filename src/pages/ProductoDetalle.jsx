import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Importamos el SEO
import { useProducto } from '../hooks/useProducto';
import { useTipoCambio } from '../hooks/useTipoCambio';
import { useCartStore } from '../store/cartStore';
import { nombreProducto } from '../utils/helpers';

// Helper: normaliza el campo JSONB (puede venir como array, objeto o null).
function normalizarJsonb(campo) {
  if (!campo) return [];
  if (Array.isArray(campo)) return campo;
  if (typeof campo === 'object') {
    return Object.entries(campo).map(([key, value]) => ({ key, value }));
  }
  return [];
}

// Normaliza para el match de imágenes por variante: trim + toLowerCase.
const norm = (s) => String(s ?? '').trim().toLowerCase();

// variantes_imagenes: jsonb array de { tipo, imagen, sku_ref }. Puede venir
// como array o como string JSON. Devuelve siempre un array.
function normalizarVariantesImagenes(campo) {
  if (!campo) return [];
  let arr = campo;
  if (typeof campo === 'string') {
    try { arr = JSON.parse(campo); } catch { return []; }
  }
  return Array.isArray(arr) ? arr : [];
}

// Imagen de una variante con fallback EN CASCADA (nunca la de otra variante):
//   1) imagen del jsonb variantes_imagenes cuyo `tipo` == variante_nombre (normalizado)
//   2) imagen_url de la fila de esa misma variante
//   3) imagen_url del registro "padre" del grupo
function imagenDeVariante(v, mapaImgs, padre) {
  const match = mapaImgs[norm(v?.variante_nombre)];
  return match || v?.imagen_url || padre?.imagen_url || null;
}

const ProductoDetalle = () => {
  // Extraemos id o sku de la URL para que no falle sin importar la ruta
  const { id, sku } = useParams();
  const { t, i18n } = useTranslation();
  const skuBusqueda = id || sku;

  const { producto, variantes, loading, error } = useProducto(skuBusqueda);
  const tc = useTipoCambio(); // USD -> MXN (public.config)
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(null);
  // Variante seleccionada in-situ (una fila del grupo_variantes, o el base).
  const [varianteSel, setVarianteSel] = useState(null);
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito);

  // Familia = base + hermanos del mismo grupo_variantes, deduplicada por mi_sku.
  const familia = useMemo(() => {
    const all = [producto, ...(variantes || [])].filter(Boolean);
    const vistos = new Set();
    const out = [];
    for (const r of all) {
      if (r?.mi_sku && !vistos.has(r.mi_sku)) { vistos.add(r.mi_sku); out.push(r); }
    }
    return out;
  }, [producto, variantes]);

  // Mapa de imágenes por variante: normaliza(tipo) -> imagen. Se arma con los
  // variantes_imagenes de CUALQUIER fila del grupo (el "padre" suele traerlos).
  const mapaImgs = useMemo(() => {
    const m = {};
    for (const row of familia) {
      for (const it of normalizarVariantesImagenes(row?.variantes_imagenes)) {
        const k = norm(it?.tipo);
        if (k && it?.imagen && !(k in m)) m[k] = it.imagen;
      }
    }
    return m;
  }, [familia]);

  // "Padre" del grupo: la fila que trae variantes_imagenes (si existe), o el base.
  const padre = useMemo(
    () => familia.find((r) => normalizarVariantesImagenes(r?.variantes_imagenes).length) || producto,
    [familia, producto]
  );

  // Variantes para los botones: una por variante_nombre (hay SKUs duplicados).
  // Prioridad al elegir representante: producto actual > con imagen > primero.
  const variantesUnicas = useMemo(() => {
    const porNombre = {};
    for (const v of familia) {
      const k = v?.variante_nombre;
      if (!k) continue;
      const cur = porNombre[k];
      if (
        !cur ||
        v.mi_sku === producto?.mi_sku ||
        (cur.mi_sku !== producto?.mi_sku && !cur.imagen_url && v.imagen_url)
      ) {
        porNombre[k] = v;
      }
    }
    return Object.values(porNombre).sort(
      (a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0)
    );
  }, [familia, producto]);

  const esVariante = !!producto?.grupo_variantes;

  // Al cargar un SKU nuevo: reset de cantidad y variante = base.
  useEffect(() => {
    setCantidad(1);
    setVarianteSel(producto || null);
  }, [producto?.mi_sku]);

  // Imagen por defecto = la de la variante seleccionada por defecto (el base),
  // NO un imagen_url fijo. Se recalcula cuando llega la familia / cambian imágenes.
  useEffect(() => {
    if (!producto) return;
    setImagenActiva(imagenDeVariante(producto, mapaImgs, padre));
  }, [producto?.mi_sku, mapaImgs, padre]);

  // PANTALLA DE CARGA
  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4">
      <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
      <p className="text-gray-500 font-bold">{t('productPage.loadingDetails')}</p>
    </div>
  );

  // PANTALLA DE ERROR
  if (error || !producto) return (
    <div className="p-20 text-center">
      <h2 className="text-2xl font-bold text-gray-800">{t('productPage.notFound')}</h2>
      <p className="text-gray-500">{t('productPage.skuNotFound', { sku: skuBusqueda })}</p>
    </div>
  );

  // Producto mostrado: variante seleccionada in-situ (o el base al cargar).
  const prod = varianteSel || producto;

  // Precio de la variante mostrada: cada fila trae su `precio` en USD; se
  // convierte a MXN con el TC de config. Para productos individuales (sin
  // grupo_variantes) se conserva el comportamiento anterior.
  const precioVarianteMXN = esVariante ? (Number(prod.precio) || 0) * tc : null;
  const fmtMXN = (n) =>
    `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;

  // Normalizamos las tablas (de la variante mostrada)
  const compatibilityList = normalizarJsonb(prod.compatibility);
  const especificacionesList = normalizarJsonb(prod.especificaciones);
  const oemcrossList = normalizarJsonb(prod.oemcross);

  // Galería de imágenes (de la variante mostrada)
  const galeriaImagenes = [
    prod?.imagen_url,
    prod?.imagen_url_2,
    prod?.imagen_url_3,
    prod?.imagen_url_4,
    prod?.imagen_url_5,
    prod?.imagen_url_6,
  ].filter(Boolean);

  const seleccionarVariante = (v) => {
    setVarianteSel(v);
    setImagenActiva(imagenDeVariante(v, mapaImgs, padre));
  };

  return (
    <>
      {/* MAGIA DE SEO PARA GOOGLE */}
      <Helmet>
        <title>{nombreProducto(producto, i18n.language)} | Catsen Medical</title>
        <meta
          name="description"
          content={`Compra ${nombreProducto(producto, i18n.language)}. Sensor médico compatible con equipos de la marca. SKU: ${producto.mi_sku}. Envíos rápidos y seguros.`}
        />
        <meta property="og:title" content={`${nombreProducto(producto, i18n.language)} | Catsen Medical`} />
        <meta property="og:image" content={producto.imagen_url} />
      </Helmet>

      {/* DISEÑO ORIGINAL DE TU PÁGINA */}
      <div className="bg-white min-h-screen pb-20">
        <div className="container mx-auto px-4 py-6 max-w-[1200px]">

          {/* BREADCRUMBS */}
          <nav className="text-xs text-gray-300 mb-8 flex gap-2">
             <Link to="/" className="hover:text-blue-600">{t('nav.home')}</Link>
             <span>›</span>
             <Link to={`/categorias?tipo=${producto.categoria}`} className="hover:text-blue-600">{producto.categoria}</Link>
             <span>›</span>
             <span className="text-gray-400">{nombreProducto(prod, i18n.language)}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

            {/* COLUMNA 1: IMÁGENES INTERACTIVAS */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-center mb-4 relative h-[350px] bg-white rounded-2xl border border-gray-50 p-4">
                <img
                  src={imagenActiva || '/sin-imagen.svg'}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/sin-imagen.svg'; }}

                  alt={nombreProducto(prod, i18n.language)}
                  className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
                />
              </div>

              {galeriaImagenes.length > 1 && (
                <div className="flex gap-2 justify-center mt-4">
                   {galeriaImagenes.map((imgUrl, index) => (
                     <div
                       key={index}
                       onClick={() => setImagenActiva(imgUrl)}
                       className={`w-16 h-16 border rounded-xl p-1 cursor-pointer transition-all bg-white flex items-center justify-center overflow-hidden ${
                         imagenActiva === imgUrl
                           ? 'border-blue-600 shadow-sm scale-105'
                           : 'border-gray-200 hover:border-gray-400 opacity-80'
                       }`}
                     >
                       <img
                         src={imgUrl}
                         className="max-w-full max-h-full object-contain mix-blend-multiply"
                         alt={`thumb-${index}`}
                         onError={(e) => {
                           e.target.closest('div').style.display = 'none';
                           if (imagenActiva === imgUrl) setImagenActiva(imagenDeVariante(prod, mapaImgs, padre));
                         }}
                       />
                     </div>
                   ))}
                </div>
              )}
            </div>

            {/* COLUMNA 2: TÍTULO Y VARIANTES */}
            <div className="lg:col-span-4 flex flex-col pt-2">
              <h1 className="text-2xl font-bold text-black leading-tight mb-2">
                {nombreProducto(prod, i18n.language)}
              </h1>

              <div className="flex text-yellow-400 text-xs mb-4">
                <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
              </div>

              <div className="text-xs text-gray-500 mb-6">
                {t('catalog.partNumber')} <span className="font-bold text-black">{prod.mi_sku}</span>
              </div>

              {/* Selector de variantes: agrupado por grupo_variantes, in-situ.
                  Etiqueta = variante_nombre. Cambia imagen + SKU + precio + carrito
                  sin navegar. Solo se muestra si el grupo tiene 2+ variantes. */}
              {esVariante && variantesUnicas.length > 1 && (
                <section aria-label={t('productPage.chooseVariant', 'Elige tu variante')} className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('productPage.chooseVariant', 'Elige tu variante')}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {variantesUnicas.map((v) => {
                      const activa = norm(v.variante_nombre) === norm(prod.variante_nombre);
                      const pmxn = (Number(v.precio) || 0) * tc;
                      return (
                        <button
                          key={v.mi_sku}
                          type="button"
                          onClick={() => seleccionarVariante(v)}
                          aria-pressed={activa}
                          className={`text-left p-3 border-[3px] flex flex-col ${
                            activa
                              ? 'border-yellow-400 bg-white'
                              : 'border-transparent bg-white hover:border-gray-100'
                          }`}
                        >
                          <span className="text-[11px] text-gray-700 mb-1 leading-tight">
                            {v.variante_nombre || '—'}
                          </span>
                          <span className="text-[11px] font-bold text-gray-900">
                            ${pmxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* COLUMNA 3: PRECIO Y CHECKOUT */}
            <div className="lg:col-span-3 pt-2">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-black mt-1">{t('product.price')}:</span>
                {esVariante ? (
                  // Variante: precio de la fila seleccionada (USD -> MXN con TC).
                  <span className="text-2xl font-bold text-yellow-500 text-right">
                    {fmtMXN(precioVarianteMXN)}
                  </span>
                ) : prod.en_promocion && Number(prod.precio_promocion) > 0 ? (
                  <span className="flex flex-col items-end leading-tight">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-yellow-500">
                        ${Number(prod.precio_promocion).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                      {prod.porcentaje_descuento ? (
                        <span className="text-[11px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                          -{prod.porcentaje_descuento}%
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ${Number(prod.precio_venta_sugerido ?? prod.precio).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </span>
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-yellow-500">
                    ${Number(prod.precio_venta_sugerido ?? prod.precio).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-black mt-1">{t('product.quantity')}:</span>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-8 h-8 flex justify-center items-center bg-gray-50 hover:bg-gray-200 text-gray-800 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={cantidad}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCantidad(val === '' ? '' : Number(val));
                    }}
                    onBlur={() => {
                      if (cantidad === '' || cantidad < 1) setCantidad(1);
                    }}
                    className="w-10 h-8 text-center text-xs font-bold outline-none border-x border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setCantidad((cantidad || 0) + 1)}
                    className="w-8 h-8 flex justify-center items-center bg-gray-50 hover:bg-gray-200 text-gray-800 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right text-[10px] text-gray-400 mb-6">
                {t('product.inStock')}
              </div>

              <button
                onClick={() => agregarAlCarrito({
                  ...prod,
                  // Para variantes, el carrito lleva el precio ya en MXN (coherente
                  // con lo mostrado y con el total de WhatsApp/checkout).
                  ...(esVariante ? { precio: precioVarianteMXN } : {}),
                  cantidad,
                })}
                className="w-full bg-[#8ced00] hover:bg-[#7bc800] text-white py-3 font-bold transition-colors mb-8 text-sm shadow-sm"
              >
                {t('product.addToCart')}
              </button>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <i className="fas fa-piggy-bank text-gray-300 text-xl w-6 text-center"></i>
                  <div>
                    <strong className="block text-[11px] text-gray-600 uppercase tracking-wide">{t('product.savings')}</strong>
                    <span className="text-[10px] text-gray-400 leading-tight block mt-1">{t('product.savingsDesc')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="fas fa-link text-gray-300 text-xl w-6 text-center"></i>
                  <div>
                    <strong className="block text-[11px] text-gray-600 uppercase tracking-wide">{t('product.guaranteed')}</strong>
                    <span className="text-[10px] text-gray-400 leading-tight block mt-1">{t('product.guaranteedDesc')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="fas fa-truck text-gray-300 text-xl w-6 text-center"></i>
                  <div>
                    <strong className="block text-[11px] text-gray-600 uppercase tracking-wide">{t('product.shipping')}</strong>
                    <span className="text-[10px] text-gray-400 leading-tight block mt-1">{t('product.shippingDesc')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="fas fa-box text-gray-300 text-xl w-6 text-center"></i>
                  <div>
                    <strong className="block text-[11px] text-gray-600 uppercase tracking-wide">{t('product.returns')}</strong>
                    <span className="text-[10px] text-gray-400 leading-tight block mt-1">{t('product.returnsDesc')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* TABLAS INFERIORES */}
          <div className="border-t border-gray-200 pt-10">

            {/* COMPATIBILITY */}
            {compatibilityList.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg font-bold text-black mb-6">{t('catalog.compatibility')}:</h2>
                <div className="border-b border-gray-300 pb-2 flex text-sm font-bold text-black mb-4">
                  <div className="w-1/3">{t('catalog.manufacturer')}</div>
                  <div className="w-2/3">{t('catalog.model')}</div>
                </div>
                <div className="flex flex-col">
                  {compatibilityList.map((item, i) => (
                    <div key={i} className="flex text-sm py-3 border-b border-gray-100">
                      <div className="w-1/3 font-bold text-gray-700 pr-4">
                        {item.Manufacturer || item.manufacturer || '—'}
                      </div>
                      <div className="w-2/3 text-gray-600 leading-relaxed">
                        {item.Model || item.model || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OEM CROSS REFERENCES */}
            {oemcrossList.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg font-bold text-black mb-6">{t('productPage.oemCrossReference')}:</h2>
                <div className="border-b border-gray-300 pb-2 flex text-sm font-bold text-black mb-4">
                  <div className="w-1/3">{t('catalog.manufacturer')}</div>
                  <div className="w-2/3">{t('productPage.oemPartHeader')}</div>
                </div>
                <div className="flex flex-col">
                  {oemcrossList.map((item, i) => (
                    <div key={i} className="flex text-sm py-3 border-b border-gray-100">
                      <div className="w-1/3 font-bold text-gray-700 pr-4">
                        {item.Manufacturer || item.manufacturer || '—'}
                      </div>
                      <div className="w-2/3 text-gray-600 leading-relaxed">
                        {item['OEM Part #'] || item.oem_part || item['oem part #'] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TECHNICAL SPECIFICATIONS */}
            {especificacionesList.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg font-bold text-black mb-6">{t('productPage.technicalSpecifications')}:</h2>
                <div className="flex flex-col border-t border-gray-200 pt-2">
                  {especificacionesList.map((item, i) => (
                    <div key={i} className="flex text-sm py-3 border-b border-gray-100">
                      <div className="w-1/3 font-bold text-gray-700 pr-4">
                        {item.key || item.Key || '—'}
                      </div>
                      <div className="w-2/3 text-gray-600">
                        {item.value || item.Value || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default ProductoDetalle;
