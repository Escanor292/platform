import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_3: PresentationSlide[] = [
  {
    kicker: "Slide 42",
    title: "USE CASE: AI LÀM VIỆC GÌ?",
    blocks: [
      {
        heading: "Guest",
        bullets: [
          "Xem chiến dịch",
          "Đăng ký tài khoản",
          "Ủng hộ không quà bằng Gmail",
        ],
      },
      {
        heading: "Backer",
        bullets: [
          "Đặt Reward",
          "Xem Kho đồ",
          "Chọn Tip",
          "Chat với Creator",
          "Báo cáo campaign",
        ],
      },
      {
        heading: "Creator",
        bullets: [
          "KYC / KYB",
          "Tạo và quản lý Campaign",
          "Quản lý Reward",
          "Xác nhận giao hàng",
          "Theo dõi sao kê",
        ],
      },
      {
        heading: "Admin / System",
        bullets: [
          "Kiểm duyệt",
          "Settle giao dịch",
          "Khóa tài khoản",
          "Đối soát tài khoản trung gian",
          "Cấp chứng từ và quà",
        ],
      },
      {
        heading: "Mục tiêu của Use Case",
        bullets: [
          "Xác định rõ actor nào thực hiện hành động nào và hệ thống phản hồi ra sao.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 43",
    title: "NHÓM USE CASE",
    blocks: [
      {
        heading: "A. Tài khoản",
        bullets: [
          "Đăng ký và đăng nhập",
          "Ủng hộ không quà bằng Gmail",
          "Đặt Reward khi đã đăng nhập",
          "Nâng cấp tài khoản Creator",
          "Khóa tài khoản vi phạm",
        ],
      },
      {
        heading: "B. Gây quỹ",
        bullets: [
          "Tạo, sửa và quản lý Campaign",
          "Tạo và quản lý Reward",
          "Chọn AoN hoặc KIA",
          "Đăng cập nhật",
          "Quản lý Blog",
          "Xuất bản hồ sơ Creator",
        ],
      },
      {
        heading: "C. Dòng tiền",
        bullets: [
          "Chọn phương thức thanh toán",
          "Tạo Pledge",
          "Tip",
          "COD khi gói cho phép",
          "Đối soát và Settle",
          "Chi hoặc hoàn tiền",
        ],
      },
      {
        heading: "D. Kiểm duyệt",
        bullets: [
          "KYC / KYB",
          "Quản lý eKYC",
          "Duyệt Campaign",
          "Duyệt Blog",
          "Xử lý Report",
          "Ghi Audit Log",
        ],
      },
    ],
  },
  {
    kicker: "Slide 44",
    title: "ĐẶC TẢ USE CASE UC-01: TẠO PLEDGE",
    blocks: [
      { heading: "Thông tin chính" },
      {
        heading: "Actor chính",
        bullets: [
          "Guest: khi ủng hộ không quà",
          "Backer: khi đặt Reward",
        ],
      },
      {
        heading: "Actor phụ",
        bullets: ["System", "Admin đối soát tài khoản trung gian"],
      },
      {
        heading: "Tiền điều kiện",
        bullets: [
          "Campaign phải ở trạng thái ACTIVE",
          "Campaign còn trong thời hạn",
          "Reward còn số lượng",
          "Không quà: chỉ cần Gmail hợp lệ",
          "Có quà: bắt buộc đăng nhập",
        ],
      },
      {
        heading: "Luồng chính",
        bullets: [
          "Chọn Ủng hộ không quà hoặc Reward",
          "→ Nhập Gmail / Đăng nhập",
          "→ Tạo Pledge PENDING",
          "→ Thực hiện thanh toán",
          "→ Admin đối soát",
          "→ Settle SUCCESS",
        ],
      },
      { heading: "Hậu điều kiện" },
      {
        heading: "Không quà",
        bullets: [
          "Khách: nhận TT-UH qua Gmail",
          "Người dùng đã đăng nhập: nhận Gmail và lưu chứng từ trong Kho đồ",
        ],
      },
      {
        heading: "Có quà",
        bullets: [
          "Cấp INV-",
          "Quà được ghi nhận trong Kho đồ nếu là quà số",
        ],
      },
      {
        heading: "Ngoại lệ",
        bullets: [
          "Campaign hết hạn",
          "Reward hết suất",
          "Email không hợp lệ",
          "Reward nhưng chưa đăng nhập → từ chối",
          "Gửi paymentMethodId không hợp lệ → API trả lỗi",
        ],
      },
      {
        heading: "Quy tắc cốt lõi",
        bullets: [
          "PENDING chưa được tính vào số tiền huy động.",
          "Chỉ SUCCESS mới tạo quyền lợi cho người dùng.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 45",
    title: "ĐẶC TẢ USE CASE UC-02: TẠO VÀ DUYỆT CAMPAIGN",
    blocks: [
      { heading: "Actor" },
      {
        heading: "Actor chính: Creator",
        bullets: ["Actor phụ: Admin"],
      },
      {
        heading: "Tiền điều kiện",
        bullets: [
          "Hồ sơ Creator đã VERIFIED",
          "Cá nhân có thông tin CCCD hợp lệ",
          "Tổ chức có MST/GPKD đã được duyệt",
        ],
      },
      {
        heading: "Luồng chính",
        bullets: [
          "Tạo DRAFT → Hoàn thiện nội dung → Gửi PENDING_REVIEW → Admin kiểm duyệt → ACTIVE",
        ],
      },
      {
        heading: "Hậu điều kiện",
        bullets: [
          "ACTIVE: campaign được phép nhận pledge",
          "REJECTED: campaign không được công khai và phải có lý do từ chối",
        ],
      },
      {
        heading: "Kiểm tra chính",
        bullets: [
          "Đủ thông tin và hình ảnh bắt buộc",
          "Goal phải lớn hơn 0",
          "Creator phải hoàn tất KYC/KYB",
          "Không cho phép tự hạ mục tiêu sau khi campaign đã ACTIVE",
        ],
      },
      {
        heading: "Nguyên tắc",
        bullets: [
          "Campaign chỉ được công khai và nhận giao dịch sau khi hoàn tất xác minh và kiểm duyệt.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 46",
    title: "ĐẶC TẢ USE CASE UC-03: SETTLE, CHI VÀ HOÀN",
    blocks: [
      { heading: "Actor" },
      {
        heading: "Actor chính",
        bullets: [
          "Admin: thực hiện Settle",
          "System: xử lý chi hoặc hoàn",
        ],
      },
      {
        heading: "Actor phụ",
        bullets: [
          "Creator: xác nhận giao hàng",
          "Backer: nhận chứng từ",
        ],
      },
      {
        heading: "Tiền điều kiện",
        bullets: [
          "Pledge đang ở trạng thái PENDING",
          "Phương thức thanh toán là BANK_ESCROW",
          "Khoản tiền đã được đối soát vào tài khoản trung gian",
        ],
      },
      {
        heading: "Luồng Settle",
        bullets: ["PENDING → Đối soát → SUCCESS → Cấp chứng từ / Quà"],
      },
      {
        heading: "Luồng chi",
        bullets: [
          "Khi:",
          "Campaign đã chốt",
          "Đơn đã được giao hoặc xác nhận hoàn thành",
          "Đơn vẫn trong thời hạn cam kết",
          "→ Hệ thống thực hiện chi cho Creator",
          "→ Phần Reward áp dụng feeRate 8%",
        ],
      },
      {
        heading: "Luồng hoàn",
        bullets: [
          "Khi:",
          "Đơn vượt quá SLA",
          "Hoặc campaign thất bại theo mô hình All-or-Nothing",
          "→ Hoàn đúng đơn",
          "→ Thu hồi quà đã cấp",
          "→ Giữ nguyên lịch sử giao dịch và sao kê",
        ],
      },
      {
        heading: "Nguyên tắc",
        bullets: [
          "Tiền được xử lý theo từng đơn, vì vậy một đơn chậm không làm ảnh hưởng đến các đơn đã hoàn thành.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 47",
    title: "ACTIVITY: TỪ THANH TOÁN ĐẾN CHỨNG TỪ",
    blocks: [
      {
        heading: "1. Tạo Pledge",
        bullets: [
          "PENDING",
          "Chưa cộng currentAmount",
          "Chưa cấp TT-UH",
          "Chưa cấp INV-",
          "Chưa cấp quà",
        ],
      },
      {
        heading: "2. Thanh toán",
        bullets: [
          "Hỗ trợ các kênh:",
          "Ví điện tử",
          "Thẻ quốc tế",
          "NAPAS",
          "VietQR",
          "Sau đó mở trang thanh toán qua tài khoản trung gian.",
        ],
      },
      {
        heading: "3. Đối soát",
        bullets: [
          "settlePledgeAsPaid",
          "Chuyển Pledge sang SUCCESS",
          "Ghi nhận tiền đúng một lần",
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
          "Quà số được cấp vào Kho đồ",
          "Quà vật lý tiếp tục qua quy trình giao hàng",
        ],
      },
      {
        heading: "5. Chi hoặc hoàn",
        bullets: [
          "Đủ điều kiện → Chi cho Creator",
          "Trễ SLA → Hoàn đúng đơn",
          "Hoàn → Thu hồi quà đã cấp",
        ],
      },
      {
        heading: "Nguyên tắc xuyên suốt",
        bullets: ["PENDING → Đối soát → SUCCESS → Cấp quyền lợi → Chi / Hoàn"],
      },
    ],
  },
  {
    kicker: "Slide 48",
    title: "ERD: VÒNG GÂY QUỸ LAI",
    blocks: [
      {
        heading: "1. Người dùng và xác minh",
        bullets: [
          "users",
          "→ kyc_info",
          "Quan hệ 1–1",
          "Người dùng có thể mang các role:",
          "ADMIN",
          "BACKER",
          "CREATOR_PENDING",
          "CREATOR",
          "Ngoài ra lưu:",
          "isOrganization",
          "isAdmin",
        ],
      },
      {
        heading: "2. Cấu trúc gây quỹ",
        bullets: [
          "users",
          "→ projects",
          "→ campaigns",
          "→ rewards",
          "Campaign hỗ trợ:",
          "DONATION",
          "REWARD",
          "All-or-Nothing (AoN)",
          "Keep-It-All (KIA)",
        ],
      },
      {
        heading: "3. Dòng tiền",
        bullets: [
          "campaigns",
          "→ pledges",
          "Một pledge có thể liên kết với:",
          "Donation Certificate (TT-UH)",
          "Invoice (INV-)",
          "Digital Reward Asset",
        ],
      },
      {
        heading: "4. Kiểm soát hệ thống",
        bullets: [
          "Các thành phần hỗ trợ:",
          "Campaign Reports",
          "Audit Logs",
          "Blacklist",
          "Blog và trạng thái kiểm duyệt",
        ],
      },
      {
        heading: "Ý nghĩa ERD",
        bullets: [
          "Mô hình dữ liệu liên kết xuyên suốt từ tài khoản → campaign → giao dịch → chứng từ → quà → kiểm soát.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 49",
    title: "QUAN HỆ DỮ LIỆU & PRISMA",
    body: "Các quan hệ chính",
    table: {
      headers: ["Quan hệ", "Ý nghĩa"],
      rows: [
        ["Users → Campaigns", "Một Creator có thể tạo nhiều campaign"],
        ["Users → Pledges", "Một Backer có thể có nhiều pledge"],
        ["Campaigns → Pledges", "Một campaign nhận nhiều giao dịch"],
        ["Pledge → TT-UH", "Donation thành công có một chứng từ"],
        ["Pledge → INV-", "Reward có một biên lai/hoá đơn hệ thống"],
        ["Pledge → Digital Asset", "Một giao dịch có thể cấp nhiều tài sản số"],
        ["Users → KYC", "Mỗi tài khoản có một hồ sơ xác minh"],
      ],
    },
    blocks: [
      { heading: "Một số trường dữ liệu trọng tâm" },
      {
        heading: "users",
        bullets: ["role", "isOrganization", "isAdmin"],
      },
      {
        heading: "kyc_info",
        bullets: [
          "Hình ảnh xác minh",
          "Thời điểm đồng ý",
          "Thông tin eKYC",
          "Lý do từ chối",
        ],
      },
      {
        heading: "campaigns",
        bullets: ["feeRate", "fundingModel", "status"],
      },
      {
        heading: "Trạng thái Campaign",
        bullets: ["DRAFT → PENDING_REVIEW → ACTIVE → SUCCESS / FAILED / CANCELED"],
      },
      {
        heading: "Nguyên tắc thiết kế",
        bullets: [
          "Không tạo một bảng Kho đồ riêng; quà số được quản lý thông qua reward_digital_assets.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 50",
    title: "DANH SÁCH MODULE",
    body: "Sáu module nghiệp vụ. Use case cấp 0 ở slide sau bám đúng danh sách này.",
    table: {
      headers: ["Mã", "Tên module", "Mục tiêu", "File chính"],
      rows: [
        ["M01", "Xác minh", "Chỉ creator đã duyệt mới được công khai chiến dịch", "kyc.ts · platform-settings.ts"],
        ["M02", "Chiến dịch", "Tạo, gửi duyệt và chuyển campaign sang ACTIVE", "campaign-lifecycle.ts"],
        ["M03", "Giao dịch", "Tạo pledge đúng điều kiện, chưa cộng tiền khi PENDING", "payment/create-pledge.ts"],
        ["M04", "Chứng từ và Kho đồ", "SUCCESS mới cấp TT-UH, INV- hoặc quà số", "digital-warehouse.ts · invoice-generator.ts"],
        ["M05", "Đối soát tiền", "Giữ, chi hoặc hoàn theo từng đơn", "money-buckets.ts · ship-sla.ts"],
        ["M06", "Kiểm duyệt", "Duyệt nội dung, nhận báo cáo, ghi Audit Log", "moderation.ts · audit.ts"],
      ],
    },
  },
  {
    kicker: "Slide 51",
    title: "M01 · M02 — MỤC TIÊU VÀ CHỨC NĂNG CON",
    cards: [
      {
        title: "M01 Xác minh",
        body: "Mục tiêu: hồ sơ cá nhân hoặc tổ chức đạt trước khi campaign ACTIVE. Chức năng con: nộp CCCD, đọc QR, eKYC hoặc form thủ công, duyệt hoặc từ chối kèm lý do, bật tắt eKYC.",
      },
      {
        title: "M02 Chiến dịch",
        body: "Mục tiêu: một campaign có thể gồm ủng hộ không quà và Reward. Chức năng con: tạo DRAFT, gói Reward, chọn AoN hoặc KIA, gửi PENDING_REVIEW, admin duyệt thành ACTIVE hoặc REJECTED.",
      },
    ],
  },
  {
    kicker: "Slide 52",
    title: "M03 · M04 — MỤC TIÊU VÀ CHỨC NĂNG CON",
    cards: [
      {
        title: "M03 Giao dịch",
        body: "Mục tiêu: nhận ủng hộ hoặc đặt Reward khi campaign còn hiệu lực. Chức năng con: kiểm tra ACTIVE, hạn, suất, Gmail hoặc đăng nhập, tạo pledge PENDING, từ chối paymentMethodId.",
      },
      {
        title: "M04 Chứng từ và Kho đồ",
        body: "Mục tiêu: quyền lợi chỉ phát sinh sau SUCCESS, không cấp trùng. Chức năng con: TT-UH qua Gmail, lưu Kho đồ nếu đã đăng nhập, INV- và quà số, thu hồi quà khi hoàn.",
      },
    ],
  },
  {
    kicker: "Slide 53",
    title: "M05 · M06 — MỤC TIÊU VÀ CHỨC NĂNG CON",
    cards: [
      {
        title: "M05 Đối soát tiền",
        body: "Mục tiêu: tiền đi theo từng đơn, một đơn trễ không chặn đơn đã xong. Chức năng con: settle một lần, chi khi đủ điều kiện, phí Reward 8%, Donation 0%, hoàn quá SLA.",
      },
      {
        title: "M06 Kiểm duyệt",
        body: "Mục tiêu: nội dung công khai đã được duyệt và thao tác admin truy được. Chức năng con: hàng đợi KYC, campaign, blog, báo cáo, khóa tài khoản, Audit Log.",
      },
    ],
    note: "Redis chỉ cache 300 giây. Không phải module nghiệp vụ.",
  },
  {
    kicker: "Slide 54",
    title: "USE CASE CẤP 0",
    body: "Hệ thống là một khối. Tác nhân đứng ngoài. Mỗi use case lấy từ một module.",
    table: {
      headers: ["Mã", "Tên mô hình", "Tác nhân", "Module"],
      rows: [
        ["UC-01", "Tạo pledge", "Guest, Backer", "M03"],
        ["UC-02", "Tạo và duyệt campaign", "Creator, Admin", "M02"],
        ["UC-03", "Settle, chi và hoàn", "Admin, System", "M05"],
        ["UC-04", "Xác minh hồ sơ", "Creator, Admin", "M01"],
        ["UC-05", "Cấp chứng từ và quà", "System", "M04"],
        ["UC-06", "Kiểm duyệt nội dung", "Admin", "M06"],
      ],
    },
    note: "Tác nhân: Guest, Backer, Creator, Admin, System. Danh sách đầy đủ ở slide 29–31.",
  },
  {
    kicker: "Slide 55",
    title: "ĐẶC TẢ VÀ ACTIVITY",
    body: "Ba use case lõi đã đặc tả. Ba use case còn lại bám chức năng con của module.",
    table: {
      headers: ["Mã", "Đặc tả", "Activity"],
      rows: [
        ["UC-01", "Slide 44", "Slide 47: PENDING → SUCCESS → chứng từ"],
        ["UC-02", "Slide 45", "DRAFT → PENDING_REVIEW → ACTIVE"],
        ["UC-03", "Slide 46", "Settle → chi hoặc hoàn theo đơn"],
        ["UC-04", "M01", "Nộp hồ sơ → duyệt → VERIFIED"],
        ["UC-05", "M04", "SUCCESS → TT-UH hoặc INV- → Kho đồ"],
        ["UC-06", "M06", "Hàng đợi → duyệt hoặc từ chối → Audit Log"],
      ],
    },
  },
  {
    kicker: "Slide 56",
    title: "MÔ HÌNH THU PHÍ",
    blocks: [
      {
        heading: "Nguyên tắc",
        bullets: ["Phí nền tảng không cộng thêm vào giá mà Backer phải trả."],
      },
      {
        heading: "Reward",
        bullets: [
          "Backer trả",
          "Giá gói Reward",
          "Tip nếu người dùng tự chọn",
          "Sàn giữ",
          "8% trên phần Reward",
          "Creator nhận",
          "Phần còn lại sau phí",
          "Thời điểm",
          "Sau khi campaign chốt và đơn đủ điều kiện chi",
        ],
      },
      {
        heading: "Donation",
        bullets: [
          "Backer trả",
          "Khoản ủng hộ",
          "Tip nếu tự chọn",
          "Sàn giữ",
          "0% trên khoản Donation",
          "Creator / dự án nhận",
          "Khoản ủng hộ sau khi giao dịch được settle",
          "Chứng từ",
          "TT-UH chỉ được cấp sau SUCCESS",
        ],
      },
      {
        heading: "Hàng sẵn / COD",
        bullets: [
          "Không áp dụng Tip",
          "Không đi qua luồng Tip",
          "COD chỉ xuất hiện khi Reward cho phép",
        ],
      },
      {
        heading: "Quy tắc",
        bullets: [
          "Không gộp phí cổng thanh toán vào phí nền tảng và không cộng phí nền tảng trực tiếp vào giá Reward.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 57",
    title: "GIỮ CHÂN CREATOR & PHẠM VI SẢN PHẨM",
    blocks: [
      {
        heading: "Các tính năng đã có",
        bullets: [
          "Cập nhật Campaign",
          "Blog và quy trình kiểm duyệt",
          "Chat với cộng đồng",
          "Hồ sơ công khai",
          "Thông báo",
          "Kho đồ sau thanh toán",
        ],
      },
      {
        heading: "Những mô hình chưa triển khai",
        bullets: [
          "Gói quay phim / sản xuất nội dung",
          "Gói Marketing trọn gói",
          "Subscription theo tháng",
          "Gọi vốn cổ phần",
        ],
      },
      {
        heading: "Chưa làm trong P0",
        bullets: [
          "Xuất sao kê Excel",
          "Nhân bản Campaign",
          "Tài khoản nhân viên",
          "Điểm uy tín tự động",
          "Banner hệ thống",
          "Admin phụ",
        ],
      },
      {
        heading: "Định hướng doanh thu dịch vụ",
        bullets: [
          "Các dịch vụ trả phí cho Creator chỉ được xem xét sau khi:",
          "Take rate Reward 8% + đối soát tài khoản trung gian vận hành ổn định.",
        ],
      },
      {
        heading: "Trạng thái hiện tại",
        bullets: ["Các dịch vụ bổ sung chưa được ghi nhận là doanh thu hiện tại."],
      },
    ],
  },
  {
    kicker: "Slide 58",
    title: "PCA, TEST PLAN & TEST RESULT",
    paragraphs: [
      { text: "Baseline" },
      { text: "PRD: 07/09/2026" },
      { text: "Test Lead: Nguyễn Quách Phú Tài" },
      { text: "Phạm vi kiểm thử chính" },
    ],
    table: {
      headers: ["Mã", "Tình huống", "Kết quả kỳ vọng"],
      rows: [
        ["TR-01", "Donation Guest / Backer", "Gmail, không COD"],
        ["TR-02", "Đặt Reward khi chưa đăng nhập", "API từ chối, không tạo pledge"],
        ["TR-03", "Settle Donation", "TT-UH được gửi đúng kênh"],
        ["TR-04", "Hoàn Reward", "Thu hồi quà, giữ lịch sử sao kê"],
        ["TR-05", "Tắt eKYC", "Chuyển sang form thủ công"],
        ["TR-06", "Creator chưa KYC", "Campaign không ACTIVE"],
        ["TR-07", "Reject không có lý do", "Không chuyển sang REJECTED"],
        ["TR-08", "Redis gặp lỗi", "Hệ thống vẫn đọc DB"],
        ["TR-09", "Gửi paymentMethodId", "API từ chối"],
        ["TR-10", "Settle lần hai", "Không cấp quà trùng"],
      ],
    },
    blocks: [
      {
        heading: "Nguyên tắc kiểm thử",
        bullets: [
          "Ghi nhận ngày test",
          "Ghi nhận commit / phiên bản",
          "Ghi nhận môi trường kiểm thử",
          "Chỉ kết luận PASS sau khi kiểm thử thực tế",
        ],
      },
      {
        heading: "Phạm vi P0",
        bullets: ["Không đưa Web3, Chatbot hoặc PayPal vào phạm vi P0."],
      },
    ],
  },
  {
    kicker: "Slide 59",
    title: "DATABASE SERVER & WEB SERVER",
    blocks: [
      {
        heading: "Database Server",
        bullets: ["Neon PostgreSQL"],
      },
      {
        heading: "Neon PostgreSQL",
        bullets: [
          "Users",
          "KYC",
          "Campaigns",
          "Pledges",
          "Invoices",
          "Certificates",
          "Presentation",
          "Biến kết nối:",
          "DATABASE_URL",
        ],
      },
      {
        heading: "Dịch vụ dữ liệu bổ trợ",
        bullets: [
          "MongoDB",
          "→ Lưu dữ liệu Chat",
          "Redis",
          "→ Cache Campaign và Statistics",
          "→ TTL 300 giây",
          "→ Redis lỗi vẫn cho phép đọc từ Database",
        ],
      },
      {
        heading: "Web Server",
        bullets: ["Vercel"],
      },
      {
        heading: "Vercel",
        bullets: [
          "Next.js App Router",
          "Triển khai ứng dụng Web",
          "Checkout theo mô hình BANK_ESCROW",
          "Trang thanh toán qua tài khoản trung gian",
        ],
      },
      {
        heading: "Quy trình triển khai",
        bullets: ["Push main → Build → Prisma Generate → Migrate → Smoke Test"],
      },
      {
        heading: "Smoke Test",
        bullets: [
          "Guest ủng hộ không quà bằng Gmail",
          "Backer đặt Reward sau khi đăng nhập",
          "Campaign bị từ chối với đầy đủ lý do",
        ],
      },
      {
        heading: "Nguyên tắc bảo mật",
        bullets: [
          "Không commit .env",
          "Schema Database phải đồng bộ với môi trường triển khai",
          "Không sử dụng schema placeholder",
        ],
      },
      {
        heading: "Tổng thể",
        bullets: ["Web App → API / Business Logic → PostgreSQL + MongoDB + Redis → Tài khoản trung gian"],
      },
    ],
  },
];
