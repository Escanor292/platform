/**
 * Unit tests for Project Service
 * 
 * Tests CRUD operations for Project Hierarchy Management
 * Validates: Requirements 4.2, 5.1, 5.2, 6.2, 7.2, 12.1, 18.1, 18.2
 */

// Mock Prisma client BEFORE imports
jest.mock('@/lib/prisma', () => ({
    prisma: {
        projects: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        campaigns: {
            count: jest.fn(),
        },
        blog_posts: {
            count: jest.fn(),
        },
        users: {
            findUnique: jest.fn(),
        },
    },
}));

import { prisma } from '@/lib/prisma';
import {
    createProject,
    getProjectById,
    listProjects,
    updateProject,
    deleteProject,
    validateProjectOwnership,
    type CreateProjectInput,
    type UpdateProjectInput,
    type PaginationParams,
} from '@/lib/project/project.service';

describe('Project Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createProject', () => {
        it('should create a project with title and description', async () => {
            const mockProject = {
                id: 'cuid123',
                creatorId: 'user123',
                title: 'Test Project',
                description: 'Test description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T10:00:00.000Z'),
            };

            (prisma.projects.create as jest.Mock).mockResolvedValue(mockProject);
            (prisma.campaigns.count as jest.Mock).mockResolvedValue(0);
            (prisma.blog_posts.count as jest.Mock).mockResolvedValue(0);

            const input: CreateProjectInput = {
                title: 'Test Project',
                description: 'Test description',
            };

            const result = await createProject('user123', input);

            expect(result).toEqual({
                ...mockProject,
                campaignCount: 0,
                blogPostCount: 0,
            });

            expect(prisma.projects.create).toHaveBeenCalledWith({
                data: {
                    creatorId: 'user123',
                    title: 'Test Project',
                    description: 'Test description',
                },
            });
        });

        it('should create a project with title only (description as null)', async () => {
            const mockProject = {
                id: 'cuid123',
                creatorId: 'user123',
                title: 'Test Project',
                description: null,
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T10:00:00.000Z'),
            };

            (prisma.projects.create as jest.Mock).mockResolvedValue(mockProject);
            (prisma.campaigns.count as jest.Mock).mockResolvedValue(0);
            (prisma.blog_posts.count as jest.Mock).mockResolvedValue(0);

            const input: CreateProjectInput = {
                title: 'Test Project',
            };

            const result = await createProject('user123', input);

            expect(result.description).toBeNull();
            expect(prisma.projects.create).toHaveBeenCalledWith({
                data: {
                    creatorId: 'user123',
                    title: 'Test Project',
                    description: null,
                },
            });
        });

        it('should use parameterized queries (SQL injection protection)', async () => {
            const maliciousInput: CreateProjectInput = {
                title: "'; DROP TABLE projects;--",
                description: "'; DELETE FROM users;--",
            };

            const mockProject = {
                id: 'cuid123',
                creatorId: 'user123',
                title: "'; DROP TABLE projects;--",
                description: "'; DELETE FROM users;--",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.projects.create as jest.Mock).mockResolvedValue(mockProject);
            (prisma.campaigns.count as jest.Mock).mockResolvedValue(0);
            (prisma.blog_posts.count as jest.Mock).mockResolvedValue(0);

            await createProject('user123', maliciousInput);

            // Verify Prisma is called with the raw values (Prisma handles parameterization)
            expect(prisma.projects.create).toHaveBeenCalledWith({
                data: {
                    creatorId: 'user123',
                    title: "'; DROP TABLE projects;--",
                    description: "'; DELETE FROM users;--",
                },
            });
        });
    });

    describe('getProjectById', () => {
        it('should get project by id for owner with associated data', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user123',
                title: 'Test Project',
                description: 'Test description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T10:00:00.000Z'),
                campaigns: [
                    {
                        id: 'camp123',
                        title: 'Test Campaign',
                        slug: 'test-campaign',
                        status: 'ACTIVE',
                        goalAmount: { toNumber: () => 100000 },
                        currentAmount: { toNumber: () => 50000 },
                        imageUrl: 'https://example.com/image.jpg',
                    },
                ],
                blog_posts: [
                    {
                        id: 'blog123',
                        title: 'Test Blog Post',
                        slug: 'test-blog-post',
                        excerpt: 'Test excerpt',
                        coverImage: 'https://example.com/cover.jpg',
                        publishedAt: new Date('2024-01-20T10:00:00.000Z'),
                    },
                ],
            };

            (prisma.projects.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockProject) // For validateProjectOwnership
                .mockResolvedValueOnce(mockProject); // For getProjectById
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            const result = await getProjectById('project123', 'user123');

            expect(result.id).toBe('project123');
            expect(result.campaignCount).toBe(1);
            expect(result.blogPostCount).toBe(1);
            expect(result.campaigns).toHaveLength(1);
            expect(result.blogPosts).toHaveLength(1);
            expect(result.campaigns[0].goalAmount).toBe(100000);
        });

        it('should include all required campaign fields (Task 3.3)', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user123',
                title: 'Test Project',
                description: 'Test description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T10:00:00.000Z'),
                campaigns: [
                    {
                        id: 'camp123',
                        title: 'Campaign Title',
                        slug: 'campaign-slug',
                        status: 'ACTIVE',
                        goalAmount: { toNumber: () => 500000 },
                        currentAmount: { toNumber: () => 250000 },
                        imageUrl: 'https://example.com/campaign.jpg',
                    },
                    {
                        id: 'camp456',
                        title: 'Another Campaign',
                        slug: 'another-campaign',
                        status: 'COMPLETED',
                        goalAmount: { toNumber: () => 1000000 },
                        currentAmount: { toNumber: () => 1200000 },
                        imageUrl: null,
                    },
                ],
                blog_posts: [],
            };

            (prisma.projects.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockProject)
                .mockResolvedValueOnce(mockProject);
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            const result = await getProjectById('project123', 'user123');

            // Verify all required campaign fields are present
            expect(result.campaigns).toHaveLength(2);
            result.campaigns.forEach((campaign) => {
                expect(campaign).toHaveProperty('id');
                expect(campaign).toHaveProperty('title');
                expect(campaign).toHaveProperty('slug');
                expect(campaign).toHaveProperty('status');
                expect(campaign).toHaveProperty('goalAmount');
                expect(campaign).toHaveProperty('currentAmount');
                expect(campaign).toHaveProperty('imageUrl');
            });

            // Verify specific values
            expect(result.campaigns[0].id).toBe('camp123');
            expect(result.campaigns[0].title).toBe('Campaign Title');
            expect(result.campaigns[0].slug).toBe('campaign-slug');
            expect(result.campaigns[0].status).toBe('ACTIVE');
            expect(result.campaigns[0].goalAmount).toBe(500000);
            expect(result.campaigns[0].currentAmount).toBe(250000);
            expect(result.campaigns[0].imageUrl).toBe('https://example.com/campaign.jpg');

            // Verify null handling
            expect(result.campaigns[1].imageUrl).toBeNull();
        });

        it('should include all required blog post fields (Task 3.3)', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user123',
                title: 'Test Project',
                description: 'Test description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T10:00:00.000Z'),
                campaigns: [],
                blog_posts: [
                    {
                        id: 'blog123',
                        title: 'Blog Post Title',
                        slug: 'blog-post-slug',
                        excerpt: 'This is a blog post excerpt',
                        coverImage: 'https://example.com/blog-cover.jpg',
                        publishedAt: new Date('2024-01-19T10:00:00.000Z'),
                    },
                    {
                        id: 'blog456',
                        title: 'Another Blog Post',
                        slug: 'another-blog-post',
                        excerpt: null,
                        coverImage: null,
                        publishedAt: null,
                    },
                ],
            };

            (prisma.projects.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockProject)
                .mockResolvedValueOnce(mockProject);
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            const result = await getProjectById('project123', 'user123');

            // Verify all required blog post fields are present
            expect(result.blogPosts).toHaveLength(2);
            result.blogPosts.forEach((blogPost) => {
                expect(blogPost).toHaveProperty('id');
                expect(blogPost).toHaveProperty('title');
                expect(blogPost).toHaveProperty('slug');
                expect(blogPost).toHaveProperty('excerpt');
                expect(blogPost).toHaveProperty('coverImage');
                expect(blogPost).toHaveProperty('publishedAt');
            });

            // Verify specific values
            expect(result.blogPosts[0].id).toBe('blog123');
            expect(result.blogPosts[0].title).toBe('Blog Post Title');
            expect(result.blogPosts[0].slug).toBe('blog-post-slug');
            expect(result.blogPosts[0].excerpt).toBe('This is a blog post excerpt');
            expect(result.blogPosts[0].coverImage).toBe('https://example.com/blog-cover.jpg');
            expect(result.blogPosts[0].publishedAt).toEqual(new Date('2024-01-19T10:00:00.000Z'));

            // Verify null handling
            expect(result.blogPosts[1].excerpt).toBeNull();
            expect(result.blogPosts[1].coverImage).toBeNull();
            expect(result.blogPosts[1].publishedAt).toBeNull();
        });

        it('should use Prisma include clause for efficient querying', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user123',
                title: 'Test Project',
                description: 'Test description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T10:00:00.000Z'),
                campaigns: [],
                blog_posts: [],
            };

            (prisma.projects.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockProject)
                .mockResolvedValueOnce(mockProject);
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            await getProjectById('project123', 'user123');

            // Verify Prisma was called with include clause
            expect(prisma.projects.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        campaigns: expect.any(Object),
                        blog_posts: expect.any(Object),
                    }),
                })
            );
        });

        it('should allow admin to access any project', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user456',
                title: 'Test Project',
                description: 'Test description',
                createdAt: new Date(),
                updatedAt: new Date(),
                campaigns: [],
                blog_posts: [],
            };

            (prisma.projects.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockProject) // For validateProjectOwnership
                .mockResolvedValueOnce(mockProject); // For getProjectById
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: true });

            const result = await getProjectById('project123', 'adminUser');

            expect(result.id).toBe('project123');
            expect(result.creatorId).toBe('user456');
        });

        it('should throw error for non-owner non-admin', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user456',
                title: 'Test Project',
                description: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.projects.findUnique as jest.Mock).mockResolvedValue(mockProject);
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            await expect(getProjectById('project123', 'user789')).rejects.toThrow(
                'Not authorized to access this project'
            );
        });

        it('should throw error if project not found', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(getProjectById('invalid123', 'user123')).rejects.toThrow(
                'Project not found'
            );
        });
    });

    describe('listProjects', () => {
        it('should list projects with pagination and counts', async () => {
            const mockProjects = [
                {
                    id: 'project1',
                    creatorId: 'user123',
                    title: 'Project 1',
                    description: 'Description 1',
                    createdAt: new Date('2024-01-20T10:00:00.000Z'),
                    updatedAt: new Date('2024-01-20T10:00:00.000Z'),
                },
                {
                    id: 'project2',
                    creatorId: 'user123',
                    title: 'Project 2',
                    description: null,
                    createdAt: new Date('2024-01-19T10:00:00.000Z'),
                    updatedAt: new Date('2024-01-19T10:00:00.000Z'),
                },
            ];

            (prisma.projects.findMany as jest.Mock).mockResolvedValue(mockProjects);
            (prisma.projects.count as jest.Mock).mockResolvedValue(2);
            (prisma.campaigns.count as jest.Mock)
                .mockResolvedValueOnce(3)
                .mockResolvedValueOnce(1);
            (prisma.blog_posts.count as jest.Mock)
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(0);

            const pagination: PaginationParams = { page: 1, limit: 10 };
            const result = await listProjects('user123', pagination);

            expect(result.data).toHaveLength(2);
            expect(result.data[0].campaignCount).toBe(3);
            expect(result.data[0].blogPostCount).toBe(2);
            expect(result.data[1].campaignCount).toBe(1);
            expect(result.data[1].blogPostCount).toBe(0);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
            });
        });

        it('should calculate correct pagination with multiple pages', async () => {
            (prisma.projects.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.projects.count as jest.Mock).mockResolvedValue(25);

            const pagination: PaginationParams = { page: 2, limit: 10 };
            const result = await listProjects('user123', pagination);

            expect(result.pagination.totalPages).toBe(3);
            expect(result.pagination.page).toBe(2);
            expect(prisma.projects.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10, // (page 2 - 1) * 10
                    take: 10,
                })
            );
        });

        it('should sort projects by createdAt descending', async () => {
            (prisma.projects.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.projects.count as jest.Mock).mockResolvedValue(0);

            await listProjects('user123', { page: 1, limit: 10 });

            expect(prisma.projects.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: 'desc' },
                })
            );
        });
    });

    describe('updateProject', () => {
        it('should update project with partial data (title only)', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user123',
                title: 'Updated Title',
                description: 'Original description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T11:00:00.000Z'),
            };

            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user123',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });
            (prisma.projects.update as jest.Mock).mockResolvedValue(mockProject);
            (prisma.campaigns.count as jest.Mock).mockResolvedValue(5);
            (prisma.blog_posts.count as jest.Mock).mockResolvedValue(3);

            const input: UpdateProjectInput = { title: 'Updated Title' };
            const result = await updateProject('project123', 'user123', input);

            expect(result.title).toBe('Updated Title');
            expect(result.description).toBe('Original description');
            expect(prisma.projects.update).toHaveBeenCalledWith({
                where: { id: 'project123' },
                data: { title: 'Updated Title' },
            });
        });

        it('should update project with partial data (description only)', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user123',
                title: 'Original Title',
                description: 'Updated description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T11:00:00.000Z'),
            };

            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user123',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });
            (prisma.projects.update as jest.Mock).mockResolvedValue(mockProject);
            (prisma.campaigns.count as jest.Mock).mockResolvedValue(0);
            (prisma.blog_posts.count as jest.Mock).mockResolvedValue(0);

            const input: UpdateProjectInput = { description: 'Updated description' };
            const result = await updateProject('project123', 'user123', input);

            expect(result.title).toBe('Original Title');
            expect(result.description).toBe('Updated description');
            expect(prisma.projects.update).toHaveBeenCalledWith({
                where: { id: 'project123' },
                data: { description: 'Updated description' },
            });
        });

        it('should update both title and description', async () => {
            const mockProject = {
                id: 'project123',
                creatorId: 'user123',
                title: 'Updated Title',
                description: 'Updated description',
                createdAt: new Date('2024-01-20T10:00:00.000Z'),
                updatedAt: new Date('2024-01-20T11:00:00.000Z'),
            };

            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user123',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });
            (prisma.projects.update as jest.Mock).mockResolvedValue(mockProject);
            (prisma.campaigns.count as jest.Mock).mockResolvedValue(0);
            (prisma.blog_posts.count as jest.Mock).mockResolvedValue(0);

            const input: UpdateProjectInput = {
                title: 'Updated Title',
                description: 'Updated description',
            };
            const result = await updateProject('project123', 'user123', input);

            expect(result.title).toBe('Updated Title');
            expect(result.description).toBe('Updated description');
        });

        it('should throw error if not owner', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user456',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            const input: UpdateProjectInput = { title: 'Updated Title' };

            await expect(updateProject('project123', 'user789', input)).rejects.toThrow(
                'Not authorized to access this project'
            );
        });
    });

    describe('deleteProject', () => {
        it('should delete project for owner', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user123',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });
            (prisma.projects.delete as jest.Mock).mockResolvedValue({});

            await deleteProject('project123', 'user123');

            expect(prisma.projects.delete).toHaveBeenCalledWith({
                where: { id: 'project123' },
            });
        });

        it('should allow admin to delete any project', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user456',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: true });
            (prisma.projects.delete as jest.Mock).mockResolvedValue({});

            await deleteProject('project123', 'adminUser');

            expect(prisma.projects.delete).toHaveBeenCalled();
        });

        it('should throw error if not owner', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user456',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            await expect(deleteProject('project123', 'user789')).rejects.toThrow(
                'Not authorized to access this project'
            );
        });

        it('should throw error if project not found', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(deleteProject('invalid123', 'user123')).rejects.toThrow(
                'Project not found'
            );
        });
    });

    describe('validateProjectOwnership', () => {
        it('should return true for project owner', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user123',
            });

            const result = await validateProjectOwnership('project123', 'user123');

            expect(result).toBe(true);
        });

        it('should return true for admin when allowAdmin is true', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user456',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: true });

            const result = await validateProjectOwnership('project123', 'adminUser', true);

            expect(result).toBe(true);
        });

        it('should throw error for non-owner when allowAdmin is false', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user456',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: true });

            await expect(
                validateProjectOwnership('project123', 'adminUser', false)
            ).rejects.toThrow('Not authorized to access this project');
        });

        it('should throw error if project not found', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(validateProjectOwnership('invalid123', 'user123')).rejects.toThrow(
                'Project not found'
            );
        });

        it('should throw error for non-owner non-admin', async () => {
            (prisma.projects.findUnique as jest.Mock).mockResolvedValue({
                id: 'project123',
                creatorId: 'user456',
            });
            (prisma.users.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false });

            await expect(validateProjectOwnership('project123', 'user789')).rejects.toThrow(
                'Not authorized to access this project'
            );
        });
    });
});
