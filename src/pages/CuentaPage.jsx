// src/pages/CuentaPage.jsx
// Página todo-en-uno de cuenta: si NO hay sesión muestra login/registro;
// si hay sesión muestra el perfil y el historial de pedidos con su estado y guía.
// Ruta sugerida: /cuenta

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';

// ─────────────────────────────────────────────
// Formulario de acceso (login + registro + recuperar)
// ─────────────────────────────────────────────
function FormularioAcceso() {
  const { iniciarSesion, registrarse, recuperarPassword } = useAuth();
  const [modo, setModo] = useState('login'); // login | registro | recuperar
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setEnviando(true); setMensaje(null);
    try {
      if (modo === 'login') {
        const { error } = await iniciarSesion(form.email, form.password);
        if (error) throw error;
      } else if (modo === 'registro') {
        const { error } = await registrarse(form.email, form.password, form.nombre);
        if (error) throw error;
        setMensaje({ tipo: 'ok', texto: 'Cuenta creada. Revisa tu correo para confirmar tu cuenta.' });
      } else {
        const { error } = await recuperarPassword(form.email);
        if (error) throw error;
        setMensaje({ tipo: 'ok', texto: 'Te enviamos un correo para restablecer tu contraseña.' });
      }
    } catch (e) {
      const traducciones = {
        'Invalid login credentials': 'Correo o contraseña incorrectos',
        'User already registered': 'Ya existe una cuenta con este correo',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
        'Email not confirmed': 'Confirma tu correo antes de iniciar sesión (revisa tu bandeja)',
      };
      setMensaje({ tipo: 'error', texto: traducciones[e.message] || e.message });
    } finally {
      setEnviando(false);
    }
  };

  const input = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-black text-gray-800 mb-1">
        {modo === 'login' ? 'Iniciar sesión' : modo === 'registro' ? 'Crear cuenta' : 'Recuperar contraseña'}
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        {modo === 'login' ? 'Accede para ver tus pedidos y datos.' : modo === 'registro' ? 'Tus compras anteriores con este correo se ligarán automáticamente.' : 'Te enviaremos un enlace a tu correo.'}
      </p>

      <div className="space-y-4">
        {modo === 'registro' && (
          <input className={input} placeholder="Nombre completo" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        )}
        <input className={input} type="email" placeholder="Correo electrónico" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {modo !== 'recuperar' && (
          <input className={input} type="password" placeholder="Contraseña" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && enviar()} />
        )}

        {mensaje && (
          <p className={`text-sm font-medium ${mensaje.tipo === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
            {mensaje.texto}
          </p>
        )}

        <button onClick={enviar} disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
          {enviando ? 'Procesando...' : modo === 'login' ? 'Entrar' : modo === 'registro' ? 'Crear cuenta' : 'Enviar enlace'}
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
        {modo === 'login' && (
          <>
            <p>¿No tienes cuenta?{' '}
              <button className="text-blue-600 font-bold" onClick={() => { setModo('registro'); setMensaje(null); }}>Regístrate</button>
            </p>
            <p><button className="text-gray-400 hover:text-blue-600" onClick={() => { setModo('recuperar'); setMensaje(null); }}>Olvidé mi contraseña</button></p>
          </>
        )}
        {modo !== 'login' && (
          <p><button className="text-blue-600 font-bold" onClick={() => { setModo('login'); setMensaje(null); }}>← Volver a iniciar sesión</button></p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Badge de estado del pedido
// ─────────────────────────────────────────────
const ESTADOS = {
  pendiente:  { texto: 'Pendiente de pago', clase: 'bg-yellow-100 text-yellow-800' },
  pagada:     { texto: 'Pago confirmado',   clase: 'bg-green-100 text-green-800' },
  preparando: { texto: 'Preparando envío',  clase: 'bg-blue-100 text-blue-800' },
  enviada:    { texto: 'Enviada',           clase: 'bg-sky-100 text-sky-800' },
  entregada:  { texto: 'Entregada',         clase: 'bg-emerald-100 text-emerald-800' },
  cancelada:  { texto: 'Cancelada',         clase: 'bg-red-100 text-red-700' },
};
const BadgeEstado = ({ estado }) => {
  const e = ESTADOS[estado] || { texto: estado, clase: 'bg-gray-100 text-gray-600' };
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${e.clase}`}>{e.texto}</span>;
};

// URLs de rastreo por paquetería
const urlRastreo = (paqueteria, guia) => {
  if (!paqueteria || !guia) return null;
  const p = paqueteria.toLowerCase();
  if (p.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${guia}`;
  if (p.includes('dhl')) return `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${guia}`;
  if (p.includes('estafeta')) return `https://www.estafeta.com/Herramientas/Rastreo?guias=${guia}`;
  if (p.includes('ups')) return `https://www.ups.com/track?tracknum=${guia}`;
  if (p.includes('paquetexpress')) return `https://www.paquetexpress.com.mx/rastreo/${guia}`;
  return null;
};

// ─────────────────────────────────────────────
// Mi cuenta (con sesión): perfil + pedidos
// ─────────────────────────────────────────────
function MiCuenta() {
  const { usuario, cerrarSesion } = useAuth();
  const [tab, setTab] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const [{ data: ords }, { data: perf }] = await Promise.all([
        supabase.from('ordenes')
          .select('numero_orden, created_at, estado, total_usd, items, paqueteria, numero_guia')
          .order('created_at', { ascending: false }),
        supabase.from('perfiles').select('*').eq('id', usuario.id).single(),
      ]);
      setPedidos(ords || []);
      setPerfil(perf || { nombre: '', telefono: '', rfc: '', razon_social: '' });
      setCargando(false);
    };
    cargar();
  }, [usuario.id]);

  const guardarPerfil = async () => {
    setGuardando(true); setGuardado(false);
    const { id, created_at, updated_at, direcciones, ...campos } = perfil;
    await supabase.from('perfiles').update({ ...campos, updated_at: new Date().toISOString() }).eq('id', usuario.id);
    setGuardando(false); setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const input = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500";

  if (cargando) return <p className="text-center text-gray-400 py-16"><i className="fas fa-spinner fa-spin mr-2"></i>Cargando tu cuenta...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Hola, {perfil?.nombre || usuario.email}</h2>
          <p className="text-sm text-gray-400">{usuario.email}</p>
        </div>
        <button onClick={cerrarSesion} className="text-sm font-bold text-red-500 hover:text-red-700">
          <i className="fas fa-sign-out-alt mr-1"></i> Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['pedidos', 'Mis pedidos'], ['perfil', 'Mis datos']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${tab === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Pedidos ── */}
      {tab === 'pedidos' && (
        pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <i className="fas fa-box-open text-4xl mb-3"></i>
            <p>Aún no tienes pedidos con esta cuenta.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p) => {
              const link = urlRastreo(p.paqueteria, p.numero_guia);
              return (
                <div key={p.numero_orden} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="font-black text-gray-800">{p.numero_orden}</span>
                      <span className="text-sm text-gray-400 ml-3">{new Date(p.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <BadgeEstado estado={p.estado} />
                  </div>
                  <ul className="text-sm text-gray-600 mb-3">
                    {(p.items || []).map((it, i) => (
                      <li key={i}>• {it.cantidad ?? 1} × {it.nombre ?? it.mi_sku}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-50">
                    <span className="font-bold text-gray-800">Total: ${Number(p.total_usd).toFixed(2)} USD</span>
                    {p.numero_guia ? (
                      <div className="text-sm">
                        <span className="text-gray-500">{p.paqueteria} · Guía <b>{p.numero_guia}</b></span>
                        {link && (
                          <a href={link} target="_blank" rel="noreferrer" className="ml-3 text-blue-600 font-bold hover:underline">
                            Rastrear envío <i className="fas fa-external-link-alt text-xs"></i>
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Guía de envío pendiente</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Perfil ── */}
      {tab === 'perfil' && perfil && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nombre completo</label>
              <input className={input} value={perfil.nombre || ''} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Teléfono / WhatsApp</label>
              <input className={input} value={perfil.telefono || ''} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
              <i className="fas fa-file-invoice mr-2 text-blue-600"></i>Datos de facturación (opcional)
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">RFC</label>
                <input className={input} value={perfil.rfc || ''} onChange={(e) => setPerfil({ ...perfil, rfc: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Razón social</label>
                <input className={input} value={perfil.razon_social || ''} onChange={(e) => setPerfil({ ...perfil, razon_social: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={guardarPerfil} disabled={guardando}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {guardado && <span className="text-green-600 text-sm font-bold"><i className="fas fa-check mr-1"></i>Guardado</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
export default function CuentaPage() {
  const { usuario, cargandoSesion } = useAuth();
  return (
    <div className="min-h-[60vh] bg-gray-50 py-12 px-4">
      {cargandoSesion
        ? <p className="text-center text-gray-400 py-16"><i className="fas fa-spinner fa-spin mr-2"></i>Cargando...</p>
        : usuario ? <MiCuenta /> : <FormularioAcceso />}
    </div>
  );
}
