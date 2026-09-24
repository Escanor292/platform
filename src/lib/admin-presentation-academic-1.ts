import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_1: PresentationSlide[] = [
  {
    kicker: "Chương 1",
    title: "Phụ lục học thuật — nối sau bộ kinh doanh",
    body: "Bộ kinh doanh hiện 19 slide, không ghi đè. Phụ lục bắt đầu ở slide 20. Thứ tự: bức tranh lớn (bối cảnh đã làm / chưa làm) → khảo sát 9 sàn → bức tranh hệ thống → actor → user story → user flow → use case → ERD → module → test → deploy.",
    cards: [
      {
        title: "CARE — chuẩn viết",
        body: "Context: Tử Tế Fund, crowdfunding lai Donation + Reward tại Việt Nam. Action: khảo sát 9 sàn, chốt actor, viết story và AC đo được. Result: bộ phân tích–thiết kế bám code đang chạy. Requirement: đúng format thầy, không bịa nghiệp vụ. Example: từng slide dưới đây.",
      },
      {
        title: "Nguồn trong repo",
        body: "Actor lấy từ users.role và users.isOrganization. Thanh toán: bốn kênh trên màn (ví, thẻ quốc tế, NAPAS, VietQR), sổ đơn BANK_ESCROW, tiền vào STK trung gian. Schema: prisma/schema.prisma. Test: kế hoạch kiểm thử nhóm 2. Deploy: Neon + Vercel + Mongo Atlas + Redis.",
      },
    ],
    bullets: [
      "Không copy nghiệp vụ sàn phế liệu. Chỉ học mật độ: bài học từng sàn, AC ngay dưới actor, mỗi story có AC.",
      "PlantUML trên slide là nguồn text. Lane phía trên là hình đọc được lúc thuyết trình.",
    ],
  },
  {
    kicker: "Bức tranh lớn",
    title: "Bối cảnh — đã làm, chưa làm, bài toán",
    body: "Đúng ý thầy Tuần 6: vẽ bối cảnh tổ chức, không vẽ sơ đồ nối hộp. Hỏi: thị trường và nội địa đã làm được gì, còn thiếu gì, chức năng mặc định nào vẫn phải làm.",
    blocks: [
      {
        heading: "1. Hiện trạng Việt Nam",
        bullets: [
          "Nhiều dự án gọi vốn hoặc ủng hộ vẫn ghi fanpage, form, Excel. Chỉ biết ai đã chuyển, bao nhiêu, ngày nào.",
          "Sàn ngoại (Kickstarter, Indiegogo, GoFundMe, Patreon) đã chứng minh nhu cầu toàn cầu nhưng kẹt Stripe, PayPal, hộ chiếu, SSN. Creator Việt khó vượt KYC và rút tiền về STK nội địa.",
          "Comicola làm được Reward văn hóa nhưng hẹp ngách, thiếu escrow theo đơn và SLA giao hàng.",
          "Thiện Nguyện MB và GiveNow làm được ủng hộ, sao kê, chứng từ. Không mở pre-order, không Reward thương mại.",
        ],
      },
      {
        heading: "2. Đã có sẵn ở cấp quốc gia / hạ tầng",
        bullets: [
          "VietQR, NAPAS, ví điện tử, thẻ nội địa — người Việt đã trả được, không cần cổng ngoại.",
          "CCCD gắn chip, eKYC, MST / GPKD — đủ định danh cá nhân và tổ chức trong nước.",
          "NQ 86/NQ-CP và chương trình khởi nghiệp 2026–2035 đẩy ý tưởng ra thị trường. Chưa có sàn nhà nước đặt hàng cho crowdfunding lai.",
          "Chức năng mặc định vẫn phải làm dù nơi khác đã có: tài khoản, chiến dịch, gói quà, thanh toán, duyệt, sao kê. Không bỏ vì Kickstarter hay MB đã làm.",
        ],
      },
      {
        heading: "3. Chưa làm — đây là bài toán Tử Tế Fund",
        bullets: [
          "Chưa có sàn nội địa mở cùng lúc ủng hộ không quà và đặt trước có quà trên một chiến dịch.",
          "Chưa có giữ tiền theo từng đơn, SLA giao hàng + 2 ngày, hoàn đúng đơn trễ mà không khóa cả chiến dịch.",
          "Chưa có chứng từ tách đôi: TT-UH cho Donation, INV- cho Reward. Kho đồ gắn tài khoản, không phụ thuộc tin nhắn.",
          "Bài toán: số hóa đúng chỗ còn thiếu. Không copy Kickstarter, không làm thuần thiện nguyện, không làm cổ phần.",
        ],
      },
    ],
    bullets: [
      "Đây là bức tranh lớn kiểu thầy: hiện trạng → cái đã có → cái còn thiếu. Slide vòng đời hệ thống để sau khảo sát.",
    ],
  },
  {
    kicker: "Khảo sát",
    title: "Khung khảo sát — 6 mục thầy",
    body: "Mỗi sàn đối chiếu cùng một khung, rồi mới rút bài học mang về Tử Tế Fund. Số liệu quy mô là ước tính đã dùng ở slide kinh doanh, không phải báo cáo tài chính đã kiểm toán.",
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
          "Ƭu: thương hiệu Reward số 1, backer quốc tế, gói quà rõ.",
          "Nhược: KYC và Stripe chặn creator Việt; giữ cả chiến dịch; tỷ lệ trượt goal cao.",
          "Bài học → Tử Tế Fund: lấy All-or-Nothing và gói Reward. Không dùng Stripe. Giữ tiền theo từng đơn, chi khi chiến dịch đã chốt và đơn đó nhận đủ.",
        ],
      },
      {
        heading: "2. Indiegogo (Mỹ)",
        bullets: [
          "Định hướng: gadget và cả dự án cá nhân, cứu trợ; có bán tiếp sau chiến dịch (InDemand).",
          "Mô hình: creator chọn All-or-Nothing hoặc Keep-It-All. Phí sàn khoảng 5%.",
          "Chức năng: hai kiểu giữ tiền, pre-order sau khi đóng chiến dịch, gói quảng bá.",
          "Ƭu: linh hoạt hơn Kickstarter, có đường bán tiếp.",
          "Nhược: kiểm duyệt lỏng hơn nên dễ bùng hàng; vẫn kẹt cổng ngoại.",
          "Bài học → Tử Tế Fund: cho chọn AoN hoặc KIA. Không nới duyệt: campaign chỉ ACTIVE sau admin. Chưa mở chợ bán tiếp kiểu InDemand.",
        ],
      },
      {
        heading: "3. GoFundMe (Mỹ)",
        bullets: [
          "Định hướng: thuần cho đi — y tế, học phí, thiên tai, quỹ phi lợi nhuận. Không bán hàng.",
          "Mô hình: 0% phí bắt buộc với creator. Doanh thu từ tip tự chọn lúc checkout.",
          "Chức năng: trang hoàn cảnh, chia sẻ mạng xã hội, biên lai ngoại.",
          "Ƭu: niềm tin vì không cắt khoản quyên góp.",
          "Nhược: không Reward, không pre-order, không phủ creator Việt.",
          "Bài học → Tử Tế Fund: nhánh Donation không chiết khấu khoản ủng hộ, tip tự chọn. Không làm thuần thiện nguyện — vẫn có nhánh Reward thu 8%.",
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
          "Ƭu: doanh thu lặp lại.",
          "Nhược: không gom vốn một lần để sản xuất hoặc nhập hàng.",
          "Bài học → Tử Tế Fund: không lấy subscription làm lõi. Enum có SUBSCRIPTION nhưng form tạo campaign không set — mặc định REWARD. Giữ chân bằng cập nhật chiến dịch và blog, không thu phí tháng.",
        ],
      },
      {
        heading: "5. Campfire (Nhật)",
        bullets: [
          "Định hướng: văn hóa nội địa Nhật — anime, manga, F&B, thủ công, game indie.",
          "Mô hình: phí sàn khoảng 12% cộng phí cổng khoảng 5%. Thanh toán cả tiền mặt tại konbini.",
          "Chức năng: gọi vốn nội địa, gói truyền thông trong nước.",
          "Ƭu: người Nhật trả được bằng kênh họ đang có.",
          "Nhược: khép thị trường Nhật, phí cao.",
          "Bài học → Tử Tế Fund: nội địa hóa thanh toán. Họ dùng konbini. Mình hiện bốn kênh trên màn (ví điện tử, thẻ quốc tế, NAPAS, VietQR), tiền vào STK trung gian. Không lấy mức phí ~17%.",
        ],
      },
      {
        heading: "6. Wadiz (Hàn)",
        bullets: [
          "Định hướng: pre-order thương mại (mỹ phẩm, thời trang, gia dụng). Nhánh Partner là equity.",
          "Mô hình: phí khoảng 7–15% theo gói, cộng phí kiểm định và marketing.",
          "Chức năng: duyệt hàng trước khi lên sàn, gói quảng bá trọn gói.",
          "Ƭu: pre-order mạnh, có kiểm hàng.",
          "Nhược: phí nặng với creator nhỏ; equity đòi pháp nhân Hàn.",
          "Bài học → Tử Tế Fund: học pre-order và cam kết giao hàng. Không làm gọi vốn cổ phần. Không bán gói quay phim.",
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
          "Ƭu: hiểu người mua nội địa, có dự án lớn.",
          "Nhược: hẹp ngách nghệ thuật, thiếu escrow theo SLA, công cụ còn đơn.",
          "Bài học → Tử Tế Fund: mức phí Reward 8% bám khoảng Comicola/Kickstarter. Bổ sung giữ tiền theo đơn và SLA + 2 ngày — chỗ họ chưa làm. Không khóa sàn vào comic.",
        ],
      },
      {
        heading: "8. Thiện Nguyện MB (Việt Nam)",
        bullets: [
          "Định hướng: 100% nhân đạo — trường vùng cao, mổ tim, cứu trợ.",
          "Mô hình: 0% phí nền tảng. Ngân hàng được CASA và người dùng app.",
          "Chức năng: sao kê realtime, tài khoản minh bạch.",
          "Ƭu: niềm tin cộng đồng rất cao.",
          "Nhược: không Reward, không khởi nghiệp thương mại.",
          "Bài học → Tử Tế Fund: sao kê không xóa lịch sử, dòng hoàn nhìn thấy được. Không copy 0% cho cả sàn vì Reward phải nuôi vận hành. Sàn không sống bằng tiền gửi ngân hàng.",
        ],
      },
      {
        heading: "9. Kindmate / GiveNow (Việt Nam)",
        bullets: [
          "Định hướng: NGO, bảo tồn, giáo dục, sinh kế.",
          "Mô hình: phí kỹ thuật khoảng 3–5%, cộng tài trợ quỹ và CSR.",
          "Chức năng: kết nối tổ chức, chứng từ quyên góp.",
          "Ƭu: chứng từ rõ cho bên cho đi.",
          "Nhược: truyền thông yếu, không pre-order.",
          "Bài học → Tử Tế Fund: Donation có giấy TT-UH sau khi admin chốt tiền. TT-UH không thay hóa đơn GTGT.",
        ],
      },
    ],
  },
  {
    kicker: "Khảo sát",
    title: "Bảng so sánh — cột hệ thống của tôi",
    body: "Cột cuối là giải thích quyết định, không chỉ điền tên tính năng.",
    table: {
      headers: ["Tiêu chí", "Sàn ngoại", "Sàn VN", "Tử Tế Fund", "Vì sao"],
      rows: [
        [
          "Thanh toán",
          "Stripe, thẻ, PayPal. FX khoảng 3–5%.",
          "Chuyển khoản, app ngân hàng.",
          "Bốn kênh trên màn: ví điện tử, thẻ quốc tế, NAPAS, VietQR. Đơn ONLINE là BANK_ESCROW.",
          "API từ chối paymentMethodId. Tiền vào STK trung gian, không về thẳng creator.",
        ],
        [
          "KYC / KYB",
          "Hộ chiếu, SSN, địa chỉ nước ngoài.",
          "Thủ công hoặc không có.",
          "CCCD, eKYC tắt được về form tay. Tổ chức nộp MST / GPKD.",
          "Đúng giấy tờ VN. QR mặt sau chỉ điền form, không gọi CSDL quốc gia.",
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
          "Khách: không có Kho đồ. Đã login: TT-UH trong Kho đồ. Quà số grant khi SUCCESS. Hoàn thì revoke.",
          "Kho gắn tài khoản đã đăng nhập, không phụ thuộc tin nhắn.",
        ],
        [
          "Cách thu",
          "Phí 5% hoặc tip GoFundMe.",
          "8–10% hoặc 0% vì CSR ngân hàng.",
          "Reward: 8% trừ lúc chi. Donation: 0% trên khoản ủng hộ, tip tự chọn.",
          "Học Kickstarter/Comicola và GoFundMe. Không cộng phí sàn vào giá backer.",
        ],
      ],
    },
  },
  {
    kicker: "Bức tranh lớn",
    title: "Bức tranh lớn của hệ thống",
    body: "Guest xem — Backer ủng hộ hoặc đặt trước — Creator gọi vốn sau KYC — Admin duyệt và chốt tiền — System ghi sổ, giữ quyền lợi, cấp chứng từ.",
    cards: [
      { title: "Đầu vào", body: "Tài khoản hoặc email khách, CCCD hoặc GPKD/MST, chiến dịch, gói Reward hoặc không quà, tip, bốn kênh checkout." },
      { title: "Xử lý", body: "Duyệt KYC, campaign, blog. Pledge PENDING trên STK trung gian. settlePledgeAsPaid mới SUCCESS. Escrow theo đơn. SLA. Hoàn hoặc giải ngân. TT-UH hoặc INV-." },
      { title: "Đầu ra", body: "Chiến dịch public, chứng từ, sao kê, thông báo. Khách: TT-UH gửi Gmail. Đã login: Gmail và Kho đồ. Tiền ở STK trung gian đến khi đủ điều kiện chi." },
    ],
    lanes: [
      {
        title: "Vòng đời một chiến dịch",
        tone: "navy",
        steps: [
          "Creator tạo project và campaign DRAFT.",
          "KYC VERIFIED rồi gửi duyệt PENDING_REVIEW.",
          "Admin cho ACTIVE. Trước đó không nhận pledge.",
          "Backer trả ONLINE. Không quà thì luôn ONLINE, không COD.",
          "Chưa đối soát thì không cộng tiền. settlePledgeAsPaid mới SUCCESS: khách nhận TT-UH qua Gmail; đã login thì thêm vào Kho đồ; quà số vào Kho đồ.",
          "Reward: giao trong hạn, nhận đủ, chiến dịch đã chốt thì chi đơn đó, trừ 8%. Trễ hạn thì hoàn đơn và revoke quà.",
        ],
      },
    ],
  },
];
