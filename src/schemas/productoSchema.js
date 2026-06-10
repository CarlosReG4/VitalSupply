// src/schemas/productoSchema.js
import { z } from 'zod';

// Helper para precios opcionales
const precioOpcional = z.union([z.number(), z.string()])
  .nullable()
  .optional()
  .transform((val) => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  });

export const productoSchema = z.object({
  mi_sku: z.string({ required_error: "El SKU es obligatorio" }).min(1, "El SKU no puede estar vacío"),
  nombre: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El nombre no puede estar vacío"),

  // Precios
  precio: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val) || 0)
  ]).optional(),
  
  precio_venta_sugerido: precioOpcional,
  precio_ref_decys: precioOpcional,
  precio_ref_cs: precioOpcional,
  precio_sinok: precioOpcional,
  
  sku_sinok: z.string().nullable().optional(),
  tiene_proveedor: z.boolean().optional().default(true),
  tipo: z.string().nullable().optional(),

  // Clasificación
  categoria: z.string().nullable().optional(),
  subcategoria: z.string().nullable().optional(),
  sku_competencia: z.string().nullable().optional(),
  
  // Datos generales
  url: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  disponible: z.boolean().optional().default(true),

  // Imágenes
  imagen_url: z.string().nullable().optional(),
  imagen_url_2: z.string().nullable().optional(),
  imagen_url_3: z.string().nullable().optional(),
  imagen_url_4: z.string().nullable().optional(),
  imagen_url_5: z.string().nullable().optional(),
  imagen_url_6: z.string().nullable().optional(),

  // Características y compatibilidad
  especificaciones: z.any().optional(),
  compatibility: z.any().optional(),
  oemcross: z.any().optional(),

  // Banderas de estado
  es_nuevo: z.boolean().optional().default(false),
  destacado: z.boolean().optional().default(false),

  // Cantidad (útil para el carrito)
  cantidad: z.number().optional()

}).passthrough(); // Deja pasar campos extra de Supabase sin romper la app

// Validadores para arreglos completos
export const arrayProductosSchema = z.array(productoSchema);
export const productosArraySchema = arrayProductosSchema;