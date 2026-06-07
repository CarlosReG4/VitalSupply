import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; 

// 1. Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Inicializar Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. Configurar Autenticación de Google
const KEY_FILE_PATH = path.join(__dirname, 'credentials.json');
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: ['https://www.googleapis.com/auth/content'],
});

const MERCHANT_ID = '5803389323'; 

async function sincronizarProductos() {
  try {
    console.log('Consultando la tabla productos_medicos_v2 en Supabase...');
    
    const { data: productosDb, error: dbError } = await supabase
      .from('productos_medicos_v2')
      .select('*');

    if (dbError) throw new Error(`Error al leer Supabase: ${dbError.message}`);
    if (!productosDb || productosDb.length === 0) {
      console.log('No se encontraron productos en la tabla.');
      return;
    }

    // =========================================================
    // FILTRO: 1 POR CATEGORÍA (SALTANDO PRECIOS NULL/0)
    // =========================================================
    const productosParaEnviar = [];
    const categoriasVistas = new Set();

    for (const prod of productosDb) {
      const categoriaActual = prod.categoria || 'Sin Categoria'; 
      const precio = prod.precio_venta_sugerido; // <--- CORREGIDO AQUÍ

      // Si el precio no es válido, saltamos al siguiente producto
      if (precio === null || precio === undefined || Number(precio) === 0) {
        continue; 
      }
      
      // Si la categoría es nueva, guardamos esta muestra válida
      if (!categoriasVistas.has(categoriaActual)) {
        categoriasVistas.add(categoriaActual);
        productosParaEnviar.push(prod);
      }
    }

    console.log(`Se filtraron ${productosParaEnviar.length} productos de prueba con precios válidos. Conectando con Google...`);
    // =========================================================

    const shopping = google.content({
      version: 'v2.1',
      auth: auth,
    });

    for (const prod of productosParaEnviar) {
      
      // --- CONSTRUCCIÓN DE LA DESCRIPCIÓN ---
      let descripcionConstruida = `${prod.nombre}. `;

      if (prod.especificaciones && prod.especificaciones.length > 0) {
        const specs = prod.especificaciones.map(e => `${e.key}: ${e.value}`).join(', ');
        descripcionConstruida += `Especificaciones: ${specs}. `;
      }

      if (prod.compatibility && prod.compatibility.length > 0) {
        const compat = prod.compatibility.map(c => `${c.Manufacturer} ${c.Model}`).join(', ');
        descripcionConstruida += `Compatible con: ${compat}.`;
      }
      
      descripcionConstruida = descripcionConstruida.substring(0, 4990); 

      // --- RECOPILACIÓN DE IMÁGENES EXTRA ---
      const imagenesExtra = [
        prod.imagen_url2, 
        prod.imagen_url3, 
        prod.imagen_url4, 
        prod.imagen_url5, 
        prod.imagen_url6
      ].filter(url => url !== null && url !== undefined && String(url).trim() !== '');

      // --- ESTRUCTURA FINAL PARA GOOGLE ---
      const productoGoogle = {
        offerId: String(prod.mi_sku), 
        title: prod.nombre,
        description: descripcionConstruida, 
        link: `https://vitalsupply.site/producto/${prod.mi_sku}`,
        imageLink: prod.imagen_url, 
        
        ...(imagenesExtra.length > 0 && { additionalImageLinks: imagenesExtra }),

        contentLanguage: 'es',
        targetCountry: 'MX', 
        channel: 'online',
        availability: 'in stock', 
        condition: 'new',
        brand: 'VitalSupply',
        
        price: {
          // Asegura formato decimal limpio en USD y evita notación científica
          value: Number(prod.precio_venta_sugerido).toFixed(2), // <--- CORREGIDO AQUÍ
          currency: 'USD', 
        },
        
        productTypes: [prod.categoria, prod.subcategoria].filter(Boolean).join(' > '),

        shipping: [
          {
            country: 'MX',
            price: {
              value: '5.00', 
              currency: 'USD',
            },
          },
        ],
      };

      console.log(`Sincronizando SKU [${productoGoogle.offerId}]: ${productoGoogle.title} ($${productoGoogle.price.value} USD)`);

      await shopping.products.insert({
        merchantId: MERCHANT_ID,
        resource: productoGoogle,
      });
    }

    console.log('\n¡Proceso terminado! La muestra representativa en USD se sincronizó con éxito.');

  } catch (error) {
    console.error('\n--- ERROR EN LA SINCRONIZACIÓN ---');
    console.error(error.response ? error.response.data : error.message);
  }
}

sincronizarProductos();