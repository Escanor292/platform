# Quy định pháp luật áp dụng — Tử Tế Fund

> **Loại tài liệu:** nghiên cứu đồ án / thuyết minh (lớp C).  
> **Không phải:** tư vấn pháp lý, điều khoản người dùng, hay giấy phép hoạt động.  
> **Ngày soạn:** 08/09/2026. Cập nhật dẫn chiếu trước ngày bảo vệ.  
> **Sinh viên:** Nguyễn Quách Phú Tài (MSSV 123000609) — ĐH Lạc Hồng, PTUD.

Tài liệu này trả lời một câu hỏi trước khi viết tính năng: **chiến dịch đang ở nhóm dòng tiền nào?**

| Lớp | Vai trò | Chỗ trên hệ thống |
| --- | --- | --- |
| **A. Điều khoản sản phẩm** | Người dùng đồng ý khi đăng ký | `/policy/terms`, `/policy/privacy`, `/policy/creator`, `/policy/refund` |
| **B. Hướng dẫn Creator** | Giáo dục, không ràng buộc | `/huong-dan/creator` |
| **C. Nghiên cứu pháp lý (file này)** | Bảo vệ đồ án, ranh giới thiết kế | `docs/phap-luat/` — **không** render thành trang public |

---

## Mục lục

1. [Nguyên tắc phân loại](#1-nguyên-tắc-phân-loại--nhìn-bản-chất-dòng-tiền)
2. [Nhóm A — ủng hộ không nhận lại lợi ích kinh tế](#2-nhóm-a--ủng-hộ-không-nhận-lại-lợi-ích-kinh-tế)
3. [Nhóm B — quà / pre-order / bán hàng tạo quỹ](#3-nhóm-b--ủng-hộ-có-quà--pre-order--bán-hàng-tạo-quỹ)
4. [Thủ tục theo mốc thời gian](#4-thủ-tục-theo-mốc-thời-gian)
5. [Vai trò Tử Tế Fund với tư cách nền tảng](#5-vai-trò-tử-tế-fund-với-tư-cách-nền-tảng)
6. [Thị trường tài sản mã hóa — chỉ để đặt ranh giới](#6-thị-trường-tài-sản-mã-hóa--chỉ-để-đặt-ranh-giới)
7. [Rủi ro và xử lý trên sản phẩm](#7-rủi-ro-thường-gặp-và-cách-xử-lý-trên-sản-phẩm)
8. [Checklist thuyết minh đồ án](#8-checklist-đưa-vào-thuyết-minh-đồ-án)
9. [Văn bản nên dẫn](#9-văn-bản-nên-dẫn)
10. [Ánh xạ sang code hiện tại](#10-ánh-xạ-sang-code-hiện-tại)

---

## 1. Nguyên tắc phân loại — nhìn bản chất dòng tiền

Pháp luật Việt Nam quản theo việc **người ủng hộ nhận lại gì**, không quản theo việc chiến dịch chạy trên Facebook, website hay app.

Trước khi mở campaign, Creator và nền tảng phải gắn đúng **một** nhóm:

| Nhóm | Người ủng hộ nhận lại | Khung chính | Trên Tử Tế Fund |
| --- | --- | --- | --- |
| **A. Ủng hộ thuần túy** | Không hàng, không quyền dùng | NĐ 93/2021 **nếu đúng phạm vi** từ thiện quy định | Pledge không reward; luôn thanh toán ONLINE |
| **B. Pre-order / bán quà** | Key, file, quà vật lý, credit | Luật Thương mại + TMĐT + thuế doanh thu | Reward + Kho đồ số + COD tùy sản phẩm |
| **C. Token / NFT** | Tài sản mã hóa chuyển nhượng được | NQ 05/2025, TT 32 & 41/2026, NĐ 284/2026 | **Chưa triển khai**; chỉ nghiên cứu hybrid |

### Phạm vi NĐ 93/2021

Nghị định 93/2021/NĐ-CP điều chỉnh vận động, tiếp nhận, phân phối nguồn đóng góp tự nguyện để hỗ trợ khắc phục thiên tai, dịch bệnh, sự cố và hỗ trợ bệnh nhân mắc bệnh hiểm nghèo.

**Không** phải mọi chiến dịch “ủng hộ mình làm game” đều tự động rơi vào NĐ 93. Nếu chiến dịch ngoài phạm vi đó, không viện NĐ 93 như giấy phép bao quát; phải xem dân sự, thuế và TMĐT.

---

## 2. Nhóm A — ủng hộ không nhận lại lợi ích kinh tế

### 2.1. Nghĩa vụ khi cá nhân tự vận động đúng phạm vi NĐ 93

- Thông báo công khai mục đích, phạm vi, phương thức, tài khoản, thời gian phân phối.
- Gửi văn bản thông báo đến UBND cấp xã nơi cư trú theo mẫu kèm nghị định.
- Mở tài khoản ngân hàng riêng cho từng cuộc vận động; không trộn ví chi tiêu.
- Không nhận thêm sau khi hết thời gian cam kết; thông báo ngân hàng dừng ghi có.
- Thời gian tiếp nhận hỗ trợ khắc phục thiên tai/dịch/sự cố: không quá 90 ngày trừ cam kết khác hoặc ban vận động cấp tỉnh kéo dài.
- Thời gian phân phối: thực hiện ngay và kết thúc chậm nhất 20 ngày sau khi hết nhận, trừ cam kết khác.
- Sao kê, công khai danh sách đóng góp và danh sách thụ hưởng theo quy định.

### 2.2. Bằng chứng đã gửi thông báo

| Hình thức | Bằng chứng |
| --- | --- |
| Nộp trực tiếp | Dấu công văn đến / phiếu hẹn |
| Bưu điện | Vận đơn đã giao |
| Cổng DVC địa phương (nếu đã số hóa) | Mã hồ sơ điện tử |

### 2.3. Thuế khoản thuần túy

Khoản cá nhân nhận từ thiện/tài trợ bằng tiền thường không thuộc thu nhập chịu thuế TNCN. Nếu tiền đi vào pháp nhân công ty, cơ quan thuế có thể xếp “thu nhập khác” và tính TNDN nếu không chứng minh được tính chất tài trợ đúng quy định.

Dù miễn thuế thu nhập, vẫn phải **chi đúng mục đích đã kêu gọi**. Dùng tiền gây quỹ vào việc khác có rủi ro hình sự.

### 2.4. Khi đi qua nền tảng trung gian

Nền tảng giữ tiền hộ (escrow) làm giảm rủi ro tài khoản cá nhân bị ngân hàng gắn cờ vì hàng nghìn giao dịch nhỏ. Creator rút một cục.

Nghĩa vụ thông báo UBND **không tự biến mất** chỉ vì dùng app, nhưng hồ sơ giải trình nhẹ hơn nhờ biên bản đối soát của pháp nhân nền tảng.

---

## 3. Nhóm B — ủng hộ có quà / pre-order / bán hàng tạo quỹ

Đây là **mua bán**. Cam kết “trích 50% lợi nhuận làm quỹ” không biến doanh thu thành tiền từ thiện. Thuế tính trên doanh thu bán hàng trước; phần làm từ thiện tính sau.

### 3.1. Tư cách và website

- Bán thường xuyên, có quy mô: hộ kinh doanh hoặc doanh nghiệp, có MST.
- Website tự vận hành có chức năng đặt hàng / thanh toán: thông báo hoặc đăng ký TMĐT với Bộ Công Thương.
- Điều khoản thanh toán phải ghi thời gian giao, chính sách hoàn nếu dự án thất bại, tỷ lệ (nếu có) trích quỹ.

### 3.2. Thuế cá nhân kinh doanh

Với cá nhân bán hàng số / pre-order qua TMĐT, thực tế phổ biến là tự khai theo lần phát sinh trên `canhan.gdt.gov.vn`, mẫu 01/CNKD.

Ghi chú gốc dùng mức khoảng **2% doanh thu** (1% GTGT + 1% TNCN) cho nhóm dịch vụ. **Mức đúng phụ thuộc ngành nghề trên tờ khai** — không copy 2% cho mọi trường hợp, không ghi cứng vào ToS.

### 3.3. Dòng tiền quốc tế (Kickstarter, Stripe, PayPal)

- Ngân hàng VN có thể tạm giữ ngoại tệ lớn, yêu cầu proof of funds.
- Bộ hồ sơ tối thiểu: dashboard chiến dịch, payout invoice, terms nền tảng, sao kê.
- Cơ quan thuế quản khi tiền **về tài khoản VN**, không quản số dư đang nằm ở Stripe.

### 3.4. Dòng tiền nền tảng trong nước

- Chuyển khoản VND từ pháp nhân sàn → ít bị treo hơn.
- Lưu biên bản đối soát: tổng thu, phí sàn, thực nhận.
- Nếu sàn khấu trừ thuế tại nguồn: lấy chứng từ khấu trừ, không khai trùng.

---

## 4. Thủ tục theo mốc thời gian

### 4.1. Trước khi mở nhận tiền

| Việc | Nhóm A | Nhóm B |
| --- | --- | --- |
| Thông báo UBND xã | Bắt buộc nếu thuộc NĐ 93 | Không thay cho đăng ký kinh doanh/TMĐT |
| Tài khoản nhận | TK riêng từng cuộc / hoặc TK rút từ sàn | TK kinh doanh / TK rút từ sàn |
| eKYC trên nền tảng | Nên có | Bắt buộc với Creator |
| Điều khoản hoàn tiền | Nêu cách hoàn nếu không triển khai được | Bắt buộc, gắn từng reward |
| Công khai mục đích | Bắt buộc | Bắt buộc trên trang campaign |

### 4.2. Sau khi đóng chiến dịch

1. Khóa cổng nhận tiền đúng hạn đã công bố.
2. Xuất đối soát cổng thanh toán + sao kê.
3. **Nhóm A:** báo cáo UBND và công khai thu-chi theo đúng thời hạn nghị định.
4. **Nhóm B:** ghi nhận doanh thu, xuất hóa đơn/chứng từ, khai thuế, rồi mới giải ngân phần quỹ nếu có cam kết.
5. Giao quà / ghi Kho đồ đúng pledge `SUCCESS`; refund thì thu hồi asset số.

---

## 5. Vai trò Tử Tế Fund với tư cách nền tảng

Sàn trong nước đã kết nối ngân hàng và lưu lịch sử nộp tiền giúp Creator có chứng từ tập trung.

Để giữ vai trò này, nền tảng cần:

- Định danh Creator.
- Tách chiến dịch nhóm A và B trên UI.
- Giữ tiền theo trạng thái campaign.
- Xuất biên bản đối soát.
- Không để Creator tự dán STK cá nhân lên trang nếu chọn mô hình trung gian.

Quy tắc vận hành:

- Không nhận tiền mặt hộ ngoài cổng đã tích hợp.
- Không quảng cáo chiến dịch token như hàng hóa đã được cấp phép.
- Có nút báo cáo lạm dụng / hàng lậu / gây quỹ giả.
- Audit log thanh toán, KYC, hoàn tiền phải đủ để trả lời ngân hàng.

**Một câu dùng trong thuyết minh và footer sản phẩm:**

> Tử Tế Fund là nền tảng trung gian thanh toán VND và quản lý campaign. Không phải quỹ từ thiện theo NĐ 93 và không phải sàn tài sản mã hóa. Nghĩa vụ thuế, thông báo chính quyền và đăng ký TMĐT thuộc về Creator theo bản chất dòng tiền thực tế.

---

## 6. Thị trường tài sản mã hóa — chỉ để đặt ranh giới

Việt Nam đang thí điểm thị trường tài sản mã hóa:

- Nghị quyết 05/2025/NQ-CP
- Thông tư 32/2026/TT-BTC (thuế, hiệu lực 27/3/2026)
- Thông tư 41/2026/TT-BTC (kê khai, khấu trừ)
- Nghị định 284/2026/NĐ-CP về xử phạt

CAEX, TCEX và một số đơn vị khác là doanh nghiệp **đã nộp hồ sơ xin phép**, chưa đồng nghĩa đã được cấp phép hoạt động tại thời điểm viết.

| Nội dung | Hướng dẫn đang công bố | Hệ quả với Tử Tế Fund |
| --- | --- | --- |
| GTGT chuyển nhượng token | Không chịu GTGT theo TT 32 | Chỉ áp cho giao dịch token đúng nghĩa, **không** áp cho bán file/pre-order fiat |
| TNCN cá nhân qua sàn có phép | 0,1% trên giá chuyển nhượng từng lần | Sàn đối tác khấu trừ; Fund không tự thu thuế token |
| TNDN tổ chức trong nước | 20% trên thu nhập chuyển nhượng (có mức giảm DNNVV) | Creator pháp nhân tự hạch toán |
| Giao dịch ngoài đơn vị có phép | NĐ 284 dự kiến xử phạt khi thị trường chính thức có sàn | Không tự mở order book NFT |

### Đừng trộn hai sắc thuế

Bán game 200.000 đồng bằng PayOS là doanh thu hàng hóa/dịch vụ số. Mint NFT trên sàn có phép rồi chuyển nhượng token mới xét TT 32.

Một sản phẩm có thể đi cả hai nhánh; hệ thống phải **tách ledger**, không gắn nhãn “miễn GTGT” cho mọi SKU.

Web3 nếu có chỉ là phụ lục nghiên cứu: badge/NFT lưu niệm **sau** thanh toán fiat, neo hash mốc. Không thay escrow.

---

## 7. Rủi ro thường gặp và cách xử lý trên sản phẩm

| Rủi ro | Dấu hiệu | Xử lý sản phẩm |
| --- | --- | --- |
| Gọi vốn từ thiện giả | Không quà + mục đích mơ hồ + STK cá nhân | Ép chọn nhóm A/B; khóa campaign; yêu cầu KYC |
| Trốn thuế pre-order | Bán key nhưng khai donate | Reward digital = nhóm B mặc định |
| Ngân hàng treo tiền | Payout ngoại tệ lớn | Gói chứng từ dashboard + đối soát |
| Hàng lậu NFT/file | Hash trùng, report cộng đồng | Gỡ listing, hoàn tiền, khóa user |
| Tự nhận là sàn token | UI mua bán NFT P2P | Cấm đến khi có đối tác được cấp phép |

---

## 8. Checklist đưa vào thuyết minh đồ án

Dùng nguyên các gạch đầu dòng này trên slide bảo vệ:

- [ ] Nêu rõ Tử Tế Fund là nền tảng trung gian thanh toán VND + quản lý campaign, **không** phải quỹ từ thiện và **không** phải sàn tài sản mã hóa.
- [ ] Hai nhóm chiến dịch: không quà / có quà. Điều khoản hoàn tiền khác nhau.
- [ ] Creator phải KYC trước khi public.
- [ ] Website nếu vận hành thương mại cần lộ trình thông báo TMĐT.
- [ ] Web3 chỉ là phụ lục nghiên cứu: badge/NFT lưu niệm sau thanh toán fiat, neo hash mốc, không thay escrow.
- [ ] Mọi số thuế trong slide phải ghi nguồn văn bản và ngày hiệu lực.

---

## 9. Văn bản nên dẫn

| Văn bản | Dùng cho |
| --- | --- |
| Nghị định 93/2021/NĐ-CP | Đóng góp tự nguyện theo đúng phạm vi |
| Luật Thương mại; quy định quản lý TMĐT đối với website bán hàng | Nhóm B |
| Thông tư 40/2021/TT-BTC và hướng dẫn khai thuế cá nhân kinh doanh hiện hành | CNKD / pre-order |
| Nghị quyết 05/2025/NQ-CP | Thí điểm thị trường tài sản mã hóa |
| Thông tư 32/2026/TT-BTC | Thuế token (hiệu lực 27/3/2026) |
| Thông tư 41/2026/TT-BTC | Kê khai, khấu trừ token |
| Nghị định 284/2026/NĐ-CP | Xử phạt |
| Pháp luật bảo vệ dữ liệu cá nhân | Hồ sơ KYC |

Cập nhật lại các dẫn chiếu này trước ngày bảo vệ vì khung thí điểm tài sản mã hóa còn thay đổi nhanh.

---

## 10. Ánh xạ sang code hiện tại

Trạng thái đối chiếu **08/09/2026**. Code là nguồn sự thật runtime; file này không thay test hay review.

| Quyết định thiết kế | Trên sản phẩm | Ghi chú |
| --- | --- | --- |
| Không phải quỹ / không phải sàn token | Copy trên `/policy/terms`, `/policy` | Đúng lớp A |
| Hai nhóm A/B | Hướng dẫn `/huong-dan/creator`; điều khoản Creator | **Chưa** có field bắt chọn A/B lúc tạo campaign |
| KYC trước public | `/kyc`, `/api/kyc/*`, admin eKYC toggle | P0–P2 đã có |
| Thanh toán VND | PayOS / VietQR / SePay / MoMo kế hoạch | Không Web3 escrow |
| Pledge không reward = ONLINE | `PledgeFormContent` ẩn COD khi `!allowsCod` | Đã có |
| Kho đồ số + thu hồi khi refund | `/purchases`, `grantDigitalWarehouseItem` | Đã có |
| Báo cáo lạm dụng | `CampaignReportModal` | Đã có |
| Đồng ý điều khoản lúc đăng ký | Checkbox + `acceptTerms` trên `POST /api/auth/register` | Đã có |
| UI mua bán NFT P2P | Không triển khai | Giữ cấm |

### Việc còn lại (product, không phải docs)

1. Bắt chọn nhóm A/B khi tạo campaign.
2. Có reward / file / key → mặc định nhóm B, không cho để A.
3. Không dán STK cá nhân khi chọn mô hình trung gian (validate UI).

---

*Nguồn gốc: tái cấu trúc từ `Quy_Dinh_Phap_Luat.docx` (ghi chú nghiên cứu NĐ 93, TMĐT, thuế CNKD, ranh giới tài sản mã hóa). Dùng cho đồ án Tử Tế Fund.*
