jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { assistant_telemetry_events: { findMany: jest.fn() } },
}));

import prisma from "@/lib/prisma";
import { GET } from "./route";

const mockFindMany = prisma.assistant_telemetry_events.findMany as unknown as jest.Mock;
const originalKey = process.env.ASSISTANT_TELEMETRY_READ_KEY;

beforeEach(() => {
  process.env.ASSISTANT_TELEMETRY_READ_KEY = "a-long-test-telemetry-key-for-route";
  jest.clearAllMocks();
});

afterAll(() => {
  if (originalKey === undefined) delete process.env.ASSISTANT_TELEMETRY_READ_KEY;
  else process.env.ASSISTANT_TELEMETRY_READ_KEY = originalKey;
});

describe("GET /api/internal/assistant-telemetry", () => {
  it("từ chối request không có Bearer key và không truy vấn telemetry", async () => {
    const response = await GET(new Request("https://example.test/api/internal/assistant-telemetry"));
    expect(response.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("chỉ trả tổng hợp command_rejected ẩn danh theo ngày", async () => {
    mockFindMany.mockResolvedValue([
      { createdAt: new Date("2026-08-21T04:00:00.000Z") },
      { createdAt: new Date("2026-08-21T11:00:00.000Z") },
      { createdAt: new Date("2026-08-22T02:00:00.000Z") },
    ]);

    const response = await GET(new Request("https://example.test/api/internal/assistant-telemetry?rangeHours=72", {
      headers: { authorization: "Bearer a-long-test-telemetry-key-for-route" },
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(expect.objectContaining({
      assistant: "platform-help",
      event: "command_rejected",
      rangeHours: 72,
      total: 3,
      latestAt: "2026-08-22T02:00:00.000Z",
      daily: [{ date: "2026-08-21", count: 2 }, { date: "2026-08-22", count: 1 }],
    }));
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ assistant: "platform-help", eventType: "command_rejected" }),
      select: { createdAt: true },
    }));
  });
});
