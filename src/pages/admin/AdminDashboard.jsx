import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TablaProductos from '../../components/admin/TablaProductos';
import FormularioProducto from '../../components/admin/FormularioProducto';
import TablaPedidos from '../../components/admin/TablaPedidos';
import GestorPromociones from '../../components/admin/GestorPromociones'
import CotizacionGenerator from '../../components/admin/CotizacionGenerator';
import Inventario from '../../components/admin/Inventario';

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
    <div className="flex bg-slate-100 font-sans items-start min-h-screen">
      
      {/* Panel Lateral (Sidebar) */}
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
            <i className="fas fa-boxes text-base w-5 text-center"></i>
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
            <i className="fas fa-sparkles text-base w-5 text-center"></i>
            Productos Nuevos
          </button>

          {/* GESTIÓN DE PEDIDOS */}
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
            <i className="fas fa-shopping-bag text-base w-5 text-center"></i>
            Gestión de Pedidos
          </button>

          {/* NUEVO: PROMOCIONES ESPECIALES */}
          <button
            onClick={() => {
              setSeccion('promociones');
              setEnCreacion(false);
              setProductoEditar(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              seccion === 'promociones'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className="fas fa-tags text-base w-5 text-center"></i>
            Promociones Especiales
          </button>

          {/* NUEVO: INVENTARIO */}
          <button
            onClick={() => {
              setSeccion('inventario');
              setEnCreacion(false);
              setProductoEditar(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              seccion === 'inventario'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className="fas fa-warehouse text-base w-5 text-center"></i>
            Inventario
          </button>

          {/* NUEVO: COTIZACIONES */}
          <button
            onClick={() => {
              setSeccion('cotizaciones');
              setEnCreacion(false);
              setProductoEditar(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              seccion === 'cotizaciones'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className="fas fa-file-invoice-dollar text-base w-5 text-center"></i>
            Cotizaciones
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

      {/* Área de Contenido Principal (Derecha) */}
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

          {/* SECCIÓN: GESTIÓN DE PEDIDOS */}
          {seccion === 'pedidos' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h2>
                <p className="text-gray-500 text-sm">Administración de ventas, seguimiento de logística y control de estados.</p>
              </div>
              <TablaPedidos />
            </div>
          )}

          {/* NUEVA SECCIÓN: PROMOCIONES */}
          {seccion === 'promociones' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Promociones Especiales</h2>
                <p className="text-gray-500 text-sm">Gestiona descuentos, ofertas por porcentaje y precios especiales para la tienda.</p>
              </div>
              <GestorPromociones />
            </div>
          )}

          {/* NUEVA SECCIÓN: INVENTARIO */}
          {seccion === 'inventario' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Inventario</h2>
                <p className="text-gray-500 text-sm">Existencias por SKU de Sino-K sobre todo el catálogo, agrupadas por categoría. Registra entradas, ventas y ajustes.</p>
              </div>
              <Inventario />
            </div>
          )}

          {/* NUEVA SECCIÓN: COTIZACIONES */}
          {seccion === 'cotizaciones' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Cotizaciones</h2>
                <p className="text-gray-500 text-sm">Genera cotizaciones a cliente y órdenes de compra a Sino-K en PDF.</p>
              </div>
              <CotizacionGenerator />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
