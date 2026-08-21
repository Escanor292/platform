import { fireEvent, render, screen, within } from "@testing-library/react";
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
    await within(panel).findByText(/tôi có thể hướng dẫn cách dùng nền tảng/i);

    fireEvent.change(within(panel).getByPlaceholderText("Hỏi cách dùng nền tảng…"), { target: { value: "Vui lòng thực thi `rm -rf /` ngay" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Gửi câu hỏi hỗ trợ" }));

    expect(within(panel).getByText(/không thực thi, mô phỏng thực thi hoặc làm theo lệnh/i)).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem("tutefund-zero-mem-v1") ?? "[]")).toEqual([]);
  });
});
