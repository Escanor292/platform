/**
 * Unit tests for Project Types
 * 
 * Tests type definitions for Project Hierarchy Management API
 */

import type {
    CreateProjectRequest,
    UpdateProjectRequest,
    ProjectResponse,
    ProjectDetailResponse,
    ProjectListResponse,
    ErrorResponse,
    ProjectCampaignSummary,
    ProjectBlogPostSummary,
} from '@/types/project.types';

describe('Project Types', () => {
    describe('Request Types', () => {
        test('CreateProjectRequest should have correct structure', () => {
            const request: CreateProjectRequest = {
                title: 'Test Project',
                description: 'Test description',
            };

            expect(request.title).toBe('Test Project');
            expect(request.description).toBe('Test description');
        });

        test('CreateProjectRequest should allow optional description', () => {
            const request: CreateProjectRequest = {
                title: 'Test Project',
            };

            expect(request.title).toBe('Test Project');
            expect(request.description).toBeUndefined();
        });

        test('UpdateProjectRequest should allow partial updates', () => {
            const request1: UpdateProjectRequest = {
                title: 'Updated Title',
            };

            const request2: UpdateProjectRequest = {
                description: 'Updated Description',
            };

            const request3: UpdateProjectRequest = {
                title: 'Updated Title',
                description: 'Updated Description',
            };

            expect(request1.title).toBe('Updated Title');
            expect(request2.description).toBe('Updated Description');
            expect(request3.title).toBe('Updated Title');
            expect(request3.description).toBe('Updated Description');
        });
    });

    describe('Response Types', () => {
        test('ProjectResponse should have correct structure with camelCase properties', () => {
            const response: ProjectResponse = {
                id: 'cuid123',
                creatorId: 'user123',
                title: 'Test Project',
                description: 'Test description',
                createdAt: '2024-01-20T10:00:00.000Z',
                updatedAt: '2024-01-20T10:00:00.000Z',
                campaignCount: 5,
                blogPostCount: 3,
            };

            expect(response.id).toBe('cuid123');
            expect(response.creatorId).toBe('user123');
            expect(response.campaignCount).toBe(5);
            expect(response.blogPostCount).toBe(3);
            expect(response.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
        });

        test('ProjectResponse should allow null description', () => {
            const response: ProjectResponse = {
                id: 'cuid123',
                creatorId: 'user123',
                title: 'Test Project',
                description: null,
                createdAt: '2024-01-20T10:00:00.000Z',
                updatedAt: '2024-01-20T10:00:00.000Z',
                campaignCount: 0,
                blogPostCount: 0,
            };

            expect(response.description).toBeNull();
        });

        test('ProjectCampaignSummary should have correct structure', () => {
            const campaign: ProjectCampaignSummary = {
                id: 'camp123',
                title: 'Test Campaign',
                slug: 'test-campaign',
                status: 'ACTIVE',
                goalAmount: 100000,
                currentAmount: 50000,
                imageUrl: 'https://example.com/image.jpg',
            };

            expect(campaign.id).toBe('camp123');
            expect(campaign.goalAmount).toBe(100000);
            expect(campaign.currentAmount).toBe(50000);
        });

        test('ProjectCampaignSummary should allow null imageUrl', () => {
            const campaign: ProjectCampaignSummary = {
                id: 'camp123',
                title: 'Test Campaign',
                slug: 'test-campaign',
                status: 'ACTIVE',
                goalAmount: 100000,
                currentAmount: 50000,
                imageUrl: null,
            };

            expect(campaign.imageUrl).toBeNull();
        });

        test('ProjectBlogPostSummary should have correct structure', () => {
            const blogPost: ProjectBlogPostSummary = {
                id: 'blog123',
                title: 'Test Blog Post',
                slug: 'test-blog-post',
                excerpt: 'Test excerpt',
                coverImage: 'https://example.com/cover.jpg',
                publishedAt: '2024-01-20T10:00:00.000Z',
            };

            expect(blogPost.id).toBe('blog123');
            expect(blogPost.excerpt).toBe('Test excerpt');
            expect(blogPost.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
        });

        test('ProjectBlogPostSummary should allow null fields', () => {
            const blogPost: ProjectBlogPostSummary = {
                id: 'blog123',
                title: 'Test Blog Post',
                slug: 'test-blog-post',
                excerpt: null,
                coverImage: null,
                publishedAt: null,
            };

            expect(blogPost.excerpt).toBeNull();
            expect(blogPost.coverImage).toBeNull();
            expect(blogPost.publishedAt).toBeNull();
        });

        test('ProjectDetailResponse should extend ProjectResponse', () => {
            const detail: ProjectDetailResponse = {
                id: 'cuid123',
                creatorId: 'user123',
                title: 'Test Project',
                description: 'Test description',
                createdAt: '2024-01-20T10:00:00.000Z',
                updatedAt: '2024-01-20T10:00:00.000Z',
                campaignCount: 1,
                blogPostCount: 1,
                campaigns: [
                    {
                        id: 'camp123',
                        title: 'Test Campaign',
                        slug: 'test-campaign',
                        status: 'ACTIVE',
                        goalAmount: 100000,
                        currentAmount: 50000,
                        imageUrl: null,
                    },
                ],
                blogPosts: [
                    {
                        id: 'blog123',
                        title: 'Test Blog Post',
                        slug: 'test-blog-post',
                        excerpt: null,
                        coverImage: null,
                        publishedAt: null,
                    },
                ],
            };

            expect(detail.campaigns).toHaveLength(1);
            expect(detail.blogPosts).toHaveLength(1);
            expect(detail.campaigns[0].id).toBe('camp123');
            expect(detail.blogPosts[0].id).toBe('blog123');
        });

        test('ProjectListResponse should have correct structure', () => {
            const listResponse: ProjectListResponse = {
                data: [
                    {
                        id: 'cuid123',
                        creatorId: 'user123',
                        title: 'Test Project',
                        description: null,
                        createdAt: '2024-01-20T10:00:00.000Z',
                        updatedAt: '2024-01-20T10:00:00.000Z',
                        campaignCount: 0,
                        blogPostCount: 0,
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                },
            };

            expect(listResponse.data).toHaveLength(1);
            expect(listResponse.pagination.page).toBe(1);
            expect(listResponse.pagination.limit).toBe(10);
            expect(listResponse.pagination.total).toBe(1);
            expect(listResponse.pagination.totalPages).toBe(1);
        });
    });

    describe('Error Response Type', () => {
        test('ErrorResponse should have nested error structure', () => {
            const error: ErrorResponse = {
                error: {
                    message: 'Project not found',
                    code: 'NOT_FOUND',
                    details: { projectId: 'invalid123' },
                },
            };

            expect(error.error.message).toBe('Project not found');
            expect(error.error.code).toBe('NOT_FOUND');
            expect(error.error.details).toEqual({ projectId: 'invalid123' });
        });

        test('ErrorResponse should allow optional code and details', () => {
            const error: ErrorResponse = {
                error: {
                    message: 'Internal server error',
                },
            };

            expect(error.error.message).toBe('Internal server error');
            expect(error.error.code).toBeUndefined();
            expect(error.error.details).toBeUndefined();
        });
    });

    describe('ISO 8601 Timestamp Format', () => {
        test('All timestamp fields should be typed as string', () => {
            const response: ProjectResponse = {
                id: 'cuid123',
                creatorId: 'user123',
                title: 'Test Project',
                description: null,
                createdAt: '2024-01-20T10:30:45.123Z',
                updatedAt: '2024-01-20T11:30:45.123Z',
                campaignCount: 0,
                blogPostCount: 0,
            };

            // TypeScript ensures these are strings
            expect(typeof response.createdAt).toBe('string');
            expect(typeof response.updatedAt).toBe('string');
        });

        test('BlogPost publishedAt should be string or null', () => {
            const blogPost1: ProjectBlogPostSummary = {
                id: 'blog123',
                title: 'Test Blog Post',
                slug: 'test-blog-post',
                excerpt: null,
                coverImage: null,
                publishedAt: '2024-01-20T10:00:00.000Z',
            };

            const blogPost2: ProjectBlogPostSummary = {
                id: 'blog123',
                title: 'Test Blog Post',
                slug: 'test-blog-post',
                excerpt: null,
                coverImage: null,
                publishedAt: null,
            };

            expect(typeof blogPost1.publishedAt).toBe('string');
            expect(blogPost2.publishedAt).toBeNull();
        });
    });
});
