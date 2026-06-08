function Nosotros() {
  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen flex flex-col">
      
      {/* El contenido central de esta página */}
      <main className="flex-grow container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-black text-blue-900 mb-6 uppercase tracking-tighter">Contact Us</h1>
        <p className="text-gray-600 mb-10 max-w-lg mx-auto">
          Do you need a volume quote for your hospital or clinic? Leave your details and a specialized advisor will contact you.
        </p>
        
        {/* Un formulario "boceto" rápido */}
        <form className="max-w-md mx-auto bg-white p-8 border rounded shadow-sm text-left">
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Full Name</label>
            <input type="text" className="w-full border-2 border-gray-100 rounded py-2 px-4 focus:border-blue-500 outline-none" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Hospital or Clinic</label>
            <input type="text" className="w-full border-2 border-gray-100 rounded py-2 px-4 focus:border-blue-500 outline-none" />
          </div>
          <button className="w-full bg-blue-600 text-white font-black py-3 rounded uppercase tracking-widest hover:bg-blue-700 mt-4">
            Send Message
          </button>
        </form>
      </main>
    </div>
  );
}

export default Nosotros;
