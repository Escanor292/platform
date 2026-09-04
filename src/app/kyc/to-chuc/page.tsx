"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";

export default function OrganizationUpgradePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false);
  const [form, setForm] = useState({
    taxCode: "", companyName: "", companyAddress: "", representative: "",
    businessLicense: "", authorizationUrl: "", fullName: "", idCardNumber: "",
    idCardType: "CCCD", idCardFrontImage: "", idCardBackImage: "", dateOfBirth: "",
    permanentAddress: "", currentAddress: "", phone: "", bankAccount: "", bankName: "",
    displayName: "", bio: "",
  });

  const lookup = async () => {
    setLooking(true);
    try {
      const res = await fetch(`/api/kyc/ekyb/lookup?taxCode=${encodeURIComponent(form.taxCode)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Khong tra cuu duoc");
      const b = data.business;
      setForm((p) => ({
        ...p,
        companyName: b.name || p.companyName,
        companyAddress: b.address || p.companyAddress,
        representative: b.representative || p.representative,
        displayName: b.name || p.displayName,
      }));
      toast.success(b.source === "vietqr" ? "Da dien tu cong tra cuu" : "MST hop le, hay dien tay phan con thieu");
    } catch (e: any) { toast.error(e.message); } finally { setLooking(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.taxCode || !form.companyName || !form.businessLicense) {
      toast.error("Can MST, ten cong ty va file DKKD");
      return;
    }
    if (!form.fullName || !form.idCardNumber || !form.idCardFrontImage || !form.idCardBackImage) {
      toast.error("Nguoi dai dien phai co CCCD du 2 mat");
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
      if (!res.ok) throw new Error(data.error || "Gui that bai");
      toast.success("Ho so eKYB da gui. Admin duyet lai.");
      router.push("/dashboard");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4 py-12">
      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-700 text-white"><Building2 /></div>
          <h1 className="text-3xl font-black">eKYB — tai khoan doanh nghiep</h1>
          <p className="mt-2 text-gray-600">P2: MST + DKKD + eKYC nguoi dai dien. Admin phe duyet cuoi.</p>
          <p className="mt-2 text-sm">Chua eKYC ca nhan? <Link className="font-bold text-emerald-700 underline" href="/kyc?next=/kyc/to-chuc">Chay /kyc</Link></p>
        </div>
        <section className="rounded-3xl border bg-white p-6 space-y-4">
          <h2 className="font-black">Phap nhan</h2>
          <div className="flex gap-2">
            <Input placeholder="Ma so thue" value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} />
            <Button type="button" variant="outline" onClick={lookup} disabled={looking}>{looking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tra cuu"}</Button>
          </div>
          <Input placeholder="Ten doanh nghiep" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <Input placeholder="Dia chi dang ky" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} />
          <Input placeholder="Nguoi dai dien phap luat" value={form.representative} onChange={(e) => setForm({ ...form, representative: e.target.value })} />
          <ImageUpload label="Giay DKKD / GPKD" value={form.businessLicense} onChange={(url) => setForm({ ...form, businessLicense: url })} />
          <ImageUpload label="Giay uy quyen (neu can)" value={form.authorizationUrl} onChange={(url) => setForm({ ...form, authorizationUrl: url })} />
        </section>
        <section className="rounded-3xl border bg-white p-6 space-y-4">
          <h2 className="font-black">eKYC nguoi dai dien</h2>
          <Input placeholder="Ho ten tren CCCD" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input placeholder="So CCCD 12 so" value={form.idCardNumber} onChange={(e) => setForm({ ...form, idCardNumber: e.target.value })} />
          <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          <Input placeholder="Dia chi thuong tru" value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUpload label="CCCD truoc" value={form.idCardFrontImage} onChange={(url) => setForm({ ...form, idCardFrontImage: url })} />
            <ImageUpload label="CCCD sau" value={form.idCardBackImage} onChange={(url) => setForm({ ...form, idCardBackImage: url })} />
          </div>
        </section>
        <Button type="submit" disabled={busy} className="h-12 w-full bg-emerald-700 hover:bg-emerald-800">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Gui ho so eKYB
        </Button>
      </form>
    </div>
  );
}
