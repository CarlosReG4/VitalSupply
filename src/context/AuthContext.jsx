// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Sesión actual al cargar
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });

    // Escuchar cambios de sesión (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ¿El usuario logueado es admin? Lo leemos de app_metadata.is_admin
  const esAdmin = Boolean(
    session?.user?.app_metadata?.is_admin === true
  );

  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, usuario: session?.user ?? null, esAdmin, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
