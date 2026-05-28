// src/components/admin/RutaProtegida.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RutaProtegida({ children }) {
  const { session, esAdmin, cargando } = useAuth();

  // Mientras verifica la sesión, mostramos un cargando (evita parpadeo)
  if (cargando) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
      </div>
    );
  }

  // Sin sesión -> al login
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Con sesión pero sin permisos de admin -> fuera
  if (!esAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 text-red-600 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <i className="fas fa-ban text-3xl"></i>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Sin permisos</h1>
        <p className="text-gray-500 max-w-sm text-sm">
          Tu cuenta no tiene permisos de administrador. Contacta al dueño del sitio si crees que es un error.
        </p>
      </div>
    );
  }

  // Todo bien: mostramos el contenido protegido
  return children;
}
