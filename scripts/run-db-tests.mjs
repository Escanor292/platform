import { spawnSync } from "node:child_process";

const testDatabaseUrl = process.env.JEST_DATABASE_URL;
if (!testDatabaseUrl) throw new Error("Thiếu JEST_DATABASE_URL. Chỉ dùng URL của database test riêng, không dùng DATABASE_URL phát hành.");

const parsed = new URL(testDatabaseUrl);
if (!/^postgres(ql)?:$/.test(parsed.protocol) || !/(^|[_-])test([_-]|$)/i.test(parsed.pathname)) {
  throw new Error("JEST_DATABASE_URL phải là PostgreSQL database có tên chứa 'test' để tránh chạy nhầm vào database phát hành.");
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const env = { ...process.env, NODE_ENV: "test", DATABASE_URL: testDatabaseUrl };

for (const args of [["prisma", "migrate", "deploy"], ["jest", "--config", "jest.db.config.js", "--runInBand"]]) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
