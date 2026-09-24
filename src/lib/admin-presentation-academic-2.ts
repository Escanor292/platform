import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_2: PresentationSlide[] = [
  {
    kicker: "Actor",
    title: "Actor người — loại, việc, điều kiện",
    body: "Loại Người: một tài khoản cá nhân, hoặc khách chưa có users.id. Điều kiện chấp nhận nằm ngay dưới actor, không để sang story.",
    blocks: [
      {
        heading: "Guest — Người, chưa có users.id",
        bullets: [
          "Việc: xem campaign public, tìm kiếm, đọc blog đã xuất bản, bấm ủng hộ thì bị đưa tới đăng nhập.",
          "AC1: listing public chỉ chiến dịch ACTIVE. DRAFT và PENDING_REVIEW không hiện.",
          "AC2: không session thì không vào dashboard creator, sao kê, Kho đồ.",
          "AC3: có email hợp lệ thì tạo được pledge khi chưa đăng nhập. userId để null. Không email thì không tạo đơn.",
        ],
      },
      {
        heading: "Backer — Người, role BACKER",
        bullets: [
          "Việc: ủng hộ không quà, đặt Reward, tip, chat, Kho đồ, nhận TT-UH hoặc INV-.",
          "AC1: campaign phải ACTIVE, còn hạn, còn suất. Số tiền pledge > 0.",
          "AC2: không quà, hoặc gói không cho COD, thì method chỉ ONLINE. Không hiện radio COD.",
          "AC3: chưa settlePledgeAsPaid thì không cộng currentAmount, không grant Kho đồ, không cấp chứng từ.",
        ],
      },
      {
        heading: "Creator cá nhân — Người, CREATOR_PENDING rồi CREATOR",
        bullets: [
          "Việc: nộp CCCD, tạo project/campaign/reward, cập nhật, sao kê, xác nhận giao hàng.",
          "AC1: chưa VERIFIED thì không đưa campaign lên ACTIVE.",
          "AC2: form KYC thiếu ảnh CCCD thì API từ chối khi eKYC đang bật.",
          "AC3: sao kê chỉ thêm dòng. Không xóa lịch sử thu, hoàn, chi.",
        ],
      },
      {
        heading: "Admin — Người, role ADMIN và isAdmin",
        bullets: [
          "Việc: duyệt KYC, campaign, blog; settle BANK_ESCROW; bật/tắt eKYC; khóa user.",
          "AC1: từ chối KYC, campaign hoặc blog thì bắt buộc có lý do. Không reject rỗng.",
          "AC2: TT-UH chỉ phát khi settle SUCCESS. Bấm duyệt campaign không ra giấy ủng hộ.",
          "AC3: tắt eKYC thì form tay vẫn nhận. API eKYC trả 403.",
        ],
      },
    ],
  },
  {
    kicker: "Actor",
    title: "Actor tổ chức",
    body: "Loại Tổ chức: users.isOrganization. Cùng role với cá nhân, khác hồ sơ pháp lý. Sàn không trở thành người bán.",
    blocks: [
      {
        heading: "Creator doanh nghiệp / HKD — Tổ chức",
        bullets: [
          "Việc: nộp GPKD và MST (eKYB), gọi vốn, xuất chứng từ với tư cách người bán.",
          "AC1: hồ sơ tổ chức chưa duyệt thì không được coi là VERIFIED để public chiến dịch.",
          "AC2: QR hoặc MST chỉ điền form. Không tự kết luận doanh nghiệp hợp pháp nếu admin chưa duyệt.",
          "AC3: hóa đơn GTGT nếu có là của creator. INV- của sàn chỉ là biên lai đối chiếu.",
        ],
      },
      {
        heading: "Backer tổ chức — Tổ chức, role BACKER",
        bullets: [
          "Việc: ủng hộ hoặc đặt hàng dưới tên tổ chức, xem Kho đồ và chứng từ của tài khoản đó.",
          "AC1: cùng rule tiền với backer cá nhân. Không có luồng cổ phần, không chia lợi nhuận.",
          "AC2: Donation vẫn chờ settle mới có TT-UH. Tên trên giấy lấy từ hồ sơ đã lưu, không gõ tay lúc checkout.",
          "AC3: tổ chức không vào màn admin và không settle hộ.",
        ],
      },
    ],
  },
  {
    kicker: "Actor",
    title: "Actor hệ thống",
    body: "Loại Hệ thống: không có người bấm. Màn hình có bốn kênh. Sổ tiền chỉ đổi khi đối soát STK trung gian.",
    table: {
      headers: ["Hệ thống", "Việc", "Điều kiện chấp nhận"],
      rows: [
        [
          "OnlinePaymentPicker + create-pledge",
          "Bốn kênh: ví MoMo/ZaloPay/VNPay, thẻ quốc tế, NAPAS, VietQR. API trả BANK_ESCROW và trang chuyển khoản.",
          "Gửi paymentMethodId thì 400 ESCROW_BANK_ONLY. payos.ts và sepay.ts không tạo đơn. VNPay chỉ là tab ví, không redirect cổng.",
        ],
        [
          "App + Neon Postgres",
          "Ghi user, KYC, campaign, pledge, invoice, certificate, Kho đồ.",
          "Pledge PENDING chưa cộng currentAmount. SUCCESS mới cộng. FAILED không grant.",
        ],
        [
          "Kho đồ + chứng từ",
          "Grant reward khi SUCCESS. Donation hiện thẻ chờ. Settle SUCCESS mới ra TT-UH.",
          "Hoàn thì revoke asset. Chứng từ donation không hiện trên màn hình thanh toán thành công như hàng số.",
        ],
        [
          "Redis",
          "Cache GET /api/campaigns và /api/stats, TTL 300 giây.",
          "Fail-open: Redis chết thì đọc DB. Không giữ session, không khóa payout. Xóa cache khi POST campaign.",
        ],
        [
          "MongoDB Atlas",
          "Chat và nội dung linh hoạt.",
          "Không giữ sổ tiền.",
        ],
        [
          "Cloudinary",
          "Ảnh campaign và ảnh CCCD.",
          "Không tự quyết định KYC. Ảnh không thay cho trạng thái VERIFIED.",
        ],
      ],
    },
  },
  {
    kicker: "User Story",
    title: "User Story + AC — Guest",
    body: "As a [Role], I want [việc], so that [lợi ích]. Mỗi story có 3 AC đo được.",
    blocks: [
      {
        heading: "US-G01 — Xem chiến dịch khi chưa đăng nhập",
        bullets: [
          "As a Guest, I want xem danh sách và chi tiết chiến dịch đang mở, so that quyết định có ủng hộ.",
          "AC1: /projects và API public chỉ trả campaign ACTIVE.",
          "AC2: campaign DRAFT của người khác trả không tìm thấy với khách.",
          "AC3: bộ lọc category là khớp đúng nhãn, không tìm gần đúng.",
        ],
      },
      {
        heading: "US-G02 — Đăng ký",
        bullets: [
          "As a Guest, I want tạo tài khoản, so that ủng hộ và giữ Kho đồ.",
          "AC1: đăng ký qua NextAuth. Role mặc định BACKER, chưa phải CREATOR.",
          "AC2: email đã tồn tại thì không tạo user thứ hai.",
          "AC3: đăng nhập không bắt buộc để tạo pledge. Email hợp lệ là đủ. Kho đồ gắn user khi có session.",
        ],
      },
      {
        heading: "US-G03 — Ủng hộ khi chưa có session",
        bullets: [
          "As a Guest, I want ủng hộ bằng email khi chưa có tài khoản, so that không bỏ lỡ khoản cho đi.",
          "AC1: create-pledge nhận guestEmail, userId = null, vẫn insert pledge PENDING.",
          "AC2: thiếu email hợp lệ thì 400, không tạo đơn và không mở trang chuyển khoản.",
          "AC3: khách không vào dashboard, sao kê hay hàng đợi admin.",
        ],
      },
      {
        heading: "US-G04 — Đọc blog public",
        bullets: [
          "As a Guest, I want đọc bài đã xuất bản, so that hiểu dự án trước khi cho tiền.",
          "AC1: bài PENDING_REVIEW không lên trang public.",
          "AC2: bài đã publish đọc được không cần role ADMIN.",
          "AC3: khách không mở được hàng đợi duyệt /dashboard/admin/blog.",
        ],
      },
    ],
  },
  {
    kicker: "User Story",
    title: "User Story + AC — Backer",
    blocks: [
      {
        heading: "US-B01 — Ủng hộ không quà",
        bullets: [
          "As a Backer, I want chọn ví, thẻ, NAPAS hoặc VietQR rồi chuyển khoản STK trung gian, so that có TT-UH sau khi đối soát.",
          "AC1: gói không quà luôn ONLINE. Form không hiện radio COD.",
          "AC2: trước settle, /purchases chỉ là thẻ chờ, chưa có mã TT-UH.",
          "AC3: settlePledgeAsPaid SUCCESS thì có TT-UH. Đơn còn PENDING thì không giấy, không cộng tiền. Không có webhook PayOS.",
        ],
      },
      {
        heading: "US-B02 — Đặt Reward và mở Kho đồ",
        bullets: [
          "As a Backer, I want đặt gói quà và xem Kho đồ, so that biết quà đã vào hay còn chờ giao.",
          "AC1: settle SUCCESS và quà thuộc loại số thì grantDigitalWarehouseItem, href /purchases. Quà vật lý không cấp asset số.",
          "AC2: thông báo dạng đã vào kho, không ghi nhầm là giấy ủng hộ.",
          "AC3: hết suất hoặc hết hạn thì không tạo pledge mới.",
        ],
      },
      {
        heading: "US-B03 — Hoàn khi trễ hạn giao",
        bullets: [
          "As a Backer, I want được hoàn nếu creator trễ hạn, so that tiền không kẹt.",
          "AC1: hạn tính theo ship-sla = hạn cam kết + 2 ngày.",
          "AC2: hoàn thì trạng thái tiền đổi và revoke asset Kho đồ.",
          "AC3: đơn đã nhận đủ và chiến dịch đã chốt thì không hoàn chỉ vì đơn khác trễ.",
        ],
      },
      {
        heading: "US-B04 — Tip",
        bullets: [
          "As a Backer, I want chọn tip, so that trả thêm cho sàn mà không bị cộng vào giá gói.",
          "AC1: mức gợi ý 0 / 5 / 10 / 15, kéo 0–100%, nhập số 0–1000.",
          "AC2: gói hàng sẵn và đơn COD không hiện tip.",
          "AC3: tip không đổi feeRate 8% của phần Reward khi chi creator.",
        ],
      },
      {
        heading: "US-B05 — Chat với creator",
        bullets: [
          "As a Backer, I want nhắn creator trong thread, so that hỏi hạn giao mà không đưa ra mạng xã hội.",
          "AC1: chỉ user đã đăng nhập mở thread của mình.",
          "AC2: cuộc gọi kết thúc ghi một trong bốn: completed, rejected, missed, cancelled.",
          "AC3: nội dung chat nằm Mongo, không ghi đè số tiền trên Postgres.",
        ],
      },
      {
        heading: "US-B06 — Báo cáo chiến dịch",
        bullets: [
          "As a Backer, I want báo cáo campaign sai phạm, so that admin thấy hàng đợi chứ không chỉ tin nhắn riêng.",
          "AC1: chưa đăng nhập thì không gửi report.",
          "AC2: report gắn campaign và người gửi.",
          "AC3: gửi report không tự ẩn campaign. Chỉ admin đổi trạng thái.",
        ],
      },
    ],
  },
  {
    kicker: "User Story",
    title: "User Story + AC — Creator",
    blocks: [
      {
        heading: "US-C01 — Nộp KYC cá nhân",
        bullets: [
          "As a Creator, I want nộp CCCD rồi chờ duyệt, so that được mở chiến dịch.",
          "AC1: eKYC bật mà thiếu ảnh CCCD thì submit bị từ chối.",
          "AC2: QR mặt sau chỉ điền form. Không gọi CSDL dân cư.",
          "AC3: PENDING hoặc REJECTED thì campaign không ACTIVE. Reject có rejectedReason.",
        ],
      },
      {
        heading: "US-C02 — Một campaign vừa cho đi vừa đặt hàng",
        bullets: [
          "As a Creator, I want mở cả ủng hộ không quà và gói Reward trên một chiến dịch, so that không phải làm hai trang.",
          "AC1: nhánh Donation ra TT-UH sau settle. Nhánh Reward ra INV- và Kho đồ.",
          "AC2: form tạo không bắt chọn type. Bản ghi mặc định REWARD nếu không set.",
          "AC3: goal phải lớn hơn 0. Thiếu ảnh thì không qua duyệt.",
        ],
      },
      {
        heading: "US-C03 — Sao kê",
        bullets: [
          "As a Creator, I want xem sao kê không xóa được dòng cũ, so that đối soát với STK trung gian.",
          "AC1: mỗi pledge SUCCESS, hoàn, chi là một dòng mới.",
          "AC2: creator không sửa số tiền đối soát đã ghi.",
          "AC3: creator khác không xem sao kê này.",
        ],
      },
      {
        heading: "US-C04 — Xác nhận giao hàng",
        bullets: [
          "As a Creator, I want xác nhận đã gửi hoặc sẵn sàng nhận tại chỗ, so that đơn đủ điều kiện chi sau khi chiến dịch chốt.",
          "AC1: chưa ACTIVE thì không có pledge để giao.",
          "AC2: quá hạn SLA thì đơn đó đi hướng hoàn, không chi.",
          "AC3: phiếu trong Kho đồ không bị coi là chưa giao chỉ vì khách chưa quét tại quán.",
        ],
      },
      {
        heading: "US-C05 — Cập nhật tiến độ",
        bullets: [
          "As a Creator, I want đăng cập nhật chiến dịch, so that backer thấy việc đang làm.",
          "AC1: CAMPAIGN_UPDATE được publish khi KYC VERIFIED.",
          "AC2: PLATFORM, ANNOUNCEMENT, STORY, IMPACT_REPORT vào PENDING_REVIEW.",
          "AC3: bài bị reject lưu rejectionReason, reviewedAt, reviewedBy.",
        ],
      },
      {
        heading: "US-C06 — KYB tổ chức",
        bullets: [
          "As a Creator tổ chức, I want nộp MST và GPKD, so that hồ sơ pháp nhân được duyệt trước khi gọi vốn.",
          "AC1: isOrganization khác cá nhân chỉ CCCD.",
          "AC2: admin chưa duyệt thì không VERIFIED.",
          "AC3: sàn không tự xuất hóa đơn GTGT thay tổ chức.",
        ],
      },
    ],
  },
  {
    kicker: "User Story",
    title: "User Story + AC — Admin và System",
    blocks: [
      {
        heading: "US-A01 — Bật tắt eKYC",
        bullets: [
          "As an Admin, I want tắt eKYC khi API lỗi, so that creator vẫn nộp hồ sơ tay.",
          "AC1: công tắc ở /dashboard/admin/system, lưu platform_settings.ekyc_enabled.",
          "AC2: OFF thì /kyc hiện form tay. API eKYC 403.",
          "AC3: mặc định ON. Không cần sửa prisma/schema.prisma cho cờ này.",
        ],
      },
      {
        heading: "US-A02 — Settle tiền ủng hộ",
        bullets: [
          "As an Admin, I want settle BANK_ESCROW, so that TT-UH chỉ ra khi khoản ủng hộ đã được chốt.",
          "AC1: settle SUCCESS mới insert certificate TT-UH.",
          "AC2: settle không chạy từ tài khoản Backer.",
          "AC3: pledge Reward không đi đường TT-UH.",
        ],
      },
      {
        heading: "US-A03 — Từ chối có lý do",
        bullets: [
          "As an Admin, I want từ chối KYC, campaign hoặc blog kèm lý do, so that người gửi biết sửa gì.",
          "AC1: lý do rỗng thì không ghi REJECTED.",
          "AC2: campaign reject không lên /projects.",
          "AC3: blog reject hiện ở hàng đợi admin và bài của tác giả.",
        ],
      },
      {
        heading: "US-A04 — Khóa user",
        bullets: [
          "As an Admin, I want khóa tài khoản vi phạm, so that không pledge và không đăng campaign tiếp.",
          "AC1: user BANNED không tạo pledge mới.",
          "AC2: khóa không xóa pledge và chứng từ cũ.",
          "AC3: thao tác admin ghi audit log.",
        ],
      },
      {
        heading: "US-S01 — Đối soát ghi Kho đồ",
        bullets: [
          "As the System, I want grant Kho đồ khi settle SUCCESS của pledge quà số, so that backer thấy quà sau khi tiền vào STK.",
          "AC1: settlePledgeAsPaid cộng currentAmount đúng một lần.",
          "AC2: đơn PENDING hoặc FAILED không grant, không cộng tiền.",
          "AC3: gọi settle lần hai không tạo thêm asset cho cùng pledge.",
        ],
      },
      {
        heading: "US-S02 — Hoàn thì gỡ quà",
        bullets: [
          "As the System, I want revoke asset khi hoàn, so that Kho đồ không còn quà của đơn đã trả tiền lại.",
          "AC1: refund gọi revoke.",
          "AC2: certificate TT-UH không sinh từ refund.",
          "AC3: dòng sao kê hoàn vẫn còn, không xóa dòng thu cũ.",
        ],
      },
      {
        heading: "US-S03 — Cache danh sách",
        bullets: [
          "As the System, I want cache danh sách campaign 300 giây, so that trang chủ không đọc DB mỗi request.",
          "AC1: key campaigns và stats TTL 300s.",
          "AC2: POST campaign xóa prefix cache.",
          "AC3: Redis lỗi thì vẫn trả DB, không 500 cả trang.",
        ],
      },
      {
        heading: "US-S04 — Chưa SUCCESS thì chưa có đầu ra",
        bullets: [
          "As the System, I want chặn chứng từ và Kho đồ trước SUCCESS, so that QR chưa trả không thành quà.",
          "AC1: PENDING không có TT-UH, không có asset.",
          "AC2: SUCCESS của khoản không quà chính là lúc settle — TT-UH ra trong lần đó, không chờ thêm một webhook.",
          "AC3: màn hình thanh toán thành công của donation không ghi là đã nhận sản phẩm số.",
        ],
      },
    ],
  },
];
