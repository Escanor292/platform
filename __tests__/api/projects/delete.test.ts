/**
 * Tests for DELETE /api/projects/[id] endpoint
 * 
 * Validates: Requirements 7.1, 7.2, 7.5, 7.6, 7.7, 18.5
 * 
 * Note: The SET NULL cascade behavior (Requirements 7.3, 7.4) is tested at the database level
 * through the Prisma schema configuration (onDelete: SetNull) and is verified through integration tests.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/prisma';

describe('DELETE /api/projects/[id]', () => {
    let testUserId: string;
    let testProjectId: string;
    let otherUserId: string;

    beforeEach(async () => {
        // Create test user (creator)
        const testUser = await prisma.users.create({
            data: {
                id: `test-user-delete-${Date.now()}`,
                email: `test-delete-${Date.now()}@example.com`,
                name: 'Test User',
                role: 'CREATOR',
                isAdmin: false,
                updatedAt: new Date(),
            },
        });
        testUserId = testUser.id;

        // Create another user for authorization tests
        const otherUser = await prisma.users.create({
            data: {
                id: `other-user-delete-${Date.now()}`,
                email: `other-delete-${Date.now()}@example.com`,
                name: 'Other User',
                role: 'CREATOR',
                isAdmin: false,
                updatedAt: new Date(),
            },
        });
        otherUserId = otherUser.id;

        // Create test project
        const testProject = await prisma.projects.create({
            data: {
                creatorId: testUserId,
                title: 'Test Project to Delete',
                description: 'This project will be deleted',
            },
        });
        testProjectId = testProject.id;
    });

    afterEach(async () => {
        // Clean up test data
        try {
            await prisma.projects.deleteMany({
                where: { id: testProjectId },
            });
        } catch (error) {
            // Ignore if already deleted
        }

        try {
            await prisma.users.deleteMany({
                where: { id: { in: [testUserId, otherUserId] } },
            });
        } catch (error) {
            // Ignore if already deleted
        }
    });

    it('should successfully delete project', async () => {
        // Verify project exists
        const projectBefore = await prisma.projects.findUnique({
            where: { id: testProjectId },
        });
        expect(projectBefore).not.toBeNull();

        // Import and call deleteProject service
        const { deleteProject } = await import('@/lib/project/project.service');
        await deleteProject(testProjectId, testUserId);

        // Verify project is deleted
        const projectAfter = await prisma.projects.findUnique({
            where: { id: testProjectId },
        });
        expect(projectAfter).toBeNull();
    });

    it('should throw error when project not found', async () => {
        const { deleteProject } = await import('@/lib/project/project.service');
        const nonExistentId = 'non-existent-id';

        await expect(deleteProject(nonExistentId, testUserId)).rejects.toThrow(
            'Project not found'
        );
    });

    it('should throw error when user is not authorized to delete project', async () => {
        const { deleteProject } = await import('@/lib/project/project.service');

        await expect(deleteProject(testProjectId, otherUserId)).rejects.toThrow(
            'Not authorized to access this project'
        );
    });

    it('should allow admin user to delete any project', async () => {
        // Make otherUser an admin
        await prisma.users.update({
            where: { id: otherUserId },
            data: { isAdmin: true },
        });

        const { deleteProject } = await import('@/lib/project/project.service');
        await deleteProject(testProjectId, otherUserId);

        // Verify project is deleted
        const projectAfter = await prisma.projects.findUnique({
            where: { id: testProjectId },
        });
        expect(projectAfter).toBeNull();
    });
});
