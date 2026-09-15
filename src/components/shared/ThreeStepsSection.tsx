import { Edit3, Share2, Gift } from 'lucide-react';
import T from '@/i18n/T';

export default function ThreeStepsSection() {
  const steps = [
    { icon: Edit3, number: 1, title: 'steps.t1' as const, description: 'steps.d1' as const, gradient: 'gradient-green', delay: '0s' },
    { icon: Share2, number: 2, title: 'steps.t2' as const, description: 'steps.d2' as const, gradient: 'gradient-blue', delay: '0.2s' },
    { icon: Gift, number: 3, title: 'steps.t3' as const, description: 'steps.d3' as const, gradient: 'bg-gradient-to-br from-ebrown to-amber-600', delay: '0.4s' },
  ];

  return (
    <section className="py-20 px-6 gradient-warm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-3">
            <T k="steps.title" />
          </h2>
          <p className="text-gray-600 text-lg">
            <T k="steps.sub" />
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="text-center group"
                style={{
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  animationDelay: step.delay,
                  opacity: 0
                }}
              >
                <div className="mb-6 relative">
                  <div className={`w-24 h-24 mx-auto rounded-3xl ${step.gradient} flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300`}>
                    <Icon className="w-11 h-11 text-white" />
                  </div>
                  <div className="absolute top-[5.5rem] -right-5 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center font-display font-bold text-pgreen text-sm z-10">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-display font-bold text-dblue text-xl mb-2">
                  <T k={step.title} />
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <T k={step.description} />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
