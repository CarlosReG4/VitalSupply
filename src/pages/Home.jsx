// src/pages/Home.jsx
import '../index.css';

// Fíjate en los dos puntitos ../ para buscar la carpeta components
import PromoBanner from '../components/layout/PromoBanner';
import TopBanner from '../components/layout/TopBanner';
import HeroBanner from '../components/home/HeroBanner';
import CarruselMarcas from '../components/home/CarruselMarcas';
import CategoriasPrincipales from '../components/home/CategoriasPrincipales';
import CompatibilityFinder from '../components/home/CompatibilityFinder';
import ProductosDestacados from '../components/home/ProductosDestacados';
import SeccionMayoristas from '../components/home/SeccionMayoristas';
import Testimonios from '../components/home/Testimonios';

function Home() { // Le cambiamos el nombre de App a Home
  return (
    <div className="bg-gray-50 font-sans text-gray-900">
      <PromoBanner />
      <TopBanner />
      <HeroBanner />
      <CarruselMarcas />
      <CategoriasPrincipales />
      <CompatibilityFinder />
      <ProductosDestacados />
      <Testimonios />
      <SeccionMayoristas />
    </div>
  );
}

export default Home;