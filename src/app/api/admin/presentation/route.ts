import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deletePresentationDeck } from "@/lib/admin-presentation";

function isAdmin(user: unknown) {
  const u = user as { role?: string; isAdmin?: boolean } | undefined;
  return u?.role === "ADMIN" || u?.isAdmin === true;
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await deletePresentationDeck();
  return NextResponse.json({ ok: true, status: "deleted" });
}
