"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Camera, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";

type OcrFields = {
  fullName: string; idCardNumber: string; idCardType: "CCCD" | "CMND" | "PASSPORT";
  dateOfBirth: string; idCardIssueDate: string; idCardIssuePlace: string; placeOfBirth: string; permanentAddress: string;
};
const empty: OcrFields = { fullName: "", idCardNumber: "", idCardType: "CCCD", dateOfBirth: "", idCardIssueDate: "", idCardIssuePlace: "", placeOfBirth: "", permanentAddress: "" };

export function EkycWizard({ nextHref = "/dashboard" }: { nextHref?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const [selfieImageUrl, setSelfieImageUrl] = useState("");
  const [camReady, setCamReady] = useState(false);
  const [fields, setFields] = useState<OcrFields>(empty);
  const [scores, setScores] = useState<{ liveness?: number; face?: number; verdict?: string }>({});

  useEffect(() => {
    fetch("/api/kyc/status").then((r) => r.json()).then(setStatus).catch(() => null);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCamReady(true);
    } catch { toast.error("Khong mo duoc camera. Hay tai anh selfie."); }
  };

  const captureSelfie = async () => {
    const video = videoRef.current; if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return;
    const form = new FormData(); form.append("file", new File([blob], "selfie.jpg", { type: "image/jpeg" }));
    setBusy(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload selfie that bai");
      setSelfieImageUrl(data.secure_url || data.url);
      toast.success("Da chup anh chan dung");
      streamRef.current?.getTracks().forEach((t) => t.stop()); setCamReady(false);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const startSession = async () => {
    if (!consent) { toast.error("Can dong y dieu khoan du lieu ca nhan."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/kyc/ekyc/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consent: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Khong tao duoc phien");
      setSessionId(data.sessionId); setStep(1);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const analyze = async () => {
    if (!frontImageUrl || !backImageUrl || !selfieImageUrl) { toast.error("Can du 3 anh."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/kyc/ekyc/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, frontImageUrl, backImageUrl, selfieImageUrl, hint: fields }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Phan tich that bai");
      setFields((prev) => ({
        ...prev,
        fullName: data.ocr?.fullName || prev.fullName,
        idCardNumber: data.ocr?.idCardNumber || prev.idCardNumber,
        idCardType: data.ocr?.idCardType || prev.idCardType,
        dateOfBirth: String(data.ocr?.dateOfBirth || prev.dateOfBirth || "").slice(0, 10),
        idCardIssueDate: String(data.ocr?.idCardIssueDate || prev.idCardIssueDate || "").slice(0, 10),
        idCardIssuePlace: data.ocr?.idCardIssuePlace || prev.idCardIssuePlace,
        placeOfBirth: data.ocr?.placeOfBirth || prev.placeOfBirth,
        permanentAddress: data.ocr?.permanentAddress || prev.permanentAddress,
      }));
      setScores({ liveness: data.livenessScore, face: data.faceMatchScore, verdict: data.verdict });
      setStep(4);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/kyc/ekyc/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, fields, frontImageUrl, backImageUrl, selfieImageUrl, currentAddress: fields.permanentAddress }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xac nhan that bai");
      if (data.status === "VERIFIED") toast.success("Dinh danh thanh cong.");
      else if (data.status === "REJECTED") toast.error("eKYC chua dat.");
      else toast.message("Ho so da gui, cho admin hau kiem.");
      router.push(nextHref); router.refresh();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const kyc = status?.kyc;
  return (
    <div className="space-y-6">
      {kyc?.status === "VERIFIED" && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 flex items-center gap-3 text-emerald-800"><CheckCircle /><div><div className="font-bold">Da dinh danh</div><div className="text-sm">{kyc.fullName}</div></div></div>}
      {step === 0 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-black"><ShieldCheck className="text-emerald-700" /> Dong y xu ly du lieu</h2>
          <p className="mb-4 text-gray-600">Anh CCCD va chan dung chi dung de dinh danh, tang han muc va xet Creator. Bao ve theo ND 13/2023/ND-CP.</p>
          <label className="mb-6 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Toi dong y cho phep xu ly giay to tuy than va anh khuon mat.</label>
          <Button onClick={startSession} disabled={busy} className="h-12 bg-emerald-700 hover:bg-emerald-800">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Bat dau eKYC <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </section>
      )}
      {step === 1 && <section className="rounded-3xl border bg-white p-8 shadow-sm"><h2 className="mb-4 text-2xl font-black">CCCD mat truoc</h2><ImageUpload value={frontImageUrl} onChange={setFrontImageUrl} /><div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(0)}>Lai</Button><Button disabled={!frontImageUrl} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setStep(2)}>Tiep</Button></div></section>}
      {step === 2 && <section className="rounded-3xl border bg-white p-8 shadow-sm"><h2 className="mb-4 text-2xl font-black">CCCD mat sau</h2><ImageUpload value={backImageUrl} onChange={setBackImageUrl} /><div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(1)}>Lai</Button><Button disabled={!backImageUrl} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setStep(3)}>Tiep</Button></div></section>}
      {step === 3 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-black"><Camera className="text-emerald-700" /> Liveness</h2>
          <p className="mb-4 text-sm text-gray-600">Nhin thang camera, du sang, khong khau trang.</p>
          <video ref={videoRef} className="mb-3 aspect-video w-full rounded-2xl bg-black object-cover" playsInline muted />
          <div className="flex flex-wrap gap-3 mb-4">
            <Button variant="outline" onClick={startCamera}>Mo camera</Button>
            <Button disabled={!camReady || busy} className="bg-emerald-700 hover:bg-emerald-800" onClick={captureSelfie}>Chup</Button>
          </div>
          <ImageUpload value={selfieImageUrl} onChange={setSelfieImageUrl} />
          <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(2)}>Lai</Button><Button disabled={!selfieImageUrl || busy} className="bg-emerald-700 hover:bg-emerald-800" onClick={analyze}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Phan tich</Button></div>
        </section>
      )}
      {step === 4 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-black">Doi chieu OCR</h2>
          <p className="mb-4 text-sm text-gray-600">Sua tay se chuyen ho so sang admin. Sandbox: so 000000 = FAIL, 111111 = REVIEW.</p>
          {scores.verdict && <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm">May: <b>{scores.verdict}</b> · Liveness {scores.liveness} · Face {scores.face}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Ho ten" value={fields.fullName} onChange={(e) => setFields({ ...fields, fullName: e.target.value })} />
            <Input placeholder="So giay to" value={fields.idCardNumber} onChange={(e) => setFields({ ...fields, idCardNumber: e.target.value })} />
            <Input type="date" value={fields.dateOfBirth} onChange={(e) => setFields({ ...fields, dateOfBirth: e.target.value })} />
            <Input placeholder="Dia chi" value={fields.permanentAddress} onChange={(e) => setFields({ ...fields, permanentAddress: e.target.value })} />
          </div>
          <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(3)}>Chup lai</Button><Button disabled={busy || !fields.fullName || !fields.idCardNumber} className="bg-emerald-700 hover:bg-emerald-800" onClick={confirm}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xac nhan</Button></div>
        </section>
      )}
    </div>
  );
}
