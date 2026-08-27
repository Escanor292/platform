import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DEMO_WAREHOUSE_USER_ID, seedDemoWarehouseItems } from "@/lib/digital-warehouse";

export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; isAdmin?: boolean; role?: string } | undefined;
  const allowed = user?.id === DEMO_WAREHOUSE_USER_ID || user?.isAdmin || user?.role === "ADMIN";
  if (!allowed) {
    return NextResponse.json({ error: "Không có quyền seed kho đồ demo" }, { status: 403 });
  }

  const result = await seedDemoWarehouseItems(DEMO_WAREHOUSE_USER_ID);
  return NextResponse.json(result);
}

export async function GET() {
  return POST();
}
