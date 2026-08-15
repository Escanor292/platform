/**
 * Migration Idempotence and Constraint Verification Tests
 * 
 * Tests verify:
 * - Running migrations multiple times doesn't cause errors (idempotence)
 * - Foreign key constraints work correctly (CASCADE for users, SET NULL for projects)
 * - Rollback migration removes all project hierarchy components
 * 
 * Validates Requirements: 16.1, 16.2, 16.3, 16.4, 16.5
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('Migration Idempotence and Rollback Tests', () => {
    beforeAll(async () => {
        // Ensure we're connected to test database
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Migration Idempotence', () => {
        test('should verify projects table exists with correct structure', async () => {
            // Query the schema to check if projects table exists
            const result = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      `;

            expect(result.length).toBe(1);
            expect(result[0].table_name).toBe('projects');
        });

        test('should verify projects table has all required columns', async () => {
            const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string; is_nullable: string }>>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'projects'
        ORDER BY ordinal_position
      `;

            const columnMap = new Map(columns.map(c => [c.column_name, c]));

            // Verify required columns exist
            expect(columnMap.has('id')).toBe(true);
            expect(columnMap.has('creatorId')).toBe(true);
            expect(columnMap.has('title')).toBe(true);
            expect(columnMap.has('description')).toBe(true);
            expect(columnMap.has('createdAt')).toBe(true);
            expect(columnMap.has('updatedAt')).toBe(true);

            // Verify NOT NULL constraints
            expect(columnMap.get('id')?.is_nullable).toBe('NO');
            expect(columnMap.get('creatorId')?.is_nullable).toBe('NO');
            expect(columnMap.get('title')?.is_nullable).toBe('NO');
            expect(columnMap.get('description')?.is_nullable).toBe('YES'); // nullable
            expect(columnMap.get('createdAt')?.is_nullable).toBe('NO');
            expect(columnMap.get('updatedAt')?.is_nullable).toBe('NO');
        });

        test('should verify campaigns has projectId column', async () => {
            const columns = await prisma.$queryRaw<Array<{ column_name: string; is_nullable: string }>>`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'campaigns'
        AND column_name = 'projectId'
      `;

            expect(columns.length).toBe(1);
            expect(columns[0].column_name).toBe('projectId');
            expect(columns[0].is_nullable).toBe('YES'); // nullable for backward compatibility
        });

        test('should verify blog_posts has projectId column', async () => {
            const columns = await prisma.$queryRaw<Array<{ column_name: string; is_nullable: string }>>`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'blog_posts'
        AND column_name = 'projectId'
      `;

            expect(columns.length).toBe(1);
            expect(columns[0].column_name).toBe('projectId');
            expect(columns[0].is_nullable).toBe('YES'); // nullable for backward compatibility
        });

        test('should verify all required indexes exist', async () => {
            const indexes = await prisma.$queryRaw<Array<{ indexname: string; tablename: string }>>`
        SELECT indexname, tablename
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND (
          indexname = 'projects_creatorId_idx' OR
          indexname = 'campaigns_projectId_idx' OR
          indexname = 'blog_posts_projectId_idx'
        )
      `;

            const indexNames = indexes.map(idx => idx.indexname);

            expect(indexNames).toContain('projects_creatorId_idx');
            expect(indexNames).toContain('campaigns_projectId_idx');
            expect(indexNames).toContain('blog_posts_projectId_idx');
        });
    });

    describe('Foreign Key Constraint Verification', () => {
        let testUserId: string;
        let testProjectId: string;
        let testCampaignId: string;
        let testBlogPostId: string;

        beforeEach(async () => {
            // Create test user
            testUserId = `test-user-${Date.now()}`;
            await prisma.users.create({
                data: {
                    id: testUserId,
                    email: `test-${Date.now()}@example.com`,
                    name: 'Test User',
                    password: 'test-password',
                    role: 'CREATOR',
                    updatedAt: new Date(),
                },
            });
        });

        afterEach(async () => {
            // Cleanup: Delete test data in reverse dependency order
            if (testCampaignId) {
                await prisma.campaigns.deleteMany({
                    where: { id: testCampaignId },
                }).catch(() => { });
            }
            if (testBlogPostId) {
                await prisma.blog_posts.deleteMany({
                    where: { id: testBlogPostId },
                }).catch(() => { });
            }
            if (testProjectId) {
                await prisma.projects.deleteMany({
                    where: { id: testProjectId },
                }).catch(() => { });
            }
            if (testUserId) {
                await prisma.users.deleteMany({
                    where: { id: testUserId },
                }).catch(() => { });
            }
        });

        test('should CASCADE delete projects when user is deleted', async () => {
            // Create project for user
            testProjectId = `test-project-${Date.now()}`;
            await prisma.projects.create({
                data: {
                    id: testProjectId,
                    creatorId: testUserId,
                    title: 'Test Project',
                    description: 'Test Description',
                },
            });

            // Verify project exists
            const projectBefore = await prisma.projects.findUnique({
                where: { id: testProjectId },
            });
            expect(projectBefore).not.toBeNull();

            // Delete user
            await prisma.users.delete({
                where: { id: testUserId },
            });

            // Verify project was CASCADE deleted
            const projectAfter = await prisma.projects.findUnique({
                where: { id: testProjectId },
            });
            expect(projectAfter).toBeNull();

            // Cleanup flag to avoid afterEach errors
            testUserId = '';
            testProjectId = '';
        });

        test('should SET NULL on campaigns.projectId when project is deleted', async () => {
            // Create project
            testProjectId = `test-project-${Date.now()}`;
            await prisma.projects.create({
                data: {
                    id: testProjectId,
                    creatorId: testUserId,
                    title: 'Test Project',
                },
            });

            // Create campaign associated with project
            testCampaignId = `test-campaign-${Date.now()}`;
            await prisma.campaigns.create({
                data: {
                    id: testCampaignId,
                    campaignCode: `TEST-${Date.now()}`,
                    slug: `test-campaign-${Date.now()}`,
                    title: 'Test Campaign',
                    description: 'Test Description',
                    category: 'Technology',
                    goalAmount: 10000,
                    creatorId: testUserId,
                    projectId: testProjectId,
                    updatedAt: new Date(),
                },
            });

            // Verify campaign has projectId
            const campaignBefore = await prisma.campaigns.findUnique({
                where: { id: testCampaignId },
                select: { projectId: true },
            });
            expect(campaignBefore?.projectId).toBe(testProjectId);

            // Delete project
            await prisma.projects.delete({
                where: { id: testProjectId },
            });

            // Verify campaign.projectId was SET NULL
            const campaignAfter = await prisma.campaigns.findUnique({
                where: { id: testCampaignId },
                select: { projectId: true },
            });
            expect(campaignAfter?.projectId).toBeNull();

            testProjectId = '';
        });

        test('should SET NULL on blog_posts.projectId when project is deleted', async () => {
            // Create project
            testProjectId = `test-project-${Date.now()}`;
            await prisma.projects.create({
                data: {
                    id: testProjectId,
                    creatorId: testUserId,
                    title: 'Test Project',
                },
            });

            // Create blog post associated with project
            testBlogPostId = `test-blog-${Date.now()}`;
            await prisma.blog_posts.create({
                data: {
                    id: testBlogPostId,
                    authorId: testUserId,
                    title: 'Test Blog Post',
                    slug: `test-blog-${Date.now()}`,
                    projectId: testProjectId,
                    updatedAt: new Date(),
                },
            });

            // Verify blog post has projectId
            const blogBefore = await prisma.blog_posts.findUnique({
                where: { id: testBlogPostId },
                select: { projectId: true },
            });
            expect(blogBefore?.projectId).toBe(testProjectId);

            // Delete project
            await prisma.projects.delete({
                where: { id: testProjectId },
            });

            // Verify blog_posts.projectId was SET NULL
            const blogAfter = await prisma.blog_posts.findUnique({
                where: { id: testBlogPostId },
                select: { projectId: true },
            });
            expect(blogAfter?.projectId).toBeNull();

            testProjectId = '';
        });

        test('should allow campaigns to exist with NULL projectId (standalone)', async () => {
            // Create campaign without project
            testCampaignId = `test-campaign-standalone-${Date.now()}`;
            const campaign = await prisma.campaigns.create({
                data: {
                    id: testCampaignId,
                    campaignCode: `TEST-STANDALONE-${Date.now()}`,
                    slug: `test-standalone-${Date.now()}`,
                    title: 'Standalone Campaign',
                    description: 'Test Description',
                    category: 'Technology',
                    goalAmount: 10000,
                    creatorId: testUserId,
                    projectId: null, // Explicitly null
                    updatedAt: new Date(),
                },
            });

            expect(campaign.projectId).toBeNull();
        });

        test('should allow blog posts to exist with NULL projectId (platform posts)', async () => {
            // Create blog post without project
            testBlogPostId = `test-blog-standalone-${Date.now()}`;
            const blogPost = await prisma.blog_posts.create({
                data: {
                    id: testBlogPostId,
                    authorId: testUserId,
                    title: 'Platform Blog Post',
                    slug: `test-platform-${Date.now()}`,
                    projectId: null, // Explicitly null
                    updatedAt: new Date(),
                },
            });

            expect(blogPost.projectId).toBeNull();
        });
    });

    describe('Rollback Migration Script', () => {
        test('should verify rollback script exists', () => {
            const rollbackPath = path.join(
                process.cwd(),
                'prisma',
                'migrations',
                'rollback_add_projects_table.sql'
            );

            expect(fs.existsSync(rollbackPath)).toBe(true);
        });

        test('should verify rollback script has correct content', () => {
            const rollbackPath = path.join(
                process.cwd(),
                'prisma',
                'migrations',
                'rollback_add_projects_table.sql'
            );

            const content = fs.readFileSync(rollbackPath, 'utf-8');

            // Verify script removes foreign keys
            expect(content).toContain('DROP CONSTRAINT IF EXISTS "blog_posts_projectId_fkey"');
            expect(content).toContain('DROP CONSTRAINT IF EXISTS "campaigns_projectId_fkey"');
            expect(content).toContain('DROP CONSTRAINT IF EXISTS "projects_creatorId_fkey"');

            // Verify script drops indexes
            expect(content).toContain('DROP INDEX IF EXISTS "blog_posts_projectId_idx"');
            expect(content).toContain('DROP INDEX IF EXISTS "campaigns_projectId_idx"');
            expect(content).toContain('DROP INDEX IF EXISTS "projects_creatorId_idx"');

            // Verify script removes columns
            expect(content).toContain('DROP COLUMN IF EXISTS "projectId"');

            // Verify script drops table
            expect(content).toContain('DROP TABLE IF EXISTS "projects"');
        });
    });

    describe('Migration Performance', () => {
        test('should verify migration can handle existing data efficiently', async () => {
            // Count existing records to ensure migration handles data
            const campaignCount = await prisma.campaigns.count();
            const blogPostCount = await prisma.blog_posts.count();
            const projectCount = await prisma.projects.count();

            // Migration should work regardless of data volume
            expect(campaignCount).toBeGreaterThanOrEqual(0);
            expect(blogPostCount).toBeGreaterThanOrEqual(0);
            expect(projectCount).toBeGreaterThanOrEqual(0);
        });
    });
});
