import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresentationMedia, isPresentationActive } from "@/lib/admin-presentation";

function isAdmin(user: unknown) {
  const u = user as { role?: string; isAdmin?: boolean } | undefined;
  return u?.role === "ADMIN" || u?.isAdmin === true;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await isPresentationActive())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { key } = await context.params;
  const media = await getPresentationMedia(decodeURIComponent(key));
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(media.bytes), {
    headers: {
      "Content-Type": media.mime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
