"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND } from "@/lib/utils";

type Tier = { id: string; title: string; description: string | null; amount: number };
type Member = { id: string; name: string; tierTitle: string };
type Transfer = {
  amount: number;
  transferContent: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  transactionId: string;
  confirmationUrl: string;
  reused?: boolean;
};

export default function SupportTiersPanel({
  creatorId,
  creatorName,
  tiers,
  members,
  memberCount,
  isLoggedIn,
  isOwnProfile,
}: {
  creatorId: string;
  creatorName: string;
  tiers: Tier[];
  members: Member[];
  memberCount: number;
  isLoggedIn: boolean;
  isOwnProfile: boolean;
}) {
  const [anonymous, setAnonymous] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<Transfer | null>(null);

  async function join(tierId: string) {
    setError(null);
    setPendingId(tierId);
    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, isAnonymous: anonymous }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không tạo được kỳ ủng hộ");
      setTransfer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được kỳ ủng hộ");
    } finally {
      setPendingId(null);
    }
  }

  if (!tiers.length && !isOwnProfile) return null;

  return (
    <section className="rounded-[2rem] border border-pgreen/15 bg-cream p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pgreen">Hội viên</p>
          <h2 className="font-display text-3xl font-black text-dblue">Ủng hộ dài lâu</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Mỗi kỳ là một tháng, chuyển khoản vào tài khoản trung gian. Hết hạn sẽ nhắc gia hạn. Không tự trừ tiền.
          </p>
        </div>
        <div className="text-sm font-bold text-dblue">{memberCount} hội viên đang hoạt động</div>
      </div>

      {isOwnProfile && (
        <Link href="/dashboard/creator/hoi-vien" className="mb-5 inline-flex rounded-2xl bg-dblue px-4 py-2 text-sm font-bold text-white">
          Quản lý mức ủng hộ
        </Link>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((tier) => (
          <article key={tier.id} className="rounded-3xl border border-white bg-white p-5 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-dblue">{tier.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{tier.description || "Đồng hành mỗi tháng với người sáng tạo."}</p>
            <p className="mt-4 font-display text-3xl font-black text-pgreen">{formatVND(tier.amount)}<span className="text-base font-bold text-gray-400"> / tháng</span></p>
            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => join(tier.id)}
                disabled={pendingId === tier.id}
                className="mt-4 inline-flex h-11 items-center rounded-2xl bg-gradient-to-r from-pgreen to-fgreen px-5 text-sm font-bold text-white disabled:opacity-60"
              >
                {pendingId === tier.id ? "Đang tạo kỳ..." : "Ủng hộ mức này"}
              </button>
            )}
          </article>
        ))}
      </div>

      {!isOwnProfile && isLoggedIn && tiers.length > 0 && (
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
          Hiện tên là ẩn danh trong danh sách hội viên
        </label>
      )}
      {!isOwnProfile && !isLoggedIn && tiers.length > 0 && (
        <Link href={`/auth/login?callbackUrl=/profile/${creatorId}`} className="mt-4 inline-flex text-sm font-bold text-pgreen">
          Đăng nhập để ủng hộ {creatorName}
        </Link>
      )}
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      {transfer && (
        <div className="mt-5 rounded-3xl border border-pgreen/20 bg-white p-5">
          <h3 className="font-display text-xl font-bold text-dblue">{transfer.reused ? "Kỳ chuyển khoản đang chờ" : "Chuyển khoản kỳ này"}</h3>
          <p className="mt-2 text-sm text-gray-600">Chuyển đúng số tiền và nội dung. Admin đối soát xong, kỳ hội viên mới bắt đầu. Không hoàn kỳ đang chạy nếu bạn dừng ở kỳ sau.</p>
          <dl className="mt-4 grid gap-2 text-sm text-dblue">
            <div className="flex justify-between gap-3"><dt>Ngân hàng</dt><dd className="font-bold">{transfer.bankName}</dd></div>
            <div className="flex justify-between gap-3"><dt>Số tài khoản</dt><dd className="font-bold">{transfer.accountNumber}</dd></div>
            <div className="flex justify-between gap-3"><dt>Chủ tài khoản</dt><dd className="font-bold">{transfer.accountHolder}</dd></div>
            <div className="flex justify-between gap-3"><dt>Số tiền</dt><dd className="font-bold">{formatVND(transfer.amount)}</dd></div>
            <div className="flex justify-between gap-3"><dt>Nội dung</dt><dd className="font-bold">{transfer.transferContent}</dd></div>
          </dl>
          <Link href={transfer.confirmationUrl} className="mt-4 inline-flex text-sm font-bold text-pgreen">Xem trang xác nhận</Link>
        </div>
      )}

      {members.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {members.map((member) => (
            <li key={member.id} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-dblue">
              {member.name} · {member.tierTitle}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
