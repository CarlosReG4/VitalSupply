// components/BotonWhatsapp.jsx
function BotonWhatsapp() {
  return (
    <a href="https://wa.me/5218710000000" target="_blank" 
       className="fixed bottom-8 left-8 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl hover:bg-green-600 transition-all z-[100] animate-bounce">
        <i className="fab fa-whatsapp"></i>
    </a>
  );
}

export default BotonWhatsapp;