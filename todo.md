# Payment Update TODO

- [x] Soạn tài liệu Markdown giải thích thay đổi payment, API, webhook, secrets và vận hành

- [x] Chuẩn hóa phương thức thanh toán công khai thành BANK và ZALOPAY
- [x] Hợp nhất PayOS/SePay phía sau lựa chọn BANK, ưu tiên SePay cho QR Banking
- [x] Bổ sung ZaloPay adapter, create route và contract trạng thái không giả lập kết quả thanh toán
- [x] Cứng hóa xác thực webhook và idempotency cho provider hiện có
- [x] Bổ sung test contract cho Bank/ZaloPay và kiểm thử typecheck/Jest trước khi push
