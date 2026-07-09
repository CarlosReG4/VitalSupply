import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Testimonios() {
  const { t } = useTranslation();
  const reviews = [
    {
      name: "Dr. Robert Mendez",
      role: t('home.testimonials.review1Role'),
      text: t('home.testimonials.review1Text'),
    },
    {
      name: "Eng. Anna Sophia Ruiz",
      role: t('home.testimonials.review2Role'),
      text: t('home.testimonials.review2Text'),
    },
    {
      name: "MedVida Clinic",
      role: t('home.testimonials.review3Role'),
      text: t('home.testimonials.review3Text'),
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-blue-500 font-bold tracking-widest text-sm uppercase mb-2">{t('home.testimonials.eyebrow')}</h2>
          <p className="text-3xl font-bold text-slate-900">{t('home.testimonials.title')}</p>
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