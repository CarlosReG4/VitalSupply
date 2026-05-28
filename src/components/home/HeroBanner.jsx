import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Definición de las diapositivas (Slides)
  const slides = [
    {
      title: "Premium Medical Sensors & Cables",
      subtitle: "100% Compatible with Leading Patient Monitors",
      description: "High-precision SpO2 sensors, ECG cables, and temperature probes certified for critical hospital environments.",
      buttonText: "Explore Catalog",
      buttonLink: "/tienda",
      // Puedes usar imágenes de Unsplash profesionales de stock médico temporales en lo que pones las tuyas
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Maximize Technical Compatibility",
      subtitle: "Zero Risk, Precision Guaranteed",
      description: "Engineered to match strict OEM specifications for Mindray, Philips, GE, and more. Certified quality you can trust.",
      buttonText: "Use Compatibility Finder",
      buttonLink: "/",
      image: "https://images.unsplash.com/photo-1584515933487-78021c673153?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "B2B Wholesale Supply Programs",
      subtitle: "Specialized Volume Pricing for Clinics & Hospitals",
      description: "Partner with VitalSupply for stable bulk supply, custom medical cable manufacturing, and priority logistics across the region.",
      buttonText: "Contact Wholesale Specialist",
      buttonLink: "/contacto",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1600&auto=format&fit=crop"
    }
  ];

  // Lógica para que el banner cambie automáticamente cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-[500px] md:h-[600px] w-full bg-slate-900 overflow-hidden">
      
      {/* Contenedor de Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Imagen de Fondo con Capa Oscura Overlay para asegurar legibilidad del texto */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-linear"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />

          {/* Contenido del Texto */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl space-y-4 md:space-y-6">
                <span className="inline-block bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase animate-fade-in">
                  {slide.subtitle}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none">
                  {slide.title}
                </h1>
                <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                  {slide.description}
                </p>
                <div className="pt-4">
                  <Link
                    to={slide.buttonLink}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-base group"
                  >
                    {slide.buttonText}
                    <i className="fas fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controles de Navegación Inferiores (Puntitos) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-blue-500' : 'w-2.5 bg-slate-500/50 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}