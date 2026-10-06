import Link from "next/link";

const KIND_LABEL: Record<string, string> = {
  DEGREE: "Bằng cấp",
  CERTIFICATE: "Chứng chỉ",
  BUSINESS_LICENSE: "Giấy phép kinh doanh",
  TAX_REGISTRATION: "Đăng ký thuế",
};

const SUBJECT_LABEL: Record<string, string> = {
  INDIVIDUAL: "Cá nhân",
  ORGANIZATION: "Doanh nghiệp",
};

export type PublicCredential = {
  id: string;
  subjectType: string;
  kind: string;
  title: string;
  issuer: string;
  issuedAt: Date | string | null;
  credentialCode: string | null;
  fileUrl: string;
};

export default function CredentialsSection({
  items,
  isOwnProfile,
}: {
  items: PublicCredential[];
  isOwnProfile: boolean;
}) {
  if (!items.length && !isOwnProfile) return null;
  return (
    <section className="rounded-[2rem] border border-dblue/10 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pgreen">Đã đối chiếu</p>
          <h2 className="font-display text-3xl font-black text-dblue">Bằng cấp và chứng chỉ</h2>
          <p className="mt-2 text-sm text-gray-600">Chỉ hiện hồ sơ admin đã đối chiếu. Ảnh mới tải lên chưa phải là đã xác minh.</p>
        </div>
        {isOwnProfile && (
          <Link href="/dashboard/bang-cap" className="rounded-2xl bg-gradient-to-r from-pgreen to-fgreen px-4 py-2 text-sm font-bold text-white">
            Thêm hồ sơ
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có mục nào được duyệt.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl bg-cream p-5">
              <p className="text-xs font-black uppercase tracking-wider text-pgreen">
                {SUBJECT_LABEL[item.subjectType] || item.subjectType} · {KIND_LABEL[item.kind] || item.kind}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-dblue">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.issuer}</p>
              <p className="mt-2 text-xs text-gray-500">
                {item.issuedAt ? new Date(item.issuedAt).toLocaleDateString("vi-VN") : "Không ghi ngày cấp"}
                {item.credentialCode ? ` · ${item.credentialCode}` : ""}
              </p>
              <a href={item.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-bold text-pgreen">
                Xem bản đối chiếu
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
