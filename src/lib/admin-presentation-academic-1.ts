import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_1: PresentationSlide[] = [
  {
    kicker: "Chương 1",
    title: "Phụ lục học thuật — nối sau 20 slide kinh doanh",
    body: "Bộ kinh doanh giữ nguyên 20 slide, không ghi đè. Phụ lục bắt đầu ở slide 21. Bộ giới thiệu nối sau phụ lục, không còn cố định ở slide 50.",
    steps: [
      { n: "01", t: "Bối cảnh", d: "Ai tham gia, đã có gì, còn thiếu gì." },
      { n: "02", t: "Khảo sát", d: "9 sàn, 6 mục, bảng vì sao." },
      { n: "03", t: "Hệ thống", d: "Đầu vào, xử lý, đầu ra, vòng đời." },
      { n: "04", t: "Actor + story", d: "Người, tổ chức, hệ thống. AC ngay dưới." },
      { n: "05", t: "Màn hình", d: "Story chiếu sang route đang chạy." },
      { n: "06", t: "Flow → thiết kế", d: "4 lane, use case, ERD, test, deploy." },
    ],
    bullets: [
      "Không copy nghiệp vụ sàn phế liệu. Chỉ học mật độ: 6 mục khảo sát, AC dưới actor, mỗi story có AC, chức năng ra màn hình.",
      "Việc chưa làm ghi là chưa làm. Không đưa EPR, bảng giá, e-Manifest, ví escrow vào Tử Tế Fund.",
    ],
  },
  {
    kicker: "Bức tranh lớn",
    title: "Ai tham gia — và bài toán còn thiếu",
    body: "Bức tranh tổ chức, không phải sơ đồ nối hộp. Sàn là bên thứ ba giữ chứng từ và tiền trung gian, không trở thành người bán.",
    lanes: [
      {
        title: "Guest / Backer",
        tone: "emerald",
        steps: ["Xem campaign ACTIVE", "Ủng hộ không quà bằng Gmail", "Đặt quà khi đã đăng nhập", "Nhận TT-UH hoặc Kho đồ"],
      },
      {
        title: "Creator cá nhân / tổ chức",
        tone: "navy",
        steps: ["CCCD hoặc MST/GPKD", "Tạo campaign DRAFT", "Chờ ACTIVE", "Giao hàng và xem sao kê"],
      },
      {
        title: "Admin + System",
        tone: "rose",
        steps: ["Duyệt KYC, campaign, blog", "Settle STK trung gian", "Cấp TT-UH / INV-", "Hoàn đúng đơn trễ"],
      },
    ],
    blocks: [
      {
        heading: "Đã có ở Việt Nam",
        headingTone: "navy",
        bullets: [
          "Fanpage, form, Excel biết ai chuyển, bao nhiêu, ngày nào. Không có escrow theo đơn.",
          "Kickstarter, Indiegogo, GoFundMe, Patreon đã chứng minh nhu cầu, nhưng kẹt Stripe, PayPal, hộ chiếu.",
          "Comicola làm Reward văn hóa. Thiện Nguyện MB và GiveNow làm ủng hộ, sao kê, chứng từ. Không mở pre-order trên cùng chiến dịch.",
          "VietQR, NAPAS, ví, CCCD, MST đã có. Chưa có sàn nhà nước đặt hàng cho crowdfunding lai.",
        ],
      },
      {
        heading: "Tử Tế Fund làm chỗ còn thiếu",
        headingTone: "emerald",
        bullets: [
          "Một chiến dịch vừa ủng hộ không quà vừa đặt trước có quà.",
          "Giữ tiền theo từng đơn trên STK trung gian. Một đơn trễ không khóa đơn đã giao xong.",
          "SLA = hạn cam kết + 2 ngày. Chứng từ tách: TT-UH cho Donation, INV- cho Reward.",
          "Kho đồ gắn tài khoản đã đăng nhập. Khách không quà chỉ nhận giấy qua Gmail.",
        ],
      },
    ],
    note: "Không làm cổ phần, không làm thuần thiện nguyện, không bán gói quay phim.",
  },
  {
    kicker: "Khảo sát",
    title: "Khung khảo sát — 6 mục",
    body: "Mỗi sàn đối chiếu cùng một khung, rồi mới rút một quyết định mang về Tử Tế Fund. Số quy mô là ước tính đã dùng ở slide kinh doanh, không phải báo cáo đã kiểm toán.",
    table: {
      headers: ["Mục", "Hỏi gì", "Không viết"],
      rows: [
        ["Định hướng", "Sàn giải quyết ngách nào, cho ai", "Không chép mô tả marketing"],
        ["Mô hình vận hành", "Ai giữ tiền, thu phí lúc nào", "Không gộp phí cổng vào phí sàn"],
        ["Chức năng chính", "Việc user làm được trên sản phẩm", "Không liệt kê mọi nút"],
        ["Ưu điểm", "Chỗ đã chứng minh trên thị trường", "Không khen chung chung"],
        ["Nhược điểm", "Chỗ creator hoặc backer Việt bị kẹt", "Không đổ lỗi ngoài phạm vi"],
        ["Bài học áp dụng", "Một quyết định cụ thể của Tử Tế Fund", "Không copy nguyên mô hình"],
      ],
    },
  },
  {
    kicker: "Khảo sát",
    title: "Kickstarter, Indiegogo, GoFundMe",
    blocks: [
      {
        heading: "1. Kickstarter (Mỹ)",
        bullets: [
          "Định hướng: gọi vốn Reward cho phần cứng, game, phim, thiết kế, sách.",
          "Mô hình: All-or-Nothing. Phí sàn 5% khi thành công, cộng phí Stripe khoảng 3–5%.",
          "Chức năng: reward tiers, goal, cộng đồng backer toàn cầu, không escrow theo SLA giao hàng.",
          "Ưu: thương hiệu Reward số 1, backer quốc tế, gói quà rõ.",
          "Nhược: KYC và Stripe chặn creator Việt; giữ cả chiến dịch; tỷ lệ trượt goal cao.",
          "Bài học: lấy All-or-Nothing và gói Reward. Không dùng Stripe. Giữ tiền theo từng đơn.",
        ],
      },
      {
        heading: "2. Indiegogo (Mỹ)",
        bullets: [
          "Định hướng: gadget và cả dự án cá nhân, cứu trợ; có bán tiếp sau chiến dịch (InDemand).",
          "Mô hình: creator chọn All-or-Nothing hoặc Keep-It-All. Phí sàn khoảng 5%.",
          "Chức năng: hai kiểu giữ tiền, pre-order sau khi đóng chiến dịch, gói quảng bá.",
          "Ưu: linh hoạt hơn Kickstarter, có đường bán tiếp.",
          "Nhược: kiểm duyệt lỏng hơn nên dễ bùng hàng; vẫn kẹt cổng ngoại.",
          "Bài học: cho chọn AoN hoặc KIA. Campaign chỉ ACTIVE sau admin. Chưa mở chợ bán tiếp kiểu InDemand.",
        ],
      },
      {
        heading: "3. GoFundMe (Mỹ)",
        bullets: [
          "Định hướng: thuần cho đi — y tế, học phí, thiên tai. Không bán hàng.",
          "Mô hình: 0% phí bắt buộc với creator. Doanh thu từ tip tự chọn lúc checkout.",
          "Chức năng: trang hoàn cảnh, chia sẻ, biên lai ngoại.",
          "Ưu: niềm tin vì không cắt khoản quyên góp.",
          "Nhược: không Reward, không pre-order, không phủ creator Việt.",
          "Bài học: nhánh Donation không chiết khấu khoản ủng hộ, tip tự chọn. Reward vẫn thu 8%.",
        ],
      },
    ],
  },
  {
    kicker: "Khảo sát",
    title: "Patreon, Campfire, Wadiz",
    blocks: [
      {
        heading: "4. Patreon (Mỹ)",
        bullets: [
          "Định hướng: membership nội dung số, trả tiền theo tháng.",
          "Mô hình: subscription. Hoa hồng khoảng 5% / 8% / 12% tùy gói.",
          "Chức năng: cấp nội dung độc quyền, thu định kỳ, cộng đồng fan.",
          "Ưu: doanh thu lặp lại.",
          "Nhược: không gom vốn một lần để sản xuất hoặc nhập hàng.",
          "Bài học: không lấy subscription làm lõi. Form tạo không set type, mặc định REWARD. Giữ chân bằng cập nhật và blog.",
        ],
      },
      {
        heading: "5. Campfire (Nhật)",
        bullets: [
          "Định hướng: văn hóa nội địa Nhật — anime, manga, F&B, thủ công, game indie.",
          "Mô hình: phí sàn khoảng 12% cộng phí cổng khoảng 5%. Thanh toán cả tiền mặt tại konbini.",
          "Chức năng: gọi vốn nội địa, gói truyền thông trong nước.",
          "Ưu: người Nhật trả được bằng kênh họ đang có.",
          "Nhược: khép thị trường Nhật, phí cao.",
          "Bài học: nội địa hóa thanh toán. Bốn kênh trên màn, tiền vào STK trung gian. Không lấy mức phí ~17%.",
        ],
      },
      {
        heading: "6. Wadiz (Hàn)",
        bullets: [
          "Định hướng: pre-order thương mại. Nhánh Partner là equity.",
          "Mô hình: phí khoảng 7–15% theo gói, cộng phí kiểm định và marketing.",
          "Chức năng: duyệt hàng trước khi lên sàn, gói quảng bá trọn gói.",
          "Ưu: pre-order mạnh, có kiểm hàng.",
          "Nhược: phí nặng với creator nhỏ; equity đòi pháp nhân Hàn.",
          "Bài học: học pre-order và cam kết giao hàng. Không làm cổ phần. Không bán gói quay phim.",
        ],
      },
    ],
  },
  {
    kicker: "Khảo sát",
    title: "Comicola, Thiện Nguyện MB, GiveNow",
    blocks: [
      {
        heading: "7. Comicola (Việt Nam)",
        bullets: [
          "Định hướng: truyện, boardgame, nhạc indie, vật phẩm văn hóa.",
          "Mô hình: phí gây quỹ khoảng 8–10% khi thành công, sau đó có thể phân phối vật lý.",
          "Chức năng: gọi vốn fandom Việt, hỗ trợ in và phát hành.",
          "Ưu: hiểu người mua nội địa, có dự án lớn.",
          "Nhược: hẹp ngách nghệ thuật, thiếu escrow theo SLA, công cụ còn đơn.",
          "Bài học: phí Reward 8% bám khoảng này. Bổ sung giữ tiền theo đơn và SLA + 2 ngày. Không khóa sàn vào comic.",
        ],
      },
      {
        heading: "8. Thiện Nguyện MB (Việt Nam)",
        bullets: [
          "Định hướng: 100% nhân đạo — trường vùng cao, mổ tim, cứu trợ.",
          "Mô hình: 0% phí nền tảng. Ngân hàng được CASA và người dùng app.",
          "Chức năng: sao kê realtime, tài khoản minh bạch.",
          "Ưu: niềm tin cộng đồng rất cao.",
          "Nhược: không Reward, không khởi nghiệp thương mại.",
          "Bài học: sao kê không xóa lịch sử, dòng hoàn nhìn thấy được. Không copy 0% cho cả sàn.",
        ],
      },
      {
        heading: "9. Kindmate / GiveNow (Việt Nam)",
        bullets: [
          "Định hướng: NGO, bảo tồn, giáo dục, sinh kế.",
          "Mô hình: phí kỹ thuật khoảng 3–5%, cộng tài trợ quỹ và CSR.",
          "Chức năng: kết nối tổ chức, chứng từ quyên góp.",
          "Ưu: chứng từ rõ cho bên cho đi.",
          "Nhược: truyền thông yếu, không pre-order.",
          "Bài học: Donation có giấy TT-UH sau khi admin chốt tiền. TT-UH không thay hóa đơn GTGT.",
        ],
      },
    ],
  },
  {
    kicker: "Khảo sát",
    title: "Bảng so sánh — cột hệ thống của tôi",
    body: "Cột cuối là quyết định, không chỉ điền tên tính năng.",
    table: {
      headers: ["Tiêu chí", "Sàn ngoại", "Sàn VN", "Tử Tế Fund", "Vì sao"],
      rows: [
        [
          "Thanh toán",
          "Stripe, thẻ, PayPal. FX khoảng 3–5%.",
          "Chuyển khoản, app ngân hàng.",
          "Ví, thẻ quốc tế, NAPAS, VietQR. Đơn ONLINE là BANK_ESCROW.",
          "API từ chối paymentMethodId. Tiền vào STK trung gian, không về thẳng creator.",
        ],
        [
          "KYC / KYB",
          "Hộ chiếu, SSN, địa chỉ nước ngoài.",
          "Thủ công hoặc không có.",
          "CCCD. eKYC tắt được về form tay. Tổ chức nộp MST / GPKD.",
          "QR mặt sau chỉ điền form, không gọi CSDL quốc gia.",
        ],
        [
          "Giữ tiền",
          "Thường giữ cả chiến dịch.",
          "Ít escrow theo từng đơn.",
          "Giữ theo pledge. Chi khi chiến dịch đã chốt và đơn đã nhận đủ.",
          "Một đơn trễ không khóa tiền của đơn đã giao xong.",
        ],
        [
          "Chứng từ",
          "Biên lai nước ngoài.",
          "Sao kê hoặc hóa đơn tự phát.",
          "TT-UH sau settle SUCCESS. Reward có INV-.",
          "Ủng hộ không được ghi thành mua hàng. Sàn không xuất hóa đơn GTGT thay creator.",
        ],
        [
          "Kho quà",
          "Pledge Manager sau chiến dịch.",
          "Giao tay, fanpage.",
          "Khách: Gmail. Đã login: Kho đồ. Hoàn thì revoke.",
          "Kho gắn tài khoản, không phụ thuộc tin nhắn.",
        ],
        [
          "Cách thu",
          "Phí 5% hoặc tip GoFundMe.",
          "8–10% hoặc 0% vì CSR ngân hàng.",
          "Reward 8% trừ lúc chi. Donation 0% trên khoản ủng hộ, tip tự chọn.",
          "Không cộng phí sàn vào giá backer.",
        ],
      ],
    },
  },
  {
    kicker: "Bức tranh lớn",
    title: "Bức tranh hệ thống — 8 bước một chiến dịch",
    body: "Đặt sau khảo sát. Đây là vòng đời đang chạy, không phải kiến trúc vi dịch vụ.",
    cards: [
      { title: "Đầu vào", body: "Email khách hoặc session, CCCD hoặc MST/GPKD, campaign, gói hoặc không quà, tip, bốn kênh checkout." },
      { title: "Xử lý", body: "Duyệt KYC và campaign. Pledge PENDING. settlePledgeAsPaid mới SUCCESS. Escrow theo đơn. SLA. Hoàn hoặc chi." },
      { title: "Đầu ra", body: "Campaign public, TT-UH hoặc INV-, sao kê, thông báo. Tiền ở STK trung gian đến khi đủ điều kiện chi." },
    ],
    lanes: [
      {
        title: "Tám bước",
        tone: "navy",
        steps: [
          "Creator nộp CCCD hoặc MST. QR chỉ điền form.",
          "Admin VERIFIED. Reject thì có lý do.",
          "Campaign DRAFT, goal > 0, rồi PENDING_REVIEW.",
          "Admin cho ACTIVE. Trước đó không nhận pledge.",
          "Backer hoặc khách trả ONLINE. Pledge PENDING, trang chuyển khoản.",
          "Admin settle SUCCESS. Khách nhận TT-UH qua Gmail. Đã login thì thêm Kho đồ.",
          "Reward giao trong hạn, nhận đủ, chiến dịch đã chốt thì chi, trừ 8%.",
          "Trễ SLA hoặc hụt goal kiểu AoN thì hoàn đúng đơn và revoke quà.",
        ],
      },
    ],
    note: "Redis chỉ cache danh sách 300 giây. Mongo chỉ chat. Không giữ sổ tiền.",
  },
];
