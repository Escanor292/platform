import Link from "next/link";
import { PolicyCard, PolicyShell } from "@/components/policy/PolicyShell";

export default function CreatorTermsPage() {
  return (
    <PolicyShell
      title="Điều khoản Creator"
      subtitle="Áp dụng khi bạn tạo, gửi duyệt hoặc public chiến dịch trên Tử Tế Fund."
    >
      <PolicyCard title="1. Điều kiện mở chiến dịch">
        <ul className="list-disc pl-5 space-y-2">
          <li>Hoàn tất KYC/eKYC và được hệ thống ghi nhận VERIFIED trước khi public.</li>
          <li>Chọn đúng một nhóm: A (không quà) hoặc B (có quà / pre-order).</li>
          <li>Không dán số tài khoản cá nhân lên trang chiến dịch nếu chọn mô hình sàn giữ tiền.</li>
          <li>Ghi rõ mục đích, thời hạn nhận tiền và chính sách hoàn nếu không triển khai được.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="2. Nhóm A và nhóm B">
        <p>
          Có reward, file, key, quà vật lý hoặc credit thì mặc định là nhóm B. Cam kết “trích một phần làm quỹ” không biến doanh thu thành tiền từ thiện. Xem{" "}
          <Link href="/huong-dan/creator" className="text-pgreen font-bold hover:underline">
            hướng dẫn phân loại
          </Link>
          .
        </p>
      </PolicyCard>

      <PolicyCard title="3. Tiền, quà và hoàn">
        <ul className="list-disc pl-5 space-y-2">
          <li>Sàn khóa cổng nhận đúng hạn đã công bố.</li>
          <li>Reward số (file, key, truyện) được ghi vào Kho đồ khi thanh toán SUCCESS; refund thì thu hồi quyền dùng.</li>
          <li>Creator chịu trách nhiệm giao quà đúng mô tả. Sàn có thể hoàn hộ và khóa chiến dịch khi gian lận.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="4. Nghĩa vụ ngoài sàn">
        <p>
          Thuế, hóa đơn, thông báo UBND nếu chiến dịch đúng phạm vi NĐ 93, và thông báo/đăng ký TMĐT nếu bán hàng thường xuyên là nghĩa vụ của Creator. Tử Tế Fund không kê khai thuế hộ.
        </p>
      </PolicyCard>
    </PolicyShell>
  );
}
