import { appendZeroMemTrace, clearZeroMemTraces, isZeroMemSensitive, loadZeroMemTraces, retrieveZeroMemEvidence, ZERO_MEM_TTL_MS } from "./zero-mem";

describe("Zero-Mem local reimplementation", () => {
  const sessionId = "test-session";

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("keeps provenance traces and retrieves temporal evidence without an LLM", () => {
    appendZeroMemTrace(sessionId, "user", "Tôi muốn tạo chiến dịch", 1_000);
    appendZeroMemTrace(sessionId, "assistant", "Bạn có thể bắt đầu tại trang tạo chiến dịch.", 1_001);
    const traces = loadZeroMemTraces(sessionId, 1_100);
    const evidence = retrieveZeroMemEvidence("Nhắc lại điều tôi vừa hỏi", traces, 1_200);
    expect(evidence.map(item => item.text)).toContain("Tôi muốn tạo chiến dịch");
    expect(evidence.every(item => item.source === "platform-help")).toBe(true);
  });

  it("refuses secrets, expires stale traces and supports explicit deletion", () => {
    expect(isZeroMemSensitive("OTP của tôi là 123456")).toBe(true);
    expect(appendZeroMemTrace(sessionId, "user", "API key abcdefghijk", 1_000).accepted).toBe(false);
    appendZeroMemTrace(sessionId, "user", "Tôi cần tra cứu chiến dịch", 1_000);
    expect(loadZeroMemTraces(sessionId, 1_000 + ZERO_MEM_TTL_MS + 1)).toHaveLength(0);
    appendZeroMemTrace(sessionId, "user", "Tôi muốn xem blog", 10_000);
    clearZeroMemTraces(sessionId, 10_001);
    expect(loadZeroMemTraces(sessionId, 10_002)).toHaveLength(0);
  });
});
