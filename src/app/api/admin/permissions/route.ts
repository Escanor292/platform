import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  ACCOUNT_TYPES,
  DEFAULT_PERMISSION_MAP,
  PERMISSIONS,
  PERMISSION_GROUPS,
  getPermissionMap,
  isLocked,
  savePermissionMap,
  setBit,
  type AccountType,
  type PermissionKey,
} from "@/lib/permissions";

function isAdmin(user: unknown) {
  const u = user as { role?: string; isAdmin?: boolean } | undefined;
  return u?.role === "ADMIN" || u?.isAdmin === true;
}

function payload(map: Awaited<ReturnType<typeof getPermissionMap>>) {
  return {
    accountTypes: ACCOUNT_TYPES,
    groups: PERMISSION_GROUPS,
    permissions: PERMISSIONS,
    map,
    defaults: DEFAULT_PERMISSION_MAP,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(payload(await getPermissionMap()));
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  if (body.reset) {
    const map = await savePermissionMap({ ...DEFAULT_PERMISSION_MAP });
    return NextResponse.json({ success: true, ...payload(map) });
  }
  if (body.map && typeof body.map === "object") {
    const map = await savePermissionMap(body.map);
    return NextResponse.json({ success: true, ...payload(map) });
  }
  return NextResponse.json({ error: "Thiếu bản phân quyền để lưu." }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const accountType = body.accountType as AccountType;
  const permission = body.permission as PermissionKey;
  const enabled = Boolean(body.enabled);
  if (!ACCOUNT_TYPES.some((t) => t.key === accountType) || !PERMISSIONS.some((p) => p.key === permission)) {
    return NextResponse.json({ error: "Quyền hoặc loại tài khoản không hợp lệ." }, { status: 400 });
  }
  if (isLocked(accountType, permission) && !enabled) {
    return NextResponse.json({ error: "Không tắt được quyền bắt buộc của Admin." }, { status: 400 });
  }
  const current = await getPermissionMap();
  current[accountType] = setBit(current[accountType], permission, enabled);
  const map = await savePermissionMap(current);
  return NextResponse.json({ success: true, ...payload(map) });
}
