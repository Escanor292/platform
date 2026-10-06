import { existsSync } from "fs";
import path from "path";

export type DatabaseTarget = "postgresql" | "sqlserver";

export const ACTIVE_DATABASE_KEY = "active_database";

let effective: DatabaseTarget = "postgresql";

export function getDatabaseTarget(): DatabaseTarget {
  return effective;
}

export function applyDatabaseTarget(stored: DatabaseTarget): DatabaseTarget {
  const readiness = inspectDatabaseReadiness(stored);
  return readiness.effective;
}

export function mssqlUrlConfigured(): boolean {
  return Boolean(process.env.MSSQL_URL?.trim());
}

export function mssqlClientGenerated(): boolean {
  return existsSync(path.join(process.cwd(), "prisma", "generated", "mssql", "index.js"));
}

export type DatabaseReadiness = {
  stored: DatabaseTarget;
  effective: DatabaseTarget;
  mssqlConfigured: boolean;
  mssqlClientReady: boolean;
  canSwitch: boolean;
  reasons: string[];
};

export function inspectDatabaseReadiness(stored: DatabaseTarget = "postgresql"): DatabaseReadiness {
  const mssqlConfigured = mssqlUrlConfigured();
  const mssqlClientReady = mssqlClientGenerated();
  const unlocked = process.env.DB_SWITCH_UNLOCK === "1";
  const reasons: string[] = [];
  if (!mssqlConfigured) reasons.push("Chưa có MSSQL_URL trên server.");
  if (!mssqlClientReady) reasons.push("Chưa generate client Prisma cho SQL Server.");
  if (!unlocked) reasons.push("Chưa bật DB_SWITCH_UNLOCK. Neon vẫn là database đang ghi.");
  const canSwitch = mssqlConfigured && mssqlClientReady && unlocked;
  if (!canSwitch) {
    reasons.push("Nút tắt: câu SQL và client vẫn là Postgres.");
    effective = "postgresql";
  } else {
    reasons.push("Bật nút chỉ đổi SQL thô sang SQL Server. Query campaign, user, pledge vẫn Neon.");
    effective = stored === "sqlserver" ? "sqlserver" : "postgresql";
  }
  return {
    stored,
    effective,
    mssqlConfigured,
    mssqlClientReady,
    canSwitch,
    reasons,
  };
}
