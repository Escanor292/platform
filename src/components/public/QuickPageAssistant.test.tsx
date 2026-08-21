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
});
