export type SqlProvider = "postgresql" | "sqlserver";

const LEFTOVER = /ON CONFLICT|ILIKE|\bRETURNING\b|::(?:bigint|int|text|jsonb)|\$\d|CREATE (?:TABLE|INDEX) IF NOT EXISTS|ADD COLUMN IF NOT EXISTS|TIMESTAMPTZ|\bJSONB\b|\bBYTEA\b|\bNOW\s*\(|\bdecode\s*\(|\bencode\s*\(|\bFILTER\s*\(|NULLS (?:FIRST|LAST)|\bEXCLUDED\.|\bLIMIT\b/i;

export function toDialect(sql: string, provider: SqlProvider): string {
  if (provider === "postgresql") return sql;
  let next = sql.trim();
  next = rewriteCountFilter(next);
  next = rewriteGroupByOrdinal(next);
  next = rewriteCasts(next);
  next = rewriteNullsOrder(next);
  next = rewriteEncodeDecode(next);
  next = next.replace(/\bNOW\s*\(\s*\)/gi, "SYSUTCDATETIME()");
  next = next.replace(/\bTIMESTAMPTZ\b/gi, "DATETIMEOFFSET");
  next = next.replace(/\bJSONB\b/gi, "NVARCHAR(MAX)");
  next = next.replace(/\bBYTEA\b/gi, "VARBINARY(MAX)");
  next = next.replace(/\bTIMESTAMP\s*\(\s*3\s*\)/gi, "DATETIME2(3)");
  next = rewriteCreateTable(next);
  next = rewriteCreateIndex(next);
  next = rewriteAddColumn(next);
  next = rewriteUpsert(next);
  next = next.replace(/\bLIMIT\s+(\$\d+|\d+)\b/gi, "OFFSET 0 ROWS FETCH NEXT $1 ROWS ONLY");
  next = next.replace(/\$(\d+)/g, "@p$1");
  if (LEFTOVER.test(next)) {
    throw new Error(`SQL Postgres chưa dịch sang SQL Server: ${next.slice(0, 240)}`);
  }
  return next;
}

function rewriteCasts(sql: string): string {
  return sql.replace(
    /(\bCOUNT\s*\(\s*\*\s*\)|\$\d+|"[^"]+"|[A-Za-z_][\w.]*)::(bigint|int|text|jsonb)/gi,
    (_all, expr: string, type: string) => {
      if (type.toLowerCase() === "jsonb") return expr;
      const cast = type.toLowerCase() === "bigint" ? "BIGINT" : type.toLowerCase() === "int" ? "INT" : "NVARCHAR(MAX)";
      return `CAST(${expr} AS ${cast})`;
    },
  );
}

function rewriteCountFilter(sql: string): string {
  return sql.replace(
    /COUNT\s*\(\s*\*\s*\)\s+FILTER\s*\(\s*WHERE\s+([\s\S]+?)\)(?:\s*::bigint)?/gi,
    (_all, where: string) => `CAST(SUM(CASE WHEN ${where.trim()} THEN 1 ELSE 0 END) AS BIGINT)`,
  );
}

function rewriteNullsOrder(sql: string): string {
  return sql
    .replace(
      /([A-Za-z0-9_."[\]]+)\s+DESC\s+NULLS LAST/gi,
      "CASE WHEN $1 IS NULL THEN 1 ELSE 0 END, $1 DESC",
    )
    .replace(
      /([A-Za-z0-9_."[\]]+)\s+ASC\s+NULLS FIRST/gi,
      "CASE WHEN $1 IS NULL THEN 0 ELSE 1 END, $1 ASC",
    );
}

function rewriteEncodeDecode(sql: string): string {
  return sql
    .replace(/decode\s*\(\s*(\$\d+)\s*,\s*'hex'\s*\)/gi, "CONVERT(VARBINARY(MAX), $1, 2)")
    .replace(
      /encode\s*\(\s*([A-Za-z0-9_."[\]]+)\s*,\s*'base64'\s*\)/gi,
      "CAST(N'' AS XML).value('xs:base64Binary(sql:column(\"$1\"))', 'VARCHAR(MAX)')",
    );
}

function rewriteGroupByOrdinal(sql: string): string {
  if (!/\bGROUP BY\s+1\b/i.test(sql)) return sql;
  const alias = sql.match(/\bAS\s+who\b/i);
  if (!alias) return sql;
  return sql.replace(/\bGROUP BY\s+1\b/i, "GROUP BY who");
}

function rewriteCreateTable(sql: string): string {
  return sql.replace(/CREATE TABLE IF NOT EXISTS\s+([A-Za-z0-9_]+)\s*\(/gi, (all, name: string, offset: number) => {
    const open = offset + all.length - 1;
    const body = extractParen(sql, open);
    if (!body) return all;
    return all;
  }).replace(/CREATE TABLE IF NOT EXISTS\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)\s*$/gi, (_all, name: string, body: string) => {
    const rewritten = rewriteColumnTypes(body);
    return `IF OBJECT_ID(N'${name}', N'U') IS NULL BEGIN CREATE TABLE ${name} (${rewritten}) END`;
  });
}

function rewriteColumnTypes(body: string): string {
  const multi = new Set<string>();
  for (const match of body.matchAll(/(?:PRIMARY KEY|UNIQUE)\s*\(([^)]+)\)/gi)) {
    const names = match[1].split(",").map((item) => item.trim().replace(/[\[\]"]/g, "").toLowerCase());
    if (names.length > 1) names.forEach((name) => multi.add(name));
  }
  const bounded = new Set(["id", "key", "slug", "author_id", "status", "visibility", "owner_id", "entity_type", "entity_id", "template_id", "user_id", "url"]);
  return body.replace(/\bTEXT\b/gi, (match, offset: number, source: string) => {
    const name = source.slice(0, offset).match(/([A-Za-z_][\w]*)\s*$/)?.[1]?.toLowerCase() || "";
    if (multi.has(name)) return "NVARCHAR(200)";
    const tail = source.slice(offset);
    const inKey = /PRIMARY KEY|UNIQUE/i.test(tail.split(",")[0] || "") || columnInKey(source, offset);
    if (inKey) return "NVARCHAR(450)";
    if (bounded.has(name)) return "NVARCHAR(250)";
    return "NVARCHAR(MAX)";
  });
}

function columnInKey(body: string, offset: number): boolean {
  const before = body.slice(0, offset);
  const name = before.match(/([A-Za-z_][\w]*)\s*$/)?.[1];
  if (!name) return false;
  return new RegExp(`PRIMARY KEY\\s*\\([^)]*\\b${name}\\b`, "i").test(body) || new RegExp(`UNIQUE\\s*\\([^)]*\\b${name}\\b`, "i").test(body);
}

function rewriteCreateIndex(sql: string): string {
  return sql.replace(
    /CREATE INDEX IF NOT EXISTS\s+([A-Za-z0-9_]+)\s+ON\s+([A-Za-z0-9_]+)\s*\(([\s\S]+?)\)/gi,
    (_all, index: string, table: string, cols: string) =>
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'${index}' AND object_id = OBJECT_ID(N'${table}')) CREATE INDEX ${index} ON ${table} (${cols.trim()})`,
  );
}

function rewriteAddColumn(sql: string): string {
  return sql.replace(
    /ALTER TABLE\s+([A-Za-z0-9_]+)\s+ADD COLUMN IF NOT EXISTS\s+"?([A-Za-z0-9_]+)"?\s+([A-Za-z0-9_()]+)/gi,
    (_all, table: string, column: string, type: string) => {
      const mapped = type.toUpperCase() === "TEXT" ? "NVARCHAR(MAX)" : type;
      return `IF COL_LENGTH('${table}', '${column}') IS NULL ALTER TABLE ${table} ADD [${column}] ${mapped}`;
    },
  );
}

function rewriteUpsert(sql: string): string {
  if (!/ON\s+CONFLICT/i.test(sql)) return sql;
  const insertAt = sql.search(/INSERT\s+INTO/i);
  if (insertAt < 0) return sql;
  const tableMatch = sql.slice(insertAt).match(/INSERT\s+INTO\s+([A-Za-z0-9_."[\]]+)\s*\(/i);
  if (!tableMatch) return sql;
  const table = tableMatch[1].replace(/[\[\]"]/g, "");
  const colsOpen = insertAt + tableMatch.index! + tableMatch[0].length - 1;
  const cols = extractParen(sql, colsOpen);
  if (!cols) return sql;
  const valuesKey = sql.slice(cols.end + 1).match(/^\s*VALUES\s*\(/i);
  if (!valuesKey) return sql;
  const valuesOpen = cols.end + 1 + valuesKey.index! + valuesKey[0].length - 1;
  const values = extractParen(sql, valuesOpen);
  if (!values) return sql;
  const conflict = sql.slice(values.end + 1).match(/^\s*ON\s+CONFLICT\s*\(/i);
  if (!conflict) return sql;
  const conflictOpen = values.end + 1 + conflict.index! + conflict[0].length - 1;
  const keys = extractParen(sql, conflictOpen);
  if (!keys) return sql;
  const action = sql.slice(keys.end + 1).match(/^\s*DO\s+(NOTHING|UPDATE\s+SET\s+[\s\S]*?)(?:\s+RETURNING\s+([A-Za-z0-9_,"\s]+))?\s*$/i);
  if (!action) return sql;
  const columns = splitCsv(cols.inner).map((item) => item.replace(/[\[\]"]/g, "").trim());
  const exprs = splitCsv(values.inner).map((item) => item.trim());
  const keyCols = splitCsv(keys.inner).map((item) => item.replace(/[\[\]"]/g, "").trim());
  const valueOf = (column: string) => {
    const index = columns.findIndex((item) => item.toLowerCase() === column.toLowerCase());
    if (index < 0) throw new Error(`Không map được cột ${column} trong INSERT ${table}`);
    return exprs[index];
  };
  const returning = action[2]?.trim();
  if (/^NOTHING$/i.test(action[1])) {
    const where = keyCols.map((column) => `[${column}] = ${valueOf(column)}`).join(" AND ");
    const insert = `INSERT INTO ${table} (${columns.map((column) => `[${column}]`).join(", ")}) SELECT ${exprs.join(", ")} WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE ${where})`;
    if (!returning) return `${sql.slice(0, insertAt)}${insert}`;
    const retCols = splitCsv(returning).map((item) => item.replace(/[\[\]"]/g, "").trim());
    const selectWhere = keyCols.map((column) => `[${column}] = ${valueOf(column)}`).join(" AND ");
    return `${sql.slice(0, insertAt)}${insert}; SELECT ${retCols.map((column) => `[${column}]`).join(", ")} FROM ${table} WHERE ${selectWhere} AND @@ROWCOUNT > 0`;
  }
  const setBody = action[1].replace(/^UPDATE\s+SET\s+/i, "");
  const whereMatch = setBody.match(/\s+WHERE\s+([\s\S]+)$/i);
  const assignments = (whereMatch ? setBody.slice(0, whereMatch.index) : setBody).split(",").map((item) => item.trim()).filter(Boolean);
  const matchedAnd = whereMatch ? ` AND ${whereMatch[1].replace(new RegExp(table, "ig"), "target")}` : "";
  const setSql = assignments
    .map((item) => item.replace(/\bEXCLUDED\.([A-Za-z0-9_]+)/gi, "source.[$1]").replace(/^"?([A-Za-z0-9_]+)"?\s*=/, "[$1] ="))
    .join(", ");
  const sourceCols = columns.map((column, index) => `${exprs[index]} AS [${column}]`).join(", ");
  const on = keyCols.map((column) => `target.[${column}] = source.[${column}]`).join(" AND ");
  const insertCols = columns.map((column) => `[${column}]`).join(", ");
  const insertVals = columns.map((column) => `source.[${column}]`).join(", ");
  return `${sql.slice(0, insertAt)}MERGE ${table} AS target USING (SELECT ${sourceCols}) AS source ON ${on} WHEN MATCHED${matchedAnd} THEN UPDATE SET ${setSql} WHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals});`;
}

function splitCsv(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "," && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  return parts.map((item) => item.trim()).filter(Boolean);
}

function extractParen(sql: string, openIndex: number): { inner: string; end: number } | null {
  if (sql[openIndex] !== "(") return null;
  let depth = 0;
  let quote = "";
  for (let i = openIndex; i < sql.length; i += 1) {
    const char = sql[i];
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0) return { inner: sql.slice(openIndex + 1, i), end: i };
    }
  }
  return null;
}
