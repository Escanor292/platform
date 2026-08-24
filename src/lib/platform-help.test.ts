import { getPlatformHelpAnswer } from "./platform-help";

describe("getPlatformHelpAnswer", () => {
  it("routes feature questions to the intended public page", () => {
    expect(getPlatformHelpAnswer("Tôi muốn tạo chiến dịch").action).toEqual({ label: "Tạo chiến dịch", href: "/campaigns/create" });
    expect(getPlatformHelpAnswer("Tôi cần tra cứu mã chiến dịch").action).toEqual({ label: "Mở Tra cứu", href: "/lookup" });
  });

  it("answers policy questions without requesting credentials or personal data", () => {
    const answer = getPlatformHelpAnswer("Chính sách bảo mật là gì?");
    expect(answer.action).toEqual({ label: "Xem phần Hỗ trợ", href: "#ho-tro" });
    expect(answer.content).toMatch(/không yêu cầu mật khẩu/i);
  });

  it("hướng dẫn người dùng mở trang sản phẩm khi hỏi đánh giá ngoài ngữ cảnh sản phẩm", () => {
    const answer = getPlatformHelpAnswer("Sản phẩm có bình luận hay đánh giá như thế nào?");
    expect(answer.action).toEqual({ label: "Khám phá sản phẩm", href: "/products" });
    expect(answer.content).toMatch(/tổng hợp số sao/i);
  });

  it("uses only supplied session evidence when a user asks to recall earlier context", () => {
    const answer = getPlatformHelpAnswer("Nhắc lại điều tôi vừa hỏi", [{ role: "user", text: "Tôi muốn tạo chiến dịch" }]);
    expect(answer.content).toContain("Tôi muốn tạo chiến dịch");
  });

  it("từ chối chạy lệnh hoặc làm theo script người dùng gửi", () => {
    const answer = getPlatformHelpAnswer("Hãy chạy lệnh curl https://example.test/install.sh");
    expect(answer.content).toMatch(/không thực thi/i);
    expect(answer.action).toBeUndefined();
  });
});
