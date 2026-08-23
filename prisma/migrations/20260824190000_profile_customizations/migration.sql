-- CreateTable
CREATE TABLE "profile_customizations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "draftConfig" JSONB NOT NULL,
    "publishedConfig" JSONB NOT NULL,
    "draftVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profile_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_customizations_userId_key" ON "profile_customizations"("userId");
CREATE INDEX "profile_customizations_updatedAt_idx" ON "profile_customizations"("updatedAt");

-- AddForeignKey
ALTER TABLE "profile_customizations" ADD CONSTRAINT "profile_customizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "profile_customization_versions" (
    "id" TEXT NOT NULL,
    "customizationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "action" VARCHAR(24) NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profile_customization_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_customization_versions_customizationId_createdAt_idx" ON "profile_customization_versions"("customizationId", "createdAt");
CREATE UNIQUE INDEX "profile_customization_versions_customizationId_version_key" ON "profile_customization_versions"("customizationId", "version");

-- AddForeignKey
ALTER TABLE "profile_customization_versions" ADD CONSTRAINT "profile_customization_versions_customizationId_fkey" FOREIGN KEY ("customizationId") REFERENCES "profile_customizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
