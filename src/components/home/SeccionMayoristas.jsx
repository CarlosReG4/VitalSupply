function SeccionMayoristas() {
  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-8 md:mb-0 max-w-xl text-balance">
          <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter italic">Ventas al por mayor para Hospitales</h2>
          <p className="text-blue-200">¿Necesitas surtir una clínica o renovar tus sensores? Ofrecemos precios preferenciales y atención personalizada para instituciones de salud.</p>
        </div>
        <a href="#" className="bg-white text-blue-900 px-12 py-4 rounded font-black hover:bg-blue-50 transition-all uppercase tracking-widest">Solicitar Cotización</a>
      </div>
    </section>
  );
}
export default SeccionMayoristas;