import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_1: PresentationSlide[] = [
  {
    kicker: "Slide 21",
    title: "PHỤ LỤC HỌC THUẬT",
    body: "Từ bài toán thực tế đến mô hình hệ thống",
    blocks: [
      {
        heading: "Phần phụ lục tập trung làm rõ:",
        bullets: [
          "Bối cảnh và các bên tham gia",
          "Khảo sát các mô hình tương đồng",
          "Mô hình vận hành của hệ thống",
          "Actor và User Story",
          "Chức năng và màn hình tương ứng",
          "Use Case và điều kiện chấp nhận",
          "Luồng dữ liệu và quy trình xử lý",
          "Thiết kế hệ thống và cơ sở dữ liệu",
        ],
      },
      {
        heading: "Mục tiêu",
        bullets: [
          "Chuyển bài toán kinh doanh thành một hệ thống có quy trình, vai trò, dữ liệu và chức năng rõ ràng.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 22",
    title: "AI THAM GIA VÀ BÀI TOÁN CÒN THIẾU",
    body: "Các bên tham gia trong hệ thống",
    blocks: [
      {
        heading: "GUEST / BACKER",
        bullets: [
          "Khám phá các chiến dịch đang hoạt động.",
          "Ủng hộ dự án không nhận quà.",
          "Đặt trước sản phẩm hoặc nhận Reward.",
          "Theo dõi đơn hàng, chứng từ và quyền lợi.",
        ],
      },
      {
        heading: "CREATOR",
        bullets: [
          "Xác minh danh tính hoặc thông tin tổ chức.",
          "Tạo và quản lý dự án, chiến dịch và Reward.",
          "Theo dõi giao dịch, tiến độ và đối soát.",
          "Thực hiện các cam kết với người tham gia.",
        ],
      },
      {
        heading: "ADMIN",
        bullets: [
          "Kiểm duyệt người tạo, chiến dịch và nội dung.",
          "Quản lý giao dịch, hoàn tiền và đối soát.",
          "Quản lý vi phạm và lịch sử thao tác.",
        ],
      },
      {
        heading: "SYSTEM",
        bullets: [
          "Xử lý trạng thái giao dịch.",
          "Quản lý dữ liệu và quyền truy cập.",
          "Cấp chứng từ và quyền lợi theo điều kiện.",
          "Ghi nhận lịch sử xử lý.",
        ],
      },
      {
        heading: "Khoảng trống Tử Tế Fund hướng tới giải quyết",
        bullets: [
          "Kết hợp gây quỹ không nhận quà và đặt trước sản phẩm trong cùng một chiến dịch, đồng thời duy trì hồ sơ, giao dịch và hành trình phát triển của dự án trên cùng một nền tảng.",
        ],
      },
    ],
    note: "Nguồn gốc nội dung actor và mô hình vận hành được thể hiện trong phần phân tích hệ thống của tài liệu.",
  },
  {
    kicker: "Slide 23",
    title: "KHUNG KHẢO SÁT",
    body: "6 tiêu chí đối chiếu các nền tảng tương đồng",
    table: {
      headers: ["Tiêu chí", "Nội dung xem xét"],
      rows: [
        ["1. Phân khúc", "Nền tảng phục vụ nhóm người dùng và nhu cầu nào?"],
        ["2. Mô hình vận hành", "Ai tạo chiến dịch, ai tham gia và dòng tiền được xử lý như thế nào?"],
        ["3. Chức năng chính", "Người dùng có thể thực hiện những hoạt động cốt lõi nào?"],
        ["4. Ưu điểm", "Những điểm nào đã được thị trường chứng minh hoặc sử dụng hiệu quả?"],
        ["5. Hạn chế", "Những điểm nào còn gây khó khăn cho người tạo hoặc người dùng Việt Nam?"],
        ["6. Bài học áp dụng", "Tử Tế Fund có thể học hoặc điều chỉnh điểm nào?"],
      ],
    },
    blocks: [
      {
        heading: "Nguyên tắc khảo sát",
        bullets: [
          "Không sao chép mô hình. Phân tích để xác định khoảng trống và lựa chọn những yếu tố phù hợp với Tử Tế Fund.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 24",
    title: "KICKSTARTER · INDIEGOGO · GOFUNDME",
    blocks: [
      {
        heading: "Kickstarter",
        bullets: [
          "Mô hình: Reward, All-or-Nothing",
          "Thế mạnh: Thương hiệu crowdfunding mạnh, cộng đồng backer quốc tế, Reward rõ ràng.",
          "Hạn chế: Khó tiếp cận đối với creator Việt Nam do yêu cầu xác minh và cổng thanh toán quốc tế.",
          "Bài học: Cơ chế mục tiêu, Reward và cộng đồng backer.",
        ],
      },
      {
        heading: "Indiegogo",
        bullets: [
          "Mô hình: All-or-Nothing hoặc Keep-It-All.",
          "Thế mạnh: Linh hoạt hơn và có khả năng tiếp tục bán sau chiến dịch.",
          "Hạn chế: Vẫn phụ thuộc vào hệ thống thanh toán quốc tế.",
          "Bài học: Cho phép nhiều cách thức huy động và duy trì hành trình sau chiến dịch.",
        ],
      },
      {
        heading: "GoFundMe",
        bullets: [
          "Mô hình: Gây quỹ cộng đồng, không tập trung bán sản phẩm.",
          "Thế mạnh: Đơn giản, phù hợp với các hoạt động ủng hộ.",
          "Hạn chế: Không kết hợp Reward và Pre-order thương mại.",
          "Bài học: Tách rõ hoạt động ủng hộ khỏi giao dịch mua bán.",
        ],
      },
      {
        heading: "Kết luận khảo sát",
        bullets: [
          "Tử Tế Fund có thể kế thừa những cơ chế phù hợp nhưng cần nội địa hóa thanh toán, xác minh và quy trình vận hành cho thị trường Việt Nam.",
          "Các đặc điểm so sánh này được lấy từ phần khảo sát Kickstarter, Indiegogo và GoFundMe trong tài liệu.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 25",
    title: "PATREON · CAMPFIRE · WADIZ",
    blocks: [
      {
        heading: "Patreon",
        bullets: [
          "Mô hình: Thành viên trả phí định kỳ cho nội dung số.",
          "Thế mạnh: Tạo doanh thu lặp lại và duy trì cộng đồng.",
          "Hạn chế: Không tập trung vào huy động vốn một lần để phát triển sản phẩm.",
          "Bài học: Giá trị cộng đồng và khả năng duy trì người dùng.",
        ],
      },
      {
        heading: "Campfire",
        bullets: [
          "Mô hình: Crowdfunding nội địa Nhật Bản.",
          "Thế mạnh: Nội địa hóa trải nghiệm và phương thức thanh toán.",
          "Hạn chế: Thị trường chủ yếu tập trung tại Nhật Bản.",
          "Bài học: Tử Tế Fund cần ưu tiên trải nghiệm và thanh toán phù hợp với người dùng Việt Nam.",
        ],
      },
      {
        heading: "Wadiz",
        bullets: [
          "Mô hình: Crowdfunding và Pre-order thương mại.",
          "Thế mạnh: Pre-order mạnh và có các chương trình hỗ trợ dự án.",
          "Hạn chế: Chi phí và điều kiện tham gia có thể cao đối với nhóm nhỏ.",
          "Bài học: Tập trung vào khả năng kiểm chứng nhu cầu và cam kết giao hàng.",
        ],
      },
    ],
    note: "Các nội dung khảo sát tương ứng nằm trong phần nghiên cứu Patreon, Campfire và Wadiz.",
  },
  {
    kicker: "Slide 26",
    title: "COMICOLA · THIỆN NGUYỆN MB · GIVEDNOW",
    blocks: [
      {
        heading: "Comicola",
        bullets: [
          "Định hướng: Nội dung và sản phẩm văn hóa.",
          "Thế mạnh: Hiểu thị trường nội địa và cộng đồng chuyên biệt.",
          "Hạn chế: Phạm vi tập trung vào một số nhóm sản phẩm.",
          "Bài học: Nội địa hóa cộng đồng và phát triển hệ thống Reward.",
        ],
      },
      {
        heading: "Thiện Nguyện MB",
        bullets: [
          "Định hướng: Hoạt động thiện nguyện và nhân đạo.",
          "Thế mạnh: Tính minh bạch và niềm tin cộng đồng.",
          "Hạn chế: Không tập trung vào thương mại và Pre-order.",
          "Bài học: Minh bạch dòng tiền và duy trì lịch sử giao dịch.",
        ],
      },
      {
        heading: "GiveNow",
        bullets: [
          "Định hướng: NGO, giáo dục, bảo tồn và các hoạt động cộng đồng.",
          "Thế mạnh: Chứng từ và hoạt động ủng hộ rõ ràng.",
          "Hạn chế: Không kết hợp gây quỹ với Pre-order thương mại.",
          "Bài học: Phân biệt rõ hoạt động ủng hộ và giao dịch thương mại.",
        ],
      },
      {
        heading: "Kết luận",
        bullets: [
          "Thị trường hiện có nhiều nền tảng phục vụ từng nhu cầu riêng. Khoảng trống Tử Tế Fund hướng đến là kết nối các nhu cầu đó trong cùng một hành trình.",
          "Các nội dung đối chiếu này được lấy từ phần khảo sát Comicola, Thiện Nguyện MB và GiveNow.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 27",
    title: "BẢNG SO SÁNH MÔ HÌNH",
    body: "Tử Tế Fund kế thừa và khác biệt ở đâu?",
    table: {
      headers: ["Tiêu chí", "Nền tảng quốc tế", "Nền tảng Việt Nam", "Tử Tế Fund"],
      rows: [
        ["Thanh toán", "Thẻ, PayPal, Stripe", "Chuyển khoản, ứng dụng ngân hàng", "Ví, thẻ quốc tế, NAPAS, VietQR"],
        ["Xác minh", "Hộ chiếu, địa chỉ quốc tế", "Thủ công hoặc tùy nền tảng", "CCCD / MST / GPKD"],
        ["Giữ tiền", "Thường theo chiến dịch", "Hạn chế cơ chế theo đơn", "Định hướng giữ theo từng giao dịch"],
        ["Chứng từ", "Biên lai nền tảng", "Sao kê hoặc chứng từ riêng", "TT-UH cho ủng hộ, chứng từ giao dịch Reward"],
        ["Bán hàng tiếp", "Tùy nền tảng", "Có ở một số mô hình", "Cùng hồ sơ thương hiệu"],
        ["Kiểm chứng nhu cầu", "Goal / Backer", "Tùy nền tảng", "Gây quỹ + Pre-order"],
        ["Mô hình phí", "Theo từng nền tảng", "Theo từng nền tảng", "Phí giao dịch theo mô hình"],
        ["Cộng đồng", "Tùy nền tảng", "Tùy nền tảng", "Blog · Chat · Thảo luận · Theo dõi"],
      ],
    },
    blocks: [
      {
        heading: "Điểm khác biệt",
        bullets: [
          "Tử Tế Fund hướng tới một hành trình liên tục: Kiểm chứng → Huy động / Đặt trước → Sản xuất → Bán hàng → Xây dựng thương hiệu.",
          "Bảng này được biên tập lại từ phần so sánh hệ thống hiện có trong tài liệu.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 28",
    title: "BỨC TRANH HỆ THỐNG",
    body: "8 bước của một chiến dịch",
    steps: [
      { n: "01", t: "XÁC MINH", d: "Creator cung cấp thông tin cá nhân hoặc tổ chức." },
      { n: "02", t: "TẠO CHIẾN DỊCH", d: "Tạo Project và Campaign ở trạng thái DRAFT." },
      { n: "03", t: "KIỂM DUYỆT", d: "Admin kiểm tra KYC và nội dung chiến dịch." },
      { n: "04", t: "CÔNG KHAI", d: "Chiến dịch được chuyển sang ACTIVE và bắt đầu nhận tham gia." },
      { n: "05", t: "GIAO DỊCH", d: "Backer ủng hộ hoặc đặt Reward." },
      { n: "06", t: "ĐỐI SOÁT", d: "Giao dịch được xác nhận sau khi hệ thống đối soát." },
      { n: "07", t: "THỰC HIỆN CAM KẾT", d: "Creator sản xuất, giao hàng hoặc cung cấp sản phẩm." },
      { n: "08", t: "CHI / HOÀN", d: "Đủ điều kiện → giải ngân. Không đạt điều kiện → hoàn tiền theo quy định." },
    ],
    blocks: [
      {
        heading: "Luồng tổng quát",
        bullets: [
          "Creator → Kiểm duyệt → Campaign → Backer → Giao dịch → Đối soát → Giao hàng → Giải ngân / Hoàn tiền",
        ],
      },
    ],
    note: "Mô hình 8 bước và các trạng thái xử lý được lấy từ phần mô tả hệ thống trong tài liệu.",
  },
];
