jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    users: { findUnique: jest.fn() },
    campaigns: { findFirst: jest.fn() },
    rewards: { findFirst: jest.fn() },
    blog_posts: { findFirst: jest.fn() },
    projects: { findFirst: jest.fn() },
  },
}));

import prisma from "@/lib/prisma";
import { GET } from "./route";

const mockFindUser = prisma.users.findUnique as unknown as jest.Mock;

describe("GET /api/public/entities/profile/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("chỉ trả profile và thông tin dự án công khai tối thiểu", async () => {
    mockFindUser.mockResolvedValue({
      id: "cmphnhw8e0002so1uh16dwpvn",
      name: "Test Creator Pro",
      displayName: "Test Creator Pro",
      avatar: null,
      bio: "Nhà sáng tạo nội dung",
      location: null,
      coverImage: null,
      _count: { projects: 1 },
      campaigns: [],
      projects: [{ id: "project-public", slug: "du-an-xanh", title: "Dự án xanh", description: "Dự án công khai", coverImage: null, createdAt: new Date("2026-08-01T00:00:00.000Z") }],
    });

    const response = await GET(new Request("https://example.test/api/public/entities/profile/cmphnhw8e0002so1uh16dwpvn"), {
      params: Promise.resolve({ type: "profile", id: "cmphnhw8e0002so1uh16dwpvn" }),
    });

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.data).toMatchObject({ _count: { projects: 1 }, publicStats: { campaignCount: 0, totalRaised: 0, totalBackers: 0 }, projects: [{ id: "project-public", title: "Dự án xanh" }] });
    expect(payload.data).not.toHaveProperty("email");
    expect(payload.data).not.toHaveProperty("password");
    expect(payload.data).not.toHaveProperty("bankAccount");

    const query = mockFindUser.mock.calls[0][0];
    expect(query.select).not.toHaveProperty("email");
    expect(query.select).not.toHaveProperty("password");
    expect(query.select.projects.select).toEqual({ id: true, slug: true, title: true, description: true, coverImage: true, createdAt: true });
  });
});
