"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Credential = {
  id: string;
  subjectType: string;
  kind: string;
  title: string;
  issuer: string;
  status: string;
  rejectedReason: string | null;
  fileUrl: string;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ đối chiếu",
  VERIFIED: "Đã đối chiếu",
  REJECTED: "Chưa duyệt",
};

export default function CredentialsPage() {
  const [rows, setRows] = useState<Credential[]>([]);
  const [subjectType, setSubjectType] = useState("INDIVIDUAL");
  const [kind, setKind] = useState("DEGREE");
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [credentialCode, setCredentialCode] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const response = await fetch("/api/credentials");
    const data = await response.json();
    if (response.ok) setRows(data.credentials || []);
    else setError(data.error || "Không tải được hồ sơ");
  }

  useEffect(() => { load(); }, []);

  async function onFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không tải được ảnh");
      const url = data.secure_url || data.url;
      if (!url) throw new Error("Upload chưa trả liên kết");
      setFileUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được ảnh");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectType, kind, title, issuer, issuedAt, credentialCode, fileUrl }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Không gửi được");
      return;
    }
    setTitle("");
    setIssuer("");
    setCredentialCode("");
    setFileUrl("");
    await load();
  }

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-28">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-bold text-pgreen">Về bảng điều khiển</Link>
        <h1 className="mt-3 font-display text-4xl font-black text-dblue md:text-5xl">Bằng cấp và chứng chỉ</h1>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-dblue">Đối tượng
              <select value={subjectType} onChange={(event) => setSubjectType(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4">
                <option value="INDIVIDUAL">Cá nhân</option>
                <option value="ORGANIZATION">Doanh nghiệp</option>
              </select>
            </label>
            <label className="text-sm font-bold text-dblue">Loại
              <select value={kind} onChange={(event) => setKind(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4">
                <option value="DEGREE">Bằng cấp</option>
                <option value="CERTIFICATE">Chứng chỉ</option>
                <option value="BUSINESS_LICENSE">Giấy phép kinh doanh</option>
                <option value="TAX_REGISTRATION">Đăng ký thuế</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold text-dblue">Tên
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4" placeholder="Cử nhân Công nghệ thông tin" />
          </label>
          <label className="block text-sm font-bold text-dblue">Đơn vị cấp
            <input value={issuer} onChange={(event) => setIssuer(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4" placeholder="Đại học Lạc Hồng" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-dblue">Ngày cấp
              <input type="date" value={issuedAt} onChange={(event) => setIssuedAt(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </label>
            <label className="text-sm font-bold text-dblue">Mã, nếu có
              <input value={credentialCode} onChange={(event) => setCredentialCode(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </label>
          </div>
          <label className="block text-sm font-bold text-dblue">Ảnh hoặc file
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} className="mt-1 block w-full text-sm" />
          </label>
          {fileUrl && <p className="text-xs text-pgreen">Đã có liên kết ảnh.</p>}
          <button disabled={uploading} className="h-12 rounded-2xl bg-gradient-to-r from-pgreen to-fgreen px-6 font-bold text-white disabled:opacity-60">
            {uploading ? "Đang tải ảnh..." : "Gửi đối chiếu"}
          </button>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </form>

        <div className="mt-6 space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-3xl bg-white p-5">
              <p className="text-xs font-black uppercase tracking-wider text-pgreen">{STATUS_LABEL[row.status] || row.status}</p>
              <h2 className="font-display text-2xl font-bold text-dblue">{row.title}</h2>
              <p className="text-sm text-gray-600">{row.issuer}</p>
              {row.rejectedReason && <p className="mt-2 text-sm text-red-600">{row.rejectedReason}</p>}
              <a href={row.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-bold text-pgreen">Xem file</a>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
