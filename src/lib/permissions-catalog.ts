export const ACCOUNT_TYPES = [
  { key: "GUEST", label: "Khách", hint: "Chưa đăng nhập", color: "slate" },
  { key: "BACKER", label: "Backer", hint: "Người ủng hộ", color: "sky" },
  { key: "CREATOR_PENDING", label: "Creator chờ", hint: "Đang xét nâng cấp", color: "amber" },
  { key: "CREATOR", label: "Creator", hint: "Chủ chiến dịch", color: "emerald" },
  { key: "CREATOR_PRO", label: "Creator Pro", hint: "Gói Pro", color: "violet" },
  { key: "ADMIN", label: "Admin", hint: "Quản trị nền tảng", color: "rose" },
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number]["key"];

export const PERMISSION_GROUPS = [
  { key: "content", label: "Nội dung" },
  { key: "funding", label: "Gây quỹ" },
  { key: "community", label: "Cộng đồng" },
  { key: "admin", label: "Quản trị" },
] as const;

export const PERMISSIONS = [
  { key: "blog.write", bit: 0, group: "content", label: "Viết blog", description: "Tạo và sửa bài viết của mình" },
  { key: "blog.publish_direct", bit: 1, group: "content", label: "Xuất bản blog ngay", description: "Bỏ qua hàng đợi duyệt bài editorial" },
  { key: "campaign.create", bit: 2, group: "funding", label: "Tạo chiến dịch", description: "Mở chiến dịch gây quỹ mới" },
  { key: "campaign.manage", bit: 3, group: "funding", label: "Quản lý chiến dịch", description: "Sửa, gửi duyệt chiến dịch của mình" },
  { key: "project.create", bit: 4, group: "funding", label: "Tạo dự án", description: "Mở và quản lý dự án" },
  { key: "product.manage", bit: 5, group: "funding", label: "Quản lý sản phẩm", description: "Thêm phần thưởng / sản phẩm" },
  { key: "pledge.create", bit: 6, group: "funding", label: "Ủng hộ", description: "Đóng góp cho chiến dịch" },
  { key: "chat.use", bit: 7, group: "community", label: "Chat", description: "Nhắn tin với người khác" },
  { key: "follow.users", bit: 8, group: "community", label: "Theo dõi người dùng", description: "Follow để thấy ghi chú 24h" },
  { key: "note.use", bit: 9, group: "community", label: "Ghi chú 24 giờ", description: "Đăng ghi chú trên avatar" },
  { key: "kyc.submit", bit: 10, group: "community", label: "Nộp KYC / nâng cấp", description: "Gửi hồ sơ xác minh, xin lên Creator" },
  { key: "link.health", bit: 11, group: "content", label: "Cảnh báo link hỏng", description: "Quét và nhận báo link chết (Pro)" },
  { key: "admin.panel", bit: 12, group: "admin", label: "Vào trang quản trị", description: "Mở /dashboard/admin" },
  { key: "admin.review", bit: 13, group: "admin", label: "Duyệt nội dung", description: "Duyệt chiến dịch, blog, KYC, báo cáo" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];
export type PermissionMap = Record<AccountType, number>;

const LOCKED: Partial<Record<AccountType, PermissionKey[]>> = {
  ADMIN: ["admin.panel", "admin.review"],
};

export function bitOf(key: PermissionKey): number {
  const item = PERMISSIONS.find((p) => p.key === key);
  return item ? 1 << item.bit : 0;
}

export function hasBit(mask: number, key: PermissionKey): boolean {
  return (Number(mask) & bitOf(key)) !== 0;
}

export function setBit(mask: number, key: PermissionKey, enabled: boolean): number {
  const bit = bitOf(key);
  return enabled ? Number(mask) | bit : Number(mask) & ~bit;
}

export function listEnabled(mask: number): PermissionKey[] {
  return PERMISSIONS.filter((p) => hasBit(mask, p.key)).map((p) => p.key);
}

export function maskFromKeys(keys: PermissionKey[]): number {
  return keys.reduce((mask, key) => mask | bitOf(key), 0);
}

const BACKER_KEYS: PermissionKey[] = [
  "blog.write",
  "pledge.create",
  "chat.use",
  "follow.users",
  "note.use",
  "kyc.submit",
];

const CREATOR_KEYS: PermissionKey[] = [
  ...BACKER_KEYS,
  "campaign.create",
  "campaign.manage",
  "project.create",
  "product.manage",
];

export const DEFAULT_PERMISSION_MAP: PermissionMap = {
  GUEST: maskFromKeys(["pledge.create"]),
  BACKER: maskFromKeys(BACKER_KEYS),
  CREATOR_PENDING: maskFromKeys(BACKER_KEYS),
  CREATOR: maskFromKeys(CREATOR_KEYS),
  CREATOR_PRO: maskFromKeys([...CREATOR_KEYS, "link.health"]),
  ADMIN: maskFromKeys(PERMISSIONS.map((p) => p.key)),
};

export function isLocked(accountType: AccountType, key: PermissionKey): boolean {
  return Boolean(LOCKED[accountType]?.includes(key));
}

export function resolveAccountType(user?: {
  role?: string | null;
  status?: string | null;
  isAdmin?: boolean | null;
} | null): AccountType {
  if (!user) return "GUEST";
  if (user.status === "BANNED") return "GUEST";
  if (user.role === "ADMIN" || user.isAdmin) return "ADMIN";
  if (user.role === "CREATOR" && user.status === "PRO") return "CREATOR_PRO";
  if (user.role === "CREATOR") return "CREATOR";
  if (user.role === "CREATOR_PENDING") return "CREATOR_PENDING";
  return "BACKER";
}

export function sanitizePermissionMap(input: unknown): PermissionMap {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const next = { ...DEFAULT_PERMISSION_MAP };
  for (const type of ACCOUNT_TYPES) {
    const value = raw[type.key];
    if (typeof value === "number" && Number.isFinite(value)) {
      next[type.key] = value >>> 0;
    }
  }
  for (const key of LOCKED.ADMIN || []) {
    next.ADMIN = setBit(next.ADMIN, key, true);
  }
  return next;
}
