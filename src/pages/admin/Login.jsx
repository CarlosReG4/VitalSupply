// src/pages/admin/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { error } = await login(email, password);
      if (error) {
        setError('Correo o contraseña incorrectos.');
      } else {
        navigate('/admin');
      }
    } catch {
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-xl"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Panel de Administración</h1>
          <p className="text-sm text-gray-500 mt-1">Acceso restringido</p>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 outline-none"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {cargando ? <><i className="fas fa-spinner fa-spin"></i> Entrando...</> : <><i className="fas fa-sign-in-alt"></i> Iniciar sesión</>}
          </button>
        </form>
      </div>
    </div>
  );
}
