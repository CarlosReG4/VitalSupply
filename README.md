# Cambios — Filtrado dinámico de subcategorías vacías

## ¿Qué hace?

Hace que el menú lateral (`SidebarCategorias`) **oculte automáticamente** las
subcategorías que no tienen productos en la base de datos. Hoy te oculta:

- ✗ SpO2 Accessories
- ✗ EKG Accessories
- ✗ IBP Infusion Bags
- ✗ Fetal Accessories
- ✗ Temperature Accessories

Si en el futuro agregas/eliminas productos, el menú se actualiza solo —
nunca más vas a tener que tocar `constants.js`.

## Archivos

1. **NUEVO** `src/hooks/useSubcategoriasDisponibles.js`
   - Hook que hace 1 query a Supabase y devuelve un `Set` con las
     subcategorías que tienen al menos 1 producto.

2. **REEMPLAZA** `src/components/categorias/SidebarCategorias.jsx`
   - Usa el hook para filtrar las subcategorías antes de renderizarlas.
   - Mientras carga la query, muestra todas (evita parpadeo).
   - Después de cargar, oculta las vacías.

## Cómo instalar

1. Copia `useSubcategoriasDisponibles.js` a `src/hooks/`
2. Reemplaza `SidebarCategorias.jsx` (sobrescribe el archivo viejo)
3. Reinicia el dev server (`npm run dev`) si no estaba corriendo
4. Recarga la página → las subcategorías vacías ya no aparecen

## Cómo verificar que funciona

Abre tu app en localhost:5174, ve a Categorías → SpO2.
En el sidebar debe aparecer:
- Direct-Connect SpO2 Sensors
- Short SpO2 Sensors
- SpO2 Adapter Cables
- Disposable SpO2 Sensors

Pero **NO** debe aparecer "SpO2 Accessories" (porque está vacía en BD).

Lo mismo para EKG (sin "EKG Accessories"), IBP (sin "Infusion Bags") y Fetal
(sin "Fetal Accessories").

## ¿Es eficiente?

La query trae solo la columna `subcategoria` de todos los productos (~3,151 filas
de texto corto). Es muy ligera y se hace solo 1 vez al cargar la página.

Si más adelante quieres optimizar, podrías:
- Cachear el resultado en `localStorage`
- Usar React Query / SWR para invalidar inteligente
- Crear una vista materializada en Supabase

Pero para 3K productos es totalmente innecesario optimizar más.

---

# Filtros de Talla de paciente y Circunferencia de brazo (NIBP Cuffs)

Los brazaletes NIBP (subcategorías **NIBP Cuffs** y **Disposable NIBP Cuffs**)
tienen dos filtros extra en el panel *Filtrar por*: **Talla de paciente** y
**Circunferencia de brazo**, que leen del campo `especificaciones`
(keys `Patient Size` y `Hose Patient Size`) y se poblan/filtran del lado del
servidor vía las RPCs de Supabase.

## Evidencia en producción

Capturas del filtro funcionando en el sitio desplegado (`vitalsupply.site`):

- [NIBP Cuffs — Talla = "Large Adult" (85 → 9 productos)](docs/screenshots/nibp-cuffs-filter.png)
- [Disposable NIBP Cuffs — Circunferencia = "25-35 cm" (2 productos)](docs/screenshots/disposable-nibp-cuffs-filter.png)

![NIBP Cuffs filtrado por talla](docs/screenshots/nibp-cuffs-filter.png)

![Disposable NIBP Cuffs filtrado por circunferencia](docs/screenshots/disposable-nibp-cuffs-filter.png)