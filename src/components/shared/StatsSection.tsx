export default function StatsSection() {
  const stats = [
    { value: '52.8 tỷ', label: 'Tổng tiền gây quỹ', trend: '↑ 28% so năm trước', colorClass: 'text-pgreen', bgClass: 'from-pgreen/5' },
    { value: '1,247', label: 'Chiến dịch thành công', trend: '↑ 42% tăng mỗi tháng', colorClass: 'text-tblue', bgClass: 'from-tblue/5' },
    { value: '89,520', label: 'Người ủng hộ', trend: '↑ 156% năm nay', colorClass: 'text-dblue', bgClass: 'from-dblue/5' },
    { value: '98.5%', label: 'Tỷ lệ minh bạch', trend: 'Zero hidden fees', colorClass: 'text-ebrown', bgClass: 'from-ebrown/5' },
  ];

  return (
    <section className="py-20 px-6 bg-cream relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-3">
            Sức mạnh cộng đồng trong con số
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Những thống kê thực tế từ hành trình của chúng tôi
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="stat-card glass rounded-3xl p-8 text-center card-hover overflow-hidden relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgClass} to-transparent opacity-0 group-hover:opacity-100 transition duration-500`} />
              <div className="relative z-10">
                <div className={`text-4xl font-display font-extrabold ${stat.colorClass} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                <div className="text-xs text-fgreen mt-2">{stat.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
