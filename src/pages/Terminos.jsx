// src/pages/Terminos.jsx
export default function Terminos() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Terms of Service</h1>
        <p className="max-w-2xl mx-auto text-blue-100">Last updated: 2026</p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">1. Overview</h2>
            <p>
              VitalSupply ("we", "us") sells compatible medical sensors, cables, and related accessories.
              By placing an order through this website, you agree to these Terms of Service. Please read them carefully.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">2. Products &amp; Compatibility</h2>
            <p>
              Our products are aftermarket compatible parts unless explicitly stated as "Original". Brand names
              and model references are used only to indicate compatibility and remain the property of their
              respective owners. It is the buyer's responsibility to confirm compatibility with their equipment
              before purchase. When in doubt, contact us and we'll help you verify.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">3. Pricing &amp; Payment</h2>
            <p>
              All prices are listed in US Dollars (USD). We accept payments through our secure checkout provider.
              We reserve the right to correct pricing errors and to update prices at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">4. Orders &amp; Availability</h2>
            <p>
              Placing an order is an offer to purchase. We may accept or decline any order. Many items are
              prepared to order; estimated processing and delivery times are described in our Shipping Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">5. Shipping, Returns &amp; Refunds</h2>
            <p>
              Shipping terms are described in our Shipping Policy, and returns are governed by our Returns &amp;
              Exchanges policy. Import duties and taxes for international orders are the customer's responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">6. Limitation of Liability</h2>
            <p>
              Products must be installed and used by qualified personnel in accordance with the corresponding
              equipment's guidelines. To the extent permitted by law, VitalSupply is not liable for indirect or
              consequential damages arising from the misuse of our products.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-2">7. Contact</h2>
            <p>
              Questions about these Terms? Reach us at <a href="mailto:sales@vitalsupply.site" className="text-blue-600 hover:underline">sales@vitalsupply.site</a> or
              via WhatsApp at +52 871 782 1161. VitalSupply is based in Torreón, Coahuila, México.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
