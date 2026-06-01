// src/components/admin/GestorPromociones.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

export default function GestorPromociones() {
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [promocionesActivas, setPromocionesActivas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para el Modal de Edición
  const [productoEditando, setProductoEditando] = useState(null);
  const [precioOriginal, setPrecioOriginal] = useState(0);
  const [precioPromo, setPrecioPromo] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [descripcionPromo, setDescripcionPromo] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetchPromocionesActivas();
  }, []);

  // Cargar los productos que ya tienen la etiqueta en_promocion = true
  const fetchPromocionesActivas = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('en_promocion', true);
    
    if (!error && data) setPromocionesActivas(data);
  };

  // Buscador de productos en el catálogo
  const buscarProducto = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .or(`nombre.ilike.%${busqueda}%,mi_sku.ilike.%${busqueda}%`)
      .limit(5);

    if (!error && data) setResultadosBusqueda(data);
    setLoading(false);
  };

  // Abrir el modal y preparar la calculadora
  const abrirModalPromocion = (producto) => {
    const precioBase = Number(producto.precio_venta_sugerido ?? producto.precio ?? 0);
    setProductoEditando(producto);
    setPrecioOriginal(precioBase);
    
    // Si ya tenía promo, cargamos sus datos, si no, lo dejamos en blanco
    setPrecioPromo(producto.precio_promocion || '');
    setPorcentaje(producto.porcentaje_descuento || '');
    setDescripcionPromo(producto.descripcion_promocion || '');
  };

  // Lógica matemática: Si cambia el porcentaje, calcular el precio final
  const handlePorcentajeChange = (e) => {
    const nuevoPorcentaje = e.target.value;
    setPorcentaje(nuevoPorcentaje);
    
    if (nuevoPorcentaje && precioOriginal > 0) {
      const descuento = precioOriginal * (Number(nuevoPorcentaje) / 100);
      setPrecioPromo((precioOriginal - descuento).toFixed(2));
    } else {
      setPrecioPromo('');
    }
  };

  // Lógica matemática: Si cambia el precio final, calcular el porcentaje
  const handlePrecioPromoChange = (e) => {
    const nuevoPrecio = e.target.value;
    setPrecioPromo(nuevoPrecio);

    if (nuevoPrecio && precioOriginal > 0) {
      const porc = 100 - ((Number(nuevoPrecio) / precioOriginal) * 100);
      setPorcentaje(porc.toFixed(2));
    } else {
      setPorcentaje('');
    }
  };

  // Guardar en Supabase
  const guardarPromocion = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const { error } = await supabase
      .from('productos')
      .update({
        en_promocion: true,
        precio_promocion: Number(precioPromo),
        porcentaje_descuento: Number(porcentaje),
        descripcion_promocion: descripcionPromo
      })
      .eq('id', productoEditando.id);

    if (!error) {
      alert('Promoción activada con éxito');
      setProductoEditando(null);
      setResultadosBusqueda([]);
      setBusqueda('');
      fetchPromocionesActivas();
    } else {
      alert('Error al guardar: ' + error.message);
    }
    setGuardando(false);
  };

  // Quitar promoción
  const quitarPromocion = async (id) => {
    if(!window.confirm('¿Seguro que quieres quitar este producto de promociones?')) return;
    
    const { error } = await supabase
      .from('productos')
      .update({
        en_promocion: false,
        precio_promocion: null,
        porcentaje_descuento: null,
        descripcion_promocion: null
      })
      .eq('id', id);

    if (!error) fetchPromocionesActivas();
  };

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: Buscador para agregar nuevas promos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4"><i className="fas fa-search text-blue-500 mr-2"></i>Buscar producto para aplicar promoción</h3>
        <form onSubmit={buscarProducto} className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o código SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Resultados de búsqueda */}
        {resultadosBusqueda.length > 0 && (
          <div className="mt-6 border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Precio Actual</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resultadosBusqueda.map(prod => (
                  <tr key={prod.id}>
                    <td className="p-3 font-medium text-slate-800">
                      {prod.nombre} <span className="text-xs text-gray-400 block">{prod.mi_sku}</span>
                    </td>
                    <td className="p-3">${Number(prod.precio_venta_sugerido ?? prod.precio ?? 0).toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => abrirModalPromocion(prod)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Añadir a Promos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: Lista de Promociones Activas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4"><i className="fas fa-tags text-green-500 mr-2"></i>Promociones Activas</h3>
        
        {promocionesActivas.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No hay productos en promoción actualmente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promocionesActivas.map(promo => (
              <div key={promo.id} className="border border-green-100 bg-green-50/30 p-4 rounded-xl relative">
                <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  -{promo.porcentaje_descuento}%
                </div>
                <h4 className="font-bold text-slate-800 text-sm pr-10">{promo.nombre}</h4>
                <p className="text-xs text-gray-500 mt-1">{promo.descripcion_promocion}</p>
                
                <div className="mt-3 flex items-center gap-2">
                  <span className="line-through text-gray-400 text-xs">${Number(promo.precio_venta_sugerido ?? promo.precio ?? 0).toFixed(2)}</span>
                  <span className="font-bold text-green-600 text-lg">${promo.precio_promocion}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => abrirModalPromocion(promo)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                    Editar
                  </button>
                  <button onClick={() => quitarPromocion(promo.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                    Quitar Promo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN DE PROMOCIÓN */}
      {productoEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Configurar Promoción</h3>
              <button onClick={() => setProductoEditando(null)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
            </div>

            <form onSubmit={guardarPromocion} className="p-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">{productoEditando.nombre}</p>
                <p className="text-xs text-gray-500">Precio normal de catálogo: <span className="font-bold">${precioOriginal.toFixed(2)}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Descuento (%)</label>
                  <div className="relative">
                    <input 
                      type="number" step="0.01" max="99" min="1"
                      value={porcentaje} onChange={handlePorcentajeChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 pl-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ej. 15"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nuevo Precio Promo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                    <input 
                      type="number" step="0.01" min="0"
                      value={precioPromo} onChange={handlePrecioPromoChange}
                      className="w-full bg-green-50 border border-green-200 text-green-700 font-bold rounded-lg p-2.5 pl-7 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Ej. 850.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Descripción / Etiqueta (Opcional)</label>
                <input 
                  type="text" 
                  value={descripcionPromo} onChange={(e) => setDescripcionPromo(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Especial Día del Médico, Hasta agotar stock..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setProductoEditando(null)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-md">
                  {guardando ? 'Guardando...' : 'Aplicar Promoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}