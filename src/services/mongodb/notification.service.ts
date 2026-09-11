/**
 * DEPRECATED — re-export từ PostgreSQL service.
 * Import path cũ vẫn hoạt động, không cần sửa caller.
 */
export { notificationService } from '@/services/pg/notification.service';
export type { NotificationType, NotificationPayload } from '@/services/pg/notification.service';
