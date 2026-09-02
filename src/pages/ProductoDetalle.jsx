import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Importamos el SEO
import { useProducto } from '../hooks/useProducto';
import { useCartStore } from '../store/cartStore';
import { nombreProducto } from '../utils/helpers';
import VariantSelector from '../components/producto/VariantSelector';
import { getVariantesConfig } from '../data/variantesProducto';

// Helper: normaliza el campo JSONB (puede venir como array, objeto o null).
function normalizarJsonb(campo) {
  if (!campo) return [];
  if (Array.isArray(campo)) return campo;
  if (typeof campo === 'object') {
    return Object.entries(campo).map(([key, value]) => ({ key, value }));
  }
  return [];
}

const ProductoDetalle = () => {
  // Extraemos id o sku de la URL para que no falle sin importar la ruta
  const { id, sku } = useParams();
  const { t, i18n } = useTranslation();
  const skuBusqueda = id || sku;

  const { producto, variantes, loading, error } = useProducto(skuBusqueda); 
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(null);
  // Variante seleccionada in-situ (uno de los hermanos por url, o el base).
  const [varianteSel, setVarianteSel] = useState(null);
  // SKU de variante para productos con config de variantes (overlay JSON).
  const [variantSku, setVariantSku] = useState(null);
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito);

  // Al cargar un SKU nuevo: reset de cantidad, variante = base, imagen = base.
  // La imagen principal se sincroniza con la identidad del producto (mi_sku),
  // con fallback a /sin-imagen.svg si no tiene.
  useEffect(() => {
    setCantidad(1);
    setVarianteSel(producto || null);
    setImagenActiva(producto?.imagen_url || null);
    // Si el producto tiene config de variantes, arranca en la variante default
    // (para que la página cargue idéntica a hoy).
    const cfg = getVariantesConfig(producto?.mi_sku);
    setVariantSku(cfg ? cfg.defaultVariantSku : null);
  }, [producto?.mi_sku]);

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

  // ── Variantes por config (overlay JSON, mismo SKU/URL canónico) ───────────
  const esEs = String(i18n.language || 'es').startsWith('es');
  const varConfig = getVariantesConfig(producto?.mi_sku);
  const activeVar = varConfig
    ? (varConfig.variants.find((v) => v.sku === (variantSku || varConfig.defaultVariantSku)) || varConfig.variants[0])
    : null;
  const baseTitle = varConfig ? (esEs ? varConfig.base_title_es : varConfig.base_title_en) : null;
  const varLabel = activeVar ? (esEs ? activeVar.label_es : activeVar.label_en) : null;
  const tituloVariante = varConfig ? `${baseTitle} — ${varLabel}` : null;

  // Producto mostrado: si hay config de variante, se sobreescribe el mostrado
  // (SKU visible, precio, MPN, título) con la variante activa SIN navegar y sin
  // tocar la BD. Si no, se usa la variante por url o el base.
  const prod = varConfig
    ? {
        ...producto,
        mi_sku: activeVar.sku,
        precio: Number(activeVar.price),
        precio_venta_sugerido: null,
        en_promocion: false,
        nombre: `${varConfig.base_title_en} — ${activeVar.label_en}`,
        nombre_es: `${varConfig.base_title_es} — ${activeVar.label_es}`,
      }
    : (varianteSel || producto);

  // Normalizamos las tablas (de la variante mostrada)
  const compatibilityList = normalizarJsonb(prod.compatibility);
  const especificacionesList = normalizarJsonb(prod.especificaciones);
  const oemcrossList = normalizarJsonb(prod.oemcross);

  // Variantes (familia completa: base + hermanos por url)
  const todasLasOpciones = [producto, ...(variantes || [])].filter(
    (v, i, a) => v && a.findIndex(t => t?.mi_sku === v?.mi_sku) === i
  ).sort((a, b) => (a?.tipo || '').localeCompare(b?.tipo || ''));

  // Galería de imágenes (de la variante mostrada)
  const galeriaImagenes = [
    prod?.imagen_url,
    prod?.imagen_url_2,
    prod?.imagen_url_3,
    prod?.imagen_url_4,
    prod?.imagen_url_5,
    prod?.imagen_url_6,
  ].filter(Boolean);

  // ── SEO: URL canónica única (SIEMPRE el SKU padre, no la variante) ────────
  const canonicalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/producto/${producto.mi_sku}`
      : `/producto/${producto.mi_sku}`;

  // JSON-LD ProductGroup con hasVariant + AggregateOffer (solo si hay config).
  const variantesActivas = varConfig ? varConfig.variants.filter((v) => v.active !== false) : [];
  const precios = variantesActivas.map((v) => Number(v.price));
  const jsonLd = varConfig
    ? {
        '@context': 'https://schema.org/',
        '@type': 'ProductGroup',
        productGroupID: producto.mi_sku,
        sku: producto.mi_sku,
        name: baseTitle,
        url: canonicalUrl,
        image: producto.imagen_url || undefined,
        brand: { '@type': 'Brand', name: varConfig.brand },
        variesBy: ['https://schema.org/size'],
        hasVariant: variantesActivas.map((v) => ({
          '@type': 'Product',
          name: `${baseTitle} — ${esEs ? v.label_es : v.label_en}`,
          sku: v.sku,
          mpn: v.mpn,
          brand: { '@type': 'Brand', name: varConfig.brand },
          offers: {
            '@type': 'Offer',
            priceCurrency: varConfig.currency || 'USD',
            price: v.price,
            availability: 'https://schema.org/InStock',
          },
        })),
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: varConfig.currency || 'USD',
          lowPrice: Math.min(...precios),
          highPrice: Math.max(...precios),
          offerCount: variantesActivas.length,
          availability: 'https://schema.org/InStock',
        },
      }
    : null;

  return (
    <>
      {/* MAGIA DE SEO PARA GOOGLE */}
      <Helmet>
        <title>{nombreProducto(producto, i18n.language)} | VitalSupply</title>
        <meta
          name="description"
          content={`Compra ${nombreProducto(producto, i18n.language)}. Sensor médico compatible con equipos de la marca. SKU: ${producto.mi_sku}. Envíos rápidos y seguros.`}
        />
        <meta property="og:title" content={`${nombreProducto(producto, i18n.language)} | VitalSupply`} />
        <meta property="og:image" content={producto.imagen_url} />
        {/* URL canónica única para el producto (SKU padre) */}
        <link rel="canonical" href={canonicalUrl} />
        {/* Datos estructurados de variantes para Google */}
        {jsonLd && (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        )}
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
                           if (imagenActiva === imgUrl) setImagenActiva(producto?.imagen_url);
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
              
              <div className="text-xs text-gray-500 mb-1">
                {t('catalog.partNumber')} <span className="font-bold text-black">{prod.mi_sku}</span>
              </div>
              {varConfig && (
                <div className="text-xs text-gray-500 mb-6">
                  MPN (P/N Sino-K) <span className="font-bold text-black">{activeVar.mpn}</span>
                  <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                    {esEs ? 'Conector' : 'Connector'} {varConfig.connector}
                  </span>
                </div>
              )}
              {!varConfig && <div className="mb-6" />}

              {/* Selector de variante por config (overlay JSON) */}
              {varConfig && (
                <fieldset className="mb-6">
                  <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">
                    {esEs ? 'Elige la variante' : 'Choose variant'}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {varConfig.variants.filter((v) => v.active !== false).map((v) => {
                      const activo = activeVar.sku === v.sku;
                      return (
                        <button
                          key={v.sku}
                          type="button"
                          role="radio"
                          aria-checked={activo}
                          onClick={() => setVariantSku(v.sku)}
                          className={`flex items-center justify-between rounded-lg border-2 px-3 py-2 text-left transition-colors ${
                            activo ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className="text-[11px] font-semibold leading-tight text-gray-800">
                            {esEs ? v.label_es : v.label_en}
                          </span>
                          <span className="ml-2 shrink-0 text-[11px] font-bold text-gray-900">
                            ${Number(v.price).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* Tarea B: selector universal de variantes (por grupo_variantes) */}
              {!varConfig && <VariantSelector producto={producto} />}

              {/* Bloque de opciones anterior (por url); se oculta si hay grupo_variantes
                  o si el producto usa config de variante, para no duplicar selectores. */}
              {!varConfig && !producto.grupo_variantes && todasLasOpciones.length > 1 && (
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  {todasLasOpciones.map((v, i) => {
                    const isActive = prod.mi_sku === v.mi_sku;
                    return (
                      <button
                        key={v.mi_sku}
                        type="button"
                        // In-situ: cambia imagen + número de parte + precio + carrito
                        // a esta variante, sin navegar.
                        onClick={() => {
                          setVarianteSel(v);
                          setImagenActiva(v.imagen_url || producto.imagen_url);
                        }}
                        aria-pressed={isActive}
                        className={`text-left p-3 border-[3px] flex flex-col ${
                          isActive
                            ? 'border-yellow-400 bg-white'
                            : 'border-transparent bg-white hover:border-gray-100'
                        }`}
                      >
                        <span className="text-[11px] text-gray-700 mb-1 leading-tight">
                          {v.tipo || t('productPage.option', { num: i + 1 })}
                        </span>
                        <span className="text-[11px] font-bold text-gray-900">
                          ${Number(v.precio_venta_sugerido ?? v.precio).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COLUMNA 3: PRECIO Y CHECKOUT */}
            <div className="lg:col-span-3 pt-2">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-black mt-1">{t('product.price')}:</span>
                {prod.en_promocion && Number(prod.precio_promocion) > 0 ? (
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
                onClick={() => agregarAlCarrito({ ...prod, cantidad })}
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