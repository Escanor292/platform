# 📊 PLANTUML USE CASE DIAGRAM - TỬ TẾ FUND

Bạn có thể sao chép mã dưới đây vào các trình chỉnh sửa PlantUML (như [PlantText](https://www.planttext.com/) hoặc extension trong VS Code) để vẽ sơ đồ.

```plantuml
@startuml
header Dự án Crowdfunding - TửTế Fund
title Sơ đồ Use Case Tổng quát

left to right direction
skinparam packageStyle rectangle

actor "Guest" as Guest
actor "Backer (Người ủng hộ)" as Backer
actor "Creator (Nhà sáng tạo)" as Creator
actor "Admin (Quản trị viên)" as Admin
actor "System (Hệ thống)" as System

rectangle "TửTế Fund Platform" {
  ' Nhóm chức năng chung
  usecase "Đăng ký / Đăng nhập" as UC_Auth
  usecase "Xem & Tìm kiếm chiến dịch" as UC_Browse
  usecase "Đọc Blog & Tin tức" as UC_ReadBlog
  
  ' Nhóm chức năng Backer
  usecase "Ủng hộ dự án (Pledge)" as UC_Pledge
  usecase "Chọn phần thưởng (Rewards)" as UC_Rewards
  usecase "Nhắn tin trực tiếp" as UC_Chat
  
  ' Nhóm chức năng Creator
  usecase "Tạo & Quản lý chiến dịch" as UC_Create
  usecase "Đăng bài cập nhật (Update)" as UC_PostBlog
  usecase "Quản lý danh sách ủng hộ" as UC_ManagePledges
  
  ' Nhóm chức năng Admin
  usecase "Kiểm duyệt chiến dịch" as UC_Approve
  usecase "Xác minh KYC" as UC_KYC
  usecase "Quản lý Huy hiệu (Badges)" as UC_Badges
  usecase "Xem Dashboard thống kê" as UC_Stats
  usecase "Xử lý báo cáo vi phạm" as UC_Report
  
  ' Nhóm chức năng Hệ thống
  usecase "Tự động xuất hóa đơn" as UC_Invoice
  usecase "Ghi nhật ký Audit Logs" as UC_Audit
}

' Mối quan hệ Guest
Guest --> UC_Auth
Guest --> UC_Browse
Guest --> UC_ReadBlog

' Mối quan hệ Backer
Backer --|> Guest
Backer --> UC_Pledge
Backer --> UC_Rewards
Backer --> UC_Chat

' Mối quan hệ Creator
Creator --|> Guest
Creator --> UC_Create
Creator --> UC_PostBlog
Creator --> UC_Chat
Creator --> UC_ManagePledges

' Mối quan hệ Admin
Admin --> UC_Approve
Admin --> UC_KYC
Admin --> UC_Badges
Admin --> UC_Stats
Admin --> UC_Report

' Mối quan hệ System
System --> UC_Invoice
System --> UC_Audit
UC_Pledge ..> UC_Invoice : <<include>>
@enduml
```

---

### 💡 Hướng dẫn sử dụng:
1.  **Cài đặt:** Cài đặt Extension **PlantUML** trên VS Code.
2.  **Xem trước:** Nhấn `Alt + D` để xem bản vẽ trực tiếp.
3.  **Xuất ảnh:** Bạn có thể xuất ra định dạng `.png` hoặc `.svg` để chèn vào báo cáo.
