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
      body: "Không giáo dục thị trường từ zero. Crowdfunding đã khẳng định nhu cầu toàn cầu. Việt Nam vẫn là mỏ vàng chưa khai hết: sàn ngoại vướng thanh toán / KYC (xác minh cá nhân), kênh nội địa thì hẹp ngách hoặc thuần cho đi. Chỗ đứng của Tử Tế Fund: giảm tối đa chi phí khởi đầu cho nhà sáng tạo, tăng cao tốc độ đổi mới sáng tạo, thúc đẩy nền kinh tế — ý tưởng ra thị trường khi đã có người đặt, không đổ vốn sản xuất trước.",
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
            "Giảm tối đa chi phí khởi đầu cho nhà sáng tạo: không phí mở chiến dịch, không bắt nhập hàng trước khi có người đặt. Biết số đơn rồi mới chuẩn bị.",
            "Cùng hướng tăng cao tốc độ đổi mới sáng tạo, thúc đẩy nền kinh tế: ý tưởng ra thị trường nhanh hơn vì đã kiểm chứng lực cầu, không chôn vốn vào hàng chưa có người mua.",
            "Không tự xưng quỹ nhà nước, không phải đơn vị được Bộ đặt hàng. Chỉ tiêu 250–500 DN KNST thương mại hóa nghiên cứu không phải KPI của sàn.",
          ],
        },
      ],
      bullets: [
        "Gỡ rào thanh toán / KYC (xác minh cá nhân) / thuế của Kickstarter, Indiegogo.",
        "Mở ngách thương mại (Reward / pre-order) mà app thiện nguyện không làm.",
        "Escrow (giữ hộ) theo đơn và SLA (cam kết thời hạn gửi hàng) mà sàn nội như Comicola chưa triển khai.",
        "Giảm tối đa chi phí khởi đầu cho nhà sáng tạo, tăng cao tốc độ đổi mới sáng tạo, thúc đẩy nền kinh tế — không thu phí mở chiến dịch, không bắt ôm hàng trước.",
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
];
