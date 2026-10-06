import { NextResponse } from "next/server";

/** Khi CRON_SECRET có giá trị thì bắt buộc Bearer hoặc ?secret=. Không cấu hình thì vẫn chạy, giống các cron hiện có. */
export function unauthorizedCron(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const header = request.headers.get("authorization");
  const query = new URL(request.url).searchParams.get("secret");
  if (header !== `Bearer ${secret}` && query !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
