import type { PresentationSlide } from "@/lib/admin-presentation-types";

/** Bộ giới thiệu 14 slide — khoảng 4 phút 30 giây đến 5 phút. Nối ngay sau phần kinh doanh. */
export const PROPOSAL_SLIDES: PresentationSlide[] = [
  {
    variant: "hero",
    kicker: "Tầm nhìn",
    title: "Tử Tế Fund",
    titleAccent: "Ý tưởng – Cộng đồng – Thị trường – Nguồn lực",
    body: "Giúp một ý tưởng đi từ kiểm chứng đến thương mại hóa, đồng thời xây dựng cộng đồng và thương hiệu xuyên suốt hành trình.",
    lanes: [
      {
        title: "Một vòng kết nối",
        tone: "emerald",
        steps: ["Ý tưởng", "Cộng đồng", "Thị trường", "Doanh nghiệp"],
      },
    ],
    cards: [
      { title: "Kiểm chứng", body: "Đo nhu cầu trước khi đầu tư lớn.", tone: "emerald" },
      { title: "Huy động", body: "Gây quỹ không nhận quà.", tone: "emerald" },
      { title: "Đặt trước", body: "Đơn hàng trước khi sản xuất.", tone: "emerald" },
      { title: "Bán hàng", body: "Tiếp tục kinh doanh khi đã có sản phẩm." },
      { title: "Cộng đồng", body: "Blog, chat, thảo luận, theo dõi." },
      { title: "Thương hiệu", body: "Hồ sơ và lịch sử phát triển." },
    ],
    bullets: [
      "Từ một ý tưởng đến một cộng đồng.",
      "Từ một cộng đồng đến một thị trường.",
      "Từ một thị trường đến một doanh nghiệp.",
    ],
  },
  {
    kicker: "Khoảng trống",
    title: "Một ý tưởng tốt có thể thất bại vì đâu?",
    lanes: [
      {
        title: "Quy trình phổ biến",
        tone: "rose",
        steps: ["Ý tưởng", "Nghiên cứu", "Tìm vốn", "Sản xuất", "Tìm khách hàng"],
      },
      {
        title: "Hệ quả",
        tone: "rose",
        steps: ["Tốn chi phí", "Tốn thời gian", "Thiếu phản hồi sớm", "Sản xuất vượt nhu cầu"],
      },
    ],
    note: "Thị trường thường được hỏi quá muộn. Ý tưởng → Sản xuất → Kho hàng → Có ai cần?",
  },
  {
    kicker: "Cơ hội",
    title: "Tại sao phải đợi đến khi sản phẩm hoàn thiện?",
    lanes: [
      {
        title: "Truyền thống",
        tone: "rose",
        steps: ["Ý tưởng", "Nghiên cứu", "Sản xuất", "Tìm khách"],
      },
      {
        title: "Tử Tế Fund",
        tone: "emerald",
        steps: ["Ý tưởng", "Cộng đồng", "Kiểm chứng", "Huy động / Đặt trước", "Sản xuất", "Thị trường"],
      },
    ],
    note: "Đưa cộng đồng và thị trường tham gia sớm hơn. Kiểm chứng nhu cầu trước khi đầu tư lớn — đây là vấn đề trung tâm mà dự án đang giải quyết.",
  },
  {
    kicker: "Mô hình lai",
    title: "Tử Tế Fund là gì?",
    body: "Một nền tảng kết nối toàn bộ hành trình.",
    steps: [
      { n: "01", t: "Ý tưởng", d: "Đưa vấn đề và giải pháp đến cộng đồng." },
      { n: "02", t: "Kiểm chứng", d: "Nhận phản hồi và đo mức độ quan tâm." },
      { n: "03", t: "Nguồn lực", d: "Gây quỹ hoặc đặt trước." },
      { n: "04", t: "Thương mại hóa", d: "Sản xuất và bán sản phẩm." },
      { n: "05", t: "Phát triển", d: "Xây dựng cộng đồng và thương hiệu lâu dài." },
    ],
    note: "Không chỉ giúp một dự án huy động nguồn lực, mà giúp dự án đi từ ý tưởng đến thị trường.",
  },
  {
    kicker: "Mô hình lai",
    title: "Một nền tảng — ba cách tiếp cận thị trường",
    cards: [
      {
        title: "01 · Gây quỹ không nhận quà",
        body: "Cộng đồng hỗ trợ dự án. Phù hợp: xã hội, cộng đồng, thiện nguyện, ý tưởng sáng tạo. Đo niềm tin và sự sẵn sàng ủng hộ.",
        tone: "emerald",
      },
      {
        title: "02 · Đặt trước",
        body: "Khách hàng đặt trước khi sản xuất hàng loạt. Phù hợp: Startup, nhóm sáng tạo, hộ kinh doanh, sản phẩm mới. Đo nhu cầu thị trường.",
        tone: "emerald",
      },
      {
        title: "03 · Bán sản phẩm có sẵn",
        body: "Sản phẩm hoàn thiện bán trực tiếp. Gồm sản phẩm vật lý và sản phẩm phi vật lý / số. Kinh doanh và xây dựng thương hiệu.",
        tone: "emerald",
      },
    ],
    note: "Kiểm chứng → Sản xuất → Bán hàng → Phát triển",
  },
  {
    kicker: "Giữ chân",
    title: "Không chỉ giao dịch. Còn xây dựng mối quan hệ.",
    cards: [
      { title: "Blog", body: "Kiến thức · Câu chuyện" },
      { title: "Chat", body: "Trao đổi trực tiếp" },
      { title: "Bình luận / Thảo luận", body: "Góp ý · Phản hồi" },
      { title: "Theo dõi / Chia sẻ", body: "Lan tỏa · Đồng hành" },
      { title: "Thông báo", body: "Cập nhật hành trình" },
    ],
    lanes: [
      {
        title: "Thương hiệu",
        tone: "navy",
        steps: ["Hồ sơ", "Thương hiệu", "Sản phẩm", "Dự án", "Chiến dịch", "Khách hàng", "Lịch sử"],
      },
    ],
    note: "Chiến dịch kết thúc không có nghĩa mối quan hệ kết thúc. Các chức năng cộng đồng này hiện đã được triển khai, không còn là tính năng chỉ nằm trong định hướng.",
  },
  {
    kicker: "Mô hình lai",
    title: "Từ ý tưởng đến doanh thu",
    lanes: [
      {
        title: "Vòng đời liên tục",
        tone: "emerald",
        steps: [
          "Ý tưởng",
          "Cộng đồng",
          "Kiểm chứng",
          "Gây quỹ / Đặt trước",
          "Nghiên cứu và sản xuất",
          "Bán hàng",
          "Doanh thu",
          "Tái đầu tư",
          "Ý tưởng mới",
        ],
      },
    ],
    blocks: [
      {
        heading: "Trước",
        headingTone: "rose",
        bullets: ["Sản xuất trước → Tìm khách sau"],
      },
      {
        heading: "Sau",
        headingTone: "emerald",
        bullets: ["Kiểm chứng nhu cầu → Huy động / Đặt trước → Sản xuất → Bán hàng"],
      },
    ],
    note: "Từ một chiến dịch ngắn hạn thành một vòng đời phát triển liên tục.",
  },
  {
    kicker: "Khách hàng nhắm đến",
    title: "Tử Tế Fund dành cho ai?",
    cards: [
      { title: "Cá nhân có ý tưởng", body: "Giới thiệu · Kiểm chứng · Nhận phản hồi", tone: "emerald" },
      { title: "Nhóm sáng tạo", body: "Xây cộng đồng · Xây thương hiệu · Bán sản phẩm", tone: "emerald" },
      { title: "Startup giai đoạn đầu", body: "Kiểm chứng · Huy động · Tìm khách hàng · Thương mại hóa", tone: "emerald" },
      { title: "Người dùng trẻ", body: "Khám phá · Góp ý · Đặt trước · Mua hàng · Đồng hành" },
    ],
    lanes: [
      {
        title: "Giai đoạn mở rộng",
        tone: "navy",
        steps: ["Hộ kinh doanh", "Doanh nghiệp nhỏ", "Thương hiệu phát triển"],
      },
    ],
    note: "Bắt đầu từ cộng đồng phù hợp, sau đó mở rộng theo độ trưởng thành của nền tảng.",
  },
  {
    kicker: "Khoảng trống",
    title: "Không chỉ gọi vốn. Không chỉ bán hàng. Không chỉ xây cộng đồng.",
    body: "Tử Tế Fund kết nối cả ba.",
    lanes: [
      {
        title: "Một hành trình",
        tone: "emerald",
        steps: [
          "Crowdfunding — Huy động nguồn lực",
          "Pre-order — Kiểm chứng nhu cầu",
          "Marketplace — Bán sản phẩm có sẵn",
          "Community — Tương tác và đồng hành",
          "Brand Profile — Thương hiệu và lịch sử",
        ],
      },
    ],
    note: "Một nền tảng — một hành trình từ ý tưởng đến thương mại hóa.",
  },
  {
    kicker: "Giữ chân",
    title: "Tử Tế Fund giải quyết được gì?",
    steps: [
      { n: "01", t: "Kiểm chứng sớm", d: "Biết mức độ quan tâm trước khi đầu tư lớn." },
      { n: "02", t: "Giảm rủi ro", d: "Hạn chế sản xuất vượt quá nhu cầu." },
      { n: "03", t: "Tiếp cận khách hàng", d: "Xây dựng nhóm khách hàng ngay từ giai đoạn đầu." },
      { n: "04", t: "Xây dựng thương hiệu", d: "Tích lũy hồ sơ, uy tín và lịch sử phát triển." },
      { n: "05", t: "Tiếp tục kinh doanh", d: "Sau chiến dịch, sản phẩm vẫn có thể bán trên cùng nền tảng." },
    ],
    note: "Từ một ý tưởng → một dự án → một sản phẩm → một thương hiệu.",
  },
  {
    kicker: "Mô hình kinh doanh",
    title: "Tử Tế Fund kiếm doanh thu như thế nào?",
    cards: [
      {
        title: "Cốt lõi",
        body: "Phí giao dịch thành công. Gây quỹ · Đặt trước · Bán hàng.",
        tone: "emerald",
      },
      {
        title: "Mở rộng",
        body: "Dịch vụ gia tăng. Công cụ nâng cao · Phân tích dữ liệu · Truyền thông.",
      },
      {
        title: "Dài hạn",
        body: "Gói thương hiệu · Quảng bá · Kết nối đối tác.",
      },
    ],
    blocks: [
      {
        heading: "Hạ tầng khởi đầu",
        headingTone: "navy",
        bullets: [
          "VPS · Domain · DNS/CDN/SSL. Hạ tầng tiết kiệm, mở rộng khi lượng người dùng tăng.",
          "Chi phí cố định thấp.",
          "Chi phí biến đổi theo giao dịch: thanh toán, KYC, lưu trữ, email/SMS, bảo mật.",
        ],
      },
    ],
    note: "Tối ưu chi phí cố định — tăng chi phí theo quy mô sử dụng.",
  },
  {
    kicker: "Cơ hội",
    title: "Giá trị không chỉ dừng ở một giao dịch",
    lanes: [
      {
        title: "Người tạo",
        tone: "emerald",
        steps: ["Kiểm chứng sớm", "Giảm rủi ro", "Tăng khả năng thương mại hóa"],
      },
      {
        title: "Cộng đồng",
        tone: "navy",
        steps: ["Khám phá", "Góp ý", "Đồng hành"],
      },
    ],
    cards: [
      { title: "Thúc đẩy khởi nghiệp", body: "Hạ thấp rào cản để đưa ý tưởng vào thực tế." },
      { title: "Hỗ trợ thương mại hóa", body: "Kết nối ý tưởng với nhu cầu và thị trường." },
      { title: "Dùng nguồn lực hiệu quả", body: "Kiểm chứng trước khi đầu tư quy mô lớn." },
      {
        title: "Kết nối hệ sinh thái",
        body: "Ý tưởng ↔ Cộng đồng ↔ Thị trường ↔ Nguồn lực ↔ Chuyên gia ↔ Đối tác",
        tone: "emerald",
      },
    ],
    note: "Từ một ý tưởng có thể hình thành một sản phẩm. Từ một sản phẩm có thể hình thành một doanh nghiệp.",
  },
  {
    kicker: "Công ty tương lai",
    title: "Dự án đang ở đâu?",
    cards: [
      {
        title: "Giai đoạn 1 · Đã triển khai",
        body: "Nền tảng cốt lõi. Tài khoản, hồ sơ, dự án, chiến dịch, gây quỹ, đặt trước, bán hàng, đơn hàng, thanh toán, quản trị.",
        tone: "emerald",
      },
      {
        title: "Giai đoạn 2 · Đã triển khai",
        body: "Hệ sinh thái cộng đồng. Blog, chat, bình luận, thảo luận, theo dõi, chia sẻ, thông báo, hồ sơ thương hiệu, lưu hành trình.",
        tone: "emerald",
      },
      {
        title: "Giai đoạn 3 · Định hướng",
        body: "Hỗ trợ Startup. Chuyên gia, đối tác, tài chính, pháp lý, marketing, công nghệ.",
      },
      {
        title: "Giai đoạn 4 · Tầm nhìn",
        body: "Startup ↔ Cộng đồng ↔ Khách hàng. Chuyên gia ↔ Nhà đầu tư ↔ Đối tác.",
      },
    ],
    note: "Trọng tâm tiếp theo: phát triển người dùng, hoàn thiện mô hình, mở rộng thị trường. Từ nền tảng đã xây dựng → cộng đồng → hệ sinh thái.",
  },
  {
    variant: "close",
    kicker: "Tầm nhìn",
    title: "Một ý tưởng có thể đi xa đến đâu?",
    titleAccent: "Tử Tế Fund",
    lanes: [
      {
        title: "Vòng lặp",
        tone: "emerald",
        steps: [
          "Ý tưởng",
          "Cộng đồng",
          "Phản hồi",
          "Kiểm chứng",
          "Nguồn lực",
          "Sản phẩm",
          "Thị trường",
          "Doanh thu",
          "Tái đầu tư",
          "Ý tưởng mới",
        ],
      },
    ],
    bullets: [
      "Không cần chờ sản phẩm hoàn chỉnh mới tìm khách hàng.",
      "Bắt đầu từ một ý tưởng. Tìm thấy cộng đồng. Lắng nghe thị trường. Kết nối nguồn lực.",
      "Từng bước biến ý tưởng thành giá trị thực tế.",
      "Từ một ý tưởng đến một cộng đồng. Từ một cộng đồng đến một thị trường. Từ một thị trường đến một doanh nghiệp.",
    ],
    note: "Kiểm chứng ý tưởng · Huy động nguồn lực · Đặt trước · Bán hàng · Xây dựng thương hiệu · Phát triển cộng đồng",
  },
];
