# Ghi chú nghiên cứu Zero-Mem

Bài báo [Zero-Mem: Zero-Token Memory Operations for LLM Agents](https://arxiv.org/abs/2607.29377) mô tả bộ nhớ giữ nguyên interaction trace làm nguồn chứng cứ, không dùng LLM trong các thao tác ghi, tổ chức hoặc truy hồi bộ nhớ. Kiến trúc kết hợp entity-context graph để truy hồi quan hệ và temporal hierarchy để giữ locality, session state; kết quả từ hai view được phối hợp, mở rộng evidence closure và hiệu chỉnh bằng quy tắc xác định trước final QA.

Repository chính thức [Zero-Mem/Zero-mem](https://github.com/Zero-Mem/Zero-mem) hiện chỉ có README và nêu rằng mã nguồn cùng chi tiết triển khai sẽ được phát hành sau peer review. Vì vậy, việc triển khai Platform sẽ là bản tái thực hiện độc lập theo mô tả trong bài báo, không sao chép mã nguồn chưa được phát hành.
