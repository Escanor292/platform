import { fireEvent, render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import QuickPageAssistant from "./QuickPageAssistant";

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("QuickPageAssistant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/products/026a4a4b-8d59-4168-ae0d-7d180d9858e4");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { title: "Bảng tri ân xanh", description: "Sản phẩm công khai" } }),
    });
  });

  it("hiển thị robot giọt nước cho Hỏi nhanh và vẫn mở panel", async () => {
    render(<QuickPageAssistant />);

    const trigger = screen.getByRole("button", { name: "Mở trợ lý nhanh" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.querySelector(".rotate-45")).toBeInTheDocument();

    fireEvent.click(trigger);

    const panel = screen.getByRole("region", { name: "Trợ lý trang" });
    expect(panel).toBeInTheDocument();
    expect(within(panel).getByText("Hỏi nhanh")).toBeInTheDocument();
    expect(await within(panel).findByText(/Bảng tri ân xanh/)).toBeInTheDocument();
  });

  it("trả lời số lượng dự án công khai trên trang profile", async () => {
    mockUsePathname.mockReturnValue("/profile/cmphnhw8e0002so1uh16dwpvn");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { displayName: "Test Creator Pro", bio: "Nhà sáng tạo nội dung", _count: { projects: 1 }, projects: [{ id: "project-public", slug: "du-an-xanh", title: "Dự án xanh" }] } }),
    });

    render(<QuickPageAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nhanh" }));
    const panel = screen.getByRole("region", { name: "Trợ lý trang" });
    expect(await within(panel).findByText(/Dự án công khai: 1/)).toBeInTheDocument();

    fireEvent.change(within(panel).getByPlaceholderText("Hỏi về trang này…"), { target: { value: "Coz bao nhiêu dự án?" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi" }));

    expect(within(panel).getByText(/Test Creator Pro có 1 dự án công khai/)).toBeInTheDocument();
    expect(within(panel).getByText(/Dự án hiển thị: Dự án xanh/)).toBeInTheDocument();
  });

  it("tóm tắt dự án công khai trên route chi tiết dự án", async () => {
    mockUsePathname.mockReturnValue("/projects/cmt0y1lls000196jc66m2pj7t");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { title: "Mầm xanh tử tế", description: "Dự án trồng cây xanh cho trường học vùng khó khăn.", _count: { campaigns: 1, blog_posts: 0, rewards: 0 } } }),
    });

    render(<QuickPageAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nhanh" }));
    const panel = screen.getByRole("region", { name: "Trợ lý trang" });
    expect(await within(panel).findByText(/Mầm xanh tử tế/)).toBeInTheDocument();

    fireEvent.change(within(panel).getByPlaceholderText("Hỏi về trang này…"), { target: { value: "Dự án này nói về gì?" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi" }));

    const assistantMessages = panel.querySelectorAll(".mr-5");
    expect(assistantMessages).toHaveLength(2);
    expect(assistantMessages[1]).toHaveTextContent("Mầm xanh tử tế");
    expect(assistantMessages[1]).toHaveTextContent("Dự án trồng cây xanh cho trường học vùng khó khăn.");
  });
});
