import Link from "next/link";
import { PolicyCard, PolicyShell } from "@/components/policy/PolicyShell";

export default function TermsPage() {
  return (
    <PolicyShell
      title="Điều khoản sử dụng"
      subtitle="Cập nhật 08/09/2026. Áp dụng khi bạn tạo tài khoản, đăng nhập hoặc dùng Tử Tế Fund."
    >
      <PolicyCard title="1. Sàn này là gì">
        <p>
          Tử Tế Fund là nền tảng trung gian: giúp Creator đăng chiến dịch, Backer ủng hộ bằng VND qua cổng thanh toán đã tích hợp, và lưu lịch sử giao dịch. Sàn không phải quỹ từ thiện, không phải tổ chức vận động theo NĐ 93/2021/NĐ-CP, và không phải sàn tài sản mã hóa.
        </p>
      </PolicyCard>

      <PolicyCard title="2. Tài khoản">
        <ul className="list-disc pl-5 space-y-2">
          <li>Bạn phải cung cấp thông tin trung thực và giữ bảo mật mật khẩu.</li>
          <li>Một người không được tạo hàng loạt tài khoản để lách kiểm duyệt, hoàn tiền hoặc KYC.</li>
          <li>Sàn có quyền khóa, hạn chế hoặc xóa tài khoản khi có dấu hiệu lạm dụng, gian lận hoặc vi phạm pháp luật.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="3. Hai nhóm chiến dịch">
        <p>
          Bản chất dòng tiền quyết định nghĩa vụ, không phải giao diện website. Trên Tử Tế Fund:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Nhóm A — ủng hộ không quà:</strong> Backer không nhận hàng, file, key hay quyền dùng. Thanh toán ONLINE.
          </li>
          <li>
            <strong>Nhóm B — pre-order / có quà:</strong> Backer nhận quà vật lý hoặc số. Áp dụng TMĐT, giao hàng, Kho đồ số và chính sách hoàn theo từng reward.
          </li>
        </ul>
        <p>
          Chi tiết giáo dục nằm ở{" "}
          <Link href="/huong-dan/creator" className="text-pgreen font-bold hover:underline">
            Hướng dẫn phân loại chiến dịch
          </Link>
          . Điều khoản Creator nằm ở{" "}
          <Link href="/policy/creator" className="text-pgreen font-bold hover:underline">
            đây
          </Link>
          .
        </p>
      </PolicyCard>

      <PolicyCard title="4. Thanh toán và hoàn tiền">
        <p>
          Tiền đi qua cổng đã tích hợp (PayOS, VietQR, SePay, MoMo/VNPay khi bật). Không nộp tiền mặt cho nhân sự sàn. Hoàn tiền theo{" "}
          <Link href="/policy/refund" className="text-pgreen font-bold hover:underline">
            Chính sách hoàn tiền
          </Link>
          . Reward số đã vào Kho đồ sẽ bị thu hồi khi giao dịch bị hoàn.
        </p>
      </PolicyCard>

      <PolicyCard title="5. Việc bị cấm">
        <ul className="list-disc pl-5 space-y-2">
          <li>Gây quỹ giả, mục đích mơ hồ, hoặc gắn STK cá nhân để né mô hình trung gian.</li>
          <li>Khai ủng hộ/từ thiện cho chiến dịch thực chất là bán hàng.</li>
          <li>Đăng hàng lậu, nội dung xâm phạm bản quyền, hoặc lừa đảo.</li>
          <li>Quảng cáo token/NFT như hàng hóa đã được cấp phép, hoặc mở mua bán P2P tài sản mã hóa trên sàn.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="6. Trách nhiệm">
        <p>
          Sàn cung cấp công cụ và chứng từ đối soát. Creator chịu trách nhiệm nội dung chiến dịch, giao quà, thuế, thông báo chính quyền và đăng ký TMĐT nếu thuộc nhóm bán hàng. Backer tự đọc điều khoản hoàn trước khi ủng hộ.
        </p>
      </PolicyCard>

      <PolicyCard title="7. Thay đổi điều khoản">
        <p>
          Sàn có thể cập nhật điều khoản khi tính năng hoặc khung pháp lý thay đổi. Bản mới được đăng trên trang này. Tiếp tục sử dụng dịch vụ sau khi đăng nghĩa là bạn chấp nhận bản cập nhật.
        </p>
      </PolicyCard>
    </PolicyShell>
  );
}
