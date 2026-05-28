import React from 'react';

export default function Testimonios() {
  const reviews = [
    {
      name: "Dr. Roberto Méndez",
      role: "Jefe de Área, Hospital Central",
      text: "The quality of the SpO2 sensors is exceptional. They have reduced our replacement costs significantly while maintaining precision.",
    },
    {
      name: "Ing. Ana Sofía Ruiz",
      role: "Coordinadora de Ingeniería Biomédica",
      text: "Customer service is top-tier. They provided technical support that saved us hours of troubleshooting. Highly recommended.",
    },
    {
      name: "Clínica MedVida",
      role: "Gestión de Compras",
      text: "Reliable equipment and fast shipping. We've been working with VitalSupply for a year and haven't had a single issue.",
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-blue-500 font-bold tracking-widest text-sm uppercase mb-2">Social Proof</h2>
          <p className="text-3xl font-bold text-slate-900">Trusted by Professionals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="text-blue-500 text-2xl mb-4">★★★★★</div>
              <p className="text-slate-600 mb-6 italic">"{review.text}"</p>
              <div>
                <p className="text-slate-900 font-bold">{review.name}</p>
                <p className="text-slate-500 text-sm">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}