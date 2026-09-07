"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { decodeCccdQrFromImage } from "@/lib/ekyc/decode-cccd-qr-browser";

export function ManualKycForm({ nextHref = "/dashboard" }: { nextHref?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrNote, setQrNote] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    idCardNumber: "",
    idCardType: "CCCD" as "CCCD" | "CMND" | "PASSPORT",
    idCardFrontImage: "",
    idCardBackImage: "",
    idCardIssueDate: "",
    idCardIssuePlace: "",
    dateOfBirth: "",
    placeOfBirth: "",
    permanentAddress: "",
    currentAddress: "",
    occupation: "",
    monthlyIncome: "",
  });

  const scanBack = async (file: File) => {
    try {
      const parsed = await decodeCccdQrFromImage(file);
      if (!parsed?.idCardNumber) {
        setQrNote("Không đọc được QR. Điền tay.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        fullName: parsed.fullName || prev.fullName,
        idCardNumber: parsed.idCardNumber || prev.idCardNumber,
        idCardType: "CCCD",
        dateOfBirth: (parsed.dateOfBirth || prev.dateOfBirth || "").slice(0, 10),
        idCardIssueDate: (parsed.idCardIssueDate || prev.idCardIssueDate || "").slice(0, 10),
        permanentAddress: parsed.permanentAddress || prev.permanentAddress,
        currentAddress: parsed.permanentAddress || prev.currentAddress,
      }));
      setQrNote(`Đã đọc QR: ${parsed.idCardNumber}`);
    } catch {
      setQrNote("Không đọc được QR.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gửi KYC thất bại");
      toast.success(data.message || "Đã gửi hồ sơ. Chờ admin duyệt.");
      router.push(nextHref);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-8">
      <p className="text-sm text-amber-800">eKYC đang tắt. Nộp ảnh CCCD — admin duyệt thủ công.</p>
      {qrNote && <p className="text-sm text-emerald-800">{qrNote}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
        <select className="h-11 rounded-xl border-2 px-3" value={form.idCardType} onChange={(e) => setForm({ ...form, idCardType: e.target.value as typeof form.idCardType })}>
          <option value="CCCD">CCCD</option>
          <option value="CMND">CMND</option>
          <option value="PASSPORT">Hộ chiếu</option>
        </select>
        <Input placeholder="Số CCCD" value={form.idCardNumber} onChange={(e) => setForm({ ...form, idCardNumber: e.target.value })} required />
        <Input type="date" value={form.idCardIssueDate} onChange={(e) => setForm({ ...form, idCardIssueDate: e.target.value })} />
        <Input placeholder="Nơi cấp" value={form.idCardIssuePlace} onChange={(e) => setForm({ ...form, idCardIssuePlace: e.target.value })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ImageUpload label="CCCD mặt trước *" value={form.idCardFrontImage} onChange={(url) => setForm({ ...form, idCardFrontImage: url })} capture />
        <ImageUpload label="CCCD mặt sau *" value={form.idCardBackImage} onChange={(url) => setForm({ ...form, idCardBackImage: url })} onFile={scanBack} capture />
      </div>
      <Input placeholder="Địa chỉ thường trú" value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
      <Input placeholder="Địa chỉ hiện tại" value={form.currentAddress} onChange={(e) => setForm({ ...form, currentAddress: e.target.value })} />
      <Button type="submit" disabled={loading} className="h-12 w-full bg-emerald-700 font-bold hover:bg-emerald-800">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Gửi hồ sơ KYC thủ công
      </Button>
    </form>
  );
}
