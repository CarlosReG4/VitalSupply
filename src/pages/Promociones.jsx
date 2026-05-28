const promosData = [
  { id: 1, nombre: 'Sensor SpO2 Reusable Pediátrico', precioNormal: '$950.00', precioPromo: '$750.00', descuento: '20%' },
  { id: 2, nombre: 'Cable Troncal ECG 5 Puntas', precioNormal: '$1,500.00', precioPromo: '$1,200.00', descuento: '20%' },
  { id: 3, nombre: 'Batería para Monitor Mindray', precioNormal: '$2,800.00', precioPromo: '$2,380.00', descuento: '15%' },
];

function Promociones() {
  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen flex flex-col">

      {/* Banner de Título */}
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Ofertas y <span className="text-blue-400">Promotions</span>
          </h1>
          <p className="mt-2 text-blue-200">Descuentos exclusivos en consumibles médicos por tiempo limitado.</p>
        </div>
      </div>

      {/* Contenedor Principal (Filtros a la izquierda, Productos a la derecha) */}
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* BARRA LATERAL (Filtros técnicos - Nuestra mejora sobre la competencia) */}
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-6 border rounded shadow-sm sticky top-24">
            <h3 className="font-black uppercase tracking-widest text-sm mb-6 border-b pb-2">Filter Products</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Pieza OEM (Num. Parte)</label>
              <input type="text" placeholder="Ej. M1191B" className="w-full border-2 border-gray-100 rounded py-2 px-3 focus:border-blue-500 outline-none text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Fabricante de Equipo</label>
              <select className="w-full border-2 border-gray-100 rounded py-2 px-3 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer">
                <option>All manufacturers</option>
                <option>Philips</option>
                <option>Mindray</option>
                <option>GE Medical</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Monitor Model</label>
              <select className="w-full border-2 border-gray-100 rounded py-2 px-3 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer">
                <option>Select a model...</option>
                <option>IntelliVue MP50</option>
                <option>BeneVision N12</option>
              </select>
            </div>

            <button className="w-full bg-blue-600 text-white font-bold py-2 rounded text-xs uppercase tracking-widest hover:bg-blue-700">
              Aplicar Filtros
            </button>
          </div>
        </aside>

        {/* CUADRÍCULA DE PRODUCTOS */}
        <section className="w-full md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {promosData.map((promo) => (
              <div key={promo.id} className="bg-white border rounded p-6 relative hover:shadow-lg transition-shadow group">
                {/* Etiqueta de Descuento Visual */}
                <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest z-10">
                  -{promo.descuento}
                </div>
                
                <div className="h-40 bg-gray-50 flex items-center justify-center mb-4 font-bold text-gray-300">
                  [IMAGEN]
                </div>
                
                <h4 className="font-bold text-sm mb-2 uppercase text-gray-800">{promo.nombre}</h4>
                
                {/* Precios tachados y nuevos */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-gray-400 line-through text-xs font-bold">{promo.precioNormal}</span>
                  <span className="text-red-600 font-black text-lg">{promo.precioPromo}</span>
                </div>
                
                <button className="w-full bg-white border-2 border-blue-900 text-blue-900 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-900 hover:text-white transition-colors">
                  Agregar
                </button>
              </div>
            ))}

          </div>
        </section>

      </main>
    </div>
  );
}

export default Promociones;