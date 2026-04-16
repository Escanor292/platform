# Hướng dẫn Campaign ID

## Tổng quan

Mỗi campaign được tạo ra đều có một Campaign ID duy nhất để dễ dàng tra cứu và quản lý.

## Format Campaign ID

Campaign ID có format: `CF-YYYYMMDD-XXXXX`

- `CF`: Viết tắt của CrowdFunding
- `YYYYMMDD`: Ngày tạo campaign (năm-tháng-ngày)
- `XXXXX`: 5 ký tự ngẫu nhiên (chữ hoa và số)

### Ví dụ
- `CF-20260416-A3B5C`
- `CF-20260416-XYZ12`

## Tính năng

### 1. Tự động tạo Campaign ID
Khi tạo campaign mới, hệ thống sẽ tự động:
- Tạo Campaign ID theo format chuẩn
- Kiểm tra tính duy nhất (không trùng lặp)
- Thử lại tối đa 10 lần nếu bị trùng
- Sử dụng timestamp nếu vẫn trùng sau 10 lần

### 2. Hiển thị Campaign ID
Campaign ID được hiển thị ở:
- Trang chi tiết campaign (dưới tiêu đề)
- Dashboard creator (trong danh sách campaigns)
- API responses

### 3. Tra cứu Campaign
Có thể tra cứu campaign bằng:
- Campaign ID
- Slug
- Database ID

## Code Implementation

### Tạo Campaign ID
```typescript
import { generateUniqueCampaignCode } from "@/lib/campaign-utils";

const campaignCode = await generateUniqueCampaignCode();
```

### Validate Campaign ID
```typescript
import { isValidCampaignCode } from "@/lib/campaign-utils";

if (isValidCampaignCode("CF-20260416-ABC12")) {
  // Valid format
}
```

## Database Schema

```prisma
model Campaign {
  id              String   @id @default(cuid())
  campaignCode    String   @unique  // Campaign ID duy nhất
  // ... các trường khác
}
```

## API Usage

### Tạo Campaign
```typescript
POST /api/campaigns
{
  "title": "Tên campaign",
  "description": "Mô tả",
  // ... các trường khác
}

Response:
{
  "id": "clx...",
  "campaignCode": "CF-20260416-ABC12",
  // ... các trường khác
}
```

## Migration

Trường `campaignCode` đã có sẵn trong schema, không cần migration mới.

Nếu cần update campaigns cũ chưa có campaignCode:
```sql
UPDATE campaigns 
SET campaign_code = 'CF-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 5))
WHERE campaign_code IS NULL;
```

## Best Practices

1. Luôn hiển thị Campaign ID ở các trang quan trọng
2. Sử dụng Campaign ID để tra cứu thay vì database ID
3. Validate format trước khi xử lý
4. Log Campaign ID trong audit logs
5. Sử dụng Campaign ID trong email và thông báo

## Testing

Để test tính năng:
1. Tạo campaign mới
2. Kiểm tra Campaign ID được tạo đúng format
3. Kiểm tra tính duy nhất (không trùng)
4. Kiểm tra hiển thị trên UI
5. Kiểm tra tra cứu bằng Campaign ID
