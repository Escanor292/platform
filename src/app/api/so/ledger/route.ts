import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, Prisma } from "@/lib/prisma";

const ID = "trial";

function isAdmin(user: { role?: string; isAdmin?: boolean } | undefined) {
  return !!user && (user.role === "ADMIN" || !!user.isAdmin);
}

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string; isAdmin?: boolean } | undefined;
  if (!isAdmin(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const row = await prisma.so_ledgers.findUnique({ where: { id: ID } });
  if (!row) return NextResponse.json(null);
  return NextResponse.json({ rev: row.rev, state: row.state });
}

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { role?: string; isAdmin?: boolean } | undefined;
  if (!isAdmin(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await request.json()) as { rev?: number; state?: unknown };
  if (typeof body.rev !== "number" || !body.state || typeof body.state !== "object") {
    return NextResponse.json({ error: "bad" }, { status: 400 });
  }
  const current = await prisma.so_ledgers.findUnique({ where: { id: ID } });
  if (!current) {
    try {
      const created = await prisma.so_ledgers.create({
        data: { id: ID, rev: 1, state: body.state as Prisma.InputJsonValue },
      });
      return NextResponse.json({ ok: true, rev: created.rev });
    } catch {
      const latest = await prisma.so_ledgers.findUnique({ where: { id: ID } });
      if (!latest) return NextResponse.json({ error: "write" }, { status: 500 });
      return NextResponse.json({ ok: false, current: { rev: latest.rev, state: latest.state } });
    }
  }
  if (current.rev !== body.rev) {
    return NextResponse.json({ ok: false, current: { rev: current.rev, state: current.state } });
  }
  const updated = await prisma.so_ledgers.updateMany({
    where: { id: ID, rev: body.rev },
    data: { rev: body.rev + 1, state: body.state as Prisma.InputJsonValue, updatedAt: new Date() },
  });
  if (updated.count === 1) return NextResponse.json({ ok: true, rev: body.rev + 1 });
  const latest = await prisma.so_ledgers.findUnique({ where: { id: ID } });
  return NextResponse.json({
    ok: false,
    current: latest ? { rev: latest.rev, state: latest.state } : { rev: current.rev, state: current.state },
  });
}
