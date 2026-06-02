// src/pages/Returns.jsx
export default function Returns() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Returns &amp; Exchanges</h1>
        <p className="max-w-2xl mx-auto text-blue-100">
          Your satisfaction matters. Here's how returns and exchanges work.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-8">

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-calendar-days text-blue-500 mr-2"></i>30-Day Window</h2>
            <p className="text-gray-600">
              You may request a return or exchange within <strong>30 days</strong> of receiving your order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-box text-blue-500 mr-2"></i>Product Condition</h2>
            <p className="text-gray-600">
              Items must be returned in their <strong>original packaging</strong>, unused, and in the same condition
              you received them. For hygiene and safety reasons, certain single-use or sterile items may not be
              eligible for return once opened.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-truck text-blue-500 mr-2"></i>Return Shipping</h2>
            <p className="text-gray-600">
              Return shipping costs are covered by the customer, unless the return is due to our error
              (wrong or defective item). In that case, we cover the full cost.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-rotate-left text-blue-500 mr-2"></i>How to Start a Return</h2>
            <p className="text-gray-600">
              Contact us via WhatsApp or email with your order number and the reason for the return.
              We'll guide you through the process and provide the return address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-2"><i className="fas fa-money-bill-wave text-blue-500 mr-2"></i>Refunds</h2>
            <p className="text-gray-600">
              Once we receive and inspect the returned item, your refund will be processed to the original
              payment method. Please allow a few business days for it to appear, depending on your bank or card issuer.
            </p>
          </section>

          <div className="bg-blue-50 rounded-lg p-5 text-center">
            <p className="text-gray-700 mb-3 text-sm">Questions about a return?</p>
            <a href="https://wa.me/528717821161" target="_blank" rel="noopener noreferrer"
               className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm">
              Contact us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
