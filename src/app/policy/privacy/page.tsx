import { PolicyCard, PolicyShell } from "@/components/policy/PolicyShell";

export default function PrivacyPage() {
  return (
    <PolicyShell
      title="Chính sách bảo mật"
      subtitle="Cập nhật 08/09/2026. Áp dụng cho tài khoản, thanh toán và hồ sơ định danh trên Tử Tế Fund."
    >
      <PolicyCard title="1. Dữ liệu chúng tôi xử lý">
        <ul className="list-disc pl-5 space-y-2">
          <li>Tài khoản: họ tên, email, loại cá nhân/tổ chức, ảnh đại diện.</li>
          <li>KYC/eKYC: ảnh CCCD, selfie, thời điểm đồng ý, metadata phiên xác minh.</li>
          <li>Thanh toán: mã giao dịch cổng, số tiền, trạng thái, 4 số cuối / nhãn phương thức đã lưu. Sàn không lưu số thẻ đầy đủ.</li>
          <li>Nhật ký kỹ thuật: IP khi đăng ký, báo cáo lạm dụng, audit hoàn tiền và duyệt nội dung.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="2. Mục đích">
        <p>
          Định danh Creator trước khi public chiến dịch, đối soát với cổng thanh toán, chống gian lận, trả lời ngân hàng khi bị treo tiền, và vận hành Kho đồ số / hoàn tiền.
        </p>
      </PolicyCard>

      <PolicyCard title="3. Chia sẻ">
        <p>
          Dữ liệu có thể gửi tới nhà cung cấp thanh toán, eKYC sandbox/đối tác khi bật, lưu trữ ảnh, và cơ quan có thẩm quyền khi pháp luật yêu cầu. Sàn không bán dữ liệu cá nhân.
        </p>
      </PolicyCard>

      <PolicyCard title="4. Thời hạn và quyền của bạn">
        <p>
          Hồ sơ KYC và chứng từ giao dịch được giữ đủ lâu để đối soát và giải trình. Bạn có thể yêu cầu xem hoặc chỉnh thông tin tài khoản trong trang hồ sơ. Xóa tài khoản không xóa ngay các chứng từ thanh toán pháp lý bắt buộc phải lưu.
        </p>
      </PolicyCard>
    </PolicyShell>
  );
}
