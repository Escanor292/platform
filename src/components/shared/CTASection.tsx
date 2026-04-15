import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto rounded-3xl gradient-green p-16 text-center text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition duration-500" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-125 transition duration-500" />
        
        <h2 className="font-display font-bold text-4xl lg:text-5xl mb-5 relative z-10">
          Sẵn sàng gieo mầm tử tế?
        </h2>
        <p className="text-white/90 mb-10 text-lg relative z-10 max-w-2xl mx-auto">
          Bắt đầu câu chuyện gây quỹ của bạn ngay hôm nay. Cộng đồng đang chờ đợi
        </p>
        <Link 
          href="/campaigns/create"
          className="px-10 py-4 rounded-2xl bg-white text-pgreen font-bold text-base hover:shadow-2xl hover:shadow-white/40 transition-all relative z-10 inline-flex items-center gap-2 group/btn"
        >
          <span>Tạo chiến dịch ngay</span>
          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
        </Link>
      </div>
    </section>
  );
}
