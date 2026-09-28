import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const BUSINESS_SLIDES_A: PresentationSlide[] = [
{
      variant: "hero",
      kicker: "Tử Tế Fund",
      title: "Nền tảng gây quỹ lai",
      titleAccent: "Cho đi và Nhận lại",
      body: "Nơi để bắt đầu hành trình: gây quỹ nhân đạo, đặt trước sản phẩm, và lưu hồ sơ dự án.",
      cards: [
        {
          title: "Cho đi (Donation)",
          body: "Ủng hộ vì mục đích nhân đạo. Không nhận lại lợi ích tài chính hay vật chất lớn. Đầu ra: giấy chứng nhận ủng hộ. Giải ngân sau khi chốt chiến dịch, theo All-or-Nothing hoặc Keep-It-All.",
          tone: "rose",
        },
        {
          title: "Nhận lại (Reward)",
          body: "Hàng mẫu, combo, pre-order (đặt trước). Có biên lai. Hoàn nếu trễ SLA (cam kết thời hạn gửi hàng) hoặc khách không nhận đủ. Chỉ giải ngân từng đơn khi chiến dịch đã chốt và đơn đó đã nhận đủ hàng.",
          tone: "emerald",
        },
      ],
    },
{
      kicker: "Cơ hội",
      title: "Tại sao chọn Crowdfunding — thị trường đã chứng minh",
      body: "Không giáo dục thị trường từ zero. Crowdfunding đã khẳng định nhu cầu toàn cầu. Việt Nam vẫn là mỏ vàng chưa khai hết: sàn ngoại vướng thanh toán / KYC (xác minh cá nhân), kênh nội địa thì hẹp ngách hoặc thuần cho đi. Chỗ đứng: giảm tối đa chi phí khởi đầu cho nhà sáng tạo, tăng cao tốc độ đổi mới sáng tạo, thúc đẩy nền kinh tế — ý tưởng ra thị trường khi đã có người đặt.",
      cards: [
        {
          title: "Toàn cầu",
          body: "Ước tính Reward + Donation khoảng 1,5–2,0 tỷ USD/năm. Nếu gộp P2P Lending (cho vay ngang hàng) và Equity Crowdfunding (gọi vốn cổ phần) thì quy mô vượt ~15 tỷ USD. Tử Tế Fund không chơi hai mảng sau.",
        },
        {
          title: "Mỹ",
          body: "Thị trường lớn nhất, khoảng 40–45% toàn cầu. Riêng Reward + Donation hơn ~800 triệu USD/năm. GoFundMe sống bằng tip (tiền boa); Kickstarter/Indiegogo bằng phí chiến dịch thành công.",
        },
        {
          title: "Việt Nam",
          body: "Ước tính mới khoảng 5–10 triệu USD/năm, chủ yếu dự án tự phát hoặc sách/truyện. Thanh toán không tiền mặt (VietQR / ví) đang bùng — đúng lúc nội địa hóa crowdfunding.",
        },
      ],
      blocks: [
        {
          heading: "Tại sao sàn nước ngoài không phù hợp người Việt",
          bullets: [
            "Thanh toán: bắt Visa/Mastercard, Stripe, PayPal. Phí FX (chuyển đổi ngoại tệ) 3–5% và phí rút về ngân hàng VN.",
            "Định danh: hộ chiếu, SSN (số an sinh xã hội Mỹ/Âu), địa chỉ hoặc STK (số tài khoản) nước sở tại — Creator Việt khó vượt KYC/KYB (xác minh cá nhân / doanh nghiệp).",
            "Thuế & AML (chống rửa tiền): rủi ro đóng băng tiền. Không có chứng từ hợp lệ theo kế toán VN để giải trình thuế.",
            "Giải ngân trễ 30–60 ngày sau khi chốt. Creator bùng hàng thì backer Việt gần như không có cơ chế khiếu nại nội địa.",
          ],
        },
        {
          heading: "Chính sách hỗ trợ khởi nghiệp — chỗ còn khuyết",
          bullets: [
            "Nhà nước đang thúc đẩy dự án đi từ ý tưởng ra thị trường: NQ 86/NQ-CP (Chiến lược quốc gia về khởi nghiệp sáng tạo) và Chương trình quốc gia về khởi nghiệp sáng tạo giai đoạn 2026–2035 (Bộ KH&CN phê duyệt 15/9/2026).",
            "Hệ sinh thái vẫn khuyết một nền tảng kiểm chứng lực cầu và giữ an toàn nguồn tiền pre-order (đặt trước) nội địa — đúng chỗ Tử Tế Fund đứng.",
            "Giảm tối đa chi phí khởi đầu cho nhà sáng tạo: không phí mở chiến dịch, không bắt nhập hàng trước khi có người đặt.",
            "Cùng hướng tăng cao tốc độ đổi mới sáng tạo, thúc đẩy nền kinh tế: ý tưởng ra thị trường nhanh hơn vì đã kiểm chứng lực cầu, không chôn vốn vào hàng chưa có người mua.",
            "Không tự xưng quỹ nhà nước, không phải đơn vị được Bộ đặt hàng. Chỉ tiêu 250–500 DN KNST thương mại hóa nghiên cứu không phải KPI của sàn.",
          ],
        },
      ],
      bullets: [
        "Gỡ rào thanh toán / KYC (xác minh cá nhân) / thuế của Kickstarter, Indiegogo.",
        "Mở ngách thương mại (Reward / pre-order) mà app thiện nguyện không làm.",
        "Escrow (giữ hộ) theo đơn và SLA (cam kết thời hạn gửi hàng) mà sàn nội như Comicola chưa triển khai.",
      ],
    },
{
      kicker: "Thị trường",
      title: "Đối chiếu nền tảng — thế giới và Việt Nam",
      body: "Cùng ngách crowdfunding, khác sản phẩm và khác cách kiếm tiền. Tử Tế Fund học hai dòng thu đã chứng minh: phí Reward (Kickstarter/Comicola) và tip Donation (GoFundMe) — cộng escrow (giữ hộ) và checkout nội địa bốn kênh, tiền vào STK trung gian.",
      table: {
        headers: ["Nền tảng", "Sản phẩm / ngách", "Cách kiếm tiền", "Quy mô (ước tính)", "Ưu điểm", "Nhược điểm"],
        rows: [
          ["Kickstarter (Mỹ)", "Phần cứng công nghệ, boardgame/video game, phim độc lập, thiết kế, sách/artbook. Bán theo gói Reward Tiers: cảm ơn số → Early Bird → Deluxe phụ kiện độc quyền.", "All-or-Nothing: chỉ thu khi đạt/vượt 100% goal. Phí sàn 5% trên vốn gọi thành công. Stripe 3–5% phí xử lý giao dịch (đối tác cổng).", "Doanh thu ~40–50 triệu USD/năm. Tổng vốn gọi >8 tỷ USD.", "Backer toàn cầu. Thương hiệu số 1. Reward chuẩn.", "KYC (xác minh cá nhân) + Stripe đắt. Không giữ tiền theo SLA (cam kết thời hạn gửi hàng). Tỷ lệ thất bại ~60%."],
          ["Indiegogo (Mỹ)", "Gadget, đồ gia dụng thông minh; dự án cá nhân, cứu trợ. InDemand: pre-order (đặt trước) tiếp sau khi chiến dịch kết thúc.", "Creator chọn All-or-Nothing hoặc Keep-It-All. Phí sàn 5%. InDemand thêm ~5% trên đơn sau chiến dịch. Bán gói đẩy banner/newsletter (Promotions).", "Doanh thu ~15–20 triệu USD/năm. Tổng vốn gọi >2 tỷ USD.", "Dễ tính hơn Kickstarter. Có Keep-It-All. Có kênh bán tiếp sau gọi vốn.", "Kiểm duyệt lỏng hơn → rủi ro bùng hàng. Vẫn vướng cổng thanh toán ngoại."],
          ["GoFundMe (Mỹ)", "Không bán hàng. Hoàn cảnh cá nhân (y tế, học phí, hỏa hoạn), quỹ phi lợi nhuận, cứu trợ thiên tai.", "0% phí bắt buộc với creator. Sống bằng tip (tiền boa) 0–15%+ lúc checkout. Phí cổng ~2,9% + 0,30 USD/giao dịch trừ vào khoản quyên góp.", "Doanh thu >100 triệu USD/năm từ tip. Tổng vốn gọi >15 tỷ USD.", "0% phí từ thiện → niềm tin. Lan tỏa MXH (mạng xã hội).", "Thuần Donation — không Reward / pre-order (đặt trước). Chỉ một số quốc gia."],
          ["Patreon (Mỹ)", "Nội dung số & membership: video chưa phát, bài sâu, podcast, file HD, Discord role, quà định kỳ (sticker, áo).", "Subscription (đăng ký tháng/năm). Hoa hồng Lite 5% / Pro 8% / Premium 12% trên doanh thu tháng. Phụ: phí cổng và phí payout.", "Doanh thu ~100 triệu+ USD/năm. Định giá công ty >4 tỷ USD.", "Thu nhập lặp lại hàng tháng. Fan độc quyền.", "Không gom vốn một lần (one-off) cho sản xuất / thương mại."],
          ["Campfire (Nhật)", "Văn hóa Nhật: CD/show anime, manga, F&B địa phương, thủ công, game indie.", "Phí sàn ~12% + phí cổng ~5% ≈ 17% khi thành công. Bán gói truyền thông nội địa. Thanh toán konbini (7-Eleven, Lawson).", "Doanh thu ~25 triệu USD/năm. Tổng vốn gọi >700 triệu USD.", "Nội địa hóa 100%. Người Nhật trả tiền mặt tại cửa hàng tiện lợi.", "Khép kín thị trường Nhật. Phí cao."],
          ["Wadiz (Hàn)", "Sàn TMĐT (thương mại điện tử) pre-order: mỹ phẩm, thời trang, gia dụng, tech. Nhánh Partner = Equity (cổ phần) — Tử Tế Fund không làm.", "Phí 7–15% theo gói Basic / Value / Expert. Phí kiểm định hàng và pháp lý trước niêm yết. Gói marketing trọn gói (quay, chụp, PR, ads in-app).", "Doanh thu ~30 triệu USD/năm. Thị phần số 1 Hàn.", "Pre-order mạnh. Có kiểm định hàng.", "Phí cao với creator nhỏ. Khó vào nếu không có pháp nhân Hàn."],
          ["Comicola (Việt Nam)", "Văn hóa Việt: truyện tranh (Thỏ Bảy Màu, Bad Luck), boardgame (Sử Hộ Vương), đĩa nhạc indie, vật phẩm văn hóa.", "Phí gây quỹ 8–10% khi thành công. Sau đó đóng vai nhà xuất bản / phân phối: chiết khấu phát hành ~20–40% giá bìa khi vào nhà sách hoặc sàn TMĐT (thương mại điện tử).", "Vài tỷ VNĐ/năm. Nhiều dự án lớn.", "Hiểu fandom Việt. Hỗ trợ xuất bản / phân phối vật lý.", "Hẹp ngách nghệ thuật. Thiếu escrow (giữ hộ) theo SLA (cam kết thời hạn gửi hàng). Công nghệ còn đơn sơ."],
          ["Thiện Nguyện MB (Việt Nam)", "100% nhân đạo: trường vùng cao, mổ tim, cầu dân sinh, cứu trợ thiên tai.", "0% phí nền tảng. Lợi ích gián tiếp cho MB: CASA (tiền gửi không kỳ hạn) trên tài khoản 4 số; tăng user app MBBank (sao kê realtime); CSR (trách nhiệm xã hội) / thương hiệu.", "Doanh thu sàn 0 (phi lợi nhuận). Quyên góp >2.000 tỷ VNĐ.", "Sao kê realtime, tài khoản minh bạch, niềm tin cộng đồng.", "100% Cho đi. Không Reward, không khởi nghiệp thương mại."],
          ["Kindmate / GiveNow (Việt Nam)", "NGO (tổ chức phi chính phủ), bảo tồn, giáo dục, sinh kế cộng đồng.", "Phí vận hành kỹ thuật ~3–5% trên số quyên góp (duy trì hạ tầng). Tài trợ từ quỹ quốc tế / CSR (trách nhiệm xã hội) tập đoàn.", "Vài tỷ VNĐ/năm.", "Kết nối NGO. Chứng từ quyên góp rõ.", "Truyền thông yếu. Không pre-order / bán hàng."]
        ],
      },
      bullets: [
        "Ba kiểu thu đã có thật: (1) phí thương mại Reward 5–15% — Kickstarter, Indiegogo, Wadiz, Comicola; (2) 0% phí + tip (tiền boa) tự chọn — GoFundMe >100 triệu USD/năm; (3) 0% phí để lấy CASA (tiền gửi không kỳ hạn) và user — Thiện Nguyện MB.",
        "Tử Tế Fund kết hợp: phí 8% mảng Reward (như Comicola/Kickstarter) + 0% chiết khấu khoản ủng hộ và tip tự chọn mảng Donation (như GoFundMe) + escrow (giữ hộ) theo SLA (cam kết thời hạn gửi hàng) và checkout nội địa (ví, thẻ, NAPAS, VietQR), tiền vào STK trung gian — chỗ sàn ngoại không làm được tại Việt Nam.",
      ],
    },
{
      kicker: "Khách hàng nhắm đến",
      title: "Chân dung người dùng — Creator và Backer",
      body: "Hai phía, hai nhu cầu. Creator cần cộng đồng và đặt trước để kiểm chứng thị trường, giảm tối đa chi phí khởi đầu. Backer cần minh bạch khi cho đi, và khóa hoàn khi nhận lại.",
      cards: [
        {
          title: "Creator",
          body: "Cá nhân hoặc doanh nghiệp: mở nghề nhỏ, nhượng quyền F&B, thủ công, khóa học, sản phẩm sáng tạo. Giảm tối đa chi phí khởi đầu: không phí mở chiến dịch, không ôm hàng trước khi có đơn — biết bao nhiêu người đặt rồi mới chuẩn bị. Cần cộng đồng đồng hành, không chỉ một đơn rời trên Shopee.",
        },
        {
          title: "Backer — Cho đi",
          body: "Ủng hộ nhân đạo hoặc nâng đỡ quán / dự án, không lấy hàng. Cần minh bạch và giấy chứng nhận TT-UH để lưu, không biến khoản ủng hộ thành đơn hàng giả.",
          tone: "rose",
        },
        {
          title: "Backer — Nhận lại",
          body: "Muốn trải nghiệm sớm, combo, vé, pre-order (đặt trước). Sợ bùng hàng. Cần giữ tiền, SLA (cam kết thời hạn gửi hàng), hoàn nếu trễ hoặc không nhận đủ.",
          tone: "emerald",
        },
      ],
    },
{
      kicker: "Mô hình lai",
      title: "Hai nhánh, hai loại chứng từ",
      body: "Cùng một chiến dịch có thể mở cả ủng hộ không nhận quà và đặt hàng. Pháp lý và đầu ra tách rõ — không trộn ủng hộ với mua.",
      cards: [
        {
          title: "Từ thiện / Quyên góp",
          body: "Cho đi. Không cổ phần, không lợi nhuận. Sau đối soát: giấy chứng nhận TT-UH. Không phải hóa đơn GTGT.",
          tone: "rose",
        },
        {
          title: "Nhận quà tri ân (Reward)",
          body: "Giao dịch có hàng: sẵn kho, nhận tại chỗ, hoặc pre-order. Biên lai INV- nội bộ. Hóa đơn GTGT (nếu cần) do creator xuất với tư cách người bán.",
          tone: "emerald",
        },
      ],
      figures: [
        {
          key: "chung-nhan-tt-uh.jpg",
          alt: "Mẫu giấy chứng nhận ủng hộ TT-UH",
          caption: "Mẫu giao diện giấy chứng nhận Donation. Không phải chứng từ đã cấp cho một giao dịch thật.",
        },
        {
          key: "bien-lai-thanh-toan.jpg",
          alt: "Mẫu biên lai thanh toán Reward",
          caption: "Mẫu biên lai INV- của hệ thống. Chứng từ đối chiếu, không phải hóa đơn GTGT.",
        },
      ],
    },
];
