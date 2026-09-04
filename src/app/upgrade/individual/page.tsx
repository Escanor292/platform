"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRight, Loader2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";

export default function UpgradeIndividualPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", dateOfBirth: "", idCardNumber: "", idCardType: "CCCD",
    idCardFrontImage: "", idCardBackImage: "", idCardIssueDate: "", idCardIssuePlace: "",
    permanentAddress: "", currentAddress: "", phone: "", email: "",
    displayName: "", bio: "", website: "", bankAccount: "", bankName: "", taxCode: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      toast.error("Vui lòng đăng nhập");
      router.push("/auth/login?callbackUrl=/upgrade/individual");
      return;
    }
    const user = session.user as any;
    if (user?.role !== "BACKER") {
      toast.error("Bạn đã là Creator hoặc không thể nâng cấp");
      router.push("/dashboard");
      return;
    }
    if (user?.isOrganization) {
      router.push("/upgrade/organization");
      return;
    }
    fetch("/api/user/profile").then((r) => r.json()).then((data) => {
      if (!data) return;
      setFormData((prev) => ({
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
    }).catch(() => null);
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      [formData.fullName, "Họ tên"], [formData.dateOfBirth, "Ngày sinh"], [formData.idCardNumber, "Số CCCD"],
      [formData.idCardFrontImage, "Ảnh CCCD trước"], [formData.idCardBackImage, "Ảnh CCCD sau"],
      [formData.permanentAddress, "Địa chỉ thường trú"], [formData.currentAddress, "Địa chỉ hiện tại"],
      [formData.phone, "Số điện thoại"], [formData.email, "Email"],
    ].filter(([v]) => !v).map(([, n]) => n);
    if (missing.length) { toast.error(`Vui lòng điền: ${missing.join(", ")}`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/user/upgrade-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "individual", ...formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi nâng cấp");
      toast.success("Đã gửi yêu cầu nâng cấp Creator (P0, chờ admin).");
      router.push("/dashboard");
    } catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
  };

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 px-4 py-12">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black">Nâng cấp Creator — cá nhân</h1>
          <p className="mt-2 text-gray-600">P0 nộp hồ sơ + ảnh CCCD qua Cloudinary. Nên chạy eKYC trước.</p>
          <p className="mt-2 text-sm"><Link className="font-bold text-emerald-700 underline" href="/kyc?next=/upgrade/individual">Mở /kyc</Link></p>
        </div>
        <section className="rounded-3xl border bg-white p-8 space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-black"><User className="text-emerald-700" /> Thông tin pháp lý</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Họ tên pháp lý" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
            <select className="h-11 rounded-xl border-2 px-3" value={formData.idCardType} onChange={(e) => setFormData({ ...formData, idCardType: e.target.value })}>
              <option value="CCCD">CCCD</option><option value="CMND">CMND</option><option value="PASSPORT">Hộ chiếu</option>
            </select>
            <Input placeholder="Số CCCD 12 số" value={formData.idCardNumber} onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })} required />
            <Input type="date" value={formData.idCardIssueDate} onChange={(e) => setFormData({ ...formData, idCardIssueDate: e.target.value })} />
            <Input placeholder="Nơi cấp" value={formData.idCardIssuePlace} onChange={(e) => setFormData({ ...formData, idCardIssuePlace: e.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUpload label="Ảnh CCCD mặt trước *" value={formData.idCardFrontImage} onChange={(url) => setFormData({ ...formData, idCardFrontImage: url })} />
            <ImageUpload label="Ảnh CCCD mặt sau *" value={formData.idCardBackImage} onChange={(url) => setFormData({ ...formData, idCardBackImage: url })} />
          </div>
        </section>
        <section className="rounded-3xl border bg-white p-8 space-y-4">
          <Input placeholder="Địa chỉ thường trú" value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} required />
          <Input placeholder="Địa chỉ hiện tại" value={formData.currentAddress} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            <Input type="email" value={formData.email} disabled />
          </div>
          <Input placeholder="Tên hiển thị Creator" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} />
          <Input placeholder="Số tài khoản" value={formData.bankAccount} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} />
          <Input placeholder="Ngân hàng" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
        </section>
        <Button type="submit" disabled={loading} className="h-14 w-full bg-emerald-700 text-lg font-bold hover:bg-emerald-800">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Gửi yêu cầu nâng cấp
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
