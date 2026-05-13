"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  User, Calendar, CreditCard, MapPin, Phone, Mail, 
  Building2, DollarSign, Upload, CheckCircle, ArrowRight,
  AlertCircle, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UpgradeIndividualPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    fullName: "",
    dateOfBirth: "",
    idCardNumber: "",
    idCardType: "CCCD",
    idCardFrontImage: "",
    idCardBackImage: "",
    idCardIssueDate: "",
    idCardIssuePlace: "",
    
    // Địa chỉ
    permanentAddress: "",
    currentAddress: "",
    
    // Liên hệ
    phone: "",
    email: "",
    
    // Thông tin Creator
    displayName: "",
    bio: "",
    website: "",
    
    // Thanh toán
    bankAccount: "",
    bankName: "",
    taxCode: "",
  });

  // Kiểm tra quyền và load dữ liệu user
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      toast.error("Vui lòng đăng nhập");
      router.push("/auth/login?callbackUrl=/upgrade/individual");
      return;
    }

    const user = session.user as any;
    
    // Kiểm tra nếu không phải BACKER
    if (user?.role !== "BACKER") {
      toast.error("Bạn đã là Creator hoặc không thể nâng cấp");
      router.push("/dashboard");
      return;
    }

    // Kiểm tra nếu là tổ chức
    if (user?.isOrganization) {
      toast.info("Chuyển sang trang nâng cấp doanh nghiệp");
      router.push("/upgrade/organization");
      return;
    }

    // Load thông tin user hiện tại
    fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        
        // Pre-fill form với dữ liệu đã có
        setFormData(prev => ({
          ...prev,
          fullName: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          displayName: data.displayName || data.name || "",
          bio: data.bio || "",
          website: data.website || "",
          permanentAddress: data.shippingAddress || "",
          bankAccount: data.bankAccount || "",
          bankName: data.bankName || "",
          idCardNumber: data.idCard || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      { field: formData.fullName, name: "Họ tên" },
      { field: formData.dateOfBirth, name: "Ngày sinh" },
      { field: formData.idCardNumber, name: "Số CCCD/CMND" },
      { field: formData.idCardFrontImage, name: "Ảnh CCCD mặt trước" },
      { field: formData.idCardBackImage, name: "Ảnh CCCD mặt sau" },
      { field: formData.permanentAddress, name: "Địa chỉ thường trú" },
      { field: formData.currentAddress, name: "Địa chỉ hiện tại" },
      { field: formData.phone, name: "Số điện thoại" },
      { field: formData.email, name: "Email" },
    ];

    const missingFields = requiredFields.filter(f => !f.field).map(f => f.name);
    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/upgrade-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "individual",
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi nâng cấp");
      }

      toast.success("Đã gửi yêu cầu nâng cấp! Chúng tôi sẽ xem xét trong 1-2 ngày làm việc.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pgreen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-pgreen to-fgreen rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Nâng cấp Creator - Cá nhân</h1>
          <p className="text-gray-600 font-medium max-w-2xl mx-auto">
            Hoàn tất thông tin bên dưới để trở thành Creator và bắt đầu tạo các dự án gây quỹ của riêng bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cá nhân */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-pgreen" />
              Thông tin cá nhân
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Họ tên pháp lý <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Loại giấy tờ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.idCardType}
                  onChange={(e) => setFormData({ ...formData, idCardType: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-pgreen focus:outline-none"
                >
                  <option value="CCCD">Căn cước công dân</option>
                  <option value="CMND">Chứng minh nhân dân</option>
                  <option value="PASSPORT">Hộ chiếu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Số CCCD/CMND/Hộ chiếu <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.idCardNumber}
                  onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                  placeholder="001234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày cấp
                </label>
                <Input
                  type="date"
                  value={formData.idCardIssueDate}
                  onChange={(e) => setFormData({ ...formData, idCardIssueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nơi cấp
                </label>
                <Input
                  value={formData.idCardIssuePlace}
                  onChange={(e) => setFormData({ ...formData, idCardIssuePlace: e.target.value })}
                  placeholder="Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                />
              </div>
            </div>

            {/* Upload ảnh CCCD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ảnh CCCD mặt trước <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pgreen transition cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click để tải ảnh lên</p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      // TODO: Implement image upload
                      toast.info("Chức năng upload ảnh đang được phát triển");
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ảnh CCCD mặt sau <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pgreen transition cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click để tải ảnh lên</p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-pgreen" />
              Địa chỉ
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Địa chỉ thường trú <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Địa chỉ hiện tại / nơi ở <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  required
                />
              </div>
            </div>
          </div>

          {/* Liên hệ */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Phone className="w-6 h-6 text-pgreen" />
              Thông tin liên hệ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Thông tin Creator */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-pgreen" />
              Thông tin Creator công khai
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên hiển thị Creator
                </label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Tên bạn muốn hiển thị công khai"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Chia sẻ về bản thân, kinh nghiệm và lý do bạn muốn trở thành Creator..."
                  className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pgreen focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Website cá nhân
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-pgreen" />
              Thông tin thanh toán
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Số tài khoản ngân hàng
                </label>
                <Input
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên ngân hàng
                </label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Vietcombank, Techcombank, ..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mã số thuế (nếu có)
                </label>
                <Input
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  placeholder="0123456789"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-gradient-to-r from-pgreen/10 to-fgreen/10 rounded-3xl p-8 border border-pgreen/20">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-pgreen flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Lưu ý quan trọng</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Thông tin bạn cung cấp sẽ được xem xét trong vòng 1-2 ngày làm việc</li>
                  <li>• Vui lòng đảm bảo thông tin chính xác và trung thực</li>
                  <li>• Ảnh CCCD phải rõ ràng, đầy đủ thông tin</li>
                  <li>• Sau khi được duyệt, bạn sẽ nhận được email thông báo</li>
                </ul>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pgreen to-fgreen hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Gửi yêu cầu nâng cấp
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
