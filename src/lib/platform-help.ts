import { COMMAND_REFUSAL, isCommandLikeRequest } from "@/lib/assistant-safety";

export type PlatformHelpAnswer = {
  content: string;
  action?: { label: string; href: string };
};

type EvidenceSnippet = { role: "user" | "assistant"; text: string };

export function isGreeting(question: string) {
  return /^(?:hello|hi|hey|alo|chào(?: bạn| ad| bot)?|xin chào|chào buổi (?:sáng|trưa|chiều|tối)|good morning|good afternoon|good evening)[!.,?\s]*$/iu.test(question.trim());
}

export function getPlatformHelpAnswer(question: string, evidence: EvidenceSnippet[] = []): PlatformHelpAnswer {
  const input = question.toLocaleLowerCase("vi-VN").trim();
  if (isGreeting(question)) return { content: "Chào bạn! Hôm nay bạn muốn tìm hiểu điều gì trên nền tảng?" };
  if (isCommandLikeRequest(question)) return { content: COMMAND_REFUSAL };
  if (/(nhắc lại|trước đó|vừa hỏi|tiếp tục|lần trước)/.test(input)) {
    const previousQuestion = evidence.find(item => item.role === "user");
    return previousQuestion ? { content: `Trong phiên này, mình thấy bạn vừa hỏi: “${previousQuestion.text}”. Mình có thể nối tiếp từ đó nếu bạn muốn.` } : { content: "Mình chưa thấy câu hỏi trước phù hợp. Bạn nói lại điều muốn tìm hiểu nhé." };
  }
  if (/(đánh giá|review|bình luận|nhận xét|phản hồi)/.test(input)) return { content: "Mình có thể đọc các đánh giá công khai trên trang sản phẩm và tóm tắt số sao, số bình luận cùng xu hướng phản hồi. Bạn mở sản phẩm muốn xem rồi hỏi mình nhé.", action: { label: "Khám phá sản phẩm", href: "/products" } };
  if (/(tạo.*chiến dịch|gây quỹ|khởi tạo.*quỹ|bắt đầu.*quỹ)/.test(input)) return { content: "Bạn có thể bắt đầu gây quỹ từ trang tạo chiến dịch. Chuẩn bị mục tiêu, câu chuyện, hình ảnh và thông tin minh bạch trước khi gửi.", action: { label: "Tạo chiến dịch", href: "/campaigns/create" } };
  if (/(tìm.*chiến dịch|khám phá.*chiến dịch|ủng hộ.*chiến dịch)/.test(input)) return { content: "Mục Chiến dịch giúp bạn khám phá các lời kêu gọi đang công khai và xem chi tiết trước khi ủng hộ.", action: { label: "Khám phá chiến dịch", href: "/campaigns" } };
  if (/(dự án|project)/.test(input)) return { content: "Mục Dự án tập hợp các hoạt động và nội dung có liên quan. Bạn có thể mở từng dự án để xem chiến dịch, bài viết và sản phẩm công khai.", action: { label: "Xem dự án", href: "/projects" } };
  if (/(bài viết|blog|tin tức)/.test(input)) return { content: "Mục Blog là nơi theo dõi câu chuyện, cập nhật và thông tin công khai từ cộng đồng trên nền tảng.", action: { label: "Đọc Blog", href: "/blog" } };
  if (/(tra cứu|kiểm tra|mã chiến dịch)/.test(input)) return { content: "Bạn có thể dùng Tra cứu để tìm thông tin công khai theo mã hoặc nội dung liên quan.", action: { label: "Mở Tra cứu", href: "/lookup" } };
  if (/(đăng nhập|tài khoản|đăng ký)/.test(input)) return { content: "Đăng nhập giúp bạn quản lý hoạt động của mình trên nền tảng. Chỉ nhập thông tin tài khoản tại màn hình đăng nhập chính thức.", action: { label: "Đăng nhập", href: "/auth/login" } };
  if (/(bảo mật|riêng tư|dữ liệu cá nhân|privacy)/.test(input)) return { content: "Chính sách bảo mật được đặt trong phần Hỗ trợ ở cuối trang. Trợ lý này không yêu cầu mật khẩu, mã xác thực hoặc thông tin thanh toán của bạn.", action: { label: "Xem phần Hỗ trợ", href: "#ho-tro" } };
  if (/(điều khoản|quy định|chính sách|terms)/.test(input)) return { content: "Điều khoản sử dụng và các chính sách công khai nằm trong phần Hỗ trợ ở cuối trang. Hãy đọc kỹ trước khi tạo hoặc ủng hộ một chiến dịch.", action: { label: "Xem phần Hỗ trợ", href: "#ho-tro" } };
  if (/(liên hệ|hỗ trợ|giúp tôi)/.test(input)) return { content: "Bạn có thể xem Trung tâm trợ giúp, Điều khoản sử dụng và Chính sách bảo mật ở phần Hỗ trợ cuối trang. Nếu cần, hãy dùng các kênh liên hệ chính thức hiển thị tại đó.", action: { label: "Đến phần Hỗ trợ", href: "#ho-tro" } };
  return { content: "Bạn đang muốn tìm hiểu phần nào trên nền tảng? Hãy nói tự nhiên, chẳng hạn tên sản phẩm, chiến dịch, dự án hoặc chính sách bạn đang quan tâm." };
}
