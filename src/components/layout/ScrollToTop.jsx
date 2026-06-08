import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Esto fuerza al navegador a ir arriba al cambiar de página o de filtros
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}   