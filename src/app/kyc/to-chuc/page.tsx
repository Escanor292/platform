"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { decodeCccdQrFromImage } from "@/lib/ekyc/decode-cccd-qr-browser";

export default function OrganizationUpgradePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false);
  const [qrNote, setQrNote] = useState("");
  const [form, setForm] = useState({
    taxCode: "", companyName: "", companyAddress: "", representative: "",
    businessLicense: "", authorizationUrl: "", fullName: "", idCardNumber: "",
    idCardType: "CCCD", idCardFrontImage: "", idCardBackImage: "", dateOfBirth: "",
    permanentAddress: "", currentAddress: "", phone: "", bankAccount: "", bankName: "",
    displayName: "", bio: "",
  });

  const scanBack = async (file: File) => {
    try {
      const parsed = await decodeCccdQrFromImage(file);
      if (!parsed?.idCardNumber) {
        setQrNote("Không đọc được QR mặt sau. Hãy chụp rõ mã hoặc điền tay.");
        return;
      }
      setForm((p) => ({
        ...p,
        fullName: parsed.fullName || p.fullName,
        idCardNumber: parsed.idCardNumber || p.idCardNumber,
        idCardType: "CCCD",
        dateOfBirth: (parsed.dateOfBirth || p.dateOfBirth || "").slice(0, 10),
        permanentAddress: parsed.permanentAddress || p.permanentAddress,
        currentAddress: parsed.permanentAddress || p.currentAddress,
      }));
      setQrNote(`Đã đọc QR CCCD người đại diện: ${parsed.idCardNumber}`);
      toast.success("Đã quét QR và điền CCCD người đại diện");
    } catch {
      setQrNote("Không đọc được QR mặt sau. Hãy điền tay.");
    }
  };

  const lookup = async () => {
    setLooking(true);
    try {
      const res = await fetch(`/api/kyc/ekyb/lookup?taxCode=${encodeURIComponent(form.taxCode)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tra cứu được");
      const b = data.business;
      setForm((p) => ({
        ...p,
        companyName: b.name || p.companyName,
        companyAddress: b.address || p.companyAddress,
        representative: b.representative || p.representative,
        displayName: b.name || p.displayName,
      }));
      toast.success(b.source === "vietqr" ? "Đã điền từ cổng tra cứu" : "MST hợp lệ, hãy điền tay phần còn thiếu");
    } catch (e: any) { toast.error(e.message); } finally { setLooking(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.taxCode || !form.companyName || !form.businessLicense) {
      toast.error("Cần MST, tên công ty và file ĐKKD");
      return;
    }
    if (!form.fullName || !form.idCardNumber || !form.idCardFrontImage || !form.idCardBackImage) {
      toast.error("Người đại diện phải có CCCD đủ 2 mặt");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/user/upgrade-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "organization", ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gửi thất bại");
      toast.success("Hồ sơ eKYB đã gửi. Admin duyệt lại.");
      router.push("/dashboard");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4 py-12">
      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-700 text-white"><Building2 /></div>
          <h1 className="text-3xl font-black">eKYB — tài khoản doanh nghiệp</h1>
          <p className="mt-2 text-gray-600">P2: MST + ĐKKD + eKYC người đại diện. Admin phê duyệt cuối.</p>
          <p className="mt-2 text-sm">Chưa eKYC cá nhân? <Link className="font-bold text-emerald-700 underline" href="/kyc?next=/kyc/to-chuc">Chạy /kyc</Link></p>
        </div>
        <section className="rounded-3xl border bg-white p-6 space-y-4">
          <h2 className="font-black">Pháp nhân</h2>
          <div className="flex gap-2">
            <Input placeholder="Mã số thuế" value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} />
            <Button type="button" variant="outline" onClick={lookup} disabled={looking}>{looking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tra cứu"}</Button>
          </div>
          <Input placeholder="Tên doanh nghiệp" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <Input placeholder="Địa chỉ đăng ký" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} />
          <Input placeholder="Người đại diện pháp luật" value={form.representative} onChange={(e) => setForm({ ...form, representative: e.target.value })} />
          <ImageUpload label="Giấy ĐKKD / GPKD" value={form.businessLicense} onChange={(url) => setForm({ ...form, businessLicense: url })} />
          <ImageUpload label="Giấy ủy quyền (nếu cần)" value={form.authorizationUrl} onChange={(url) => setForm({ ...form, authorizationUrl: url })} />
        </section>
        <section className="rounded-3xl border bg-white p-6 space-y-4">
          <h2 className="font-black">eKYC người đại diện</h2>
          {qrNote && <p className="text-sm text-emerald-800">{qrNote}</p>}
          <Input placeholder="Họ tên trên CCCD" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input placeholder="Số CCCD 12 số" value={form.idCardNumber} onChange={(e) => setForm({ ...form, idCardNumber: e.target.value })} />
          <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          <Input placeholder="Địa chỉ thường trú" value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUpload label="CCCD trước" value={form.idCardFrontImage} onChange={(url) => setForm({ ...form, idCardFrontImage: url })} capture />
            <ImageUpload label="CCCD sau (có QR)" value={form.idCardBackImage} onChange={(url) => setForm({ ...form, idCardBackImage: url })} onFile={scanBack} capture />
          </div>
        </section>
        <Button type="submit" disabled={busy} className="h-12 w-full bg-emerald-700 hover:bg-emerald-800">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Gửi hồ sơ eKYB
        </Button>
      </form>
    </div>
  );
}
