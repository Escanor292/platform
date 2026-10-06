import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const source = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const blocks = source.split(/(?=^model )/m);
const header = blocks.shift();
const models = [];
const junctions = [];

const specs = {
  campaign_reports: { imageUrls: ["campaign_report_images", "reportId", "url"] },
  campaign_updates: { tags: ["campaign_update_tags", "updateId", "tag"] },
  campaigns: {
    tags: ["campaign_tags", "campaignId", "tag"],
    images: ["campaign_images", "campaignId", "url"],
  },
  rewards: { productImages: ["reward_images", "rewardId", "url"] },
  product_reviews: { mediaUrls: ["review_media", "reviewId", "url"] },
  user_metadata: { tags: ["user_metadata_tags", "metadataId", "tag"] },
  conversations: {
    participantIds: ["conversation_members", "conversationId", "userId"],
    blockedBy: ["conversation_blocks", "conversationId", "userId"],
    hiddenBy: ["conversation_hides", "conversationId", "userId"],
  },
  messages: {
    readBy: ["message_reads", "messageId", "userId"],
    revealedBy: ["message_reveals", "messageId", "userId"],
  },
  message_reactions: { userIds: ["reaction_users", "reactionId", "userId"] },
  chat_reports: { imageUrls: ["chat_report_images", "reportId", "url"] },
};

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

schema = `// Schema SQL Server sinh từ prisma/schema.prisma.
// Không dùng cho Neon. Chạy lại: node scripts/build-sqlserver-schema.mjs
// Prisma 5.22 trên SQL Server không có scalar list, Json, enum.
// Mảng thành bảng nối. Json thành NVARCHAR(MAX). Enum thành String. onUpdate là NoAction.

${schema}${models.join("\n")}\n${junctions.join("\n")}`;
schema = schema.replace(/@db\.Text\b/g, "@db.NVarChar(Max)");
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
