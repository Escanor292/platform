# Telemetry trợ lý và quality gate Platform

## Mục tiêu

Tài liệu này mô tả hai ranh giới vận hành cho các trợ lý công khai của Platform: **quan sát an toàn** đối với sự kiện `command_rejected` và **hồi quy bắt buộc trong CI** cho Hỏi nhanh. Cả hai cơ chế chỉ dùng dữ liệu tối thiểu cần thiết; không đưa nội dung hội thoại, lệnh người dùng hay dữ liệu nhận diện người dùng sang AI-BS.

| Hạng mục | Cơ chế | Dữ liệu/kiểm tra |
| --- | --- | --- |
| Tổng hợp từ chối lệnh | `GET /api/internal/assistant-telemetry` | Tổng số, ngày UTC và thời điểm mới nhất của `command_rejected` trong cửa sổ 1–168 giờ |
| Xác thực liên dịch vụ | Bearer token | Chỉ AI-BS server dùng khóa đọc; không có quyền ghi |
| E2E Hỏi nhanh | Playwright + PostgreSQL service | Product, blog và profile công khai thật; happy path, loading và error state |
| Chất lượng mã nguồn | GitHub Actions `Platform CI` | Jest, TypeScript và E2E Chromium |

## Bật dashboard AI-BS

Platform cần biến môi trường server-side `ASSISTANT_TELEMETRY_READ_KEY`. AI-BS cần `PLATFORM_TELEMETRY_READ_KEY` có **cùng giá trị**. Endpoint chỉ trả `401` khi thiếu/sai Bearer; các phản hồi hợp lệ được giới hạn ở trạng thái, phạm vi, số lượng tổng hợp theo ngày và thời điểm mới nhất.

> Không cấu hình khóa không làm trợ lý dừng hoạt động. Dashboard AI-BS hiển thị trạng thái “Chưa cấu hình” thay vì suy đoán hay bỏ qua lỗi.

## E2E route công khai thật

Workflow CI khởi tạo PostgreSQL 16 tách biệt, áp dụng migration và chạy `npm run seed:e2e`. Script seed tạo riêng một user, project, campaign, product và blog có ID/slug `e2e-*`. Các test truy cập trực tiếp `/products/e2e-public-product`, `/blog/e2e-nhat-ky-gieo-mam` và `/profile/e2e-public-user`; không dùng middleware rewrite hay mock `page.route` cho happy path.

Lượt xem blog có thể tăng khi trang được tải, vì vậy assertion chỉ yêu cầu Hỏi nhanh hiển thị một giá trị số công khai thay vì cố định một con số dễ thay đổi. Báo cáo Playwright là artifact giữ 14 ngày trong GitHub Actions. Playwright khuyến nghị lưu report/trace CI như artifact tin cậy và lưu ý các artifact này có thể chứa dữ liệu thực thi cần được xử lý cẩn trọng.[1]

## Quality gate GitHub

`Platform CI` chạy trên mọi `pull_request` vào `main` và mỗi lần push lên `main`. Job `quality` chạy `npm test -- --runInBand` và `npx tsc --noEmit`; job `e2e-public-assistant` chạy E2E Chromium sau migration/seed. Cách dùng `npm ci`, `actions/setup-node` và workflow Node.js này phù hợp khuyến nghị của GitHub cho build/test Node.[2]

Khi repository được chuyển public tạm thời, branch protection của `main` đã được bật với hai check bắt buộc `quality` và `e2e-public-assistant`, yêu cầu branch cập nhật trước merge, áp dụng cả với administrator, chặn force-push/xóa nhánh và yêu cầu xử lý toàn bộ conversation. Workflow mới nhất đã đạt; trước khi đổi repository về private, chủ sở hữu nên kiểm tra lại trong GitHub Settings rằng protection vẫn được giữ theo chính sách gói đang dùng.

## Bằng chứng kiểm chứng

| Kiểm tra | Kết quả |
| --- | --- |
| Jest Platform | 22 suite / 201 test đạt |
| TypeScript Platform | Đạt sau `prisma generate` |
| E2E Chromium route thật | 6 test đạt trong GitHub Actions run `32522102836` |
| CI quality | Đạt trong GitHub Actions run `32522102836` |
| Telemetry Production | Endpoint trả `401` khi thiếu Bearer; Vitest integration AI-BS xác minh Bearer cấu hình được chấp nhận và dashboard hiển thị trạng thái live rỗng |

## Tham chiếu

[1] [Playwright — Setting up CI](https://playwright.dev/docs/ci-intro)

[2] [GitHub Docs — Building and testing Node.js](https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs)
