import { Eye, Zap, Shield, Users, CheckCircle } from 'lucide-react';
import T from '@/i18n/T';

export default function WhyUsSection() {
  const features = [
    { icon: Eye, title: 'why.t1' as const, description: 'why.d1' as const, bgClass: 'from-pgreen/20 to-pgreen/10', iconClass: 'text-pgreen' },
    { icon: Zap, title: 'why.t2' as const, description: 'why.d2' as const, bgClass: 'from-tblue/20 to-tblue/10', iconClass: 'text-tblue' },
    { icon: Shield, title: 'why.t3' as const, description: 'why.d3' as const, bgClass: 'from-fgreen/20 to-fgreen/10', iconClass: 'text-fgreen' },
    { icon: Users, title: 'why.t4' as const, description: 'why.d4' as const, bgClass: 'from-ebrown/20 to-ebrown/10', iconClass: 'text-ebrown' },
    { icon: CheckCircle, title: 'why.t5' as const, description: 'why.d5' as const, bgClass: 'from-dblue/20 to-dblue/10', iconClass: 'text-dblue' },
  ];

  return (
    <section className="py-20 px-6 gradient-warm relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46,139,87,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(47,128,237,0.1) 0%, transparent 50%)'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-4">
            <T k="why.title" />
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            <T k="why.sub" />
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="glass rounded-3xl p-8 text-center card-hover group">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.bgClass} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${feature.iconClass}`} />
                </div>
                <h3 className="font-display font-bold text-dblue text-lg mb-2">
                  <T k={feature.title} />
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <T k={feature.description} />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
