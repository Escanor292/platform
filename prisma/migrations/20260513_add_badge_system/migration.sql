-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('custom', 'achievement');

-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('common', 'rare', 'epic', 'legendary');

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "icon_name" VARCHAR(100),
    "color" VARCHAR(30),
    "background_color" VARCHAR(30),
    "type" "BadgeType" NOT NULL,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'common',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "reason" TEXT,
    "note" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,
    "revoke_reason" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badges_slug_key" ON "badges"("slug");

-- CreateIndex
CREATE INDEX "badges_slug_idx" ON "badges"("slug");

-- CreateIndex
CREATE INDEX "badges_type_idx" ON "badges"("type");

-- CreateIndex
CREATE INDEX "badges_is_active_idx" ON "badges"("is_active");

-- CreateIndex
CREATE INDEX "badges_deleted_at_idx" ON "badges"("deleted_at");

-- CreateIndex
CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");

-- CreateIndex
CREATE INDEX "user_badges_badge_id_idx" ON "user_badges"("badge_id");

-- CreateIndex
CREATE INDEX "user_badges_assigned_by_idx" ON "user_badges"("assigned_by");

-- CreateIndex
CREATE INDEX "user_badges_revoked_at_idx" ON "user_badges"("revoked_at");

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
