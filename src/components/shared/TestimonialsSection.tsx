import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      text: '"Nhờ TửTế Fund, dự án thư viện cộng đồng đã nhận 150 triệu chỉ trong 2 tuần. Sự minh bạch giúp nhà tài trợ tin tưởng hoàn toàn. Đây là nền tảng tử tế thật sự."',
      name: 'Trần Hương',
      role: 'Creator – Thư viện Hy Vọng',
      initial: 'TH',
      gradient: 'gradient-green',
      borderColor: 'border-pgreen'
    },
    {
      rating: 5,
      text: '"Tôi ủng hộ 5 chiến dịch và luôn nhận cập nhật chi tiết. Cảm giác đóng góp thực sự có ý nghĩa khi biết tiền đi đâu, làm gì. TửTế Fund thay đổi cách tôi nhìn về gây quỹ."',
      name: 'Nguyễn Minh',
      role: 'Backer – Nhà ủng hộ tích cực',
      initial: 'NM',
      gradient: 'gradient-blue',
      borderColor: 'border-tblue'
    }
  ];

  return (
    <section className="py-20 px-6 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-3">
            Những câu chuyện cảm xúc
          </h2>
          <p className="text-gray-500">
            Lời từ trái tim những người đã trải nghiệm
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
                {testimonial.text}
              </p>
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {testimonial.initial}
                </div>
                <div>
                  <div className="font-bold text-dblue">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
