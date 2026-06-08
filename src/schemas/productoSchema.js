import { z } from 'zod';

// Helper: convierte a número o null (para precios que pueden no existir)
const precioOpcional = z.union([z.number(), z.string()])
  .nullable()
  .optional()
  .transform((val) => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  });

export const productoSchema = z.object({
  mi_sku: z.string(),
  nombre: z.string().default('Producto sin nombre'),

  // Precio viejo (se mantiene como fallback). Texto o número -> número, vacío -> 0.
  precio: z.union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return 0;
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    }),

  // Precios calculados vs competencia + datos de proveedor (necesarios para Stripe)
  precio_venta_sugerido: precioOpcional,
  precio_ref_decys: precioOpcional,
  precio_ref_cs: precioOpcional,
  precio_sinok: precioOpcional,
  sku_sinok: z.string().nullable().optional(),
  tiene_proveedor: z.boolean().nullable().optional(),

  tipo: z.string().nullable().optional(),

  // Galería de imágenes (imagen principal + hasta 5 adicionales)
  imagen_url: z.string().nullable().optional(),
  imagen_url_2: z.string().nullable().optional(),
  imagen_url_3: z.string().nullable().optional(),
  imagen_url_4: z.string().nullable().optional(),
  imagen_url_5: z.string().nullable().optional(),
  imagen_url_6: z.string().nullable().optional(),

  // Clasificación
  categoria: z.string().nullable().optional(),
  subcategoria: z.string().nullable().optional(),

  // Campos usados por el panel de administración
  descripcion: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  sku_competencia: z.string().nullable().optional(),
  disponible: z.boolean().nullable().optional(),
  destacado: z.boolean().nullable().optional(),

  // Especificaciones y tablas JSON / compatibilidad
<<<<<<< HEAD
  especificaciones: z.array(z.any()).default([]),
  compatibility: z.array(z.any()).default([]),
  oemcross: z.array(z.any()).default([]),

=======
  especificaciones: z.any().optional(),
  compatibility: z.any().optional(),
  oemcross: z.any().optional(),
>>>>>>> 53b4523e379b789749bcb5db9b16088b73afbfbd
}).passthrough(); // deja pasar cualquier OTRO campo sin borrarlo (a prueba de futuro)

// Validador para arreglos completos (cuando traemos varios productos de golpe)
export const arrayProductosSchema = z.array(productoSchema);

// Alias por compatibilidad (algunos archivos pueden usar este nombre)
export const productosArraySchema = arrayProductosSchema;
