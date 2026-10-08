import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const source = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const blocks = source.split(/(?=^model )/m);
const header = blocks.shift();
const models = [];
const junctions = [];

const specs = {};

for (const block of blocks) {
  const name = block.match(/^model\s+(\w+)/)?.[1];
  if (!name) {
    models.push(block);
    continue;
  }
  const spec = specs[name] || {};
  const removed = new Set(Object.keys(spec));
  const lines = block.split("\n").filter((line) => {
    const array = line.match(/^\s+(\w+)\s+String\[\]/);
    if (array && removed.has(array[1])) return false;
    const index = line.match(/@@index\(\[([^\]]+)\]/);
    if (index && [...removed].some((field) => new RegExp(`\\b${field}\\b`).test(index[1]))) return false;
    return true;
  });
  const relationLines = Object.values(spec).map(([table]) => `  ${table} ${table}[]`);
  const anchor = lines.findIndex((line) => line.trim().startsWith("@@") || line.trim() === "}");
  if (relationLines.length && anchor >= 0) lines.splice(anchor, 0, ...relationLines);
  models.push(lines.join("\n"));
  for (const [table, fk, value] of Object.values(spec)) {
    junctions.push(`model ${table} {
  ${fk} String
  ${value} String
  position Int @default(0)
  ${name} ${name} @relation(fields: [${fk}], references: [id], onDelete: Cascade)

  @@id([${fk}, ${value}])
  @@index([${fk}])
}
`);
  }
}

let schema = header
  .replace('output   = "./generated/client"', 'output   = "./generated/mssql"')
  .replace('provider = "postgresql"', 'provider = "sqlserver"')
  .replace('env("DATABASE_URL")', 'env("MSSQL_URL")');

schema = `// Schema SQL Server 2019, sinh từ prisma/schema.prisma.
// Chạy lại: node scripts/build-sqlserver-schema.mjs
// Prisma 5.22 trên SQL Server không có scalar list, Json, enum.
// Mảng và Json thành NVARCHAR(MAX) cùng tên trường. Enum thành String. onUpdate là NoAction.
// Khóa và trường index dùng NVARCHAR(250) để vừa giới hạn 1700 byte của SQL Server 2019.
// Thêm 7 bảng tạo bằng SQL thô: platform_settings, profile_templates, profile_template_uses, link_checks, presentation_deck, presentation_media, user_followers.

${schema}${models.join("\n")}\n${junctions.join("\n")}`;
schema = schema.replace(/@db\.Text\b/g, "@db.NVarChar(Max)");
schema = schema.replace(/^([ \t]+)([A-Za-z_][A-Za-z0-9_]*)([ \t]+)String\[\](.*)$/gm, (_all, indent, name, space, rest) => {
  const cleaned = rest.replace(/@db\.[A-Za-z0-9_()]+/g, "").replace("@default([])", "@default(\"[]\")");
  return `${indent}${name}${space}String @db.NVarChar(Max)${cleaned}`;
});
schema = schema.replace(/^([ \t]+)([A-Za-z_][A-Za-z0-9_]*)([ \t]+)Json(\??)(.*)$/gm, (_all, indent, name, space, opt, rest) => {
  const db = rest.includes("@db.") ? "" : " @db.NVarChar(Max)";
  return `${indent}${name}${space}String${opt}${db}${rest}`;
});
schema = schema.replace(/@relation\(([^)]*)\)/g, (all, inner) => {
  if (!/fields\s*:/.test(inner) || /onUpdate\s*:/.test(inner)) return all;
  return `@relation(${inner}, onUpdate: NoAction)`;
});
const enumNames = [];
const enumValues = new Set();
schema = schema.replace(/^enum\s+(\w+)\s+\{[^}]*\}/gm, (block, name) => {
  enumNames.push(name);
  for (const value of block.match(/^\s{2}([A-Za-z_][A-Za-z0-9_]*)/gm) || []) enumValues.add(value.trim());
  return "";
});
if (enumNames.length) {
  schema = schema.replace(new RegExp(`\\b(?:${enumNames.join("|")})\\b`, "g"), "String");
}
schema = schema.replace(/@default\(([A-Za-z_][A-Za-z0-9_]*)\)/g, (all, value) => enumValues.has(value) ? `@default("${value}")` : all);

schema = schema.replace(/^(model [\s\S]*?)(?=^model |\Z)/gm, (block) => {
  const indexed = new Set();
  for (const match of block.matchAll(/@@(?:id|unique|index)\(\[([^\]]+)\]/g)) {
    for (const part of match[1].split(",")) indexed.add(part.trim().split("(")[0]);
  }
  for (const match of block.matchAll(/^\s+(\w+)\s+String.*@(?:id|unique)\b/gm)) indexed.add(match[1]);
  for (const match of block.matchAll(/fields:\s*\[([^\]]+)\]/g)) {
    for (const part of match[1].split(",")) indexed.add(part.trim());
  }
  return block.split("\n").map((line) => {
    const field = line.match(/^(\s+)(\w+)(\s+)String(\??)(.*)$/);
    if (!field || !indexed.has(field[2]) || /@db\./.test(line)) return line;
    return `${field[1]}${field[2]}${field[3]}String${field[4]} @db.NVarChar(250)${field[5]}`;
  }).join("\n");
});
schema = schema.replace(/^\s*@@index\(\[(tags|images|productImages|mediaUrls|participantIds|blockedBy|hiddenBy|readBy|revealedBy|userIds|imageUrls)\]\)\s*$/gm, "");
schema += `
model platform_settings {
  key        String   @id @db.NVarChar(250)
  value      String   @db.NVarChar(Max)
  updated_at DateTime @default(now())
}

model profile_templates {
  id           String    @id @db.NVarChar(250)
  slug         String    @unique @db.NVarChar(250)
  author_id    String    @db.NVarChar(250)
  title        String    @db.NVarChar(250)
  description  String    @default("") @db.NVarChar(Max)
  visibility   String    @default("PRIVATE") @db.NVarChar(20)
  status       String    @default("DRAFT") @db.NVarChar(20)
  config       String    @db.NVarChar(Max)
  use_count    Int       @default(0)
  created_at   DateTime  @default(now())
  updated_at   DateTime  @default(now())
  published_at DateTime?

  @@index([status, visibility, use_count])
  @@index([author_id])
}

model profile_template_uses {
  template_id String   @db.NVarChar(250)
  user_id     String   @db.NVarChar(250)
  used_at     DateTime @default(now())

  @@id([template_id, user_id])
}

model link_checks {
  id              String    @id @db.NVarChar(250)
  owner_id        String    @db.NVarChar(120)
  entity_type     String    @db.NVarChar(40)
  entity_id       String    @db.NVarChar(120)
  entity_title    String?   @db.NVarChar(250)
  entity_path     String?   @db.NVarChar(250)
  url             String    @db.NVarChar(200)
  status          String    @default("pending") @db.NVarChar(20)
  http_status     Int?
  last_checked_at DateTime?
  broken_at       DateTime?
  notified_at     DateTime?
  created_at      DateTime  @default(now())

  @@unique([owner_id, entity_type, entity_id, url])
}

model presentation_deck {
  id         String   @id @db.NVarChar(250)
  status     String   @default("active") @db.NVarChar(20)
  payload    String?  @db.NVarChar(Max)
  updated_at DateTime @default(now())
}

model presentation_media {
  key        String   @id @db.NVarChar(250)
  mime       String   @db.NVarChar(100)
  bytes      Bytes    @db.VarBinary(Max)
  updated_at DateTime @default(now())
}

model user_followers {
  follower_id  String   @db.NVarChar(200)
  following_id String   @db.NVarChar(200)
  created_at   DateTime @default(now())

  @@id([follower_id, following_id])
  @@index([following_id])
}
`;

if (schema.includes("String[]")) {
  console.error("schema.sqlserver.prisma still has String[]");
  process.exit(1);
}
writeFileSync(new URL("../prisma/schema.sqlserver.prisma", import.meta.url), schema);
const schemaPath = new URL("../prisma/schema.sqlserver.prisma", import.meta.url);
for (let pass = 0; pass < 40; pass += 1) {
  const result = spawnSync("npx", ["--yes", "prisma@5.22.0", "validate", "--schema", schemaPath.pathname], {
    encoding: "utf8",
    env: { ...process.env, MSSQL_URL: process.env.MSSQL_URL || "sqlserver://localhost:1433;database=tute;user=sa;password=Your_password123;encrypt=true" },
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  if (result.status === 0) {
    console.log("schema.sqlserver.prisma valid");
    process.exit(0);
  }
  const lines = [...output.matchAll(/schema\.sqlserver\.prisma:(\d+)/g)].map((match) => Number(match[1]));
  const current = readFileSync(schemaPath, "utf8").split("\n");
  let changed = 0;
  for (const lineNumber of new Set(lines)) {
    const index = lineNumber - 1;
    const line = current[index];
    if (!line || !line.includes("fields:") || !line.includes("@relation(") || line.includes("onDelete: NoAction")) continue;
    current[index] = line.includes("onDelete:")
      ? line.replace(/onDelete:\s*\w+/, "onDelete: NoAction")
      : line.replace("@relation(", "@relation(").replace(/\)/, ", onDelete: NoAction)");
    if (current[index] !== line) changed += 1;
  }
  if (!changed) {
    console.error(output.slice(-2500));
    process.exit(1);
  }
  writeFileSync(schemaPath, current.join("\n"));
  console.log(`patched referential actions, pass ${pass + 1}, lines ${changed}`);
}
