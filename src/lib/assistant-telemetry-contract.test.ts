import { parseAssistantTelemetryPayload } from "@/lib/assistant-telemetry-contract";

describe("assistant telemetry contract", () => {
  it("chỉ chấp nhận metadata tổng hợp trong giới hạn cố định", () => {
    expect(parseAssistantTelemetryPayload({ event: "answer_rendered", contextTraceCount: 2, hasAction: true })).toEqual({ event: "answer_rendered", contextTraceCount: 2, hasAction: true });
  });

  it("từ chối event lạ, dữ liệu nội dung và số trace ngoài giới hạn", () => {
    expect(parseAssistantTelemetryPayload({ event: "question", content: "mật khẩu của tôi" })).toBeNull();
    expect(parseAssistantTelemetryPayload({ event: "opened", contextTraceCount: 25 })).toEqual({ event: "opened" });
  });
});
