# Kiểm kê tài liệu và cập nhật GitHub

**Ngày kiểm tra:** 22/08/2026  
**Remote:** `origin/main` của `Escanor292/platform`  
**HEAD đối chiếu:** `9bf7ad1`

## 1. Kết quả kiểm tra GitHub

Local đã chạy `git fetch origin main`. Tại thời điểm kiểm tra, local và `origin/main` cùng ở commit `9bf7ad1`; không có commit mới hơn trên remote. Các cập nhật gần nhất đáng chú ý là checkout đa phương thức, password reset và merge Pull Request #2.

| Commit | Ý nghĩa hiện tại |
|---|---|
| `d003889` | Đồng bộ theme nhóm creator rewards |
| `a32c5ed` | Checkout `ONLINE`/`COD`, session, payment method metadata và migration liên quan |
| `1e8a93d` | Forgot/reset password, token hash một lần và giao diện auth |
| `9bf7ad1` | Merge các thay đổi trên vào `main` |

## 2. Phạm vi Markdown

Kiểm kê working tree ghi nhận 84 file có đuôi `.md`, bao gồm tài liệu dự án, đặc tả `.kiro`, ghi chú ở root, sample blog và các file audit được tạo trong quá trình này. Báo cáo raw ban đầu ghi nhận 82 file trước khi tính các artifact audit mới. Không phát hiện exact duplicate đáng tin cậy theo hash trong báo cáo raw; vấn đề chính là nhiều tài liệu diễn giải cùng một feature ở các thời điểm khác nhau.

## 3. Nhóm tài liệu chồng lặp

| Nhóm | File tiêu biểu | Cách xử lý |
|---|---|---|
| Kiến trúc/database/API | `3.1_KIEN_TRUC_HE_THONG.md`, `3.3_XAY_DUNG_BACKEND.md`, `3.4_KET_NOI_API.md`, `3.5_QUAN_LY_DU_LIEU.md`, `DATABASE_STRUCTURE_ANALYSIS.md`, `FULL_DATABASE_SCHEMA.md`, `HYBRID_DATABASE_SUMMARY.md` | Dùng `01-KIEN-TRUC-HE-THONG.md`, `02-MO-HINH-DU-LIEU.md`, `03-API-AUTH-THANH-TOAN.md` làm bản tra cứu hiện hành; giữ file cũ để truy nguyên |
| Project hierarchy | `.kiro/specs/project-hierarchy-management/*`, `PROJECT_VS_CAMPAIGN_ANALYSIS.md` | Xem như lịch sử tiến độ/thiết kế; đối chiếu schema và API trước khi thực hiện task |
| Trạng thái triển khai | `docs/README.md`, `BAO_CAO_CHI_TIET.md`, `FINAL_STATUS_REPORT.md`, `REFACTOR_PHASE*_COMPLETION_REPORT.md` | Không dùng số liệu test hoặc % cũ làm trạng thái hiện tại; dùng index và snapshot mới |
| Chat | `CHAT_SYSTEM.md`, `CHAT_SYSTEM_GUIDE.md`, `CHAT_COMPONENT_README.md`, `notes_call_*`, `notes_deleted_user_chat.md` | Dùng `04-LUONG-NGUOI-DUNG.md` cho luồng tổng quát; file chat cũ giữ chi tiết lịch sử |
| Profile/blog/product | `PROFILE_*`, `FEATURE_BLOG_LINKS_SUMMARY.md`, `MIGRATION_BLOG_LINKS.md`, `notes_product_quickedit.md` | Dùng luồng user và source component; cần cập nhật chuyên đề nếu thêm editor/block mới |
| Deploy/test/security | `VERCEL_DEPLOYMENT_GUIDE.md`, `DEPLOY_INSTRUCTIONS.md`, `deployment-verification.md`, `3.6.*`, `testing.md`, `assistant-*`, `zero-mem-*` | Dùng `05-BAO-MAT-VAN-HANH.md` cho checklist hiện tại; file cũ là bằng chứng hoặc hướng dẫn chuyên biệt |
| Payment | `SEPAY_INTEGRATION.md`, `SEPAY_QUICKSTART.md`, `notes_call_cost.md` | Legacy/provider-specific; dùng `03-API-AUTH-THANH-TOAN.md` để hiểu checkout mới và giới hạn production |
| Sample content | `scripts/sample-blog-posts/markdown/*.md` | Không gộp vào tài liệu kỹ thuật; đây là fixture/content mẫu |

## 4. Các điểm tài liệu cũ đã lỗi thời hoặc cần xác minh

`docs/README.md` và một số báo cáo trước đây có thể nhắc phiên bản 1.0.0, số test đã pass, PayOS QR, Cloudinary hoặc cấu trúc database cũ. Những thông tin đó không bị xóa vì có giá trị lịch sử, nhưng không nên coi là trạng thái production hiện tại nếu không đối chiếu source.

Một số `.kiro` report từng ghi campaign/blog integration còn thiếu, trong khi code hiện tại đã có nhiều API và component liên quan. Ngược lại, tài liệu cũ không bao quát đầy đủ checkout session, payment method metadata và password reset mới. Bộ `system-map` này bổ sung phần thiếu nhưng vẫn không thay thế kiểm thử runtime.

## 5. File nên dùng theo nhu cầu

| Nhu cầu | File bắt đầu |
|---|---|
| Hiểu toàn bộ app | [`00-CHI-MUC-HE-THONG.md`](./00-CHI-MUC-HE-THONG.md) |
| Sửa schema/quan hệ | [`02-MO-HINH-DU-LIEU.md`](./02-MO-HINH-DU-LIEU.md) |
| Thêm API hoặc auth | [`03-API-AUTH-THANH-TOAN.md`](./03-API-AUTH-THANH-TOAN.md) |
| Sửa giao diện/luồng | [`04-LUONG-NGUOI-DUNG.md`](./04-LUONG-NGUOI-DUNG.md) |
| Deploy, secret, audit | [`05-BAO-MAT-VAN-HANH.md`](./05-BAO-MAT-VAN-HANH.md) |
| Truy nguyên lịch sử | `docs/`, `.kiro/specs/` và audit raw |

## 6. Nguyên tắc duy trì tài liệu

Không tạo thêm nhiều file `FINAL_STATUS`, `IMPLEMENTATION_SUMMARY` hoặc `COMPLETION_REPORT` cho cùng một tính năng nếu không cần lưu mốc lịch sử. Tài liệu mới nên cập nhật một trong các file chuyên đề, thêm ngày/commit và nêu rõ phần nào đã xác nhận bằng code, phần nào chỉ cần runtime verification.

## References

[1]: ../MARKDOWN_AUDIT_RAW.md "Báo cáo hash/heading Markdown"
[2]: ../MARKDOWN_AUDIT_NOTES.md "Ghi chú kiểm kê trước khi tạo bộ system-map"
[3]: ../README.md "Chỉ mục tài liệu nền"
[4]: ../../.kiro/specs/project-hierarchy-management/IMPLEMENTATION_COMPLETE.md "Báo cáo implementation lịch sử"
[5]: https://github.com/Escanor292/platform "Repository GitHub"
