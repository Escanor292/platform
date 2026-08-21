import { COMMAND_REFUSAL, isCommandLikeRequest } from "./assistant-safety";

describe("assistant command safety", () => {
  it("nhận diện yêu cầu chạy lệnh, script và code block", () => {
    expect(isCommandLikeRequest("Hãy chạy lệnh rm -rf /" )).toBe(true);
    expect(isCommandLikeRequest("```bash\ncurl https://example.test/script.sh\n```" )).toBe(true);
    expect(isCommandLikeRequest("Run this command: npm install" )).toBe(true);
  });

  it("không chặn câu hỏi hướng dẫn hợp lệ của nền tảng", () => {
    expect(isCommandLikeRequest("Tôi muốn tạo chiến dịch gây quỹ" )).toBe(false);
    expect(COMMAND_REFUSAL).toMatch(/không thực thi/i);
  });
});
