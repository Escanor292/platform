-- Add cover image, slug and rich description to projects
ALTER TABLE "projects" ADD COLUMN "slug" VARCHAR(255);
ALTER TABLE "projects" ADD COLUMN "coverImage" VARCHAR(512);
ALTER TABLE "projects" ADD COLUMN "richDescription" JSONB;
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
CREATE INDEX "projects_slug_idx" ON "projects"("slug");

-- Many-to-many: projects <-> blog posts
CREATE TABLE "project_blog_links" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_blog_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_blog_links_projectId_blogPostId_key" ON "project_blog_links"("projectId", "blogPostId");
CREATE INDEX "project_blog_links_blogPostId_idx" ON "project_blog_links"("blogPostId");
CREATE INDEX "project_blog_links_projectId_idx" ON "project_blog_links"("projectId");

-- Many-to-many: projects <-> rewards (products shown in project)
CREATE TABLE "project_reward_links" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_reward_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_reward_links_projectId_rewardId_key" ON "project_reward_links"("projectId", "rewardId");
CREATE INDEX "project_reward_links_rewardId_idx" ON "project_reward_links"("rewardId");
CREATE INDEX "project_reward_links_projectId_idx" ON "project_reward_links"("projectId");

ALTER TABLE "project_blog_links" ADD CONSTRAINT "project_blog_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_blog_links" ADD CONSTRAINT "project_blog_links_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_reward_links" ADD CONSTRAINT "project_reward_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_reward_links" ADD CONSTRAINT "project_reward_links_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
