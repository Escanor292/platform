import { getPlatformSetting, setPlatformSetting } from "@/lib/platform-settings";
import {
  DEFAULT_PERMISSION_MAP,
  PERMISSIONS_VERSION,
  hasBit,
  resolveAccountType,
  sanitizePermissionMap,
  type PermissionKey,
  type PermissionMap,
} from "@/lib/permissions-catalog";

export const ROLE_PERMISSIONS_KEY = "role_permissions";

export {
  ACCOUNT_TYPES,
  DEFAULT_PERMISSION_MAP,
  PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSIONS_VERSION,
  bitOf,
  hasBit,
  isLocked,
  listEnabled,
  maskFromKeys,
  resolveAccountType,
  sanitizePermissionMap,
  setBit,
} from "@/lib/permissions-catalog";
export type { AccountType, PermissionKey, PermissionMap } from "@/lib/permissions-catalog";

export async function getPermissionMap(): Promise<PermissionMap> {
  const stored = await getPlatformSetting(ROLE_PERMISSIONS_KEY);
  if (!stored) return { ...DEFAULT_PERMISSION_MAP };
  try {
    return sanitizePermissionMap(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PERMISSION_MAP };
  }
}

export async function savePermissionMap(map: PermissionMap): Promise<PermissionMap> {
  const next = sanitizePermissionMap({ ...map, v: PERMISSIONS_VERSION }, { migrate: false });
  await setPlatformSetting(ROLE_PERMISSIONS_KEY, JSON.stringify({ v: PERMISSIONS_VERSION, ...next }));
  return next;
}

export async function userHasPermission(
  user: { role?: string | null; status?: string | null; isAdmin?: boolean | null } | null | undefined,
  key: PermissionKey,
): Promise<boolean> {
  if (user?.status === "BANNED") return false;
  const type = resolveAccountType(user);
  const map = await getPermissionMap();
  return hasBit(map[type], key);
}

export function permissionDenied(message = "Tài khoản của bạn không có quyền này.") {
  return { error: message, code: "PERMISSION_DENIED" as const };
}
