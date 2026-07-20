# Estado del proyecto — VitalSupply

> Documento para retomar el trabajo fácilmente (incluso desde el celular en `claude.ai/code`).
> Última actualización: 2026-07-20.

## Fila de pendientes (siguiente a atacar)
- **Cloudflare / DDoS:** falta configurar Cloudflare frente al dominio (proxy naranja, SSL Full-Strict,
  "Always Use HTTPS", reglas de rate-limit/Bot Fight Mode) para mitigar DDoS. Ya se preparó la guía; queda
  ejecutarla en el panel de Cloudflare + apuntar los NS del dominio.
- **PR #4 (headers de seguridad `vercel.json`):** HSTS, CSP, X-Frame-Options, nosniff, Referrer/Permissions-Policy.
  Ya está commiteado en su rama; falta probar el preview de Vercel y hacer merge a `main`.
- **Imágenes MED-6840 (SP9305AL):** subir `SP9305AL_img1.jpg` y `SP9305AL_img2.jpg` al bucket
  `imagenes_productos/sinok-spo2/` en Supabase Storage y apuntar `imagen_url`. Requiere subir el archivo
  desde el panel de Supabase (no se puede desde el entorno web sin service role key). Respaldo en `_backup_fix_manual`.

## Preferencias fijas (aplicar siempre)
- **Correo de la empresa en cotizaciones/PO:** usar SIEMPRE en automático `sales.vitalsupplymx@gmail.com`
  (no `ventas@vitalsupply.site`, no pedirlo cada vez). Ya está fijo en `CotizacionGenerator.jsx` (`EMPRESA.email`).
- **No incluir el RFC** en las cotizaciones a cliente.

## Datos del proyecto
- **Repo:** `CarlosReG4/VitalSupply` (rama principal: `main`)
- **Producción:** https://vitalsupply.site (deploy automático desde `main` vía Vercel)
- **Stack:** React + Vite + Tailwind, Supabase, i18n ES/EN (react-i18next)
- **Supabase:** proyecto "Medsen" (`bhwaxzvawzijxjsmtbvy`), tabla principal `productos_medicos_v2`

## Estado actual (todo pusheado)
Últimos trabajos ya en producción:
- **Módulo de Ventas (panel admin):** sección "Ventas" en el sidebar. Alta manual de ventas (cliente + líneas
  con buscador de SKU que muestra stock). Al registrar, el inventario se **descuenta automáticamente** vía
  trigger en la BD (`ventas_items` → movimiento `tipo='venta'`), así que también funciona si registro la venta
  por chat/SQL con la RPC `registrar_venta(p_cliente, p_notas, p_items jsonb)`. Si se vende sin stock, el stock
  queda negativo y el faltante sale en el apartado **"Por surtir"** (para pedir a Sino-K). Borrar una venta
  revierte su inventario (cascade `ventas` → `ventas_items` → `inventario_movimientos.venta_item_id`).
  Tablas `ventas` y `ventas_items` (RLS admin-only), vista `v_ventas_resumen`.
  Archivos: `src/components/admin/Ventas.jsx`, `src/pages/admin/AdminDashboard.jsx`.
- **Módulo de Inventario (panel admin):** nueva sección "Inventario" en el sidebar. Existencias por
  `sku_sinok` sobre TODO el catálogo (vista `v_inventario_stock` con `security_invoker`), agrupadas por
  categoría en acordeones con contadores (con stock / SKUs / piezas), toggle "Solo con stock", buscador
  global, alta de movimientos (entrada/venta/ajuste → tabla `inventario_movimientos`), historial por SKU
  y resalte de bajo stock (≤2, solo con movimientos). RPC `inventario_resumen()` para totales por categoría.
  Archivos: `src/components/admin/Inventario.jsx`, `src/pages/admin/AdminDashboard.jsx`.
- **Selector de variantes v2 (in-situ):** en el detalle de producto, tocar una variante cambia
  imagen + número de parte + precio + SKU del carrito **sin navegar**. Fuente: hermanos por `url`.
  Archivos: `src/pages/ProductoDetalle.jsx`, `src/hooks/useProducto.js`, `src/components/producto/VariantSelector.jsx`.
- **Categoría Veterinary:** expuesta en menú, home, footer y `/categorias?tipo=Veterinary` (101 productos).
- **Fix rutas de catálogo:** botón "Explorar catálogo" del hero → `/categorias?tipo=SpO2`; `/tienda` es alias de `<Categorias/>` (ya no da 404).
- **Catálogo en español:** columna `nombre_es` traducida (~4,651 productos); frontend usa helpers en `src/utils/helpers.js`.

## Pendiente principal: fotos reales por variante (bloqueo de DATOS, no de código)
El frontend v2 **ya funciona** (demostrado end-to-end). El problema es que las imágenes de variante
en Supabase están **duplicadas**: cada familia tiene la misma foto repetida bajo 6 nombres distintos.

**Auditoría (ver CSVs en `docs/`):**
- `docs/variantes-imagenes-duplicadas.csv` — **666 familias SpO2** con imágenes 100% duplicadas
  (536 `spo2_direct_connect_sensors` + 130 `spo2_short_sensors`).
- `docs/variantes-imagenes-mapa.csv` — mapa `SKU → tipo → archivo actual` (3,979 filas), con flag `familia_duplicada`.
- Solo existen **101 archivos únicos** para 3,979 posiciones; ninguna familia tiene fotos distintas por variante.

**Qué falta hacer:** conseguir/subir las **fotos reales** de cada tipo de variante
(Adult Clip, Adult Soft, Pediatric Clip, Pediatric Soft, Neonate Soft, Multi-Site) a Supabase Storage
y apuntar cada `imagen_url` (y/o `variantes_imagenes[].imagen`) a su archivo correcto.
En cuanto las imágenes difieran, el frontend ya las muestra sin tocar código.

> Nota: NO inventar/generar imágenes ni asignar fotos no verificadas a productos médicos (riesgo de
> mostrar la pieza equivocada al cliente). Se hará con fotos reales provistas o con un mapeo verificado.

## Otros pendientes / ideas (opcionales)
- **Unificar variantes:** las familias con `grupo_variantes` (ej. MED-8500) usan `VariantSelector`, que
  todavía **navega** en vez de cambiar in-situ. Se puede unificar al comportamiento v2 si se desea.
- **Optimizar logo:** `public/logo-vitalsupply.png` pesa ~1.5 MB.
- Pendientes de datos previos (no bloqueantes): imágenes faltantes MED-9744..9772, precios de sensores nuevos,
  series fantasma (SP-304/SP-115A/SC14xx), depuración de SKUs Sino-K duplicados.

## Cómo retomar desde el celular
1. Abre **`claude.ai/code`** en el navegador del cel y autoriza el repo `CarlosReG4/VitalSupply`.
2. Todo está en `main` (GitHub), así que se retoma sin perder contexto; pídeme cambios de código y yo commiteo/pusheo.
3. **Limitación:** desde la web en la nube probablemente NO tendré acceso a las herramientas de **Supabase (MCP)**
   ni a **Playwright** (capturas/preview) que sí tengo en la PC. Tareas de base de datos o capturas conviene
   hacerlas de vuelta en la PC, o confirmar si tu entorno web las tiene conectadas.
