export default function GestionCategorias() {
  return (
    <div className="space-y-6">
      
      {/* MENÚ DE ACCIÓN RÁPIDA (Lo que estabas buscando) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-blue-50 text-blue-700 border border-blue-200 p-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-sm flex flex-col items-center justify-center gap-2 group">
          <i className="fas fa-plus-circle text-2xl group-hover:scale-110 transition-transform"></i>
          <span>Agregar Categoría Nueva</span>
        </button>
        
        <button className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl font-semibold hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex flex-col items-center justify-center gap-2 group">
          <i className="fas fa-tag text-2xl group-hover:scale-110 transition-transform"></i>
          <span>Agregar Marca (OEM)</span>
        </button>

        <button className="bg-purple-50 text-purple-700 border border-purple-200 p-4 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all shadow-sm flex flex-col items-center justify-center gap-2 group">
          <i className="fas fa-desktop text-2xl group-hover:scale-110 transition-transform"></i>
          <span>Agregar Modelo Compatible</span>
        </button>
      </div>

      {/* ÁREA DE VISTA DE CATEGORÍAS */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 tracking-tight">Estructura Actual del Catálogo</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">Modo Edición</span>
        </div>
        
        <div className="p-8 text-center text-gray-500">
          <i className="fas fa-tools text-4xl text-amber-300 mb-4 block"></i>
          <p className="text-sm font-bold text-gray-700 mb-1">Sección en desarrollo</p>
          <p className="text-xs max-w-md mx-auto">
            La gestión de categorías y marcas todavía no está conectada a la base de datos.
            Por ahora, las categorías se administran editando cada producto en la pestaña de Productos.
          </p>
        </div>
      </div>
      
    </div>
  );
}