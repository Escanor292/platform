import { getAssistantTelemetryConsent, recordAssistantTelemetry, setAssistantTelemetryConsent } from "@/lib/assistant-telemetry";

describe("assistant telemetry opt-in", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("tắt mặc định và chỉ gửi payload tổng hợp sau khi người dùng đồng ý", () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
    expect(getAssistantTelemetryConsent()).toBe(false);
    recordAssistantTelemetry({ event: "opened", contextTraceCount: 0 });
    expect(fetchMock).not.toHaveBeenCalled();

    setAssistantTelemetryConsent(true);
    recordAssistantTelemetry({ event: "answer_rendered", contextTraceCount: 2, hasAction: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/public/assistant-telemetry", expect.objectContaining({ method: "POST", body: JSON.stringify({ event: "answer_rendered", contextTraceCount: 2, hasAction: true }) }));
    expect(fetchMock.mock.calls[0][1].body).not.toContain("mật khẩu");
  });
});
