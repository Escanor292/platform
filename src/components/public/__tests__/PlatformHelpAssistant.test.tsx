import { fireEvent, render, screen } from "@testing-library/react";
import PlatformHelpAssistant from "../PlatformHelpAssistant";

describe("PlatformHelpAssistant", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, "", "/");
    global.fetch = jest.fn();
  });

  it("không hiển thị dòng mô tả Zero-Mem ở chân panel", () => {
    render(<PlatformHelpAssistant />);

    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));

    expect(screen.getByRole("region", { name: "Trợ lý hướng dẫn nền tảng" })).toBeInTheDocument();
    expect(screen.getByText("Hướng dẫn công khai")).toBeInTheDocument();
    expect(screen.queryByText("Hướng dẫn công khai · Zero-Mem cục bộ")).not.toBeInTheDocument();
    expect(screen.queryByText(/Bộ nhớ Zero-Mem chỉ lưu trên thiết bị trong phiên này/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Đồng ý chia sẻ số liệu lỗi ẩn danh/i)).toBeInTheDocument();
  });

  it("tổng hợp review công khai khi người dùng hỏi trên trang sản phẩm", async () => {
    window.history.pushState({}, "", "/products/reward-public");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ reviews: [] }),
    });
    render(<PlatformHelpAssistant />);

    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));
    fireEvent.change(screen.getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "Sản phẩm có các đánh giá hay bình luận như thế nào?" } });
    fireEvent.submit(screen.getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }).closest("form")!);

    expect(await screen.findByText(/chưa có đánh giá công khai đã xác nhận/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/products/reward-public/reviews", { cache: "no-store" });
  });
});
