import type { Role, ViewId } from "./types";

export const ROLE_VIEWS: Record<Role, ViewId[] | "all"> = {
  owner: "all",
  cashier: ["pos", "fnb", "omni", "crm", "hdra"],
  stock: ["kho", "mua", "dm", "hdvao"],
  accountant: ["hdra", "hdvao", "so", "thue", "bc", "nh", "home", "map"],
  kitchen: ["fnb"],
};

export const VIEW_LABEL: { id: ViewId; label: string }[] = [
  { id: "pos", label: "Bán quầy" },
  { id: "fnb", label: "Bàn và bếp" },
  { id: "omni", label: "Đa kênh" },
  { id: "crm", label: "Khách" },
  { id: "kho", label: "Kho" },
  { id: "mua", label: "Mua hàng" },
  { id: "dm", label: "Danh mục" },
  { id: "hdra", label: "Hóa đơn ra" },
  { id: "hdvao", label: "Hóa đơn vào" },
  { id: "so", label: "Sổ kế toán" },
  { id: "thue", label: "Thuế" },
  { id: "bc", label: "Báo cáo" },
  { id: "nh", label: "Ngân hàng" },
  { id: "home", label: "Tổng quan" },
  { id: "ns", label: "Nhân sự" },
  { id: "ht", label: "Hệ thống" },
  { id: "map", label: "Đủ nghiệp vụ" },
];

export function can(role: Role, id: ViewId, who?: { role: Role; perms?: ViewId[] } | null) {
  if (who && who.role === role && who.perms?.length) return who.perms.includes(id);
  const list = ROLE_VIEWS[role];
  return list === "all" || list.includes(id);
}
