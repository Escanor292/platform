import { existsSync } from "fs";
import path from "path";

export type DatabaseTarget = "postgresql" | "sqlserver";

export const ACTIVE_DATABASE_KEY = "active_database";

let effective: DatabaseTarget = "postgresql";
let refreshedAt = 0;

export function getDatabaseTarget(): DatabaseTarget {
  return effective;
}

export function setDatabaseTarget(target: DatabaseTarget) {
  effective = target;
  refreshedAt = Date.now();
}

export function shouldRefreshDatabaseTarget() {
  return Boolean(process.env.MSSQL_URL?.trim()) && Date.now() - refreshedAt > 1000;
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
  const reasons: string[] = [];
  if (!mssqlConfigured) reasons.push("Chưa có MSSQL_URL trên server.");
  if (!mssqlClientReady) reasons.push("Chưa generate client Prisma cho SQL Server. Deploy lại sau khi gắn URL.");
  const canSwitch = mssqlConfigured && mssqlClientReady;
  if (!canSwitch) {
    effective = "postgresql";
    reasons.push("Nút tắt: web vẫn dùng Postgres, không đổi câu SQL.");
  } else {
    effective = stored === "sqlserver" ? "sqlserver" : "postgresql";
    refreshedAt = Date.now();
    reasons.push(effective === "sqlserver"
      ? "Đang dùng MS SQL. Tắt nút để về Postgres, dữ liệu Neon không bị xóa."
      : "Đang dùng Postgres. Bật nút sẽ chuyển web sang MS SQL đã gắn.");
  }
  return { stored, effective, mssqlConfigured, mssqlClientReady, canSwitch, reasons };
}
