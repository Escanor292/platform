import { Edit3, Share2, Gift } from 'lucide-react';

export default function ThreeStepsSection() {
  const steps = [
    {
      icon: Edit3,
      number: 1,
      title: 'Tạo chiến dịch',
      description: 'Chia sẻ câu chuyện, mục tiêu, và tại sao bạn cần hỗ trợ',
      gradient: 'gradient-green',
      delay: '0s'
    },
    {
      icon: Share2,
      number: 2,
      title: 'Chia sẻ rộng rãi',
      description: 'Lan tỏa đến bạn bè, gia đình, cộng đồng yêu thương',
      gradient: 'gradient-blue',
      delay: '0.2s'
    },
    {
      icon: Gift,
      number: 3,
      title: 'Nhận ủng hộ',
      description: 'Tiền về minh bạch, an toàn, nhanh chóng vào tài khoản',
      gradient: 'bg-gradient-to-br from-ebrown to-amber-600',
      delay: '0.4s'
    }
  ];

  return (
    <section className="py-20 px-6 gradient-warm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-3">
            Hành trình 3 bước đơn giản
          </h2>
          <p className="text-gray-600 text-lg">
            Từ ý tưởng đến hiện thực chỉ trong vài phút
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
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center font-display font-bold text-pgreen text-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-display font-bold text-dblue text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
