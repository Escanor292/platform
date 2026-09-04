"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Camera, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { decodeCccdQrFromImage } from "@/lib/ekyc/decode-cccd-qr-browser";
import type { CccdQrParse } from "@/lib/ekyc/cccd-qr";

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
  const [chipDg1, setChipDg1] = useState("");
  const [vneidCode, setVneidCode] = useState("");
  const [p2msg, setP2msg] = useState("");
  const [qrNote, setQrNote] = useState("");

  useEffect(() => {
    fetch("/api/kyc/status").then((r) => r.json()).then(setStatus).catch(() => null);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const applyQr = (parsed: CccdQrParse | null, where: string) => {
    if (!parsed?.idCardNumber) {
      if (where === "sau") setQrNote("Không đọc được QR. Hãy chụp rõ góc mã QR mặt sau hoặc điền tay.");
      return;
    }
    setFields((prev) => ({
      ...prev,
      fullName: parsed.fullName || prev.fullName,
      idCardNumber: parsed.idCardNumber || prev.idCardNumber,
      idCardType: "CCCD",
      dateOfBirth: (parsed.dateOfBirth || prev.dateOfBirth || "").slice(0, 10),
      idCardIssueDate: (parsed.idCardIssueDate || prev.idCardIssueDate || "").slice(0, 10),
      placeOfBirth: parsed.placeOfBirth || prev.placeOfBirth,
      permanentAddress: parsed.permanentAddress || prev.permanentAddress,
    }));
    setQrNote(`Đã đọc QR CCCD: ${parsed.idCardNumber}${parsed.fullName ? ` · ${parsed.fullName}` : ""}`);
    toast.success("Đã quét QR và điền thông tin CCCD");
  };

  const scanQr = async (file: File, where: "truoc" | "sau") => {
    try {
      const parsed = await decodeCccdQrFromImage(file);
      applyQr(parsed, where);
    } catch (error) {
      console.warn("[CCCD QR]", error);
      if (where === "sau") setQrNote("Không đọc được QR. Hãy chụp rõ góc mã QR mặt sau hoặc điền tay.");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCamReady(true);
    } catch { toast.error("Không mở được camera. Hãy tải ảnh selfie."); }
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
      if (!res.ok) throw new Error(data.error || "Upload selfie thất bại");
      setSelfieImageUrl(data.secure_url || data.url);
      toast.success("Đã chụp ảnh chân dung");
      streamRef.current?.getTracks().forEach((t) => t.stop()); setCamReady(false);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const startSession = async () => {
    if (!consent) { toast.error("Cần đồng ý điều khoản dữ liệu cá nhân."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/kyc/ekyc/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consent: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tạo được phiên");
      setSessionId(data.sessionId); setStep(1);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const analyze = async () => {
    if (!frontImageUrl || !backImageUrl || !selfieImageUrl) { toast.error("Cần đủ 3 ảnh."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/kyc/ekyc/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, frontImageUrl, backImageUrl, selfieImageUrl, hint: fields }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Phân tích thất bại");
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

  const runP2 = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/kyc/ekyc/nfc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          idCardNumber: fields.idCardNumber,
          fullName: fields.fullName,
          dateOfBirth: fields.dateOfBirth,
          chipDg1: chipDg1 || null,
          vneidCode: vneidCode || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "P2 thất bại");
      setP2msg(`${data.status}: ${data.message}`);
      toast.message(data.message);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/kyc/ekyc/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId, fields, frontImageUrl, backImageUrl, selfieImageUrl,
          currentAddress: fields.permanentAddress, chipDg1, vneidCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xác nhận thất bại");
      if (data.status === "VERIFIED") toast.success("Định danh thành công.");
      else if (data.status === "REJECTED") toast.error("eKYC chưa đạt.");
      else toast.message("Hồ sơ đã gửi, chờ admin hậu kiểm.");
      router.push(nextHref); router.refresh();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const kyc = status?.kyc;
  return (
    <div className="space-y-6">
      {kyc?.status === "VERIFIED" && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 flex items-center gap-3 text-emerald-800"><CheckCircle /><div><div className="font-bold">Đã định danh</div><div className="text-sm">{kyc.fullName}</div></div></div>}
      {qrNote && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{qrNote}</div>}
      {step === 0 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-black"><ShieldCheck className="text-emerald-700" /> Đồng ý xử lý dữ liệu</h2>
          <p className="mb-4 text-gray-600">Ảnh CCCD và chân dung chỉ dùng để định danh theo NĐ 13/2023/NĐ-CP. Mã QR mặt sau dùng để tự điền form, không gọi CSDL Bộ Công an.</p>
          <label className="mb-6 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Tôi đồng ý cho phép xử lý giấy tờ tùy thân và ảnh khuôn mặt.</label>
          <Button onClick={startSession} disabled={busy} className="h-12 bg-emerald-700 hover:bg-emerald-800">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Bắt đầu eKYC <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </section>
      )}
      {step === 1 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-black">CCCD mặt trước</h2>
          <p className="mb-4 text-sm text-gray-500">Chụp rõ 4 góc. QR nằm ở mặt sau nên bước này chủ yếu lưu ảnh.</p>
          <ImageUpload value={frontImageUrl} onChange={setFrontImageUrl} onFile={(file) => scanQr(file, "truoc")} capture />
          <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(0)}>Lại</Button><Button disabled={!frontImageUrl} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setStep(2)}>Tiếp</Button></div>
        </section>
      )}
      {step === 2 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-black">CCCD mặt sau — quét QR</h2>
          <p className="mb-4 text-sm text-gray-500">Chụp rõ mã QR ở góc thẻ. Hệ thống đọc QR rồi tự điền số CCCD, họ tên, ngày sinh, địa chỉ.</p>
          <ImageUpload value={backImageUrl} onChange={setBackImageUrl} onFile={(file) => scanQr(file, "sau")} capture label="Ảnh mặt sau (có QR)" />
          <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(1)}>Lại</Button><Button disabled={!backImageUrl} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setStep(3)}>Tiếp</Button></div>
        </section>
      )}
      {step === 3 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-black"><Camera className="text-emerald-700" /> Liveness</h2>
          <video ref={videoRef} className="mb-3 aspect-video w-full rounded-2xl bg-black object-cover" playsInline muted />
          <div className="mb-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={startCamera}>Mở camera</Button>
            <Button disabled={!camReady || busy} className="bg-emerald-700 hover:bg-emerald-800" onClick={captureSelfie}>Chụp</Button>
          </div>
          <ImageUpload value={selfieImageUrl} onChange={setSelfieImageUrl} capture="user" />
          <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(2)}>Lại</Button><Button disabled={!selfieImageUrl || busy} className="bg-emerald-700 hover:bg-emerald-800" onClick={analyze}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Phân tích P1</Button></div>
        </section>
      )}
      {step === 4 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-black">Đối chiếu thông tin</h2>
          {scores.verdict && <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm">Máy: <b>{scores.verdict}</b> · Liveness {scores.liveness} · Face {scores.face}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Họ tên" value={fields.fullName} onChange={(e) => setFields({ ...fields, fullName: e.target.value })} />
            <Input placeholder="Số giấy tờ" value={fields.idCardNumber} onChange={(e) => setFields({ ...fields, idCardNumber: e.target.value })} />
            <Input type="date" value={fields.dateOfBirth} onChange={(e) => setFields({ ...fields, dateOfBirth: e.target.value })} />
            <Input type="date" value={fields.idCardIssueDate} onChange={(e) => setFields({ ...fields, idCardIssueDate: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Địa chỉ thường trú" value={fields.permanentAddress} onChange={(e) => setFields({ ...fields, permanentAddress: e.target.value })} />
          </div>
          <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(3)}>Chụp lại</Button><Button disabled={!fields.fullName || !fields.idCardNumber} className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setStep(5)}>Tiếp P2 NFC</Button></div>
        </section>
      )}
      {step === 5 && (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-black">P2 — NFC / VNeID (tuỳ chọn)</h2>
          <p className="mb-4 text-sm text-gray-600">Web không đọc được chip ICAO. QR vừa quét chỉ điền form, chưa phải đối chiếu CSDL nhà nước.</p>
          <div className="grid gap-4">
            <Input placeholder="Chip DG1 / mã NFC sandbox" value={chipDg1} onChange={(e) => setChipDg1(e.target.value)} />
            <Input placeholder="Mã VNeID (nếu có)" value={vneidCode} onChange={(e) => setVneidCode(e.target.value)} />
          </div>
          {p2msg && <p className="mt-3 text-sm text-emerald-800">{p2msg}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep(4)}>Lại</Button>
            <Button variant="outline" onClick={runP2} disabled={busy}>Đối soát P2</Button>
            <Button disabled={busy} className="bg-emerald-700 hover:bg-emerald-800" onClick={confirm}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xác nhận hồ sơ</Button>
          </div>
        </section>
      )}
    </div>
  );
}
