// src/components/checkout/BotonPaypal.jsx
// Botón de PayPal para el carrito. Crea la orden en el servidor (precios
// validados en la Edge Function) y, al aprobar el comprador, la captura
// y redirige a /pago-exitoso. Mismo flujo conceptual que el botón de Stripe.

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { crearOrdenPaypal, capturarOrdenPaypal } from '../../utils/checkout';

function BotonPaypal({ carrito }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!carrito || carrito.length === 0) return null;

  return (
    <div className="mb-3">
      <PayPalScriptProvider
        options={{
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, // si tu versión es vieja, usa "client-id"
          currency: 'USD',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{ layout: 'horizontal', color: 'gold', shape: 'rect', tagline: false, height: 45 }}
          // 1) Crea la orden en el servidor y devuelve el orderId de PayPal.
          createOrder={async () => {
            try {
              return await crearOrdenPaypal(carrito);
            } catch (err) {
              console.error('Error creando orden PayPal:', err);
              alert(t('paypal.startError'));
              throw err;
            }
          }}
          // 2) El comprador aprobó: capturamos en el servidor y confirmamos.
          onApprove={async (data) => {
            try {
              await capturarOrdenPaypal(data.orderID);
              navigate('/pago-exitoso');
            } catch (err) {
              console.error('Error capturando pago PayPal:', err);
              alert(t('paypal.captureError'));
            }
          }}
          onError={(err) => {
            console.error('PayPal error:', err);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}

export default BotonPaypal;
