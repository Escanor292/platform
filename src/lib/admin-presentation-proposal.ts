import type { PresentationSlide } from "@/lib/admin-presentation-types";

/** Phụ lục đề xuất dự án — tháng 9/2026. Gắn sau slide học thuật trên admin. */
export const PROPOSAL_SLIDES: PresentationSlide[] = [
  {
    variant: "hero",
    kicker: "Đề xuất dự án",
    title: "Tử Tế Fund",
    titleAccent: "Ý tưởng – Cộng đồng – Thị trường – Nguồn lực",
    body: "Kiểm chứng ý tưởng · Huy động nguồn lực · Xây dựng cộng đồng · Đồng hành cùng Startup. Bản đề xuất tổng hợp — tháng 9/2026.",
    cards: [
      { title: "Từ một ý tưởng", body: "đến một cộng đồng.", tone: "emerald" },
      { title: "Từ một cộng đồng", body: "đến một thị trường.", tone: "emerald" },
      { title: "Từ một thị trường", body: "đến một doanh nghiệp.", tone: "emerald" },
    ],
  },
  {
    kicker: "Đề xuất",
    title: "1. Tóm tắt dự án",
    body: "Nền tảng công nghệ giúp cá nhân, nhóm sáng tạo, Startup, hộ kinh doanh và doanh nghiệp nhỏ đưa ý tưởng đến gần cộng đồng và thị trường ngay từ những giai đoạn đầu.",
    paragraphs: [
      { text: "Nền tảng kết hợp gây quỹ cộng đồng, đặt trước sản phẩm, Blog, Chat, thảo luận, tương tác và hồ sơ uy tín trong một hệ sinh thái thống nhất." },
      { text: "Giá trị cốt lõi không nằm ở việc huy động tiền, mà ở việc đưa cộng đồng và tín hiệu thị trường tham gia sớm hơn vào quá trình hình thành sản phẩm." },
    ],
    bullets: [
      "Ý tưởng → Cộng đồng → Kiểm chứng → Gây quỹ / Đặt trước → Nghiên cứu & Sản xuất → Thị trường → Thu hồi vốn → Tái đầu tư",
    ],
  },
  {
    kicker: "Đề xuất",
    title: "2. Bối cảnh và vấn đề",
    body: "Rủi ro lớn nhất không chỉ là thiếu vốn, mà là sản phẩm được tạo ra trước khi biết thị trường có thực sự cần hay không.",
    blocks: [
      {
        heading: "Người tạo dự án",
        headingTone: "navy",
        bullets: [
          "Khó tiếp cận vốn ban đầu và khách hàng đầu tiên.",
          "Phải đầu tư nghiên cứu, phát triển, sản xuất trước khi biết thị trường chấp nhận hay không.",
          "Thiếu dữ liệu kiểm chứng, môi trường trao đổi và người đồng hành.",
          "Khó xây dựng uy tín và lưu hành trình dài hạn.",
        ],
      },
      {
        heading: "Cộng đồng",
        headingTone: "emerald",
        bullets: [
          "Khó tiếp cận dự án khi ý tưởng còn đang hình thành.",
          "Chỉ tham gia khi sản phẩm đã hoàn thiện.",
          "Khó theo dõi tiến độ và minh bạch.",
          "Ít cơ hội đóng góp vào quá trình hình thành sản phẩm.",
        ],
      },
    ],
  },
  {
    kicker: "Đề xuất",
    title: "3. Mục tiêu dự án",
    body: "Xây dựng nền tảng số giúp kiểm chứng ý tưởng, huy động nguồn lực, xây dựng cộng đồng và phát triển quan hệ với thị trường ngay từ giai đoạn đầu.",
    cards: [
      { title: "1. Kiểm chứng nhu cầu", body: "Đo mức độ quan tâm trước khi đầu tư sản xuất quy mô lớn." },
      { title: "2. Huy động nguồn lực", body: "Gây quỹ không nhận quà và đặt trước sản phẩm." },
      { title: "3. Giảm rủi ro sản xuất", body: "Dùng tín hiệu cộng đồng và đơn đặt trước để chốt quy mô." },
      { title: "4. Xây dựng cộng đồng", body: "Thảo luận, phản hồi, theo dõi và đồng hành lâu dài." },
      { title: "5. Niềm tin và uy tín", body: "Công khai mục tiêu, tiến độ, kết quả và hành trình." },
      { title: "6. Hạ tầng Startup", body: "Kết nối chuyên gia, đối tác, tài chính, pháp lý, marketing, công nghệ." },
    ],
  },
  {
    kicker: "Đề xuất",
    title: "4. Giải pháp đề xuất",
    body: "Đưa cộng đồng và thị trường tham gia sớm hơn vào vòng đời phát triển sản phẩm.",
    lanes: [
      { title: "Cách tiếp cận truyền thống", tone: "rose", steps: ["Ý tưởng", "Nghiên cứu", "Sản xuất", "Tìm thị trường"] },
      { title: "Cách tiếp cận Tử Tế Fund", tone: "emerald", steps: ["Ý tưởng", "Cộng đồng", "Kiểm chứng", "Nghiên cứu", "Gây quỹ / Đặt trước", "Sản xuất", "Thị trường", "Thu hồi vốn", "Tái đầu tư"] },
    ],
    bullets: [
      "Giới thiệu → Lắng nghe → Thảo luận → Kiểm chứng → Huy động nguồn lực → Sản xuất → Đưa ra thị trường",
      "Cộng đồng không chỉ là người mua ở cuối quá trình mà là một phần của quá trình hình thành sản phẩm.",
    ],
  },
  {
    kicker: "Đề xuất",
    title: "5. Hai hình thức cốt lõi",
    table: {
      headers: ["Hình thức", "Bản chất", "Phù hợp với", "Giá trị kiểm chứng"],
      rows: [
        ["Gây quỹ không nhận quà", "Cộng đồng hỗ trợ mà không yêu cầu nhận sản phẩm", "Dự án xã hội, cộng đồng, thiện nguyện, ý tưởng sáng tạo, Startup giai đoạn đầu", "Đo mức độ tin tưởng và sẵn sàng đóng góp"],
        ["Đặt trước sản phẩm", "Người dùng đặt sản phẩm trước khi sản xuất hàng loạt", "Sản phẩm vật lý hoặc số, hộ kinh doanh, nhóm sáng tạo", "Đo nhu cầu và quy mô thị trường trước sản xuất"],
      ],
    },
    note: "Crowdfunding + Pre-order + Market Validation + Community trên cùng một nền tảng.",
  },
  {
    kicker: "Đề xuất",
    title: "6. Mô hình hoạt động",
    steps: [
      { n: "01", t: "Ý tưởng", d: "Chia sẻ vấn đề, giải pháp hoặc định hướng sản phẩm." },
      { n: "02", t: "Cộng đồng", d: "Thảo luận, đặt câu hỏi, đóng góp ý kiến." },
      { n: "03", t: "Kiểm chứng", d: "Ghi nhận mức độ quan tâm và tín hiệu nhu cầu." },
      { n: "04", t: "Gây quỹ / Đặt trước", d: "Chọn một hình thức hoặc kết hợp cả hai." },
      { n: "05", t: "Nghiên cứu và sản xuất", d: "Dùng nguồn lực và dữ liệu để ra quyết định." },
      { n: "06", t: "Thị trường", d: "Ưu tiên người đã quan tâm, sau đó mở rộng." },
      { n: "07", t: "Thu hồi vốn", d: "Doanh thu nuôi dưỡng quá trình phát triển." },
      { n: "08", t: "Tái đầu tư", d: "Tái đầu tư sản phẩm, dự án mới hoặc ý tưởng tiếp theo." },
    ],
    bullets: [
      "Từ: Sản xuất trước → Tìm khách sau",
      "Sang: Kiểm chứng nhu cầu → Gây quỹ / Đặt trước → Sản xuất",
    ],
  },
  {
    kicker: "Đề xuất",
    title: "7–8. Giá trị cốt lõi và hệ sinh thái",
    cards: [
      { title: "Tiết kiệm thời gian và nguồn lực", body: "Tiếp cận cộng đồng ngay khi ý tưởng hình thành. Hạn chế đầu tư vào sản phẩm chưa được kiểm chứng.", tone: "emerald" },
      { title: "Cộng đồng lành mạnh", body: "Thảo luận, chia sẻ kiến thức, đóng góp ý tưởng, đặt câu hỏi, nhận phản hồi, tìm người đồng hành." },
      { title: "Hồ sơ uy tín", body: "Lưu ý tưởng ban đầu, chiến dịch, sản phẩm, thành tích, hoạt động, phản hồi và cột mốc — ký ức thương hiệu." },
    ],
    bullets: [
      "Blog: kiến thức, câu chuyện dự án, bài học.",
      "Chat và thảo luận: trao đổi trực tiếp.",
      "Hồ sơ cá nhân / thương hiệu: hành trình và uy tín.",
      "Theo dõi dự án sau khi chiến dịch kết thúc.",
      "Phản hồi biến cộng đồng thành nguồn kiểm chứng thực tế.",
    ],
  },
  {
    kicker: "Đề xuất",
    title: "9–11. Đối tượng, khác biệt, doanh thu",
    table: {
      headers: ["Đối tượng", "Giá trị mang lại"],
      rows: [
        ["Người tạo / Startup", "Kiểm chứng nhu cầu, huy động nguồn lực, phản hồi sớm, xây cộng đồng từ ý tưởng"],
        ["Hộ kinh doanh / nhóm sáng tạo", "Mở đặt trước, đo nhu cầu trước sản xuất, giảm tồn kho"],
        ["Cộng đồng / người dùng", "Tiếp cận ý tưởng sớm, đóng góp, đồng hành, theo dõi hành trình"],
        ["Đối tác / chuyên gia", "Kết nối dự án phù hợp khi hệ sinh thái mở rộng"],
      ],
    },
    cards: [
      { title: "Cốt lõi", body: "Phí nền tảng trên gây quỹ thành công và đơn đặt trước hoàn tất." },
      { title: "Bổ sung", body: "Phí dịch vụ gia tăng: truyền thông, kết nối đối tác, công cụ nâng cao." },
      { title: "Dài hạn", body: "Doanh thu từ kết nối chuyên gia, đối tác và hỗ trợ Startup." },
    ],
  },
  {
    kicker: "Đề xuất",
    title: "12–15. Minh bạch, công nghệ, lộ trình",
    blocks: [
      {
        heading: "Minh bạch và rủi ro",
        headingTone: "navy",
        bullets: [
          "Xác minh tài khoản trước khi chiến dịch công khai.",
          "Công khai mục tiêu, tiến độ, kết quả và cập nhật.",
          "Theo dõi sau chiến dịch: sản xuất, giao hàng, sử dụng nguồn lực.",
        ],
      },
      {
        heading: "Lộ trình",
        headingTone: "emerald",
        bullets: [
          "Giai đoạn 1 — đã triển khai: chiến dịch, gây quỹ, đặt trước, thanh toán, hồ sơ, quản trị.",
          "Giai đoạn 2 — đang triển khai: Blog, Chat, thảo luận, theo dõi, hồ sơ uy tín.",
          "Giai đoạn 3 — định hướng: kết nối đối tác, chuyên gia, nguồn lực sau chiến dịch.",
          "Giai đoạn 4 — tầm nhìn: hệ sinh thái từ ý tưởng đến thương mại hóa.",
        ],
      },
    ],
    note: "Crowdfunding là điểm khởi đầu, không phải điểm kết thúc.",
  },
  {
    kicker: "Đề xuất",
    title: "16. KPI và chỉ số đánh giá",
    table: {
      headers: ["Nhóm", "Chỉ số"],
      rows: [
        ["Nền tảng / Người dùng", "Tài khoản, người dùng hoạt động, tỷ lệ quay lại, dự án tạo và được duyệt"],
        ["Thị trường / Tài chính", "Tổng gây quỹ, đặt trước, giao dịch, doanh thu nền tảng, tỷ lệ đạt mục tiêu"],
        ["Cộng đồng", "Bài viết, bình luận, cuộc trò chuyện, tương tác, cộng đồng/dự án còn hoạt động"],
        ["Startup / Tác động", "Startup tham gia, dự án tiếp tục sau chiến dịch, kết nối chuyên gia/đối tác, sản phẩm thương mại hóa, tỷ lệ giao hàng"],
      ],
    },
  },
  {
    variant: "close",
    kicker: "Đề xuất",
    title: "18–19. Tầm nhìn và kết luận",
    titleAccent: "Từ ý tưởng đến doanh nghiệp",
    body: "Giúp mọi ý tưởng có cơ hội được lắng nghe, được kiểm chứng và được phát triển.",
    bullets: [
      "Ý tưởng được ghi nhận.",
      "Cộng đồng được lắng nghe.",
      "Dự án được kiểm chứng.",
      "Thương hiệu được xây dựng.",
      "Hành trình được lưu giữ.",
      "Nguồn lực được kết nối.",
    ],
    paragraphs: [
      { text: "Khi đó, crowdfunding không còn chỉ là một công cụ huy động vốn, mà trở thành điểm khởi đầu cho một vòng phát triển liên tục." },
    ],
    note: "Kiểm chứng ý tưởng – Huy động nguồn lực – Xây dựng cộng đồng – Đồng hành cùng Startup",
  },
];
