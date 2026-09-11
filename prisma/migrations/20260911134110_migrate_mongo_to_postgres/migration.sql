-- CreateEnum
CREATE TYPE "CampaignCommentStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN', 'DELETED');

-- DropForeignKey
ALTER TABLE "pledges" DROP CONSTRAINT "pledges_campaignId_fkey";

-- AlterTable
ALTER TABLE "blog_posts" DROP COLUMN "rejectionReason",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedBy",
DROP COLUMN "reviewerNote",
DROP COLUMN "scheduledAt";

-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "moderationAction",
DROP COLUMN "rejectionReason",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedBy",
DROP COLUMN "reviewerNote";

-- AlterTable
ALTER TABLE "pledges" ALTER COLUMN "depositAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "chargeAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "orderTotalAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "remainingAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "accountingAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "refundAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "cancellationFeeAmount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "profile_customizations" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "lockReason",
DROP COLUMN "lockedAt",
DROP COLUMN "lockedBy";

-- AlterTable
ALTER TABLE "reward_digital_assets" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rewards" DROP COLUMN "hiddenAt",
DROP COLUMN "hiddenBy",
DROP COLUMN "hideReason";

-- DropTable
DROP TABLE "platform_settings";

-- DropTable
DROP TABLE "profile_template_uses";

-- DropTable
DROP TABLE "profile_templates";

-- DropTable
DROP TABLE "user_followers";

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs_v2" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" VARCHAR(64) NOT NULL,
    "entityType" VARCHAR(64) NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_comments" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "CampaignCommentStatus" NOT NULL DEFAULT 'APPROVED',
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "editHistory" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_comment_reactions" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_contents" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "lastSavedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "mediaGallery" JSONB NOT NULL DEFAULT '[]',
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "versionHistory" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_metadata" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "onboarding" JSONB NOT NULL DEFAULT '{}',
    "stats" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventName" VARCHAR(64) NOT NULL,
    "userId" TEXT,
    "campaignId" TEXT,
    "sessionId" TEXT,
    "path" TEXT,
    "payload" JSONB,
    "device" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_settings" (
    "id" TEXT NOT NULL DEFAULT 'behavior',
    "ttlDays" INTEGER NOT NULL DEFAULT 180,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_drafts" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "titleSnapshot" TEXT,
    "excerptSnapshot" TEXT,
    "contentSnapshot" TEXT,
    "richContentSnapshot" JSONB,
    "autosavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_versions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "titleSnapshot" TEXT,
    "excerptSnapshot" TEXT,
    "contentSnapshot" TEXT,
    "richContentSnapshot" JSONB,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_view_logs" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_view_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "conversationKey" TEXT NOT NULL,
    "type" VARCHAR(32) NOT NULL DEFAULT 'direct',
    "participantIds" TEXT[],
    "participants" JSONB NOT NULL DEFAULT '[]',
    "campaignData" JSONB,
    "lastMessage" JSONB,
    "unreadCount" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "blockedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiddenBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "typingBy" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAvatar" TEXT,
    "text" TEXT NOT NULL,
    "type" VARCHAR(32) NOT NULL DEFAULT 'text',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "readBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "revealedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "emoji" VARCHAR(16) NOT NULL,
    "userIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_reports" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT,
    "reporterId" TEXT NOT NULL,
    "reason" VARCHAR(32) NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "occurredAt" TIMESTAMP(3),
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_v2_userId_idx" ON "activity_logs_v2"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_v2_action_idx" ON "activity_logs_v2"("action");

-- CreateIndex
CREATE INDEX "activity_logs_v2_entityType_entityId_idx" ON "activity_logs_v2"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_v2_createdAt_idx" ON "activity_logs_v2"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "campaign_comments_campaignId_createdAt_idx" ON "campaign_comments"("campaignId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "campaign_comments_campaignId_parentId_createdAt_idx" ON "campaign_comments"("campaignId", "parentId", "createdAt");

-- CreateIndex
CREATE INDEX "campaign_comments_parentId_createdAt_idx" ON "campaign_comments"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "campaign_comments_userId_createdAt_idx" ON "campaign_comments"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "campaign_comments_status_idx" ON "campaign_comments"("status");

-- CreateIndex
CREATE INDEX "campaign_comment_reactions_commentId_idx" ON "campaign_comment_reactions"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_comment_reactions_commentId_userId_type_key" ON "campaign_comment_reactions"("commentId", "userId", "type");

-- CreateIndex
CREATE INDEX "campaign_contents_campaignId_idx" ON "campaign_contents"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_contents_campaignId_isDraft_key" ON "campaign_contents"("campaignId", "isDraft");

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata_userId_key" ON "user_metadata"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_eventName_idx" ON "analytics_events"("eventName");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_campaignId_idx" ON "analytics_events"("campaignId");

-- CreateIndex
CREATE INDEX "analytics_events_path_eventName_idx" ON "analytics_events"("path", "eventName");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "blog_drafts_postId_key" ON "blog_drafts"("postId");

-- CreateIndex
CREATE INDEX "blog_drafts_postId_idx" ON "blog_drafts"("postId");

-- CreateIndex
CREATE INDEX "blog_drafts_authorId_idx" ON "blog_drafts"("authorId");

-- CreateIndex
CREATE INDEX "blog_versions_postId_versionNumber_idx" ON "blog_versions"("postId", "versionNumber" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "blog_versions_postId_versionNumber_key" ON "blog_versions"("postId", "versionNumber");

-- CreateIndex
CREATE INDEX "blog_view_logs_postId_viewedAt_idx" ON "blog_view_logs"("postId", "viewedAt" DESC);

-- CreateIndex
CREATE INDEX "blog_view_logs_userId_idx" ON "blog_view_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_conversationKey_key" ON "conversations"("conversationKey");

-- CreateIndex
CREATE INDEX "conversations_participantIds_idx" ON "conversations"("participantIds");

-- CreateIndex
CREATE INDEX "conversations_updatedAt_idx" ON "conversations"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "message_reactions_messageId_idx" ON "message_reactions"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_messageId_emoji_key" ON "message_reactions"("messageId", "emoji");

-- CreateIndex
CREATE INDEX "chat_reports_conversationId_idx" ON "chat_reports"("conversationId");

-- CreateIndex
CREATE INDEX "chat_reports_reporterId_idx" ON "chat_reports"("reporterId");

-- CreateIndex
CREATE INDEX "chat_reports_status_idx" ON "chat_reports"("status");

-- CreateIndex
CREATE INDEX "user_notes_userId_expiresAt_idx" ON "user_notes"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "user_notes_targetUserId_expiresAt_idx" ON "user_notes"("targetUserId", "expiresAt");

-- AddForeignKey
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_comments" ADD CONSTRAINT "campaign_comments_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_comments" ADD CONSTRAINT "campaign_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_comments" ADD CONSTRAINT "campaign_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "campaign_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_comment_reactions" ADD CONSTRAINT "campaign_comment_reactions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "campaign_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_comment_reactions" ADD CONSTRAINT "campaign_comment_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_contents" ADD CONSTRAINT "campaign_contents_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_drafts" ADD CONSTRAINT "blog_drafts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_versions" ADD CONSTRAINT "blog_versions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_view_logs" ADD CONSTRAINT "blog_view_logs_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_reports" ADD CONSTRAINT "chat_reports_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

