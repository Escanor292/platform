# Ghi chú kiểm kê Markdown và GitHub

Nguồn kiểm tra: repository `https://github.com/Escanor292/platform.git`, branch `origin/main`, kiểm tra ngày 2026-08-22.

## Trạng thái GitHub

Local HEAD và `origin/main` đều là `9bf7ad1`; `git log HEAD..origin/main` không có commit mới. Commit gần nhất là merge Pull Request #2, gồm checkout đa phương thức và password reset.

## Kiểm kê

Đã tìm thấy 74 file `.md` ngoài `.git`, `node_modules`, `.next`, tổng hợp vào `docs/MARKDOWN_AUDIT_RAW.md`. Không phát hiện exact duplicate theo SHA-256 trong báo cáo kiểm kê. Có nhiều nhóm nội dung chồng lặp theo tên/chủ đề:

- Kiến trúc/database/API: `3.1_KIEN_TRUC_HE_THONG.md`, `3.3_XAY_DUNG_BACKEND.md`, `3.4_KET_NOI_API.md`, `3.5_QUAN_LY_DU_LIEU.md`, `HUONG_DAN_TAO_SO_DO_DATABASE.md`, `DATABASE_STRUCTURE_ANALYSIS.md`, `FULL_DATABASE_SCHEMA.md`, `HYBRID_DATABASE_SUMMARY.md`.
- Báo cáo trạng thái tổng thể: `docs/README.md`, `docs/BAO_CAO_CHI_TIET.md`, `docs/FINAL_STATUS_REPORT.md`, các `REFACTOR_PHASE*_COMPLETION_REPORT.md`, cùng nhóm `.kiro/specs/project-hierarchy-management/*STATUS*`, `IMPLEMENTATION_*`, `REMAINING_TASKS_GUIDE.md`.
- Project hierarchy: nhiều tài liệu `.kiro/specs/project-hierarchy-management/` mô tả cùng một feature ở các mốc khác nhau; `IMPLEMENTATION_COMPLETE.md` là bản muộn hơn nhưng vẫn có các số liệu/lỗi lịch sử cần đối chiếu code thực tế.
- Chat: `CHAT_SYSTEM.md`, `CHAT_SYSTEM_GUIDE.md`, `CHAT_COMPONENT_README.md`, `notes_call_design.md`, `notes_call_cost.md`, `notes_deleted_user_chat.md`.
- Profile/blog/product: `PROFILE_ANALYSIS_REPORT.md`, `PROFILE_BLOG_INTEGRATION_ANALYSIS.md`, `PROFILE_BLOG_IMPLEMENTATION_REPORT.md`, `PROFILE_TABS_IMPLEMENTATION_REPORT.md`, `FEATURE_BLOG_LINKS_SUMMARY.md`, `notes_product_quickedit.md`, `MIGRATION_BLOG_LINKS.md`.
- Deployment/testing/security: `VERCEL_DEPLOYMENT_GUIDE.md`, `DEPLOY_INSTRUCTIONS.md`, `deployment-verification.md`, `3.6.1_GIT_WORKFLOW.md`, `3.6.2_CICD_DEPLOYMENT.md`, `3.6.3_ENVIRONMENT.md`, `API_AUDIT_REPORT.md`, `assistant-safety-audit.md`, `zero-mem-*`, `assistant-observability-and-quality.md`.
- Payment: `SEPAY_INTEGRATION.md`, `SEPAY_QUICKSTART.md`; docs/README vẫn mô tả PayOS QR. Checkout mới và password reset chưa có tài liệu chính thức trong docs trước khi task này bắt đầu.

## Mã nguồn hiện tại

Các route/page hiện có bao gồm campaign, projects, rewards/products, blog, chat/messages, dashboards admin/creator/backer, cart, notifications, payment-success, lookup, auth login/register/forgot-password/reset-password. Prisma hiện có models campaigns, projects, rewards, pledges, payment_methods, checkout_sessions, users, password_reset_tokens cùng nhiều model blog/chat/admin.

## Điểm cần ghi rõ trong tài liệu tổng hợp

`docs/README.md` còn có tuyên bố lịch sử như phiên bản 1.0.0, 88 tests pass, PayOS QR và Cloudinary; phải ghi là tài liệu nền/lịch sử và đối chiếu với code hiện tại. `package.json` hiện dùng Next.js 15, Prisma migration deploy trong `vercel-build`, Jest/Playwright và nhiều script seed. Tài liệu hợp nhất cần có bảng phân biệt: đã xác nhận trong code, được tài liệu mô tả nhưng cần xác minh, và đã lỗi thời/chỉ là kế hoạch.
