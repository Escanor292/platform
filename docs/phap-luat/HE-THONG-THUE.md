# Hệ thống chứng từ và sổ thuế

Tử Tế Fund **không** khấu trừ, kê khai hay nộp thuế hộ. Tài liệu này mô tả sổ sách nội bộ, không phải tư vấn pháp lý.

## Ba luồng tiền

| Luồng | Điều kiện | Chứng từ sàn | Kho đồ |
|---|---|---|---|
| Ủng hộ không nhận quà | Không `rewardId` | Chứng nhận `TT-UH-YYYYMM-XXXX` | Có, sau đăng nhập đúng email |
| Có quà — giao ngay | Reward có sẵn, không preorder | Biên lai thanh toán (không phải HĐ GTGT) | Tài sản số vào kho; vật lý theo vận chuyển |
| Có quà — đặt trước | `isPreorder` | **Chưa** tự cấp chứng từ thuế | Theo tiến độ giao |

Khách chưa đăng nhập **bắt buộc email**. Mail gửi sau khi lệnh SUCCESS (đối soát tiền vào TK trung gian).

## Ba sổ

- **Backer:** giá niêm yết, không cộng VAT trên checkout. Tra cứu `/lookup`, xem `/chung-tu/{code}`, lưu `/purchases`.
- **Creator:** doanh thu, phí sàn ước tính 8% trừ phía creator, ngưỡng 1 tỷ CNKD. Trang `/dashboard/creator/thue` + CSV.
- **Platform:** tip, phí dịch vụ ước tính, GTGT trên phí (chưa xuất HĐ). Admin `/dashboard/admin/revenue` đối soát lệnh BANK_ESCROW.

## Không triển khai

Không ví mã hóa, token, NFT, Web3. Bán tài sản số = file/key vào Kho đồ bằng VND.
