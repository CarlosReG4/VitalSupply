// src/context/AuthContext.jsx
// Sesión global con Supabase Auth.
// Fuente única de verdad para autenticación y permisos de admin.
// Envuelve la app en <AuthProvider> y usa el hook useAuth() en cualquier componente.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setUsuario(session?.user ?? null);
      setCargandoSesion(false);
    });

    // Cambios de sesión (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSession(session ?? null);
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Permiso de admin: se lee del MISMO lugar que usa la base de datos
  // (función es_admin() y políticas RLS): app_metadata.is_admin === true.
  // Así el candado del frontend y el de la base nunca se contradicen.
  const esAdmin = usuario?.app_metadata?.is_admin === true;

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

  const value = {
    // Estado
    session,
    usuario,
    esAdmin,
    cargandoSesion,
    cargando: cargandoSesion, // alias usado por RutaProtegida

    // Acciones (nombres en español)
    registrarse,
    iniciarSesion,
    cerrarSesion,
    recuperarPassword,

    // Alias en inglés usados por Login.jsx y AdminDashboard.jsx
    login: iniciarSesion,
    logout: cerrarSesion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
