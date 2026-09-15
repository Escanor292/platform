import { Star } from 'lucide-react';
import T from '@/i18n/T';

export default function TestimonialsSection() {
  const testimonials = [
    { rating: 5, text: 'stories.q1' as const, name: 'stories.n1' as const, role: 'stories.r1' as const, initial: 'TH', gradient: 'gradient-green', borderColor: 'border-pgreen' },
    { rating: 5, text: 'stories.q2' as const, name: 'stories.n2' as const, role: 'stories.r2' as const, initial: 'NM', gradient: 'gradient-blue', borderColor: 'border-tblue' },
  ];

  return (
    <section className="py-20 px-6 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-3">
            <T k="stories.title" />
          </h2>
          <p className="text-gray-500">
            <T k="stories.sub" />
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`glass rounded-3xl p-10 card-hover border-l-4 ${testimonial.borderColor}`}
            >
              <div className="flex items-center gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 italic leading-relaxed mb-8 text-lg">
                “<T k={testimonial.text} />”
              </p>

              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {testimonial.initial}
                </div>
                <div>
                  <div className="font-bold text-dblue"><T k={testimonial.name} /></div>
                  <div className="text-sm text-gray-400"><T k={testimonial.role} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
