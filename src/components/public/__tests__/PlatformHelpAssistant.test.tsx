import { fireEvent, render, screen } from "@testing-library/react";
import PlatformHelpAssistant from "../PlatformHelpAssistant";

describe("PlatformHelpAssistant", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("không hiển thị dòng mô tả Zero-Mem ở chân panel", () => {
    render(<PlatformHelpAssistant />);

    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý nền tảng" }));

    expect(screen.getByRole("region", { name: "Trợ lý hướng dẫn nền tảng" })).toBeInTheDocument();
    expect(screen.queryByText(/Bộ nhớ Zero-Mem chỉ lưu trên thiết bị trong phiên này/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Đồng ý chia sẻ số liệu lỗi ẩn danh/i)).toBeInTheDocument();
  });
});
