import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionMap, listEnabled, resolveAccountType } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string; status?: string; isAdmin?: boolean } | undefined;
  const accountType = resolveAccountType(user);
  const map = await getPermissionMap();
  const mask = map[accountType];
  return NextResponse.json({
    accountType,
    mask,
    permissions: listEnabled(mask),
  });
}
