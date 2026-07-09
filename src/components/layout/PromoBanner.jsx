// Banner delgado de promoción en el home. Enlaza a la landing estática
// public/promo-brazaletes.html, por eso usamos <a href> y no <Link> de
// react-router (no es una ruta del SPA, es un archivo servido por Vercel).
function PromoBanner() {
  return (
    <a
      href="/promo-brazaletes.html"
      className="block bg-[#0FBF9F] text-[#062A30] text-center py-2 px-4 text-xs sm:text-sm font-bold tracking-wide hover:bg-[#0dab8e] transition-colors"
    >
      🔥 Promo: Brazaletes NIBP desde $149 c/u — <span className="underline">Ver oferta</span>
    </a>
  );
}

export default PromoBanner;
