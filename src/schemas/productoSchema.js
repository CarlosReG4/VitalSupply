import { z } from 'zod';

export const productoSchema = z.object({
  mi_sku: z.string({ required_error: "El SKU es obligatorio" }).min(1, "El SKU no puede estar vacío"),
  nombre: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El nombre no puede estar vacío"),
  
  // Acepta números directamente o strings numéricos y los convierte
  precio: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val) || 0)
  ]).optional(),
  
  precio_venta_sugerido: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val) || null)
  ]).nullable().optional(),

  tiene_proveedor: z.boolean().optional().default(true),
  tipo: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  categoria: z.string().nullable().optional(),
  subcategoria: z.string().nullable().optional(),
  sku_competencia: z.string().nullable().optional(),
  
  disponible: z.boolean().optional().default(true),
  
  // Imágenes
  imagen_url: z.string().nullable().optional(),
  imagen_url_2: z.string().nullable().optional(),
  imagen_url_3: z.string().nullable().optional(),
  imagen_url_4: z.string().nullable().optional(),
  imagen_url_5: z.string().nullable().optional(),
  imagen_url_6: z.string().nullable().optional(),
  
  // Campos de características adicionales
  compatibility: z.any().optional(),
  especificaciones: z.any().optional(), // Acepta el JSONB de especificaciones
  oemcross: z.string().nullable().optional(),
  
  // Banderas de estado
  es_nuevo: z.boolean().optional().default(false),
  destacado: z.boolean().optional().default(false),
  
  // Cantidad (útil para cuando el producto viaja al carrito)
  cantidad: z.number().optional()
  
}).passthrough(); // El .passthrough() evita que se rompa si Supabase manda algún campo extra (como el 'count')