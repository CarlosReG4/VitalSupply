// src/context/AuthContext.jsx
// Sesión global de cliente con Supabase Auth.
// Envuelve la app en <AuthProvider> y usa el hook useAuth() en cualquier componente.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setCargandoSesion(false);
    });
    // Cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const registrarse = (email, password, nombre) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

  const iniciarSesion = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const cerrarSesion = () => supabase.auth.signOut();

  const recuperarPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/cuenta`,
    });

  return (
    <AuthContext.Provider value={{ usuario, cargandoSesion, registrarse, iniciarSesion, cerrarSesion, recuperarPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
