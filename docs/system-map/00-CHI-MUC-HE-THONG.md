# Bộ tài liệu bản đồ hệ thống Tử Tế Fund

**Ngày rà soát:** 22/08/2026  
**Repository:** [`Escanor292/platform`](https://github.com/Escanor292/platform)  
**Branch đối chiếu:** `origin/main`  
**Commit hiện tại:** `9bf7ad1` — merge Pull Request #2  
**Mục đích:** Tài liệu hóa hệ thống dựa trên mã nguồn hiện tại, đồng thời phân biệt rõ tài liệu chuẩn, tài liệu lịch sử và phần cần xác minh.

> **Quy tắc đọc:** Khi tài liệu cũ khác với mã nguồn hiện tại, ưu tiên `prisma/schema.prisma`, source code trong `src/`, migration đang được quản lý và cấu hình build. Các báo cáo hoàn thành trong `.kiro/` hoặc `docs/` là bằng chứng lịch sử, không tự động phản ánh trạng thái hiện tại.

## 1. Thành phần của bộ tài liệu

| File | Nội dung | Dùng khi |
|---|---|---|
| [`01-KIEN-TRUC-HE-THONG.md`](./01-KIEN-TRUC-HE-THONG.md) | Kiến trúc chạy thật, thư mục, database và tích hợp ngoài | Cần hiểu toàn cảnh hệ thống |
| [`02-MO-HINH-DU-LIEU.md`](./02-MO-HINH-DU-LIEU.md) | Entity, quan hệ PostgreSQL/Prisma và miền nghiệp vụ | Cần sửa schema, API hoặc migration |
| [`03-API-AUTH-THANH-TOAN.md`](./03-API-AUTH-THANH-TOAN.md) | Nhóm API, xác thực, reset mật khẩu và payment flow | Cần tích hợp hoặc debug backend |
| [`04-LUONG-NGUOI-DUNG.md`](./04-LUONG-NGUOI-DUNG.md) | Luồng campaign, project, reward/product, blog, chat và checkout | Cần phát triển UI/UX hoặc kiểm thử chức năng |
| [`05-BAO-MAT-VAN-HANH.md`](./05-BAO-MAT-VAN-HANH.md) | Bảo mật, biến môi trường, build/deploy, test và rủi ro | Cần triển khai production hoặc audit |
| [`06-KIEM-KE-TAI-LIEU-CAP-NHAT.md`](./06-KIEM-KE-TAI-LIEU-CAP-NHAT.md) | Đối chiếu 84 Markdown, nhóm trùng lặp và thay đổi mới trên GitHub | Cần biết tài liệu nào nên đọc hoặc đã lỗi thời |

## 2. Bản đồ nhanh hệ thống

Tử Tế Fund là ứng dụng Next.js 15 dùng App Router. React 19 và Tailwind CSS đảm nhiệm giao diện; các route trong `src/app/api` đảm nhiệm backend; Prisma kết nối PostgreSQL; MongoDB phục vụ các vùng dữ liệu chat và nội dung phụ trợ. Mã nguồn hiện có các miền campaign/project, reward/product, blog, chat, user/auth, KYC, dashboard, notification và payment.

Theo snapshot hiện tại, repository có khoảng **102 API route handlers**, **52 page files**, **148 component files**, **58 thư viện nội bộ** và **27 file test**. Các con số này là số lượng file trên working tree tại thời điểm rà soát, không phải cam kết coverage hay số endpoint production đã được nghiệm thu.

## 3. Trạng thái cập nhật mới nhất

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| `d003889` | Đồng bộ theme creator rewards | Đã có trên `main` |
| `a32c5ed` | Checkout đa phương thức an toàn | Đã có trên `main` qua PR #2 |
| `1e8a93d` | Quên mật khẩu và đặt lại mật khẩu | Đã có trên `main` qua PR #2 |
| `9bf7ad1` | Merge PR #2 vào `main` | Commit hiện tại |

Trong lần `git fetch origin main` ngày 22/08/2026, local đã đồng bộ với `origin/main` và không phát hiện commit mới hơn `9bf7ad1`.

## 4. Phân loại độ tin cậy của tài liệu

| Nhãn | Ý nghĩa |
|---|---|
| **Đã xác nhận trong code** | Có thể kiểm tra trực tiếp trong schema, route, component, package script hoặc migration hiện tại |
| **Đã triển khai nhưng cần xác minh runtime** | Có code nhưng còn phụ thuộc database, secret, provider, webhook, seed hoặc môi trường production |
| **Tài liệu lịch sử** | Mô tả một mốc phát triển trước đây; có thể chứa số liệu, đường dẫn hoặc trạng thái cũ |
| **Kế hoạch/chưa cam kết** | Đề xuất, thiết kế hoặc danh sách việc; không được coi là tính năng đã có |

## 5. Cách cập nhật về sau

Mỗi thay đổi lớn nên cập nhật file chuyên đề tương ứng và bổ sung một dòng trong bảng trạng thái ở đây. Sau khi thay đổi schema, cần cập nhật `02-MO-HINH-DU-LIEU.md`; sau khi thêm route hoặc quyền truy cập, cập nhật `03-API-AUTH-THANH-TOAN.md`; sau khi thay đổi deployment hoặc secret, cập nhật `05-BAO-MAT-VAN-HANH.md`.

**Tài liệu được tổng hợp bởi Manus AI từ mã nguồn và tài liệu trong repository.**

---

## 6. Thứ tự đọc khuyến nghị

Người mới nên đọc file này, sau đó đọc kiến trúc, mô hình dữ liệu, API/auth/thanh toán và cuối cùng là bảo mật/vận hành. Khi điều tra một lỗi cụ thể, hãy bắt đầu từ route hoặc page bị lỗi rồi quay về tài liệu chuyên đề để kiểm tra quan hệ và giả định liên quan.

> **Lưu ý:** Bộ tài liệu này là bản đồ kỹ thuật, không thay thế test, code review, migration review hoặc xác nhận hoạt động thật của các provider thanh toán.

## 7. Nguyên tắc tránh trùng lặp

Các báo cáo cũ vẫn được giữ nguyên để truy nguyên lịch sử. Không nên tiếp tục tạo thêm một báo cáo `FINAL_STATUS` hoặc `IMPLEMENTATION_SUMMARY` mới cho cùng một tính năng. Thay vào đó, cập nhật tài liệu chuyên đề và ghi thay đổi trong phần changelog của tài liệu này hoặc file trạng thái cập nhật.

---

**Kết luận:** Bộ tài liệu mới được chia theo mục đích sử dụng, không xóa tài liệu cũ và không coi những tài liệu có cùng chủ đề là nhiều phiên bản độc lập của sự thật hiện tại.

## References

[1]: ../../prisma/schema.prisma "Prisma schema hiện tại"
[2]: ../../package.json "Scripts và dependencies hiện tại"
[3]: ../README.md "Chỉ mục tài liệu nền của repository"
[4]: ../MARKDOWN_AUDIT_NOTES.md "Ghi chú kiểm kê Markdown ngày 22/08/2026"
[5]: https://github.com/Escanor292/platform "Repository GitHub Tử Tế Fund"
[6]: ../FINAL_STATUS_REPORT.md "Báo cáo trạng thái lịch sử"
[7]: ../API_AUDIT_REPORT.md "Báo cáo audit API lịch sử"
[8]: ../PROJECT_VS_CAMPAIGN_ANALYSIS.md "Phân tích project/campaign lịch sử"
[9]: ../../src/app "Mã nguồn App Router và API"
[10]: ../../src "Mã nguồn ứng dụng"
