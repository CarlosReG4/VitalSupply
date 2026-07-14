import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/cartStore';
import { iniciarPagoStripe } from '../../utils/checkout';
import BotonPaypal from '../checkout/BotonPaypal';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { nombreProducto } from '../../utils/helpers';

const categoriesList = ['SpO2', 'ECG Cables', 'EKG Cables', 'NIBP', 'IBP Cables', 'Temperature', 'Fetal', 'Oxygen Sensors'];
const otrosList = ['Promociones', 'Novedades'];

// Número de WhatsApp para cotizaciones (código de país + número, sin signos ni espacios)
const WHATSAPP_NUMERO = '528717821161';

const LOGO_SRC = '/logo-vitalsupply.png';

function Header() {
  const { t, i18n } = useTranslation();
  const carrito = useCartStore((state) => state.carrito);
  const eliminarDelCarrito = useCartStore((state) => state.eliminarDelCarrito);
  const actualizarCantidad = useCartStore((state) => state.actualizarCantidad);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pagando, setPagando] = useState(false);

  // Sesión del cliente (null si no ha iniciado sesión)
  const auth = useAuth();
  const usuario = auth?.usuario ?? null;

  const manejarPagoStripe = async () => {
    try {
      setPagando(true);
      await iniciarPagoStripe(carrito);
    } catch (err) {
      console.error('Error al iniciar pago:', err);
      alert(t('cart.payError'));
      setPagando(false);
    }
  };

  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(null); // 'categories' | 'others' | null
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false); // menú hamburguesa

  const manejarBusqueda = (e) => {
    e.preventDefault();
    if (busqueda.trim() !== '') {
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
      setBusqueda('');
      setMenuMovilAbierto(false);
    }
  };

  // Total del carrito (en USD)
  const totalCarrito = carrito.reduce(
    (total, item) => total + (Number(item.precio) * (item.cantidad || 1)),
    0
  );

  const itemsCarrito = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  // Arma el mensaje de cotización y abre WhatsApp
  const cotizarPorWhatsapp = () => {
    if (carrito.length === 0) return;

    const lineas = carrito.map((item) => {
      const cant = item.cantidad || 1;
      const precio = Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 });
      const subtotal = (Number(item.precio) * cant).toLocaleString('en-US', { minimumFractionDigits: 2 });
      return `• ${nombreProducto(item, i18n.language)} (SKU: ${item.mi_sku})\n   ${cant} x $${precio} = $${subtotal} USD`;
    });

    const totalTexto = totalCarrito.toLocaleString('en-US', { minimumFractionDigits: 2 });

    const mensaje =
      `${t('cart.waGreeting')}\n\n` +
      `${lineas.join('\n\n')}\n\n` +
      `${t('cart.waTotal')}: $${totalTexto} USD\n\n` +
      `${t('cart.waClosing')}`;

    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">

      {/* ==================== TOP BAR — MÓVIL (< md) ==================== */}
      <div className="md:hidden">
        {/* Una sola fila: hamburguesa · logo centrado · iconos cuenta/carrito */}
        <div className="flex items-center gap-2 px-4 py-2">
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label={t('nav.menu')}
            aria-expanded={menuMovilAbierto}
            className="text-blue-900 p-1 -ml-1 shrink-0"
          >
            <i className={`fas ${menuMovilAbierto ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
          </button>

          <Link to="/" onClick={() => setMenuMovilAbierto(false)} className="flex-1 flex justify-center min-w-0">
            <img src={LOGO_SRC} alt="VitalSupply" className="h-11 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-4 text-blue-900 shrink-0">
            <Link to="/cuenta" aria-label={usuario ? t('nav.myAccount') : t('nav.account')} className="hover:text-blue-500">
              <i className={`${usuario ? 'fas text-blue-600' : 'far'} fa-user text-xl`}></i>
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={t('nav.cart')}
              className="relative hover:text-blue-500 cursor-pointer"
            >
              <i className="fas fa-shopping-cart text-xl"></i>
              {carrito.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {itemsCarrito}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador — fila delgada debajo */}
        <div className="px-4 pb-2.5">
          <form onSubmit={manejarBusqueda} className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full border-2 border-gray-100 rounded-full py-1.5 px-4 pr-10 focus:outline-none focus:border-blue-500 shadow-inner text-sm"
            />
            <button type="submit" aria-label="Buscar" className="absolute right-3 top-1.5 text-blue-600 hover:text-blue-800 transition-colors">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </div>

      {/* ==================== TOP BAR — DESKTOP (>= md) ==================== */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
          <div className="w-auto flex justify-start">
            <Link to="/" className="inline-block">
              <img src={LOGO_SRC} alt="VitalSupply" className="h-16 w-auto object-contain" />
            </Link>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <div className="flex-1 mx-12">
            <form onSubmit={manejarBusqueda} className="relative">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full border-2 border-gray-100 rounded-full py-2 px-6 focus:outline-none focus:border-blue-500 shadow-inner text-sm"
              />
              <button type="submit" className="absolute right-4 top-2.5 text-blue-600 hover:text-blue-800 transition-colors">
                <i className="fas fa-search"></i>
              </button>
            </form>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden xl:flex items-center space-x-2 text-gray-400 border-r pr-6">
              <i className="fab fa-cc-visa text-xl" title="Visa"></i>
              <i className="fab fa-cc-mastercard text-xl" title="Mastercard"></i>
              <i className="fab fa-cc-amex text-xl" title="Amex"></i>
              <i className="fab fa-cc-paypal text-xl" title="PayPal"></i>
              <span className="text-[10px] font-bold border border-gray-300 px-1 rounded">SPEI</span>
            </div>

            <LanguageSwitcher />

            <div className="flex space-x-4 text-blue-900">
              {/* CUENTA DE CLIENTE: lleva a /cuenta (login o panel según sesión) */}
              <Link to="/cuenta" className="hover:text-blue-500 flex flex-col items-center">
                <i className={`${usuario ? 'fas' : 'far'} fa-user text-lg ${usuario ? 'text-blue-600' : ''}`}></i>
                <span className="text-[10px] mt-1 font-bold uppercase">{usuario ? t('nav.myAccount') : t('nav.account')}</span>
              </Link>
              <button onClick={() => setIsCartOpen(true)} className="hover:text-blue-500 flex flex-col items-center relative cursor-pointer">
                <i className="fas fa-shopping-cart text-lg"></i>
                {carrito.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {itemsCarrito}
                  </span>
                )}
                <span className="text-[10px] mt-1 font-bold uppercase">{t('nav.cart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== NAV AZUL — solo DESKTOP ==================== */}
      <nav className="hidden md:block bg-blue-900 text-white border-t border-blue-800">
        <div className="flex container mx-auto px-4 justify-center space-x-10 text-xs font-bold uppercase tracking-widest relative">
          <Link to="/" className="hover:text-blue-300 transition-colors py-3">{t('nav.home')}</Link>

          <div className="relative py-3">
            <button
              type="button"
              onClick={() => setMenuAbierto(menuAbierto === 'categories' ? null : 'categories')}
              className="hover:text-blue-300 transition-colors flex items-center uppercase tracking-widest font-bold"
            >
              {t('nav.categories')} <i className={`fas fa-chevron-down ml-1 text-[10px] transition-transform ${menuAbierto === 'categories' ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`absolute top-full left-0 bg-white shadow-xl py-2 w-56 text-gray-800 border rounded transition-all duration-200 z-50 ${menuAbierto === 'categories' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              {categoriesList.map(item => (
                <Link
                  key={item}
                  to={`/categorias?tipo=${item}`}
                  onClick={() => setMenuAbierto(null)}
                  className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors normal-case tracking-normal"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative py-3">
            <button
              type="button"
              onClick={() => setMenuAbierto(menuAbierto === 'others' ? null : 'others')}
              className="hover:text-blue-300 transition-colors flex items-center uppercase tracking-widest font-bold"
            >
              {t('nav.others')} <i className={`fas fa-chevron-down ml-1 text-[10px] transition-transform ${menuAbierto === 'others' ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`absolute top-full left-0 bg-white shadow-xl py-2 w-48 text-gray-800 border rounded transition-all duration-200 z-50 ${menuAbierto === 'others' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              {otrosList.map(item => (
                <Link key={item} to={item === 'Promociones' ? '/promociones' : '/nuevos'} onClick={() => setMenuAbierto(null)} className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors normal-case tracking-normal">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* RASTREO DE PEDIDO */}
          <Link to="/rastrear" className="hover:text-blue-300 transition-colors py-3">
            <i className="fas fa-truck mr-1"></i> {t('nav.trackOrder')}
          </Link>

          <Link to="/nosotros" className="hover:text-blue-300 transition-colors py-3">{t('nav.about')}</Link>
        </div>
      </nav>

      {/* ==================== MENÚ MÓVIL (hamburguesa) ==================== */}
      {menuMovilAbierto && (
        <div className="md:hidden bg-blue-900 text-white border-t border-blue-800">
          <div className="container mx-auto px-4 py-3 space-y-1 text-sm max-h-[75vh] overflow-y-auto">
            <Link to="/" onClick={() => setMenuMovilAbierto(false)} className="block py-2.5 px-2 rounded hover:bg-blue-800 font-semibold">
              <i className="fas fa-home w-5"></i> {t('nav.home')}
            </Link>

            <p className="pt-3 pb-1 px-2 text-blue-300 text-xs uppercase tracking-widest font-bold">{t('nav.categories')}</p>
            {categoriesList.map(item => (
              <Link
                key={item}
                to={`/categorias?tipo=${item}`}
                onClick={() => setMenuMovilAbierto(false)}
                className="block py-2.5 px-2 pl-6 rounded hover:bg-blue-800"
              >
                {item}
              </Link>
            ))}

            <p className="pt-3 pb-1 px-2 text-blue-300 text-xs uppercase tracking-widest font-bold">{t('nav.others')}</p>
            {otrosList.map(item => (
              <Link
                key={item}
                to={item === 'Promociones' ? '/promociones' : '/nuevos'}
                onClick={() => setMenuMovilAbierto(false)}
                className="block py-2.5 px-2 pl-6 rounded hover:bg-blue-800"
              >
                {item}
              </Link>
            ))}

            {/* RASTREO Y CUENTA EN MÓVIL */}
            <Link to="/rastrear" onClick={() => setMenuMovilAbierto(false)} className="block py-2.5 px-2 mt-2 rounded hover:bg-blue-800 font-semibold border-t border-blue-800 pt-3">
              <i className="fas fa-truck w-5"></i> {t('nav.trackOrder')}
            </Link>
            <Link to="/cuenta" onClick={() => setMenuMovilAbierto(false)} className="block py-2.5 px-2 rounded hover:bg-blue-800 font-semibold">
              <i className="far fa-user w-5"></i> {usuario ? t('nav.myAccount') : t('nav.signIn')}
            </Link>

            <Link to="/nosotros" onClick={() => setMenuMovilAbierto(false)} className="block py-2.5 px-2 rounded hover:bg-blue-800 font-semibold">
              <i className="fas fa-circle-info w-5"></i> {t('nav.about')}
            </Link>

            {/* Toggle de idioma dentro del menú */}
            <div className="flex items-center gap-3 px-2 pt-3 mt-2 border-t border-blue-800">
              <span className="text-blue-300 text-xs uppercase tracking-widest font-bold">Idioma</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}

      {/* PANEL LATERAL DEL CARRITO */}
      <div className={`fixed inset-0 bg-black/50 transition-opacity z-50 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>

        <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="p-4 bg-blue-900 text-white flex justify-between items-center">
            <h2 className="font-bold tracking-widest uppercase">{t('cart.yourCart')}</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-white hover:text-red-400">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {carrito.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">{t('cart.empty')}</p>
            ) : (
              carrito.map((producto, index) => (
                <div key={index} className="flex border-b pb-2 items-center relative group">
                  <img
                    src={producto.imagen_url || '/sin-imagen.svg'}
                    alt={nombreProducto(producto, i18n.language)}
                    className="h-12 w-12 object-contain bg-white mr-4 rounded border border-gray-200"
                  />
                  <div className="flex-1 pr-6">
                    <p className="text-xs font-bold uppercase line-clamp-2">{nombreProducto(producto, i18n.language)}</p>
                    <p className="text-blue-600 font-black text-sm mt-1">
                      ${Number(producto.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>

                    {/* BOTONES DE CANTIDAD */}
                    <div className="flex items-center gap-3 mt-2 bg-gray-100 w-fit rounded-md px-2 py-1">
                      <button
                        onClick={() => actualizarCantidad(producto.mi_sku, (producto.cantidad || 1) - 1)}
                        className="text-gray-500 hover:text-blue-600 focus:outline-none"
                        disabled={(producto.cantidad || 1) <= 1}
                      >
                        <i className="fas fa-minus text-xs"></i>
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {producto.cantidad || 1}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(producto.mi_sku, (producto.cantidad || 1) + 1)}
                        className="text-gray-500 hover:text-blue-600 focus:outline-none"
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>

                  </div>
                  <button
                    onClick={() => eliminarDelCarrito(producto.mi_sku)}
                    className="absolute right-2 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-all cursor-pointer"
                    title={t('cart.removeItem')}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          {carrito.length > 0 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-4 font-black">
                <span className="uppercase">{t('cart.total')}:</span>
                <span className="text-blue-900 text-lg">
                  ${totalCarrito.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
              <button
                onClick={manejarPagoStripe}
                disabled={pagando}
                className="w-full bg-blue-900 text-white py-3 font-bold uppercase tracking-widest hover:bg-blue-800 transition-colors rounded flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mb-3"
              >
                {pagando ? (
                  <><i className="fas fa-spinner fa-spin"></i> {t('cart.redirecting')}</>
                ) : (
                  <><i className="fas fa-credit-card"></i> {t('cart.payWithCard')}</>
                )}
              </button>

              {/* Botón de PayPal (para tarjetas que no pueden pagar USD en Stripe) */}
              <BotonPaypal carrito={carrito} />

              <button
                onClick={cotizarPorWhatsapp}
                className="w-full bg-green-600 text-white py-3 font-bold uppercase tracking-widest hover:bg-green-500 transition-colors rounded flex items-center justify-center gap-2"
              >
                <i className="fab fa-whatsapp text-lg"></i> {t('cart.quoteWhatsapp')}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                {t('cart.payNote')}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
