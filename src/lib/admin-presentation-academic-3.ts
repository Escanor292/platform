import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_3: PresentationSlide[] = [
  {
    kicker: "Use Case",
    title: "Use Case — ai làm việc gì",
    figures: [
      { key: "usecase-tute.png", alt: "Use case Tử Tế Fund", caption: "Guest ủng hộ không quà. Backer đặt Reward. Creator nộp KYC. Admin settle." },
    ],
    cards: [
      { title: "Guest", body: "Xem chiến dịch. Đăng ký. Ủng hộ không quà bằng Gmail." },
      { title: "Backer", body: "Đặt Reward. Kho đồ. Tip. Chat. Báo cáo." },
      { title: "Creator", body: "KYC hoặc KYB. Quản lý campaign. Giao hàng. Sao kê." },
      { title: "Admin / System", body: "Duyệt. Settle. Khóa user. Đối soát STK. Cấp chứng từ và Kho đồ." },
    ],
  },
  {
    kicker: "Use Case",
    title: "Nhóm Use Case",
    cards: [
      { title: "A. Tài khoản", body: "Đăng ký khi đặt quà. Ủng hộ không quà: khách chỉ Gmail; đã login thì Gmail và Kho đồ. Nâng CREATOR, khóa BANNED." },
      { title: "B. Gây quỹ", body: "CRUD campaign và reward khi còn DRAFT, AoN hoặc KIA, cập nhật, blog chờ duyệt, hồ sơ xuất bản." },
      { title: "C. Dòng tiền", body: "Bốn kênh trên màn, đơn BANK_ESCROW, tip, COD chỉ khi gói cho phép, settle STK, chi, hoàn." },
      { title: "D. Kiểm duyệt", body: "KYC, eKYC tắt được, KYB, hàng đợi campaign và blog, report, audit." },
    ],
  },
  {
    kicker: "Đặc tả",
    title: "Đặc tả UC-01 Tạo pledge",
    table: {
      headers: ["Mục", "Nội dung"],
      rows: [
        ["Actor chính", "Guest khi không quà. Backer khi có quà."],
        ["Actor phụ", "System, Admin đối soát STK trung gian"],
        ["Tiền điều kiện", "Không quà: Gmail hợp lệ, không bắt đăng nhập. Có quà: phải có session. Campaign ACTIVE. Còn hạn. Còn suất."],
        ["Hậu điều kiện", "SUCCESS cộng tiền. Khách không quà: TT-UH gửi Gmail. Đã login không quà: Gmail và Kho đồ. Có quà: INV- và Kho đồ."],
        ["Luồng chính", "Chọn không quà hoặc gói → nhập Gmail hoặc đăng nhập → PENDING BANK_ESCROW → chuyển khoản → settle SUCCESS."],
        ["Ngoại lệ", "Hết hạn. Hết suất. Thiếu email. Có quà mà chưa login thì 401. paymentMethodId bị 400."],
      ],
    },
  },
  {
    kicker: "Đặc tả",
    title: "Đặc tả UC-02 Tạo và duyệt campaign",
    table: {
      headers: ["Mục", "Nội dung"],
      rows: [
        ["Actor chính", "Creator"],
        ["Actor phụ", "Admin"],
        ["Tiền điều kiện", "kyc_info VERIFIED. Cá nhân có CCCD. Tổ chức có MST/GPKD đã duyệt."],
        ["Hậu điều kiện", "ACTIVE thì nhận pledge. REJECTED thì có lý do và không public."],
        ["Luồng chính", "DRAFT → sửa nếu cần → submit PENDING_REVIEW → Admin approve ACTIVE."],
        ["Ngoại lệ", "Thiếu ảnh. Goal không lớn hơn 0. Chưa KYC. Lý do từ chối để trống. ACTIVE rồi creator không tự hạ goal."],
      ],
    },
  },
  {
    kicker: "Đặc tả",
    title: "Đặc tả UC-03 Settle, chi và hoàn",
    table: {
      headers: ["Mục", "Nội dung"],
      rows: [
        ["Actor chính", "Admin settle. System chi hoặc hoàn."],
        ["Actor phụ", "Creator xác nhận giao. Backer nhận chứng từ."],
        ["Tiền điều kiện", "Pledge PENDING, method BANK_ESCROW, tiền đã vào STK trung gian theo đối soát admin."],
        ["Hậu điều kiện", "SUCCESS cộng currentAmount một lần. Donation ra TT-UH. Reward ra INV- và có thể grant Kho đồ."],
        ["Luồng chi", "Đơn đã nhận đủ, chiến dịch đã chốt, trong SLA thì chi creator, trừ 8% trên phần Reward."],
        ["Luồng hoàn", "Trễ SLA hoặc hụt goal kiểu AoN thì hoàn đúng đơn, revoke asset, giữ dòng sao kê cũ."],
      ],
    },
  },
  {
    kicker: "Activity",
    title: "Activity — thanh toán đến chứng từ",
    figures: [
      { key: "activity-checkout.png", alt: "Activity checkout đến chứng từ", caption: "PENDING không ra giấy. SUCCESS mới cộng tiền và cấp chứng từ." },
    ],
    steps: [
      { n: "01", t: "PENDING", d: "Không quà có thể chỉ Gmail. Có quà: đã đăng nhập. Chưa cộng currentAmount." },
      { n: "02", t: "Màn hình", d: "Ví, thẻ, NAPAS hoặc VietQR. API không nhận thẻ đã lưu. Mở trang chuyển khoản." },
      { n: "03", t: "Đối soát", d: "settlePledgeAsPaid cộng tiền một lần. Chưa đối soát thì không grant." },
      { n: "04", t: "Chứng từ", d: "Khách: TT-UH gửi Gmail. Đã login: Gmail và Kho đồ. Quà số: biên lai và Kho đồ." },
      { n: "05", t: "Reward", d: "Giao trong hạn, nhận đủ, chiến dịch chốt, chi trừ 8%." },
      { n: "06", t: "Hoàn", d: "Trễ SLA hoặc hụt goal kiểu AoN thì hoàn và revoke." },
    ],
  },
  {
    kicker: "ERD",
    title: "ERD — vòng gây quỹ lai",
    schema: [
      { title: "Định danh", items: ["users 1—1 kyc_info", "role ADMIN | BACKER | CREATOR_PENDING | CREATOR", "isOrganization, isAdmin"] },
      { title: "Gây quỹ", items: ["users 1—n projects 1—n campaigns", "campaigns 1—n rewards", "type REWARD hoặc DONATION", "fundingModel AoN | KIA"] },
      { title: "Dòng tiền", items: ["campaigns 1—n pledges", "pledges 1—1 certificates (TT-UH)", "pledges 1—1 invoices (INV-)", "pledges 1—n reward_digital_assets"] },
      { title: "Kiểm duyệt", items: ["campaign_reports", "audit_logs", "blacklist", "blog rejectionReason"] },
    ],
  },
  {
    kicker: "Schema",
    title: "Quan hệ và script Prisma",
    body: "Khóa đúng schema đang chạy. Không thêm bảng Kho đồ riêng — quà nằm reward_digital_assets.",
    table: {
      headers: ["Từ", "Đến", "Loại"],
      rows: [
        ["users", "campaigns", "1—n creatorId"],
        ["users", "pledges", "1—n userId. Null chỉ với đơn không quà."],
        ["campaigns", "pledges", "1—n"],
        ["pledges", "donation_certificates", "1—1 mã TT-UH"],
        ["pledges", "backer_invoices", "1—1 mã INV-"],
        ["users", "kyc_info", "1—1"],
      ],
    },
    tree: [
      { path: "model users", note: "role UserRole · isOrganization · isAdmin" },
      { path: "model kyc_info", note: "selfieImage · consentAt · ekycMeta · rejectedReason" },
      { path: "model campaigns", note: "feeRate mặc định 0.08 · fundingModel · status" },
      { path: "enum UserRole", note: "ADMIN BACKER CREATOR_PENDING CREATOR" },
      { path: "enum CampaignStatus", note: "DRAFT PENDING_REVIEW ACTIVE SUCCESS FAILED CANCELED" },
    ],
  },
  {
    kicker: "Module",
    title: "Module theo file đang chạy",
    tree: [
      { path: "src/lib/kyc.ts", note: "nộp và duyệt KYC" },
      { path: "src/lib/ekyc/cccd-qr.ts", note: "QR CCCD, chỉ điền form" },
      { path: "src/lib/platform-settings.ts", note: "ekyc_enabled, không sửa schema.prisma" },
      { path: "src/lib/digital-warehouse.ts", note: "grant và revoke Kho đồ" },
      { path: "src/lib/ship-sla.ts", note: "hạn giao + 2 ngày" },
      { path: "src/lib/money-buckets.ts", note: "giữ, chi, hoàn" },
      { path: "src/lib/redis.ts", note: "cache 300s, fail-open" },
      { path: "src/lib/payment/create-pledge.ts", note: "không quà: Gmail. có quà: session. BANK_ESCROW" },
    ],
  },
  {
    kicker: "Take rate",
    title: "Cách sàn thu — đang chạy, không cộng vào giá",
    body: "Take rate là phần sàn giữ khi chi, không phải khoản cộng thêm lúc backer trả.",
    table: {
      headers: ["Nhánh", "Backer trả", "Sàn giữ", "Creator nhận", "Lúc nào"],
      rows: [
        ["Reward", "Giá gói. Tip nếu có, tách riêng.", "8% trên phần Reward, feeRate 0.08.", "Phần còn lại sau 8%.", "Khi chiến dịch đã chốt và đơn đã nhận đủ."],
        ["Donation", "Khoản ủng hộ. Tip tự chọn.", "0% trên khoản ủng hộ. Tip là của sàn.", "Đủ khoản ủng hộ sau settle.", "TT-UH chỉ sau settle SUCCESS."],
        ["Hàng sẵn / COD", "Giá gói. Không tip.", "Không đi đường tip.", "Theo đơn COD nếu gói cho phép.", "Ẩn tip và ẩn radio COD khi không cho phép."],
      ],
    },
    bullets: [
      "Không gộp phí cổng vào phí sàn. Checkout hiện không trừ ví hay thẻ đã lưu.",
      "Không lấy mức Campfire ~17%, không lấy 0% của MB cho cả sàn, không bán gói quảng bá như Wadiz.",
    ],
  },
  {
    kicker: "Dịch vụ creator",
    title: "Giữ chân creator — cái đã có và cái chưa bán",
    cards: [
      { title: "Đã chạy", body: "Cập nhật chiến dịch, blog có hàng đợi duyệt, chat, hồ sơ xuất bản, thông báo, Kho đồ sau thanh toán." },
      { title: "Không bán", body: "Gói quay phim, gói marketing trọn, subscription tháng, gọi vốn cổ phần. Wadiz và Patreon chỉ là bài học, không phải lộ trình P0." },
      { title: "Chưa làm P0", body: "Xuất sao kê Excel, nhân bản campaign, tài khoản nhân viên, điểm uy tín tự động, banner hệ thống, admin phụ." },
    ],
    note: "Dịch vụ trả phí cho creator chỉ đưa vào sau khi take rate Reward 8% và đối soát STK chạy ổn. Chưa ghi thành doanh thu hiện tại.",
  },
  {
    kicker: "Test",
    title: "PCA, Test Plan, TR/TC",
    body: "Baseline PRD 07/09/2026. Test lead: Nguyễn Quách Phú Tài. Không đưa Web3, chatbot, PayPal vào P0.",
    table: {
      headers: ["TR", "Việc", "Kỳ vọng"],
      rows: [
        ["TR-01", "Donation khách / đã login", "Khách: chỉ Gmail. Đã login: Gmail và Kho đồ. Không COD."],
        ["TR-02", "Đặt quà chưa login", "API 401. Không tạo pledge."],
        ["TR-03", "Settle SUCCESS không quà", "Khách: mã TT-UH gửi email. Đã login: email và Kho đồ."],
        ["TR-04", "Hoàn Reward", "Revoke Kho đồ. Sao kê còn dòng hoàn."],
        ["TR-05", "Tắt eKYC", "Form tay. API eKYC 403."],
        ["TR-06", "Chưa KYC", "Campaign không ACTIVE."],
        ["TR-07", "Reject không lý do", "Không ghi REJECTED."],
        ["TR-08", "Redis chết", "Trang campaign vẫn đọc DB."],
        ["TR-09", "paymentMethodId", "API 400. Không trừ thẻ đã lưu."],
        ["TR-10", "Settle lần hai", "Không grant thêm asset cho cùng pledge."],
      ],
    },
    bullets: [
      "Biên bản test phải ghi ngày, commit, môi trường. Không ghi 100% pass nếu chưa chạy lại.",
    ],
  },
  {
    kicker: "Deploy",
    title: "Database server và web server",
    cards: [
      { title: "Neon Postgres", body: "Sổ chính: users, KYC, campaigns, pledges, invoices, certificates, presentation. Biến DATABASE_URL." },
      { title: "Mongo và Redis", body: "Mongo cho chat. Redis chỉ cache campaigns và stats, TTL 300 giây, fail-open." },
      { title: "Vercel", body: "Next.js App Router. Demo platform-seven-navy-44.vercel.app. Checkout BANK_ESCROW, trang chuyển khoản STK trung gian." },
    ],
    steps: [
      { n: "01", t: "Build", d: "Push main. prisma generate. Không commit .env." },
      { n: "02", t: "Migrate", d: "Đồng bộ Neon với schema. Không dùng file schema placeholder." },
      { n: "03", t: "STK trung gian", d: "Khai tài khoản escrow. Checkout mở trang chuyển khoản, không cổng thanh toán ngoài." },
      { n: "04", t: "Smoke", d: "Một Guest Gmail không quà, một Reward có login, một reject có lý do." },
    ],
  },
  {
    kicker: "Chương 5",
    title: "Đánh giá đủ mục thầy",
    table: {
      headers: ["Mục", "Mức"],
      rows: [
        ["Khảo sát 6 mục và bài học 9 sàn", "Đủ"],
        ["Bảng có cột Tử Tế Fund và vì sao", "Đủ"],
        ["Bức tranh lớn: ai tham gia, đã có, còn thiếu, 8 bước", "Đủ sau khảo sát"],
        ["Actor người, tổ chức, hệ thống kèm AC", "Đủ"],
        ["User story Guest, Backer, Creator, Admin, System", "Đủ, mỗi story 3 AC"],
        ["Thẻ chức năng ngay sau story", "Đủ, có cột đang chạy / chưa làm"],
        ["User flow 4 lane", "Đủ chữ. Ảnh Guest và Creator đã có. Mã PlantUML không chiếu"],
        ["Use case, đặc tả UC-01 đến UC-03, activity", "Đủ"],
        ["ERD, schema, module", "Đủ lõi đang chạy"],
        ["Take rate và dịch vụ creator", "Đủ: 8% và 0% đang chạy. Gói trả phí chưa bán"],
        ["Test và deploy", "Khung đủ. Số pass phải chạy lại"],
      ],
    },
    bullets: [
      "Slide kinh doanh phía trước không bị thay. Phụ lục này thay phụ lục cũ mỗi lần mở thuyết trình.",
    ],
  },
];
