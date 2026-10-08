import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_4: PresentationSlide[] = [
  {
    kicker: "Slide 38",
    title: "THẺ CHỨC NĂNG: USER STORY → MÀN HÌNH",
    body: "Mỗi story gắn một màn hình hoặc API.",
    table: {
      headers: ["User Story", "Chức năng", "Màn hình / API", "Trạng thái"],
      rows: [
        ["US-G01", "Xem campaign công khai", "/projects · API Campaign", "Đã triển khai"],
        ["US-G02", "Đăng ký tài khoản", "NextAuth · Role BACKER", "Đã triển khai"],
        ["US-G03", "Ủng hộ không quà", "Gmail · TT-UH", "Đã triển khai"],
        ["US-G04", "Đọc blog công khai", "/blog", "Đã triển khai"],
        ["US-B01", "Ủng hộ khi đăng nhập", "Pledge Form · Kho đồ", "Đã triển khai"],
        ["US-B02", "Đặt Reward", "Session · Kho đồ", "Đã triển khai"],
        ["US-B05", "Trao đổi với Creator", "Thread · MongoDB", "Đã triển khai"],
        ["US-B06", "Báo cáo campaign", "Report", "Đã triển khai"],
        ["US-C01", "Xác minh Creator", "/kyc", "Đã triển khai"],
        ["US-C06", "Xác minh tổ chức", "/kyc/to-chuc", "Đã triển khai"],
        ["US-C05", "Cập nhật campaign / blog", "/blog/my-posts", "Đã triển khai"],
        ["US-C08", "Hồ sơ công khai", "Profile · Lưu nháp / Xuất bản", "Đã triển khai"],
        ["US-A01", "Quản lý eKYC", "/dashboard/admin/system", "Đã triển khai"],
        ["US-A02", "Settle giao dịch", "Admin · BANK_ESCROW", "Đã triển khai"],
        ["US-A03", "Kiểm duyệt nội dung", "Admin Queue", "Đã triển khai"],
        ["US-S03", "Cache dữ liệu", "Redis · TTL 300 giây", "Đã triển khai"],
        ["US-C03", "Xuất sao kê Excel", "Chưa có chức năng xuất file", "Chưa làm P0"],
        ["US-C07", "Nhân bản campaign", "Chưa có chức năng Clone", "Chưa làm P0"],
      ],
    },
    note: "16 dòng đã chạy. 2 dòng chưa làm trong P0: xuất sao kê Excel, nhân bản campaign.",
  },
  {
    kicker: "Slide 39",
    title: "NHÓM MÀN HÌNH ĐANG CHẠY",
    body: "Bốn nhóm màn hình đang chạy.",
    cards: [
      {
        title: "A. Tài khoản",
        body: "Đăng ký, đăng nhập, KYC cá nhân, KYB tổ chức. Tài khoản BANNED không tạo pledge mới.",
      },
      {
        title: "B. Gây quỹ",
        body: "Project và Campaign DRAFT, gói Reward, AoN hoặc KIA, gửi PENDING_REVIEW, cập nhật khi đã VERIFIED.",
      },
      {
        title: "C. Dòng tiền",
        body: "Ví, thẻ quốc tế, NAPAS, VietQR. BANK_ESCROW, Tip, COD khi gói cho phép, settle hoặc hoàn theo đơn.",
      },
      {
        title: "D. Kiểm duyệt",
        body: "Hàng đợi KYC, Campaign, Blog. Bật hoặc tắt eKYC. Báo cáo vi phạm. Audit Log.",
      },
    ],
    note: "Checkout không tự trừ ví hoặc thẻ đã liên kết. Tiền đi qua tài khoản trung gian, chỉ xác nhận sau đối soát.",
  },
  {
    kicker: "Slide 40",
    title: "USER FLOW: 4 LANE",
    body: "Bốn lane, nhìn toàn cảnh.",
    lanes: [
      {
        title: "Guest / Backer",
        tone: "emerald",
        steps: ["Chiến dịch", "Pledge", "Thanh toán", "Settle", "Chứng từ / Reward"],
      },
      {
        title: "Creator",
        tone: "navy",
        steps: ["KYC", "Chiến dịch", "Kiểm duyệt", "ACTIVE", "Giao hàng"],
      },
      {
        title: "Admin",
        tone: "rose",
        steps: ["Kiểm duyệt", "Settle", "Audit Log"],
      },
      {
        title: "System",
        tone: "default",
        steps: ["PENDING", "Đối soát", "SUCCESS", "Chứng từ"],
      },
    ],
    note: "PENDING chưa cộng tiền. SUCCESS mới ghi nhận giao dịch và cấp quyền lợi. Hoàn tiền xử lý theo từng đơn.",
  },
  {
    kicker: "Slide 41",
    title: "SƠ ĐỒ GUEST / BACKER VÀ CREATOR / ADMIN",
    body: "Từng vai, đi sâu hơn slide trước.",
    lanes: [
      {
        title: "Guest",
        tone: "emerald",
        steps: ["Xem Campaign ACTIVE", "Ủng hộ không quà", "Gmail", "TT-UH"],
      },
      {
        title: "Backer",
        tone: "emerald",
        steps: ["Đăng nhập", "Reward", "Tip", "Thanh toán", "Kho đồ"],
      },
      {
        title: "Creator",
        tone: "navy",
        steps: ["KYC / KYB", "Campaign DRAFT", "Gửi duyệt", "Giao hàng"],
      },
      {
        title: "Admin",
        tone: "rose",
        steps: ["Kiểm tra hồ sơ", "Duyệt / Từ chối", "Settle", "Hoàn"],
      },
    ],
    blocks: [
      {
        heading: "Quy tắc quan trọng",
        bullets: [
          "Campaign chỉ nhận giao dịch khi đã ACTIVE",
          "Pledge chỉ được xác nhận khi đã settle",
          "Admin không thực hiện settle từ tài khoản Backer",
        ],
      },
    ],
  },
  {
    kicker: "Slide 42",
    title: "LUỒNG SYSTEM: ĐỐI SOÁT ĐẾN CHỨNG TỪ",
    blocks: [
      {
        heading: "1. Tạo giao dịch",
        bullets: [
          "Create Pledge",
          "→ Tạo Pledge ở trạng thái PENDING",
          "→ Phương thức: BANK_ESCROW",
        ],
      },
      {
        heading: "2. Trước khi xác nhận",
        bullets: [
          "currentAmount chưa tăng",
          "Chưa cấp TT-UH",
          "Chưa cấp INV-",
          "Chưa cấp tài sản trong Kho đồ",
        ],
      },
      {
        heading: "3. Settle",
        bullets: [
          "settlePledgeAsPaid",
          "→ Chuyển giao dịch sang SUCCESS",
          "→ Cộng tiền đúng một lần",
        ],
      },
      {
        heading: "4. Cấp quyền lợi",
        bullets: [
          "Donation",
          "TT-UH qua Gmail",
          "Người dùng đăng nhập được lưu thêm trong Kho đồ",
          "Reward",
          "INV-",
          "Quà số được cấp vào /purchases",
          "Quà vật lý tiếp tục qua bước giao hàng",
        ],
      },
      {
        heading: "5. Chi hoặc hoàn",
        bullets: [
          "Đủ điều kiện → chi cho Creator, trừ phí Reward",
          "Quá hạn SLA → hoàn đúng đơn",
          "Hoàn → thu hồi quà đã cấp",
        ],
      },
      {
        heading: "Kiểm soát dữ liệu",
        bullets: [
          "Redis chỉ phục vụ cache.",
          "MongoDB lưu dữ liệu chat.",
          "Sổ giao dịch được quản lý riêng và không phụ thuộc vào cache hoặc chat.",
        ],
      },
    ],
  },
];
