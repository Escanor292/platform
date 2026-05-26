-- CreateTable
CREATE TABLE "campaign_blog_links" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_blog_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_blog_links_campaignId_idx" ON "campaign_blog_links"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_blog_links_blogPostId_idx" ON "campaign_blog_links"("blogPostId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_blog_links_campaignId_blogPostId_key" ON "campaign_blog_links"("campaignId", "blogPostId");

-- AddForeignKey
ALTER TABLE "campaign_blog_links" ADD CONSTRAINT "campaign_blog_links_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_blog_links" ADD CONSTRAINT "campaign_blog_links_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
