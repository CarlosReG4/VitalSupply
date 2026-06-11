import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';

// 1. Componentes estáticos (siempre visibles)
import BotonWhatsapp from './components/common/BotonWhatsapp';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import RutaProtegida from './components/admin/RutaProtegida';
import QRRedirect from './pages/QRRedirect';
import CuentaPage from './pages/CuentaPage';
import RastrearPage from './pages/RastrearPage';


// 2. Páginas con lazy loading (carga más rápida del sitio)
const Home = lazy(() => import('./pages/Home'));
const Nosotros = lazy(() => import('./pages/Nosotros'));
const Tienda = lazy(() => import('./pages/Tienda'));
const Categorias = lazy(() => import('./pages/Categorias'));
const Marcas = lazy(() => import('./pages/Marcas'));
const Promociones = lazy(() => import('./pages/Promociones'));
const Nuevos = lazy(() => import('./pages/Nuevos'));
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle'));
const SubcategoriaDetalle = lazy(() => import('./pages/SubcategoriaDetalle'));
const Busqueda = lazy(() => import('./pages/Busqueda'));
const Contacto = lazy(() => import('./pages/Contacto'));
const Returns = lazy(() => import('./pages/Returns'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Mayoristas = lazy(() => import('./pages/Mayoristas'));
const Terminos = lazy(() => import('./pages/Terminos'));
const Blogs = lazy(() => import('./pages/Blogs'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Login = lazy(() => import('./pages/admin/Login'));

// Páginas de pago (Stripe) y 404
const PagoExitoso = lazy(() => import('./pages/PagoExitoso'));
const PagoCancelado = lazy(() => import('./pages/PagoCancelado'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Componente de carga visual
const CargandoPantalla = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />

          <Header />

          <main className="min-h-screen">
            <Suspense fallback={<CargandoPantalla />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/tienda" element={<Tienda />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/marcas" element={<Marcas />} />
                <Route path="/promociones" element={<Promociones />} />
                <Route path="/nuevos" element={<Nuevos />} />
                <Route path="/buscar" element={<Busqueda />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/mayoristas" element={<Mayoristas />} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/producto/:id" element={<ProductoDetalle />} />
                <Route path="/subcategoria/:subId" element={<SubcategoriaDetalle />} />
                <Route path="/cuenta" element={<CuentaPage />} />
                <Route path="/rastrear" element={<RastrearPage />} />
                {/* Ruta para capturar los códigos QR dinámicos */}
                <Route path="/qr/:slug" element={<QRRedirect />} />

                {/* Panel de administración: login público, dashboard protegido */}
                <Route path="/admin/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <RutaProtegida>
                      <AdminDashboard />
                    </RutaProtegida>
                  }
                />

                {/* Pago con Stripe */}
                <Route path="/pago-exitoso" element={<PagoExitoso />} />
                <Route path="/pago-cancelado" element={<PagoCancelado />} />

                {/* 404 - debe ir al final */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
          <BotonWhatsapp />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;