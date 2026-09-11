#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const FAILED = "20260911134110_migrate_mongo_to_postgres";

function prisma(args) {
  const result = spawnSync("npx", ["prisma", ...args], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

let status = prisma(["migrate", "deploy"]);
if (status !== 0) {
  console.warn(
    `[prisma-migrate-deploy] migrate deploy failed — mark ${FAILED} rolled-back and retry`,
  );
  prisma(["migrate", "resolve", "--rolled-back", FAILED]);
  status = prisma(["migrate", "deploy"]);
}
process.exit(status);
