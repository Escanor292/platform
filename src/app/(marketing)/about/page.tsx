import Link from "next/link";
import { Info, Users, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Về Crowdfunding VN</h1>
        <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
          Chúng tôi xây dựng nền tảng này để kết nối những ý tưởng sáng tạo với cộng đồng, 
          giúp hiện thực hóa các dự án ý nghĩa tại Việt Nam.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100">
           <Heart className="text-green-600 mb-4" size={32} />
           <h3 className="text-xl font-black text-gray-900 mb-2">Sứ mệnh</h3>
           <p className="text-sm text-gray-600 leading-relaxed">
             Tạo ra một hệ sinh thái minh bạch và tin cậy để mọi người cùng nhau 
             thúc đẩy sự đổi mới và sáng tạo.
           </p>
        </div>
        <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
           <ShieldCheck className="text-blue-600 mb-4" size={32} />
           <h3 className="text-xl font-black text-gray-900 mb-2">Giá trị</h3>
           <p className="text-sm text-gray-600 leading-relaxed">
             Minh bạch trong tài chính, an toàn cho người ủng hộ và trách nhiệm 
             của người tạo dự án.
           </p>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-[3rem] p-12 text-center">
         <h2 className="text-3xl font-black mb-6">Sẵn sàng bắt đầu chưa?</h2>
         <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link href="/campaigns" className="px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition">
              Khám phá dự án
            </Link>
            <Link href="/auth/register" className="px-8 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition">
              Trở thành Creator
            </Link>
         </div>
      </div>
    </div>
  );
}
