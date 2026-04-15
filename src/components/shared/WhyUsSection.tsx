import { Eye, Zap, Shield, Users, CheckCircle } from 'lucide-react';

export default function WhyUsSection() {
  const features = [
    {
      icon: Eye,
      title: 'Minh bạch 100%',
      description: 'Mọi giao dịch công khai, theo dõi được, không biết đen tối',
      bgClass: 'from-pgreen/20 to-pgreen/10',
      iconClass: 'text-pgreen'
    },
    {
      icon: Zap,
      title: 'Dễ gây quỹ',
      description: 'Tạo chiến dịch chỉ 5 phút, không cần kinh nghiệm',
      bgClass: 'from-tblue/20 to-tblue/10',
      iconClass: 'text-tblue'
    },
    {
      icon: Shield,
      title: 'An toàn tuyệt đối',
      description: 'Thanh toán bảo mật, KYC đầy đủ, bảo vệ người dùng',
      bgClass: 'from-fgreen/20 to-fgreen/10',
      iconClass: 'text-fgreen'
    },
    {
      icon: Users,
      title: 'Cộng đồng mạnh',
      description: 'Kết nối 89.520 tấm lòng tử tế',
      bgClass: 'from-ebrown/20 to-ebrown/10',
      iconClass: 'text-ebrown'
    },
    {
      icon: CheckCircle,
      title: 'KYC Tin cậy',
      description: 'Xác minh danh tính bảo vệ niềm tin',
      bgClass: 'from-dblue/20 to-dblue/10',
      iconClass: 'text-dblue'
    }
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
            Vì sao chọn TửTế Fund?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Chúng tôi xây dựng nền tảng dựa trên sự minh bạch, an toàn và kết nối cộng đồng
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
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
