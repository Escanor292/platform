const COMMAND_PATTERN = /```[\s\S]*?```|(?:^|\n)\s*(?:sudo|curl|wget|rm|chmod|chown|git|npm|pnpm|yarn|node|python|bash|sh|powershell|cmd)\b|(?:hãy|vui lòng|giúp|please|can you)?\s*(?:chạy|thực thi|execute|run)\s+(?:lệnh|command|script|mã|code)\b|\b(?:run|execute)\s+(?:this|the)?\s*(?:command|script|code)\b/i;

export const COMMAND_REFUSAL = "Vì an toàn, tôi không thực thi, mô phỏng thực thi hoặc làm theo lệnh, đoạn mã hay script do người dùng gửi. Tôi chỉ có thể hỗ trợ thông tin công khai và hướng dẫn sử dụng nền tảng.";

export function isCommandLikeRequest(value: string) {
  return COMMAND_PATTERN.test(value.trim());
}
