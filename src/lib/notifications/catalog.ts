import type { NotificationType } from '@/types/mongodb.types';

export interface NotificationCatalogItem {
  type: NotificationType;
  label: string;
  description: string;
}

/** Danh mục các sự kiện có thể gửi thông báo cá nhân. */
export const NOTIFICATION_CATALOG: NotificationCatalogItem[] = [
  { type: 'PAYMENT_SUCCESS', label: 'Thanh toán thành công', description: 'Thông báo khi khoản ủng hộ/thanh toán được ghi nhận.' },
  { type: 'PLEDGE_RECEIVED', label: 'Nhận được ủng hộ', description: 'Thông báo cho chủ chiến dịch khi có người ủng hộ.' },
  { type: 'CAMPAIGN_APPROVED', label: 'Chiến dịch được duyệt', description: 'Thông báo khi Admin phê duyệt chiến dịch.' },
  { type: 'CAMPAIGN_REJECTED', label: 'Chiến dịch bị từ chối', description: 'Thông báo khi Admin từ chối chiến dịch.' },
  { type: 'BLOG_APPROVED', label: 'Bài viết được duyệt', description: 'Thông báo khi Admin duyệt bài Blog.' },
  { type: 'BLOG_REJECTED', label: 'Bài viết bị từ chối', description: 'Thông báo khi Admin từ chối bài Blog.' },
  { type: 'CAMPAIGN_FOLLOWED', label: 'Có người quan tâm chiến dịch', description: 'Thông báo cho creator khi có người dùng theo dõi chiến dịch.' },
  { type: 'CAMPAIGN_UPDATE', label: 'Cập nhật chiến dịch', description: 'Thông báo khi chiến dịch bạn quan tâm có cập nhật mới.' },
  { type: 'COMMENT_RECEIVED', label: 'Có bình luận mới', description: 'Thông báo cho tác giả khi bài viết có bình luận mới.' },
  { type: 'COMMENT_REPLY', label: 'Phản hồi bình luận', description: 'Thông báo khi có người phản hồi bình luận của bạn.' },
  { type: 'COMMENT_MENTION', label: 'Được nhắc tên', description: 'Thông báo khi bạn được nhắc trong bình luận.' },
  { type: 'CAMPAIGN_ENDING', label: 'Chiến dịch sắp kết thúc', description: 'Nhắc về chiến dịch bạn quan tâm sắp đóng.' },
  { type: 'REFUND_PROCESSED', label: 'Hoàn tiền', description: 'Thông báo khi hoàn tiền được xử lý thành công.' },
  { type: 'KYC_APPROVED', label: 'KYC được duyệt', description: 'Thông báo kết quả xác minh danh tính thành công.' },
  { type: 'KYC_REJECTED', label: 'KYC bị từ chối', description: 'Thông báo khi hồ sơ xác minh cần được bổ sung hoặc gửi lại.' },
  { type: 'SYSTEM', label: 'Hệ thống', description: 'Thông báo vận hành và cập nhật quan trọng của nền tảng.' },
];
