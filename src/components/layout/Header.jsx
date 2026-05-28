import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { iniciarPagoStripe } from '../../utils/checkout';

const categoriesList = ['SpO2', 'ECG Cables', 'EKG Cables', 'NIBP', 'IBP Cables', 'Temperature', 'Fetal', 'Oxygen Sensors'];
const otrosList = ['Promotions', 'New Arrivals'];

// Número de WhatsApp para cotizaciones (código de país + número, sin signos ni espacios)
const WHATSAPP_NUMERO = '5218711063097';

function Header() {
  const carrito = useCartStore((state) => state.carrito);
  const eliminarDelCarrito = useCartStore((state) => state.eliminarDelCarrito);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pagando, setPagando] = useState(false);

  const manejarPagoStripe = async () => {
    try {
      setPagando(true);
      await iniciarPagoStripe(carrito);
    } catch (err) {
      console.error('Error al iniciar pago:', err);
      alert('No se pudo iniciar el pago. Intenta de nuevo o cotiza por WhatsApp.');
      setPagando(false);
    }
  };
  
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  const manejarBusqueda = (e) => {
    e.preventDefault(); 
    if (busqueda.trim() !== '') {
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`); 
      setBusqueda('');  
    }
  };

  // Total del carrito (en USD)
  const totalCarrito = carrito.reduce(
    (total, item) => total + (Number(item.precio) * (item.cantidad || 1)),
    0
  );

  // Arma el mensaje de cotización y abre WhatsApp
  const cotizarPorWhatsapp = () => {
    if (carrito.length === 0) return;

    const lineas = carrito.map((item) => {
      const cant = item.cantidad || 1;
      const precio = Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 });
      const subtotal = (Number(item.precio) * cant).toLocaleString('en-US', { minimumFractionDigits: 2 });
      return `• ${item.nombre} (SKU: ${item.mi_sku})\n   ${cant} x $${precio} = $${subtotal} USD`;
    });

    const totalTexto = totalCarrito.toLocaleString('en-US', { minimumFractionDigits: 2 });

    const mensaje =
      `Hello, I would like to request a quote / order for the following products:\n\n` +
      `${lineas.join('\n\n')}\n\n` +
      `TOTAL ESTIMADO: $${totalTexto} USD\n\n` +
      `Looking forward to your reply. Thank you!`;

    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <div className="w-full lg:w-auto mb-4 lg:mb-0">
          <Link to="/" className="inline-block">
            <img src="/logo.svg" alt="VitalSupply" className="h-16 w-auto" />
          </Link>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="w-full lg:flex-1 lg:mx-12 mb-4 lg:mb-0">
          <form onSubmit={manejarBusqueda} className="relative">
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Search by part number (SKU), model or brand..." 
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
          
          <div className="flex space-x-4 text-blue-900">
            <a href="#" className="hover:text-blue-500 flex flex-col items-center">
              <i className="far fa-user text-lg"></i>
              <span className="text-[10px] mt-1 font-bold">ACCOUNT</span>
            </a>
            <button onClick={() => setIsCartOpen(true)} className="hover:text-blue-500 flex flex-col items-center relative cursor-pointer">
              <i className="fas fa-shopping-cart text-lg"></i>
              {carrito.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0)}
                </span>
              )}
              <span className="text-[10px] mt-1 font-bold">YOUR CART</span>
            </button>
          </div>
        </div>
      </div>
      
      <nav className="bg-blue-900 text-white border-t border-blue-800">
        <div className="container mx-auto px-4 flex justify-center space-x-10 text-xs font-bold uppercase tracking-widest relative">
          <Link to="/" className="hover:text-blue-300 transition-colors py-3">Home</Link>
          
          <div className="relative group cursor-pointer py-3">
            <span className="hover:text-blue-300 transition-colors flex items-center">
              Categories <i className="fas fa-chevron-down ml-1 text-[10px]"></i>
            </span>
            <div className="absolute top-full left-0 bg-white shadow-xl py-2 w-56 text-gray-800 border rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              {categoriesList.map(item => (
                <Link 
                  key={item} 
                  to={`/categorias?tipo=${item}`}
                  className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative group cursor-pointer py-3">
            <span className="hover:text-blue-300 transition-colors flex items-center">
              Others<i className="fas fa-chevron-down ml-1 text-[10px]"></i>
            </span>
            <div className="absolute top-full left-0 bg-white shadow-xl py-2 w-48 text-gray-800 border rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              {otrosList.map(item => (
                <Link key={item} to={item === 'Promotions' ? '/promociones' : '/nuevos'} className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/nosotros" className="hover:text-blue-300 transition-colors py-3">About Us</Link>
        </div>
      </nav>

      {/* PANEL LATERAL DEL CARRITO */}
      <div className={`fixed inset-0 bg-black/50 transition-opacity z-50 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
        
        <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="p-4 bg-blue-900 text-white flex justify-between items-center">
            <h2 className="font-bold tracking-widest uppercase">Your Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-white hover:text-red-400">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {carrito.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
            ) : (
              carrito.map((producto, index) => (
                <div key={index} className="flex border-b pb-2 items-center relative group">
                  <img 
                    src={producto.imagen_url || '/sin-imagen.svg'} 
                    alt={producto.nombre}
                    className="h-12 w-12 object-contain bg-white mr-4 rounded border border-gray-200"
                  />
                  <div className="flex-1 pr-6">
                    <p className="text-xs font-bold uppercase line-clamp-2">{producto.nombre}</p>
                    <p className="text-blue-600 font-black text-sm mt-1">
                      ${Number(producto.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {producto.cantidad > 1 && <span className="text-gray-400 text-[10px] ml-2">x{producto.cantidad}</span>}
                    </p>
                  </div>
                  <button 
                    onClick={() => eliminarDelCarrito(producto.mi_sku)}
                    className="absolute right-0 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove producto"
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
                <span>TOTAL:</span>
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
                  <><i className="fas fa-spinner fa-spin"></i> Redirecting...</>
                ) : (
                  <><i className="fas fa-credit-card"></i> Pay with card</>
                )}
              </button>
              <button
                onClick={cotizarPorWhatsapp}
                className="w-full bg-green-600 text-white py-3 font-bold uppercase tracking-widest hover:bg-green-500 transition-colors rounded flex items-center justify-center gap-2"
              >
                <i className="fab fa-whatsapp text-lg"></i> Request quote via WhatsApp
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Pay online with card or request a quote via WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
