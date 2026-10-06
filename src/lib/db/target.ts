import { existsSync } from "fs";
import path from "path";

export type DatabaseTarget = "postgresql" | "sqlserver";

export const ACTIVE_DATABASE_KEY = "active_database";

const SYNC_WORKER_READY = false;

let effective: DatabaseTarget = "postgresql";

export function getDatabaseTarget(): DatabaseTarget {
  return effective;
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
  if (!SYNC_WORKER_READY) reasons.push("Chưa có worker đồng bộ. Chưa chuyển để tránh lệch đơn PayOS.");
  const canSwitch = mssqlConfigured && mssqlClientReady && unlocked && SYNC_WORKER_READY;
  if (!canSwitch) effective = "postgresql";
  else effective = stored === "sqlserver" ? "sqlserver" : "postgresql";
  return {
    stored,
    effective,
    mssqlConfigured,
    mssqlClientReady,
    canSwitch,
    reasons: canSwitch ? [] : reasons,
  };
}
