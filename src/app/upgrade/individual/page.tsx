"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRight, Loader2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { decodeCccdQrFromImage } from "@/lib/ekyc/decode-cccd-qr-browser";
import { EkycWizard } from "@/components/kyc/EkycWizard";

const emptyLegal = {
  fullName: "", dateOfBirth: "", idCardNumber: "", idCardType: "CCCD",
  idCardFrontImage: "", idCardBackImage: "", idCardIssueDate: "", idCardIssuePlace: "",
  permanentAddress: "", currentAddress: "", phone: "", email: "",
  displayName: "", bio: "", website: "", bankAccount: "", bankName: "", taxCode: "",
};

export default function UpgradeIndividualPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [modeReady, setModeReady] = useState(false);
  const [ekycEnabled, setEkycEnabled] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [ekycDone, setEkycDone] = useState(false);
  const [qrNote, setQrNote] = useState("");
  const [formData, setFormData] = useState(emptyLegal);

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
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()).catch(() => null),
      fetch("/api/kyc/status").then((r) => r.json()).catch(() => null),
    ]).then(([profile, kycRes]) => {
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          fullName: profile.name || "",
          phone: profile.phone || "",
          email: profile.email || "",
          displayName: profile.displayName || profile.name || "",
          bio: profile.bio || "",
          website: profile.website || "",
          permanentAddress: profile.shippingAddress || "",
          bankAccount: profile.bankAccount || "",
          bankName: profile.bankName || "",
          idCardNumber: profile.idCard || "",
        }));
      }
      const enabled = kycRes?.ekycEnabled !== false;
      const statusValue = kycRes?.kyc?.status || null;
      setEkycEnabled(enabled);
      setKycStatus(statusValue);
      if (statusValue === "VERIFIED" || statusValue === "PENDING") setEkycDone(true);
      if (kycRes?.kyc?.fullName) {
        setFormData((prev) => ({
          ...prev,
          fullName: kycRes.kyc.fullName || prev.fullName,
          displayName: prev.displayName || kycRes.kyc.fullName || "",
        }));
      }
    }).finally(() => setModeReady(true));
  }, [session, status, router]);

  const scanBack = async (file: File) => {
    try {
      const parsed = await decodeCccdQrFromImage(file);
      if (!parsed?.idCardNumber) {
        setQrNote("Không đọc được QR. Chụp rõ mã ở mặt sau hoặc điền tay.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        fullName: parsed.fullName || prev.fullName,
        idCardNumber: parsed.idCardNumber || prev.idCardNumber,
        idCardType: "CCCD",
        dateOfBirth: (parsed.dateOfBirth || prev.dateOfBirth || "").slice(0, 10),
        idCardIssueDate: (parsed.idCardIssueDate || prev.idCardIssueDate || "").slice(0, 10),
        permanentAddress: parsed.permanentAddress || prev.permanentAddress,
        currentAddress: parsed.permanentAddress || prev.currentAddress,
      }));
      setQrNote(`Đã đọc QR: ${parsed.idCardNumber}${parsed.fullName ? ` · ${parsed.fullName}` : ""}`);
      toast.success("Đã quét QR và điền thông tin CCCD");
    } catch {
      setQrNote("Không đọc được QR. Hãy điền tay.");
    }
  };

  const submitUpgrade = async (payload: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/upgrade-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "individual", ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi nâng cấp");
      toast.success("Đã gửi yêu cầu nâng cấp Creator. Chờ admin duyệt.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      [formData.fullName, "Họ tên"], [formData.dateOfBirth, "Ngày sinh"], [formData.idCardNumber, "Số CCCD"],
      [formData.idCardFrontImage, "Ảnh CCCD trước"], [formData.idCardBackImage, "Ảnh CCCD sau"],
      [formData.permanentAddress, "Địa chỉ thường trú"], [formData.currentAddress, "Địa chỉ hiện tại"],
      [formData.phone, "Số điện thoại"], [formData.email, "Email"],
    ].filter(([v]) => !v).map(([, n]) => n);
    if (missing.length) { toast.error(`Vui lòng điền: ${missing.join(", ")}`); return; }
    await submitUpgrade(formData);
  };

  const handleExtrasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName && !formData.fullName) {
      toast.error("Nhập tên hiển thị Creator");
      return;
    }
    await submitUpgrade({
      fullName: formData.fullName,
      displayName: formData.displayName,
      phone: formData.phone,
      email: formData.email,
      currentAddress: formData.currentAddress,
      bankAccount: formData.bankAccount,
      bankName: formData.bankName,
      bio: formData.bio,
      website: formData.website,
    });
  };

  if (status === "loading" || !modeReady) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
  }

  const showWizard = ekycEnabled && !ekycDone && kycStatus !== "VERIFIED" && kycStatus !== "PENDING";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black">Nâng cấp Creator — cá nhân</h1>
          <p className="mt-2 text-gray-600">
            {ekycEnabled
              ? showWizard
                ? "Hoàn tất định danh điện tử để gửi yêu cầu nâng cấp."
                : "Đã định danh. Bổ sung thông tin Creator rồi gửi yêu cầu."
              : "Nộp ảnh CCCD hai mặt. Admin sẽ duyệt hồ sơ nâng cấp."}
          </p>
        </div>

        {showWizard ? (
          <EkycWizard
            onComplete={({ status: next }) => {
              if (next === "REJECTED") {
                setKycStatus("REJECTED");
                return;
              }
              setKycStatus(next);
              setEkycDone(true);
            }}
          />
        ) : ekycEnabled ? (
          <form onSubmit={handleExtrasSubmit} className="space-y-6">
            <section className="rounded-3xl border bg-white p-8 space-y-4">
              <h2 className="flex items-center gap-2 text-2xl font-black"><User className="text-emerald-700" /> Thông tin Creator</h2>
              <p className="text-sm text-emerald-800">
                {kycStatus === "VERIFIED" ? "Hồ sơ eKYC đã xác nhận." : "Hồ sơ eKYC đã gửi, admin hậu kiểm song song với nâng cấp."}
              </p>
              <Input placeholder="Tên hiển thị Creator" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} />
              <Input placeholder="Điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input placeholder="Địa chỉ hiện tại" value={formData.currentAddress} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input placeholder="STK nhận chi hộ khi chiến dịch kết thúc" value={formData.bankAccount} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} />
                <Input placeholder="Ngân hàng nhận chi hộ" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
              </div>
            </section>
            <Button type="submit" disabled={loading} className="h-14 w-full bg-emerald-700 text-lg font-bold hover:bg-emerald-800">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Gửi yêu cầu nâng cấp
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <section className="rounded-3xl border bg-white p-8 space-y-4">
              <h2 className="flex items-center gap-2 text-2xl font-black"><User className="text-emerald-700" /> Thông tin pháp lý</h2>
              {qrNote && <p className="text-sm text-emerald-800">{qrNote}</p>}
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
                <ImageUpload label="Ảnh CCCD mặt trước *" value={formData.idCardFrontImage} onChange={(url) => setFormData({ ...formData, idCardFrontImage: url })} capture />
                <ImageUpload label="Ảnh CCCD mặt sau * (có QR)" value={formData.idCardBackImage} onChange={(url) => setFormData({ ...formData, idCardBackImage: url })} onFile={scanBack} capture />
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
        )}
      </div>
    </div>
  );
}
