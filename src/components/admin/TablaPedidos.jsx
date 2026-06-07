import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';

function TablaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPago, setFiltroPago] = useState('todos');
  
  // Estado para el modal de detalle/edición
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [editEstado, setEditEstado] = useState('');
  const [editGuia, setEditGuia] = useState('');
  const [editPaqueteria, setEditPaqueteria] = useState('');
  const [editNotas, setEditNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (err) {
      console.error('Error al obtener pedidos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = (pedido) => {
    setPedidoSeleccionado(pedido);
    setEditEstado(pedido.estado || 'pendiente');
    setEditGuia(pedido.numero_guia || '');
    setEditPaqueteria(pedido.paqueteria || '');
    setEditNotas(pedido.notas_admin || '');
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!pedidoSeleccionado) return;

    try {
      setGuardando(true);
      const { error } = await supabase
        .from('ordenes')
        .update({
          estado: editEstado,
          numero_guia: editGuia,
          paqueteria: editPaqueteria,
          notas_admin: editNotas,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoSeleccionado.id);

      if (error) throw error;

      // Actualizar lista local
      setPedidos(pedidos.map(p => 
        p.id === pedidoSeleccionado.id 
          ? { ...p, estado: editEstado, numero_guia: editGuia, paqueteria: editPaqueteria, notas_admin: editNotas }
          : p
      ));
      
      setPedidoSeleccionado(null);
      alert('Pedido actualizado con éxito');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado lógico
  const pedidosFiltrados = pedidos.filter(pedido => {
    const cumpleEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const cumplePago = filtroPago === 'todos' || (pedido.metodo_pago || 'stripe') === filtroPago;
    return cumpleEstado && cumplePago;
  });

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '-';
    return new Date(fechaString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDireccion = (dir) => {
    if (!dir) return 'No especificada / Recogida';
    if (typeof dir === 'string') return dir;
    // Si viene estructurada de Stripe
    return `${dir.line1 || ''} ${dir.line2 || ''}, ${dir.city || ''}, ${dir.state || ''}, CP ${dir.postal_code || ''}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <i className="fas fa-exclamation-circle mr-2"></i> Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estado</label>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="enviada">Enviada</option>
              <option value="entregada">Entregada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Origen / Pago</label>
            <select 
              value={filtroPago} 
              onChange={(e) => setFiltroPago(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los canales</option>
              <option value="stripe">Stripe (Tarjeta)</option>
              <option value="paypal">PayPal</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        <button 
          onClick={fetchPedidos}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-all"
        >
          <i className="fas fa-sync-alt mr-2"></i> Actualizar
        </button>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase">
                <th className="p-4">ID Pedido</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Origen</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-gray-400">
                    No se encontraron pedidos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-500">
                      #{pedido.id.substring(0, 8)}...
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {formatearFecha(pedido.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{pedido.nombre_cliente || 'Cliente Web'}</div>
                      <div className="text-xs text-gray-400">{pedido.email_cliente || 'Sin correo'}</div>
                    </td>
                    <td className="p-4">
                      {(pedido.metodo_pago || 'stripe') === 'stripe' ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">
                          <i className="fas fa-credit-card text-[10px]"></i> Stripe
                        </span>
                      ) : pedido.metodo_pago === 'paypal' ? (
                        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-xs font-medium">
                          <i className="fab fa-paypal text-[10px]"></i> PayPal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
                          <i className="fab fa-whatsapp text-[10px]"></i> WhatsApp
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      ${Number(pedido.total_usd || 0).toFixed(2)} USD
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pedido.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        pedido.estado === 'enviada' ? 'bg-blue-100 text-blue-800' :
                        pedido.estado === 'entregada' ? 'bg-purple-100 text-purple-800' :
                        pedido.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pedido.estado || 'pendiente'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => abrirDetalle(pedido)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all text-xs font-medium inline-flex items-center gap-1"
                      >
                        <i className="fas fa-eye"></i> Gestionar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle y Edición */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200] overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detalle del Pedido</h3>
                <p className="text-xs text-gray-400 font-mono">ID: {pedidoSeleccionado.id}</p>
              </div>
              <button 
                onClick={() => setPedidoSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Contenido */}
            <form onSubmit={guardarCambios} className="p-6 space-y-6 flex-1">
              {/* Información del Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contacto</h4>
                  <p className="text-sm font-semibold text-gray-800">{pedidoSeleccionado.nombre_cliente || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{pedidoSeleccionado.email_cliente || 'Sin correo'}</p>
                  <p className="text-xs text-gray-500">Tel: {pedidoSeleccionado.telefono_cliente || 'Sin teléfono'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dirección de Envío</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {renderDireccion(pedidoSeleccionado.direccion_envio)}
                  </p>
                </div>
              </div>

              {/* Productos Comprados */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Artículos Solicitados</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                      <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {Array.isArray(pedidoSeleccionado.items) ? (
                        pedidoSeleccionado.items.map((item, index) => (
                          <tr key={index}>
                            <td className="p-3 font-medium text-gray-800">
                              {item.nombre || item.mi_sku || 'Producto Médico'}
                              {item.mi_sku && <span className="block text-[10px] text-gray-400 font-mono">{item.mi_sku}</span>}
                            </td>
                            <td className="p-3 text-center text-gray-600">{item.cantidad || 1}</td>
                            <td className="p-3 text-right text-gray-600">${Number(item.precio || 0).toFixed(2)}</td>
                            <td className="p-3 text-right font-semibold text-gray-800">
                              ${(Number(item.precio || 0) * (item.cantidad || 1)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center p-3 text-gray-400">Estructura de artículos no válida.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formulario de Estado y Seguimiento */}
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Control Operativo</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Estado de Orden</label>
                    <select
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagada">Pagada</option>
                      <option value="enviada">Enviada</option>
                      <option value="entregada">Entregada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Paquetería</label>
                    <input
                      type="text"
                      placeholder="Ej. Estafeta, DHL"
                      value={editPaqueteria}
                      onChange={(e) => setEditPaqueteria(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Número de Guía</label>
                    <input
                      type="text"
                      placeholder="Código de rastreo"
                      value={editGuia}
                      onChange={(e) => setEditGuia(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notas Internas de Administración</label>
                  <textarea
                    rows="2"
                    placeholder="Detalles sobre facturación, cambios solicitados por el cliente, etc..."
                    value={editNotas}
                    onChange={(e) => setEditNotas(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Botones del Modal */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setPedidoSeleccionado(null)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TablaPedidos;
