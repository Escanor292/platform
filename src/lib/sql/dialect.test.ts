import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { toDialect } from "./dialect.ts";

test("postgres sql is unchanged", () => {
  const sql = `SELECT value FROM platform_settings WHERE key = $1`;
  assert.equal(toDialect(sql, "postgresql"), sql);
});

test("platform settings upsert", () => {
  const sql = toDialect(
    `INSERT INTO platform_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    "sqlserver",
  );
  assert.match(sql, /MERGE platform_settings/);
  assert.match(sql, /@p1/);
  assert.doesNotMatch(sql, /\$1|ON CONFLICT|NOW\(/);
});

test("create table and index", () => {
  const table = toDialect(
    `CREATE TABLE IF NOT EXISTS user_followers (
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (follower_id, following_id)
    )`,
    "sqlserver",
  );
  assert.match(table, /OBJECT_ID/);
  assert.match(table, /NVARCHAR\(450\)/);
  assert.match(table, /DATETIMEOFFSET/);
  const index = toDialect(
    `CREATE INDEX IF NOT EXISTS user_followers_following_idx
    ON user_followers (following_id)`,
    "sqlserver",
  );
  assert.match(index, /sys\.indexes/);
});

test("alter, filter, nulls, casts, media", () => {
  const alter = toDialect(
    'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT',
    "sqlserver",
  );
  assert.match(alter, /COL_LENGTH/);
  assert.match(alter, /NVARCHAR\(MAX\)/);

  const filter = toDialect(
    `SELECT COUNT(*)::bigint AS total,
            COUNT(*) FILTER (WHERE visibility = 'PUBLIC')::bigint AS public_count
     FROM profile_templates WHERE author_id = $1`,
    "sqlserver",
  );
  assert.match(filter, /CAST\(COUNT\(\*\) AS BIGINT\)/);
  assert.match(filter, /SUM\(CASE WHEN/);

  const order = toDialect(
    `SELECT id FROM link_checks WHERE owner_id = $1 ORDER BY last_checked_at DESC NULLS LAST LIMIT 50`,
    "sqlserver",
  );
  assert.match(order, /CASE WHEN last_checked_at IS NULL/);

  const backers = toDialect(
    `SELECT COUNT(*)::int AS count FROM (
        SELECT COALESCE("userId", "email") AS who
        FROM pledges
        WHERE status::text = 'SUCCESS'
        GROUP BY 1
      ) backers`,
    "sqlserver",
  );
  assert.match(backers, /GROUP BY who/);
  assert.match(backers, /CAST\(status AS NVARCHAR\(MAX\)\)/);

  const media = toDialect(
    `SELECT mime, encode(bytes, 'base64') AS b64 FROM presentation_media WHERE key = $1 LIMIT 1`,
    "sqlserver",
  );
  assert.match(media, /base64Binary/);
  assert.match(media, /@p1/);
});

test("insert ignore returning and jsonb", () => {
  const inserted = toDialect(
    `INSERT INTO profile_template_uses (template_id, user_id, used_at)
     VALUES ($1,$2,NOW())
     ON CONFLICT (template_id, user_id) DO NOTHING
     RETURNING template_id`,
    "sqlserver",
  );
  assert.match(inserted, /NOT EXISTS/);
  assert.match(inserted, /@@ROWCOUNT/);

  const meta = toDialect(
    `UPDATE "kyc_info" SET "selfieImage" = $1, "consentAt" = $2, "ekycMeta" = $3::jsonb WHERE "userId" = $4`,
    "sqlserver",
  );
  assert.match(meta, /@p3/);
  assert.doesNotMatch(meta, /jsonb|\$\d/);
});

test("raw call sites no longer use prisma unsafe helpers", () => {
  const files = [
    "src/lib/platform-settings.ts",
    "src/lib/user-follows.ts",
    "src/lib/blog/blog-review.ts",
    "src/lib/link-checks.ts",
    "src/lib/moderation/review-columns.ts",
    "src/lib/moderation/takedown.ts",
    "src/lib/moderation/campaign-review.ts",
    "src/lib/admin-presentation.ts",
    "src/lib/profile-templates.ts",
    "src/app/api/stats/route.ts",
    "src/app/api/kyc/ekyc/confirm/route.ts",
  ];
  for (const file of files) {
    const text = readFileSync(new URL(`../../../${file}`, import.meta.url), "utf8");
    assert.equal(text.includes("prisma.$executeRawUnsafe") || text.includes("prisma.$queryRawUnsafe") || text.includes("prisma.$queryRaw"), false, file);
  }
});
