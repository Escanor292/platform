CREATE TYPE "FeedbackCategory" AS ENUM ('BUG', 'IDEA', 'OTHER');
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'READ');

CREATE TABLE "platform_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL DEFAULT 'IDEA',
    "message" TEXT NOT NULL,
    "pageUrl" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "platform_feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "platform_feedback_status_createdAt_idx" ON "platform_feedback"("status", "createdAt");
CREATE INDEX "platform_feedback_userId_createdAt_idx" ON "platform_feedback"("userId", "createdAt");

ALTER TABLE "platform_feedback" ADD CONSTRAINT "platform_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
