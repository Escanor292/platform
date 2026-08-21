import { notFound } from "next/navigation";

export default function AssistantE2eFixturePage() {
  if (process.env.E2E_TEST_MODE !== "1") notFound();
  return <main className="mx-auto max-w-2xl p-8"><h1>Kiểm thử Hỏi nhanh</h1><p>Trang fixture chỉ dùng cho kiểm thử trình duyệt nội bộ.</p></main>;
}
