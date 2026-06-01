import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TablaProductos from '../../components/admin/TablaProductos';
import FormularioProducto from '../../components/admin/FormularioProducto';
import TablaPedidos from '../../components/admin/TablaPedidos';

export default function AdminDashboard() {
  const { logout, usuario } = useAuth();
  const [seccion, setSeccion] = useState('catalogo');
  const [enCreacion, setEnCreacion] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const handleEdit = (producto) => {
    setProductoEditar(producto);
    setEnCreacion(true);
    setSeccion('nuevos'); 
  };

  return (
    // Agregamos items-start para que el scroll fluya natural en la página completa
    <div className="flex bg-slate-100 font-sans items-start min-h-screen">
      
      {/* Panel Lateral (Sidebar) - Ahora es STICKY, se queda fijo mientras haces scroll */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-lg shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <i className="fas fa-user-shield text-blue-500 text-xl"></i>
          <span className="font-bold text-lg text-white tracking-wide">VitalSupply Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => {
              setSeccion('catalogo');
              setEnCreacion(false);
              setProductoEditar(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              seccion === 'catalogo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className="fas fa-boxes text-base"></i>
            Catálogo General
          </button>

          <button
            onClick={() => {
              setSeccion('nuevos');
              setEnCreacion(false);
              setProductoEditar(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              seccion === 'nuevos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className="fas fa-sparkles text-base"></i>
            Productos Nuevos
          </button>

          <button
            onClick={() => {
              setSeccion('pedidos');
              setEnCreacion(false);
              setProductoEditar(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              seccion === 'pedidos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className="fas fa-receipt text-base"></i>
            Pedidos
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-2">
          {usuario?.email && (
            <p className="text-[10px] text-slate-500 text-center truncate px-2">{usuario.email}</p>
          )}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <i className="fas fa-external-link-alt"></i> Ver tienda
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
          <p className="text-[10px] text-slate-600 text-center pt-1">&copy; VitalSupply Panel</p>
        </div>
      </div>

      {/* Área de Contenido Principal (Derecha) - Se eliminó el scroll interno */}
      <div className="flex-1 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {/* SECCIÓN: CATÁLOGO GENERAL */}
          {seccion === 'catalogo' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Catálogo General</h2>
                <p className="text-gray-500 text-sm">Inventario completo y componentes globales de la tienda.</p>
              </div>
              <TablaProductos vista="catalogo" onEdit={handleEdit} />
            </div>
          )}

          {/* SECCIÓN: PRODUCTOS NUEVOS */}
          {seccion === 'nuevos' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
              {enCreacion ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {productoEditar ? 'Modificar Producto' : 'Formulario de Producto Nuevo'}
                    </h2>
                    <button
                      onClick={() => {
                        setEnCreacion(false);
                        setProductoEditar(null);
                      }}
                      className="text-gray-500 hover:text-slate-800 font-medium text-sm flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <i className="fas fa-arrow-left"></i> Regresar a Novedades
                    </button>
                  </div>
                  
                  <FormularioProducto 
                    productToEdit={productoEditar} 
                    onClose={() => {
                      setEnCreacion(false);
                      setProductoEditar(null);
                    }}
                    onProductoGuardado={() => {
                      setEnCreacion(false);
                      setProductoEditar(null);
                    }} 
                  />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">Productos Nuevos</h2>
                      <p className="text-gray-500 text-sm">Control y resalte de las últimas novedades agregadas.</p>
                    </div>
                    <button
                      onClick={() => setEnCreacion(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <i className="fas fa-plus"></i> Agregar producto nuevo
                    </button>
                  </div>
                  
                  <TablaProductos vista="nuevos" onEdit={handleEdit} />
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: PEDIDOS */}
          {seccion === 'pedidos' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Pedidos</h2>
                <p className="text-gray-500 text-sm">Gestión de órdenes recibidas (Stripe y WhatsApp).</p>
              </div>
              <TablaPedidos />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}