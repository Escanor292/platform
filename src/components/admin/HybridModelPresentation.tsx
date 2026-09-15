"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  FileBadge,
  Handshake,
  HeartHandshake,
  Package,
  Scale,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Users,
  X,
} from "lucide-react";

const SLIDE_COUNT = 12;

export default function HybridModelPresentation() {
  const [index, setIndex] = useState(0);

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(SLIDE_COUNT - 1, next)));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        go(index + 1);
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(index - 1);
      }
      if (event.key === "Home") go(0);
      if (event.key === "End") go(SLIDE_COUNT - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#F8F7F2] text-slate-900">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
        >
          <X size={14} /> Đóng
        </Link>
        <div className="min-w-0 text-center">
          <div className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            Tử Tế Fund · Thuyết trình nội bộ
          </div>
          <div className="truncate text-sm font-black text-slate-900">Mô hình lai Donation + Reward</div>
        </div>
        <div className="text-xs font-black tabular-nums text-gray-500">
          {index + 1}/{SLIDE_COUNT}
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-6xl items-center px-4 py-8 md:px-8">
          <Slide index={index} />
        </div>
      </main>

      <footer className="flex items-center justify-between gap-3 border-t border-black/5 bg-white/90 px-4 py-3 md:px-6">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Trước
        </button>
        <div className="flex flex-1 items-center justify-center gap-1.5 overflow-x-auto">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition ${
                i === index ? "w-8 bg-emerald-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          disabled={index === SLIDE_COUNT - 1}
          onClick={() => go(index + 1)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-30"
        >
          Tiếp <ArrowRight size={16} />
        </button>
      </footer>
    </div>
  );
}

function Slide({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <section className="w-full text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-700">
            <Sparkles size={14} /> Bảo vệ đồ án · Tử Tế Fund
          </div>
          <h1 className="font-display text-4xl font-black leading-tight text-[#1B365D] md:text-6xl">
            Nền tảng gây quỹ lai
            <span className="mt-2 block bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 bg-clip-text text-transparent">
              Cho đi và Nhận lại
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            Nơi người trẻ và người trưởng thành bắt đầu sự nghiệp, xây cộng đồng, thương hiệu cá nhân,
            và lưu trữ hành trình làm dự án một cách chuyên nghiệp.
          </p>
        </section>
      );
    case 1:
      return (
        <section className="w-full">
          <Eyebrow icon={Target} text="Tầm nhìn" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-5xl">
            Không thay Facebook, không đánh Shopee
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Hợp tác, mượn sức mạnh">
              Phân phối câu chuyện qua mạng xã hội và sàn lớn. Tử Tế Fund giữ thanh toán trung gian,
              nhật ký dự án, chứng từ và kho quà.
            </Card>
            <Card title="Nhiều dạng nội dung">
              Blog, video, bài viết, cập nhật chiến dịch. Ai mạnh kênh nào thì dùng kênh đó — nền tảng
              là nơi gom hành trình, không bắt mọi người đăng một kiểu.
            </Card>
            <Card title="Đối tượng">
              Người muốn mở nghề, nhượng quyền nhỏ, sáng tạo sản phẩm, gây quỹ nhân đạo, hoặc chỉ cần
              một hồ sơ dự án sạch để cộng đồng tin.
            </Card>
            <Card title="Giá trị cốt lõi">
              Minh bạch dòng tiền, rõ ràng hoàn/giữ, giấy chứng nhận khi cho đi, hàng hóa khi nhận lại.
            </Card>
          </div>
        </section>
      );
    case 2:
      return (
        <section className="w-full">
          <Eyebrow icon={Handshake} text="Mô hình lai" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-5xl">Hai nhánh trên một nền tảng</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-8">
              <HeartHandshake className="mb-4 text-rose-600" />
              <h3 className="text-2xl font-black">Từ thiện / Quyên góp</h3>
              <p className="mt-3 text-gray-600">
                Cho đi vì mục đích nhân đạo. Không nhận lại lợi ích tài chính hay vật chất lớn.
                Backer nhận giấy chứng nhận ủng hộ TT-UH.
              </p>
            </div>
            <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-8">
              <ShoppingBag className="mb-4 text-emerald-700" />
              <h3 className="text-2xl font-black">Nhận quà tri ân (Reward)</h3>
              <p className="mt-3 text-gray-600">
                Sản phẩm mẫu, hiện vật lưu niệm, hàng có sẵn hoặc pre-order. Về bản chất giao dịch,
                giống bán hàng trên Shopee / Lazada: có hàng, có giao, có hoàn khi không giao.
              </p>
            </div>
          </div>
        </section>
      );
    case 3:
      return (
        <section className="w-full">
          <Eyebrow icon={Package} text="Giữ tiền và hoàn tiền" />
          <h2 className="font-display mb-4 text-3xl font-black text-[#1B365D] md:text-4xl">
            All-or-Nothing và Keep-It-All
          </h2>
          <p className="mb-6 text-gray-600">
            Thời hạn chiến dịch gây quỹ thường khoảng 2 tháng. Hàng hóa có nút xác nhận giao kể cả khi
            chưa đạt goal.
          </p>
          <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3">Mô hình</th>
                  <th className="px-4 py-3">Donation (không quà)</th>
                  <th className="px-4 py-3">Reward / pre-order / có giao hàng</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-4 font-black">All-or-Nothing</td>
                  <td className="px-4 py-4 text-gray-600">
                    Hết hạn mà không đạt goal → hoàn toàn bộ.
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    Có nút xác nhận giao kể cả khi chưa đạt goal. Nếu creator trễ hơn 2 ngày không gửi
                    đơn vị vận chuyển → hủy và hoàn.
                  </td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="px-4 py-4 font-black">Keep-It-All</td>
                  <td className="px-4 py-4 text-gray-600">
                    Không đạt goal vẫn giữ tiền ủng hộ.
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    Vẫn hoàn khi không giao hàng cho đơn vị vận chuyển đúng hẹn.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      );
    case 4:
      return (
        <section className="w-full">
          <Eyebrow icon={Store} text="Luồng hàng Reward" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-4xl">
            Giữ tiền trung gian, giao đúng hẹn
          </h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {[
              { n: "01", t: "Đặt / ủng hộ", d: "Thanh toán vào tài khoản trung gian (PayOS / VietQR)." },
              { n: "02", t: "Giữ tiền", d: "Escrow. Chưa giải ngân khi chưa đủ điều kiện mô hình." },
              { n: "03", t: "Xác nhận gửi ĐVVC", d: "Hạn 2 ngày sau mốc giao. Trễ → hủy + hoàn." },
              { n: "04", t: "Giao / khiếu nại", d: "Backer theo dõi trong Kho đồ và trang giao dịch." },
            ].map((step) => (
              <li key={step.n} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="text-2xl font-black text-emerald-600">{step.n}</div>
                <div className="mt-2 font-black">{step.t}</div>
                <p className="mt-2 text-sm text-gray-600">{step.d}</p>
              </li>
            ))}
          </ol>
        </section>
      );
    case 5:
      return (
        <section className="w-full">
          <Eyebrow icon={FileBadge} text="Chứng từ & giao dịch" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-4xl">
            Donation có giấy, Reward có kho
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card title="Giấy TT-UH">
              Quyên góp không nhận quà: cấp chứng nhận ủng hộ sau khi đối soát tiền vào tài khoản
              trung gian. Xem tại /chung-tu/[mã].
            </Card>
            <Card title="Kho đồ /purchases">
              Quà số, giấy chứng nhận, đơn đang chờ. Một chỗ để backer thấy mình đã ủng hộ / đặt gì.
            </Card>
            <Card title="Tra cứu /lookup">
              Người dùng xem các giao dịch: trạng thái thanh toán, hoàn tiền, giải ngân.
            </Card>
          </div>
        </section>
      );
    case 6:
      return (
        <section className="w-full">
          <Eyebrow icon={Scale} text="Pháp lý" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-4xl">
            Nêu mô hình trước khi đăng ký công ty
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Reward</strong> được trình bày như bán hàng trên sàn TMĐT (Shopee, Lazada): có
              hàng, có giá, có giao, có hóa đơn/thuế theo tư cách người bán. Nền tảng là trung gian,
              không phải bên bán.
            </p>
            <p>
              <strong>Donation</strong> không phải góp vốn, không phải cổ phần. Người ủng hộ nhận giấy
              chứng nhận, không nhận lợi nhuận.
            </p>
            <p>
              Hướng đăng ký tương lai: công ty cung cấp dịch vụ TMĐT / sàn trung gian kết nối và giữ
              tiền — không sàn chứng khoán, không huy động vốn đại chúng, không sàn token.
            </p>
            <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              NĐ 93 chỉ áp khi làm từ thiện đúng phạm vi được cấp phép. Trang này mô tả mô hình sản
              phẩm, không phải tư vấn luật.
            </p>
          </div>
        </section>
      );
    case 7:
      return (
        <section className="w-full">
          <Eyebrow icon={Building2} text="Thị trường" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-4xl">
            Quốc tế đã có, Việt Nam còn khoảng trống
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Quốc tế">
              Kickstarter: All-or-Nothing + Reward. Indiegogo: AoN hoặc Keep-It-All. GoFundMe:
              donation, giữ tiền. BackerKit: giao hàng sau chiến dịch.
            </Card>
            <Card title="Việt Nam">
              Gây quỹ trên mạng xã hội, pre-order trên Shopee/Lazada, một số kênh từ thiện. Chưa có
              nền tảng lai đủ: donation có chứng từ + reward có escrow + hồ sơ dự án.
            </Card>
            <Card title="Điểm mạnh">
              Hai nhánh rõ pháp lý, thanh toán nội địa, kho đồ, blog/video trên cùng hồ sơ creator.
            </Card>
            <Card title="Điểm yếu">
              Thương hiệu mới, tin cậy phải xây bằng KYC và minh bạch. Không cạnh tranh logistic với
              sàn lớn — phải hợp tác.
            </Card>
          </div>
        </section>
      );
    case 8:
      return (
        <section className="w-full">
          <Eyebrow icon={Users} text="Khách hàng nhắm đến" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-4xl">Ai dùng, vì sao dùng</h2>
          <ul className="space-y-4 text-lg text-gray-700">
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={20} />
              Người trẻ / người lớn muốn bắt đầu một sự nghiệp nhỏ: quán, sản phẩm, khóa học, nhượng quyền.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={20} />
              Người cần cộng đồng và thương hiệu cá nhân, không chỉ một đơn hàng rời.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={20} />
              Người muốn lưu trữ quá trình làm dự án chuyên nghiệp: cập nhật, blog, video, chứng từ.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={20} />
              Backer muốn vừa ủng hộ thiện nguyện vừa đặt trước có kiểm soát hoàn tiền.
            </li>
          </ul>
        </section>
      );
    case 9:
      return (
        <section className="w-full">
          <Eyebrow icon={Store} text="Case" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-4xl">
            Khai trương quán gà rán nhượng quyền
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h3 className="font-black text-rose-700">Chạy truyền thống</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>Chỉ khách quanh khu vực, người đi ngang bỏ lỡ.</li>
                <li>Người bận ngày đó không quay lại vì không có “vé” đã mua.</li>
                <li>Phải chạy nhiều ngày → hao nguồn lực.</li>
                <li>Không biết đủ / dư / thiếu hàng ngày đầu.</li>
              </ul>
            </div>
            <div className="rounded-[2rem] bg-emerald-50 p-8">
              <h3 className="font-black text-emerald-800">Chạy trên Tử Tế Fund</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>Biết số người đặt trước → chuẩn bị đúng lượng.</li>
                <li>Người bận khai trương vẫn còn ưu đãi đã mua → ghé ngày khác.</li>
                <li>Tiếp cận khách xa hơn bán kính truyền miệng.</li>
                <li>Tối ưu chi phí, thời gian, công sức; giữ khách lâu dài.</li>
              </ul>
            </div>
          </div>
        </section>
      );
    case 10:
      return (
        <section className="w-full">
          <Eyebrow icon={Building2} text="Công ty tương lai" />
          <h2 className="font-display mb-6 text-3xl font-black text-[#1B365D] md:text-4xl">
            Đăng ký gì, không đăng ký gì
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Hướng đăng ký">
              Công ty TNHH cung cấp nền tảng TMĐT / dịch vụ trung gian thanh toán và kết nối creator —
              backer. Website công bố mô hình Donation vs Reward như trên.
            </Card>
            <Card title="Không pretends">
              Không quỹ từ thiện đã cấp phép nếu chưa có. Không sàn vốn. Không token. Reward kê khai
              như bán hàng; Donation kê như ủng hộ có chứng nhận.
            </Card>
          </div>
        </section>
      );
    default:
      return (
        <section className="w-full text-center">
          <h2 className="font-display text-4xl font-black text-[#1B365D] md:text-5xl">
            Một nền tảng để bắt đầu tử tế
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Cho đi thì có giấy. Nhận lại thì có hàng. Không đủ goal thì rõ hoàn hay giữ. Không đối đầu
            sàn lớn — mượn họ để kể chuyện, rồi đưa người về hồ sơ dự án của mình.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 font-bold"
            >
              <ArrowLeft size={16} /> Về admin
            </Link>
            <Link
              href="/gioi-thieu"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 font-bold text-white"
            >
              Trang giới thiệu công khai
            </Link>
          </div>
        </section>
      );
  }
}

function Eyebrow({ icon: Icon, text }: { icon: typeof Target; text: string }) {
  return (
    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-700 shadow-sm">
      <Icon size={14} /> {text}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{children}</p>
    </div>
  );
}
