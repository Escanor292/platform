import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const ACADEMIC_SLIDES_2: PresentationSlide[] = [
  {
    kicker: "Slide 29",
    title: "ACTOR: NGƯỜI DÙNG",
    body: "4 vai trò chính",
    blocks: [
      {
        heading: "GUEST",
        bullets: [
          "Xem chiến dịch công khai.",
          "Tìm kiếm và đọc Blog.",
          "Ủng hộ không nhận quà bằng email.",
          "Đăng nhập khi muốn đặt Reward.",
          "Điều kiện: Chỉ hiển thị Campaign đang ACTIVE.",
        ],
      },
      {
        heading: "BACKER",
        bullets: [
          "Ủng hộ không nhận quà.",
          "Đặt Reward.",
          "Theo dõi Kho đồ và chứng từ.",
          "Chat với Creator.",
          "Báo cáo chiến dịch.",
          "Theo dõi dự án.",
          "Điều kiện: Campaign còn hiệu lực, còn suất và đáp ứng điều kiện giao dịch.",
        ],
      },
      {
        heading: "CREATOR",
        bullets: [
          "Xác minh KYC/KYB.",
          "Tạo và quản lý Project, Campaign và Reward.",
          "Cập nhật chiến dịch.",
          "Xác nhận giao hàng.",
          "Theo dõi sao kê.",
          "Điều kiện: Hồ sơ được xác minh trước khi Campaign chuyển sang ACTIVE.",
        ],
      },
      {
        heading: "ADMIN",
        bullets: [
          "Duyệt KYC.",
          "Duyệt Campaign và Blog.",
          "Đối soát giao dịch.",
          "Xử lý hoàn tiền.",
          "Khóa tài khoản vi phạm.",
          "Theo dõi Audit Log.",
          "Nguyên tắc: Mọi thao tác quản trị quan trọng đều được ghi nhận lịch sử.",
        ],
      },
    ],
    note: "Các vai trò và điều kiện chấp nhận tương ứng được mô tả tại phần Actor và User Story của tài liệu.",
  },
  {
    kicker: "Slide 30",
    title: "ACTOR: TỔ CHỨC",
    body: "Creator tổ chức và Backer tổ chức",
    blocks: [
      {
        heading: "CREATOR TỔ CHỨC",
        bullets: [
          "Tổ chức có thể sử dụng nền tảng với tư cách người tạo dự án.",
          "Thông tin cần xác minh:",
          "MST · GPKD · Thông tin pháp nhân",
          "Có thể thực hiện",
          "Tạo và quản lý Campaign.",
          "Gây quỹ.",
          "Đặt trước.",
          "Bán sản phẩm.",
          "Xác nhận giao hàng.",
          "Theo dõi và đối soát giao dịch.",
          "Nguyên tắc",
          "Nền tảng cung cấp hạ tầng giao dịch và kết nối, không trở thành người bán thay cho tổ chức.",
        ],
      },
      {
        heading: "BACKER TỔ CHỨC",
        bullets: [
          "Tổ chức có thể tham gia với tư cách người ủng hộ hoặc người mua.",
          "Có thể:",
          "Gây quỹ.",
          "Đặt Reward.",
          "Theo dõi giao dịch.",
          "Quản lý Kho đồ và chứng từ của tài khoản.",
          "Giới hạn",
          "Không có cơ chế góp vốn cổ phần hoặc chia lợi nhuận trong mô hình hiện tại.",
          "Phân quyền",
          "Tổ chức sử dụng vai trò tương ứng của người dùng nhưng không có quyền truy cập chức năng quản trị hệ thống.",
        ],
      },
    ],
    note: "Các quy tắc dành cho tài khoản tổ chức được xây dựng từ phần Actor tổ chức trong tài liệu.",
  },
  {
    kicker: "Slide 31",
    title: "ACTOR: HỆ THỐNG",
    body: "Hệ thống và các thành phần chính",
    paragraphs: [
      { text: "Hệ thống là actor tự động, không trực tiếp thực hiện thao tác như người dùng." },
    ],
    blocks: [
      {
        heading: "1. Thanh toán",
        bullets: [
          "Hỗ trợ 4 kênh: Ví điện tử, Thẻ quốc tế, NAPAS, VietQR",
          "Tạo giao dịch ở trạng thái PENDING",
          "Chỉ chuyển sang SUCCESS sau khi đối soát với tài khoản trung gian",
        ],
      },
      {
        heading: "2. Dữ liệu nghiệp vụ",
        bullets: [
          "Quản lý User, KYC, Campaign, Pledge, Invoice, Certificate, Kho đồ",
          "Giao dịch PENDING chưa được ghi nhận vào số tiền huy động",
          "Giao dịch FAILED không cấp quà hoặc chứng từ",
        ],
      },
      {
        heading: "3. Chứng từ và quà",
        bullets: [
          "Donation thành công → cấp TT-UH",
          "Reward thành công → cấp INV- và quà trong Kho đồ",
          "Hoàn tiền → thu hồi quyền nhận quà đã cấp",
          "Không tạo trùng quà khi một giao dịch được settle nhiều lần",
        ],
      },
      {
        heading: "4. Quản lý thời hạn và tiền",
        bullets: [
          "Theo dõi SLA = hạn cam kết + 2 ngày",
          "Tiền được giữ, chi hoặc hoàn theo từng đơn",
          "Chỉ chi cho creator khi chiến dịch đã chốt và đơn đủ điều kiện",
        ],
      },
      {
        heading: "5. Hạ tầng",
        bullets: [
          "PostgreSQL: dữ liệu nghiệp vụ và sổ giao dịch",
          "MongoDB: dữ liệu chat",
          "Redis: cache campaign và thống kê",
          "Cloudinary: lưu trữ hình ảnh",
        ],
      },
    ],
  },
  {
    kicker: "Slide 32",
    title: "USER STORY & AC: GUEST",
    body: "Guest — Người chưa đăng nhập",
    blocks: [
      {
        heading: "US-G01 | Xem chiến dịch",
        bullets: [
          "Xem danh sách và chi tiết các chiến dịch đang hoạt động",
          "Chỉ hiển thị campaign có trạng thái ACTIVE",
          "Bộ lọc danh mục phải khớp đúng nhãn",
        ],
      },
      {
        heading: "US-G02 | Tạo tài khoản",
        bullets: [
          "Đăng ký tài khoản để đặt Reward và sử dụng Kho đồ",
          "Tài khoản mới mặc định có role BACKER",
          "Email đã tồn tại không được tạo tài khoản trùng",
        ],
      },
      {
        heading: "US-G03 | Ủng hộ không quà",
        bullets: [
          "Có thể ủng hộ bằng Gmail mà không cần đăng nhập",
          "Donation không quà tạo pledge ở trạng thái PENDING",
          "Sau khi settle thành công, hệ thống gửi TT-UH qua email",
        ],
      },
      {
        heading: "US-G04 | Đọc nội dung",
        bullets: [
          "Xem các bài viết đã được xuất bản",
          "Bài chưa được duyệt không xuất hiện trên trang công khai",
          "Guest không được truy cập khu vực quản trị",
        ],
      },
      {
        heading: "Nguyên tắc chính",
        bullets: [
          "Guest có thể khám phá và ủng hộ không quà, nhưng phải đăng nhập để nhận Reward và sử dụng Kho đồ.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 33",
    title: "USER STORY & AC: BACKER",
    body: "Backer — Người ủng hộ / khách hàng",
    blocks: [
      {
        heading: "US-B01 | Ủng hộ không quà",
        bullets: [
          "Donation luôn sử dụng thanh toán ONLINE",
          "Trước khi settle chưa cấp chứng từ",
          "Khi thành công → gửi Gmail và lưu chứng từ trong Kho đồ",
        ],
      },
      {
        heading: "US-B02 | Đặt Reward",
        bullets: [
          "Phải đăng nhập để đặt gói có quà",
          "Sau khi thanh toán thành công, quà số được cấp vào Kho đồ",
          "Không cho tạo đơn khi hết suất hoặc hết hạn",
        ],
      },
      {
        heading: "US-B03 | Hoàn tiền",
        bullets: [
          "Đơn quá hạn theo SLA = hạn cam kết + 2 ngày được xử lý hoàn",
          "Hoàn tiền đồng thời thu hồi quà đã cấp",
          "Một đơn bị trễ không ảnh hưởng đến các đơn đã hoàn thành",
        ],
      },
      {
        heading: "US-B04 | Tip",
        bullets: [
          "Cho phép người dùng chủ động lựa chọn mức tip",
          "Tip không làm thay đổi giá của Reward",
          "Tip không làm thay đổi tỷ lệ phí của phần Reward",
        ],
      },
      {
        heading: "US-B05 | Trao đổi với Creator",
        bullets: [
          "Backer đã đăng nhập có thể nhắn tin với Creator",
          "Nội dung hội thoại được quản lý riêng với dữ liệu giao dịch",
          "Thông tin chat không làm thay đổi số liệu tài chính",
        ],
      },
      {
        heading: "US-B06 | Báo cáo chiến dịch",
        bullets: [
          "Backer có thể gửi báo cáo sai phạm",
          "Báo cáo được gắn với campaign và người gửi",
          "Chỉ Admin có quyền thay đổi trạng thái xử lý",
        ],
      },
    ],
  },
  {
    kicker: "Slide 34",
    title: "USER STORY & AC: CREATOR",
    body: "Creator — Người tạo dự án",
    blocks: [
      {
        heading: "US-C01 | Xác minh danh tính",
        bullets: [
          "Nộp CCCD và thực hiện xác minh KYC",
          "Nếu thiếu thông tin bắt buộc, hồ sơ bị từ chối",
          "Campaign chưa được xác minh không thể chuyển sang ACTIVE",
        ],
      },
      {
        heading: "US-C02 | Tạo chiến dịch",
        bullets: [
          "Một campaign có thể kết hợp:",
          "Ủng hộ không quà",
          "Reward / Đặt trước",
          "Donation → TT-UH",
          "Reward → INV- và Kho đồ",
          "Campaign phải có mục tiêu huy động hợp lệ và đầy đủ nội dung cần thiết",
        ],
      },
      {
        heading: "US-C03 | Theo dõi sao kê",
        bullets: [
          "SUCCESS, hoàn và chi được ghi thành các dòng giao dịch riêng",
          "Creator không được chỉnh sửa dữ liệu đối soát đã ghi",
          "Lịch sử giao dịch không bị xóa",
        ],
      },
      {
        heading: "US-C04 | Xác nhận giao hàng",
        bullets: [
          "Creator xác nhận gửi hàng hoặc sẵn sàng bàn giao tại chỗ",
          "Đơn quá hạn SLA không đủ điều kiện chi",
          "Đơn đã hoàn thành không bị ảnh hưởng bởi đơn khác đang xử lý",
        ],
      },
      {
        heading: "US-C05 | Cập nhật chiến dịch",
        bullets: [
          "Creator có thể đăng cập nhật tiến độ cho Backer",
          "Nội dung cập nhật được phân loại theo trạng thái kiểm duyệt",
          "Bài bị từ chối phải lưu lý do và thông tin người duyệt",
        ],
      },
      {
        heading: "US-C06 | Creator tổ chức",
        bullets: [
          "Tổ chức cung cấp MST và GPKD",
          "Chỉ được công khai campaign sau khi hồ sơ được duyệt",
          "Creator tổ chức tự chịu trách nhiệm về hóa đơn GTGT của mình",
        ],
      },
    ],
  },
  {
    kicker: "Slide 35",
    title: "USER STORY & AC: HỒ SƠ, THEO DÕI & KIỂM SOÁT",
    blocks: [
      {
        heading: "Creator — Quản lý nội dung và hồ sơ",
      },
      {
        heading: "US-C07 | Chỉnh sửa chiến dịch",
        bullets: [
          "Cho phép chỉnh sửa campaign DRAFT hoặc campaign bị từ chối",
          "Campaign ACTIVE không được tự ý thay đổi các thông tin quan trọng đã phát sinh giao dịch",
          "Sau khi chỉnh sửa campaign bị từ chối, phải gửi duyệt lại",
        ],
      },
      {
        heading: "US-C08 | Hồ sơ công khai",
        bullets: [
          "Creator có thể sắp xếp các nội dung trên hồ sơ",
          "Thay đổi chỉ có hiệu lực sau khi Lưu nháp → Xuất bản",
          "Hồ sơ công khai không thay thế trạng thái KYC",
        ],
      },
      {
        heading: "Backer — Theo dõi",
      },
      {
        heading: "US-B07 | Theo dõi Creator / Campaign",
        bullets: [
          "Người dùng đăng nhập có thể theo dõi Creator hoặc campaign",
          "Theo dõi giúp nhận thông báo khi có cập nhật mới",
          "Hủy theo dõi không làm mất lịch sử giao dịch hoặc chứng từ",
        ],
      },
      {
        heading: "Admin — Kiểm soát và truy vết",
      },
      {
        heading: "US-A05 | Audit Log",
        bullets: [
          "Các thao tác quan trọng của Admin được ghi nhận vào Audit Log",
          "Bao gồm các hoạt động như khóa tài khoản, duyệt và settle",
          "Audit Log không được phép làm thay đổi dữ liệu giao dịch",
        ],
      },
      {
        heading: "Nguyên tắc kiểm soát",
        bullets: [
          "Mọi thay đổi quan trọng đều phải có trạng thái rõ ràng, lý do xử lý và khả năng truy vết.",
        ],
      },
    ],
  },
  {
    kicker: "Slide 36",
    title: "USER STORY & AC: ADMIN VÀ SYSTEM",
    blocks: [
      { heading: "Admin — Quản trị hệ thống" },
      {
        heading: "US-A01 | Quản lý eKYC",
        bullets: [
          "Có thể bật hoặc tắt eKYC từ trang quản trị.",
          "Khi eKYC tắt, Creator được chuyển sang quy trình xác minh thủ công.",
          "Việc thay đổi trạng thái eKYC được lưu lại trong hệ thống.",
        ],
      },
      {
        heading: "US-A02 | Đối soát và Settle",
        bullets: [
          "Admin thực hiện settle giao dịch thông qua tài khoản trung gian.",
          "Chỉ khi giao dịch SUCCESS mới cấp chứng từ TT-UH.",
          "Pledge Reward không sử dụng luồng chứng từ Donation.",
        ],
      },
      {
        heading: "US-A03 | Kiểm duyệt",
        bullets: [
          "Admin có quyền duyệt hoặc từ chối KYC, campaign và blog.",
          "Trường hợp từ chối phải ghi rõ lý do.",
          "Nội dung bị từ chối không được công khai.",
        ],
      },
      {
        heading: "US-A04 | Khóa tài khoản",
        bullets: [
          "Khóa tài khoản vi phạm để ngăn tạo giao dịch hoặc campaign mới.",
          "Không xóa các pledge và chứng từ đã phát sinh.",
          "Mọi thao tác khóa tài khoản đều được ghi nhận vào Audit Log.",
        ],
      },
      { heading: "System — Hệ thống tự động" },
      {
        heading: "US-S01 | Cấp quà",
        bullets: [
          "Chỉ cấp quà sau khi pledge chuyển sang SUCCESS.",
          "Không cấp trùng khi cùng một giao dịch được xử lý nhiều lần.",
        ],
      },
      {
        heading: "US-S02 | Hoàn và thu hồi",
        bullets: [
          "Khi hoàn tiền, hệ thống thu hồi quà đã cấp.",
          "Lịch sử giao dịch vẫn được giữ nguyên để phục vụ đối soát.",
        ],
      },
      {
        heading: "US-S03 | Cache",
        bullets: [
          "Cache campaign và thống kê trong 300 giây.",
          "Khi Redis lỗi, hệ thống chuyển sang đọc dữ liệu từ cơ sở dữ liệu.",
        ],
      },
      {
        heading: "US-S04 | Kiểm soát chứng từ",
        bullets: [
          "PENDING không được cấp chứng từ hoặc quà.",
          "Donation thành công cấp TT-UH; Reward thành công cấp INV- và quà tương ứng.",
        ],
      },
    ],
  },
];
