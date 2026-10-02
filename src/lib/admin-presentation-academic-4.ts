import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_4: PresentationSlide[] = [
  {
    kicker: "Slide 37",
    title: "THẺ CHỨC NĂNG: USER STORY → MÀN HÌNH",
    body: "Từ yêu cầu người dùng đến chức năng thực tế",
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
    blocks: [
      {
        heading: "Ý nghĩa",
        bullets: [
          "Mỗi User Story được ánh xạ trực tiếp thành chức năng và màn hình cụ thể, giúp kiểm tra từ yêu cầu đến triển khai.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 38",
    title: "NHÓM MÀN HÌNH ĐANG CHẠY",
    blocks: [
      {
        heading: "A. Tài khoản",
        bullets: [
          "Đăng ký và đăng nhập bằng NextAuth",
          "Xác minh Creator cá nhân tại /kyc",
          "Xác minh tổ chức tại /kyc/to-chuc",
          "Tài khoản bị BANNED không được tạo pledge mới",
        ],
      },
      {
        heading: "B. Gây quỹ",
        bullets: [
          "Tạo Project và Campaign ở trạng thái DRAFT",
          "Tạo các gói Reward",
          "Lựa chọn mô hình All-or-Nothing (AoN) hoặc Keep-It-All (KIA)",
          "Gửi campaign sang PENDING_REVIEW",
          "Creator đã VERIFIED có thể đăng cập nhật campaign",
        ],
      },
      {
        heading: "C. Dòng tiền",
        bullets: [
          "Thanh toán qua 4 kênh: Ví, Thẻ quốc tế, NAPAS và VietQR",
          "Giao dịch được ghi nhận theo mô hình BANK_ESCROW",
          "Hỗ trợ Tip và COD khi gói cho phép",
          "Thực hiện settle, chi hoặc hoàn theo từng đơn",
        ],
      },
      {
        heading: "D. Kiểm duyệt",
        bullets: [
          "Hàng đợi KYC, Campaign và Blog",
          "Bật / tắt eKYC",
          "Tiếp nhận báo cáo vi phạm",
          "Ghi Audit Log đối với các thao tác quản trị",
        ],
      },
      {
        heading: "Điểm kiểm soát",
        bullets: [
          "Checkout không tự trừ tiền từ ví hoặc thẻ đã liên kết.",
          "Giao dịch được xử lý qua tài khoản trung gian và chỉ được xác nhận sau đối soát.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 39",
    title: "USER FLOW: 4 LANE",
    body: "Luồng người dùng và hệ thống",
    lanes: [
      {
        title: "Guest / Backer",
        tone: "emerald",
        steps: [
          "Xem Campaign ACTIVE",
          "Chọn Ủng hộ không quà hoặc Reward",
          "Nhập Gmail / Đăng nhập",
          "Tạo Pledge PENDING",
          "Thanh toán",
          "Settle SUCCESS",
          "Nhận TT-UH / INV- / Quà",
        ],
      },
      {
        title: "Creator",
        tone: "navy",
        steps: [
          "Nộp CCCD hoặc MST/GPKD",
          "Xác minh",
          "Tạo Project & Campaign DRAFT",
          "Gửi PENDING_REVIEW",
          "Admin duyệt",
          "Campaign ACTIVE",
          "Giao hàng / Cập nhật",
          "Theo dõi sao kê",
        ],
      },
      {
        title: "Admin",
        tone: "rose",
        steps: [
          "Kiểm tra KYC",
          "Duyệt / Từ chối",
          "Kiểm duyệt Campaign / Blog",
          "Settle giao dịch",
          "Khóa tài khoản khi cần",
          "Ghi nhận Audit Log",
        ],
      },
      {
        title: "System & Tài khoản trung gian",
        tone: "default",
        steps: [
          "Nhận yêu cầu giao dịch",
          "PENDING",
          "Đối soát",
          "SUCCESS",
          "Cấp chứng từ / Quà",
          "Chi hoặc hoàn theo điều kiện",
        ],
      },
    ],
    blocks: [
      {
        heading: "Nguyên tắc xuyên suốt",
        bullets: [
          "PENDING chưa cộng tiền.",
          "SUCCESS mới ghi nhận giao dịch và cấp quyền lợi.",
          "Hoàn tiền xử lý theo từng đơn.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 40",
    title: "SƠ ĐỒ GUEST / BACKER VÀ CREATOR / ADMIN",
    lanes: [
      {
        title: "Luồng Guest & Backer",
        tone: "emerald",
        steps: [
          "Guest",
          "Xem Campaign ACTIVE",
          "Ủng hộ không quà bằng Gmail",
          "Guest muốn nhận Reward",
          "Chọn Reward",
          "Đăng nhập",
          "Thanh toán",
          "Chờ settle",
          "Backer",
          "Chọn Reward",
          "Tip nếu được phép",
          "Nhận thông tin thanh toán",
          "Pledge PENDING",
        ],
      },
      {
        title: "Luồng Creator & Admin",
        tone: "navy",
        steps: [
          "Creator",
          "KYC / KYB",
          "Tạo Campaign DRAFT",
          "Gửi duyệt",
          "Admin",
          "Kiểm tra hồ sơ",
          "Duyệt / Từ chối",
          "ACTIVE",
        ],
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
    kicker: "Slide 41",
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
