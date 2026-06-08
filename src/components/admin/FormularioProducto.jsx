import { useState, useEffect } from 'react';
import { crearProducto, actualizarProducto } from '../../api/productos';

export default function FormularioProducto({ onClose, onProductoGuardado, productToEdit }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState('basicos');
  
  const [formData, setFormData] = useState({
    sku: '', nombre: '', precio: '', precio_venta_sugerido: '', tiene_proveedor: true,
    tipo: '', url: '', descripcion: '',
    categoria: '', subcategoria: '', sku_competencia: '', disponible: true,
    imagen_url: '', imagen_url_2: '', imagen_url_3: '', imagen_url_4: '', imagen_url_5: '', imagen_url_6: '',
    compatibility: '[]', especificaciones: '[]', oemcross: '[]'
  });

  useEffect(() => {
    if (productToEdit && productToEdit.mi_sku) {
      setFormData({
        sku: productToEdit.mi_sku || '',
        nombre: productToEdit.nombre || '',


        // ... (Mantén todo el código que ya tienes aquí adentro igual)
        oemcross: JSON.stringify(productToEdit.oemcross || [])
      });
    } else {
      // NUEVO: Reiniciamos el estado por completo si no hay producto a editar
      setFormData({
        sku: '', nombre: '', precio: '', precio_venta_sugerido: '', tiene_proveedor: true,
        tipo: '', url: '', descripcion: '',
        categoria: '', subcategoria: '', sku_competencia: '', disponible: true,
        imagen_url: '', imagen_url_2: '', imagen_url_3: '', imagen_url_4: '', imagen_url_5: '', imagen_url_6: '',
        compatibility: '[]', especificaciones: '[]', oemcross: '[]'
      });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);

    try {
      // 1. Convertimos el texto a verdaderos objetos/arreglos JSON
      // y nos aseguramos de que la llave se llame "mi_sku" como en tu DB
      const datosParaGuardar = {
        ...formData,
        mi_sku: formData.sku.trim(),
        precio: parseFloat(formData.precio) || 0,
        precio_venta_sugerido: parseFloat(formData.precio_venta_sugerido) || null,
        compatibility: JSON.parse(formData.compatibility || '[]'),
        especificaciones: JSON.parse(formData.especificaciones || '[]'),
        oemcross: JSON.parse(formData.oemcross || '[]')
      };
      
      // Borramos la llave 'sku' para no enviar basura a la base de datos
      delete datosParaGuardar.sku; 

      if (productToEdit && productToEdit.mi_sku) {
        await actualizarProducto(productToEdit.mi_sku, datosParaGuardar);
      } else {
        await crearProducto(datosParaGuardar);
      }
      onProductoGuardado(); 
    } catch (err) {
      setError("Error al guardar. Verifica que los campos de formato JSON (Corchetes []) estén escritos correctamente o revisa tu conexión.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const pestanas = [
    { id: 'basicos', label: 'Básicos' },
    { id: 'clasificacion', label: 'Clasificación' },
    { id: 'imagenes', label: 'Imágenes' },
    { id: 'avanzado', label: 'Tablas (JSON)' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabecera */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-bold text-lg">
            {productToEdit ? `Editar Producto: ${productToEdit.mi_sku}` : 'Agregar Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0 px-4">
          {pestanas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPestañaActiva(p.id)}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
                pestañaActiva === p.id ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Formulario / Contenido Escroleable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-200 flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-xl"></i> {error}
              </div>
            )}

            {/* PESTAÑA: BÁSICOS */}
            <div className={pestañaActiva === 'basicos' ? 'block space-y-4' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} required disabled={!!productToEdit} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio referencia ($)</label>
                  <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500" />
                  <p className="text-[10px] text-gray-400 mt-1">Precio viejo / de competencia (referencia).</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Precio de venta ($) *</label>
                  <input type="number" step="0.01" name="precio_venta_sugerido" value={formData.precio_venta_sugerido} onChange={handleChange} required className="w-full border-2 border-blue-200 rounded-lg p-2 focus:border-blue-500 bg-blue-50/40" />
                  <p className="text-[10px] text-blue-500 mt-1">Este es el precio que se COBRA al cliente.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center cursor-pointer gap-2">
                  <input type="checkbox" name="disponible" checked={formData.disponible} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="font-bold text-gray-700">Producto Activo / Disponible</span>
                </label>
                <label className="flex items-center cursor-pointer gap-2">
                  <input type="checkbox" name="tiene_proveedor" checked={formData.tiene_proveedor} onChange={handleChange} className="w-5 h-5 text-green-600 rounded" />
                  <span className="font-bold text-gray-700">Tiene proveedor (surtible / se puede vender)</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Producto</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500"></textarea>
              </div>
            </div>

            {/* PESTAÑA: CLASIFICACIÓN */}
            <div className={pestañaActiva === 'clasificacion' ? 'block space-y-4' : 'hidden'}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría Principal</label>
                  <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subcategoría</label>
                  <input type="text" name="subcategoria" value={formData.subcategoria} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Variación (Ej: Adult Clip)</label>
                  <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU de Competencia</label>
                  <input type="text" name="sku_competencia" value={formData.sku_competencia} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Base (Para agrupar variantes)</label>
                  <input type="text" name="url" value={formData.url} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* PESTAÑA: IMÁGENES */}
            <div className={pestañaActiva === 'imagenes' ? 'block space-y-4' : 'hidden'}>
              {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                <div key={num}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    URL Imagen {num === 1 ? 'Principal' : num}
                  </label>
                  <input 
                    type="url" 
                    name={num === 1 ? 'imagen_url' : `imagen_url_${num}`} 
                    value={formData[num === 1 ? 'imagen_url' : `imagen_url_${num}`] || ''} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 text-sm" 
                    placeholder="https://..." 
                  />
                </div>
              ))}
            </div>

            {/* PESTAÑA: JSON TABLAS */}
            <div className={pestañaActiva === 'avanzado' ? 'block space-y-4' : 'hidden'}>
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded mb-4">
                <strong>Importante:</strong> Estos campos requieren formato de Arreglo JSON válido. Usa el formato: <code>[{"{"}"Key": "Valor"{"}"}]</code>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Compatibilidad (JSON)</label>
                <textarea name="compatibility" value={formData.compatibility} onChange={handleChange} rows="4" className="w-full border-2 border-gray-200 rounded-lg p-2 font-mono text-xs focus:border-blue-500"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Especificaciones (JSON)</label>
                <textarea name="especificaciones" value={formData.especificaciones} onChange={handleChange} rows="4" className="w-full border-2 border-gray-200 rounded-lg p-2 font-mono text-xs focus:border-blue-500"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">OEM Cross Reference (JSON)</label>
                <textarea name="oemcross" value={formData.oemcross} onChange={handleChange} rows="4" className="w-full border-2 border-gray-200 rounded-lg p-2 font-mono text-xs focus:border-blue-500"></textarea>
              </div>
            </div>
          </form>
        </div>

        {/* Botones de acción fijos abajo */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition-colors">
            Cancelar
          </button>
          <button type="submit" form="productForm" disabled={isLoading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            {isLoading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>

      </div>
    </div>
  );
}