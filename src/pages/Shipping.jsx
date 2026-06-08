// src/pages/Shipping.jsx
export default function Shipping() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Shipping Policy</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          We ship worldwide. Here's what to expect.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Banner envío gratis */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-6 text-center mb-8 shadow-sm">
          <p className="text-2xl font-black">Free Shipping on orders over $150 USD</p>
          <p className="text-blue-100 text-sm mt-1">Applies to standard shipping. Orders below $150 have a flat shipping rate calculated at checkout.</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-8">

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-gears text-blue-500 mr-2"></i>Processing Time</h2>
            <p className="text-gray-600">
              Many of our products are sourced and prepared to order to guarantee freshness and availability.
              Orders are typically processed and dispatched within <strong>10 to 20 business days</strong>.
              For items we have in local stock, processing is faster — we'll always confirm your timeline after purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-flag text-blue-500 mr-2"></i>Domestic Shipping (Mexico)</h2>
            <p className="text-gray-600">
              We ship across Mexico via national carriers (Estafeta / DHL). Once dispatched, domestic delivery
              usually takes <strong>2 to 5 business days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-earth-americas text-blue-500 mr-2"></i>International Shipping</h2>
            <p className="text-gray-600">
              We ship worldwide via international couriers (FedEx / DHL). Delivery times vary by destination,
              typically <strong>5 to 15 business days</strong> after dispatch. Import duties, taxes, or customs
              fees charged by the destination country are the customer's responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-location-crosshairs text-blue-500 mr-2"></i>Tracking</h2>
            <p className="text-gray-600">
              Once your order ships, we'll send you a tracking number so you can follow your package
              every step of the way.
            </p>
          </section>

          <div className="bg-blue-50 rounded-lg p-5 text-center">
            <p className="text-gray-700 mb-3 text-sm">Need your order by a specific date?</p>
            <a href="https://wa.me/528717821161" target="_blank" rel="noopener noreferrer"
               className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm">
              Ask us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
