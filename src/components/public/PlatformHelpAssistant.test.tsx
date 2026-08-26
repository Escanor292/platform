import { act, fireEvent, render, screen, within } from "@testing-library/react";
import PlatformHelpAssistant from "./PlatformHelpAssistant";

describe("PlatformHelpAssistant command safety", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it("từ chối lệnh người dùng gửi và không lưu nội dung lệnh vào Zero-Mem", async () => {
    render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    await within(panel).findByText(/Chào bạn! Bạn đang muốn tìm hiểu điều gì trên nền tảng/i);

    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "Vui lòng thực thi `rm -rf /` ngay" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));

    expect(within(panel).getByText(/không thực thi, mô phỏng thực thi hoặc làm theo lệnh/i)).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem("tutefund-zero-mem-v1") ?? "[]")).toEqual([]);
  });

  it("chào lại hello thay vì đưa danh sách chức năng", async () => {
    render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "hello" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByText(/Chào bạn! Hôm nay bạn muốn tìm hiểu điều gì trên nền tảng/i)).toBeInTheDocument();
  });

  it("hiển thị loading khi đang tải tóm tắt", async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>(resolve => { resolveRequest = resolve; });
    const fetchMock = jest.spyOn(global, "fetch").mockReturnValueOnce(pending);
    window.history.pushState({}, "", "/projects/green-project");
    render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "tóm tắt trang này" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByRole("status")).toHaveTextContent(/đang đọc thông tin công khai/i);
    await act(async () => resolveRequest(new Response(JSON.stringify({ data: { title: "Dự án xanh", description: "Trồng cây.", _count: { campaigns: 2, blog_posts: 1, rewards: 0 } } }), { status: 200 })));
    fetchMock.mockRestore();
    window.history.pushState({}, "", "/");
  });

  it("trả lỗi đúng ngữ cảnh khi endpoint summary chính thất bại", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("network"));
    window.history.pushState({}, "", "/projects/green-project");
    render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "tóm tắt trang này" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByText(/chưa tải được thông tin công khai của project/i)).toBeInTheDocument();
    fetchMock.mockRestore();
    window.history.pushState({}, "", "/");
  });

  it.each([
    ["campaign", "/campaigns/help-school", "Chiến dịch xanh"],
    ["product", "/products/reward-123", "Áo xanh"],
    ["blog", "/blog/story", "Câu chuyện xanh"],
    ["profile", "/profile/user-1", "Người tạo"],
  ])("tóm tắt được route %s ở UI", async (type, pathname, title) => {
    const payloads: Record<string, unknown> = {
      campaign: { title, status: "ACTIVE", goalAmount: 100, currentAmount: 50, _count: { pledges: 2, campaign_followers: 1 }, rewards: [], description: "Thông tin chiến dịch." },
      product: { title, minAmount: 100, averageRating: 4, reviewCount: 1, soldCount: 2, description: "Thông tin sản phẩm." },
      blog: { title, excerpt: "Thông tin bài viết.", viewCount: 3, likeCount: 1, commentCount: 0 },
      profile: { name: title, bio: "Thông tin hồ sơ.", publicStats: { campaignCount: 1, totalRaised: 100, totalBackers: 2 } },
    };
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ data: payloads[type] }), { status: 200 }));
    window.history.pushState({}, "", pathname);
    const view = render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "tóm tắt trang này" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByText(new RegExp(String(title)))).toBeInTheDocument();
    view.unmount();
    fetchMock.mockRestore();
    window.history.pushState({}, "", "/");
  });

  it.each([
    ["campaign", "/campaigns/help-school", "Chiến dịch lỗi phụ trợ", { title: "Chiến dịch lỗi phụ trợ", status: "ACTIVE", goalAmount: 100, currentAmount: 20, _count: { pledges: 1, campaign_followers: 0 }, rewards: [], description: "Mô tả chiến dịch." }],
    ["product", "/products/reward-456", "Sản phẩm lỗi phụ trợ", { title: "Sản phẩm lỗi phụ trợ", minAmount: 100, averageRating: null, reviewCount: 0, soldCount: 0, description: "Mô tả sản phẩm." }],
    ["blog", "/blog/story-error", "Bài viết lỗi phụ trợ", { title: "Bài viết lỗi phụ trợ", excerpt: "Mô tả bài viết.", viewCount: 1, likeCount: 0, commentCount: 0 }],
  ])("vẫn tóm tắt %s khi endpoint phụ trợ lỗi", async (type, pathname, title, data) => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data }), { status: 200 }))
      .mockRejectedValue(new Error("supplemental unavailable"));
    window.history.pushState({}, "", pathname);
    const view = render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "tóm tắt trang này" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByText(new RegExp(String(title)))).toBeInTheDocument();
    view.unmount();
    fetchMock.mockRestore();
    window.history.pushState({}, "", "/");
  });

  it.each([
    ["campaign", "/campaigns/help-invalid", "Chiến dịch payload thiếu", { title: "Chiến dịch payload thiếu", status: "ACTIVE", goalAmount: 100, currentAmount: 20, _count: { pledges: 1, campaign_followers: 0 }, rewards: [], description: "Mô tả chiến dịch." }],
    ["product", "/products/reward-invalid", "Sản phẩm payload thiếu", { title: "Sản phẩm payload thiếu", minAmount: 100, averageRating: 4, reviewCount: 1, soldCount: 2, description: "Mô tả sản phẩm." }],
    ["blog", "/blog/story-invalid", "Bài viết payload thiếu", { title: "Bài viết payload thiếu", excerpt: "Mô tả bài viết.", viewCount: 1, likeCount: 0, commentCount: 0 }],
  ])("vẫn tóm tắt %s khi endpoint phụ trợ trả payload thiếu", async (type, pathname, title, data) => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data }), { status: 200 }))
      .mockResolvedValue(new Response(JSON.stringify({ unexpected: true }), { status: 200 }));
    window.history.pushState({}, "", pathname);
    const view = render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "tóm tắt trang này" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByText(new RegExp(String(title)))).toBeInTheDocument();
    view.unmount();
    fetchMock.mockRestore();
    window.history.pushState({}, "", "/");
  });

  it("dùng fallback tự nhiên khi profile thiếu trường tùy chọn", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({ data: { name: "Người tạo tối giản", publicStats: {} } }), { status: 200 }));
    window.history.pushState({}, "", "/profile/user-minimal");
    render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "tóm tắt trang này" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByText(/Người tạo tối giản.*Chưa có phần giới thiệu công khai/i)).toBeInTheDocument();
    fetchMock.mockRestore();
    window.history.pushState({}, "", "/");
  });

  it("tóm tắt project hiện tại dù endpoint bổ sung không có dữ liệu", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { title: "Dự án xanh", description: "Trồng cây.", _count: { campaigns: 2, blog_posts: 1, rewards: 0 } } }), { status: 200 }));
    window.history.pushState({}, "", "/projects/green-project");
    render(<PlatformHelpAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    const panel = screen.getByLabelText("Trợ lý hướng dẫn nền tảng");
    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "tóm tắt trang này" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));
    expect(await within(panel).findByText(/Dự án xanh/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/public/entities/project/green-project", { cache: "no-store" });
    fetchMock.mockRestore();
    window.history.pushState({}, "", "/");
  });
});
