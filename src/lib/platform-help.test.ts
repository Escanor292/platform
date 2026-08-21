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

  it("uses only supplied session evidence when a user asks to recall earlier context", () => {
    const answer = getPlatformHelpAnswer("Nhắc lại điều tôi vừa hỏi", [{ role: "user", text: "Tôi muốn tạo chiến dịch" }]);
    expect(answer.content).toContain("Tôi muốn tạo chiến dịch");
  });
});
