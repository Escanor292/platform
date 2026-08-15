# Implementation Plan: Project Hierarchy Management

## Overview

This implementation plan adds a top-level "Project" entity to organize Campaigns and Blog Posts under common portfolio items. The feature uses TypeScript with Next.js 14+ App Router, Prisma ORM, and NextAuth.js for authentication. Implementation follows a bottom-up approach: database schema → service layer → API layer → testing.

## Tasks

- [x] 1. Set up database schema and migrations
  - [x] 1.1 Create Prisma migration for projects table
    - Add `projects` model to Prisma schema with fields: id (String @id @default(cuid())), creatorId (String), title (String @db.VarChar(255)), description (String? @db.Text), createdAt (DateTime @default(now())), updatedAt (DateTime @updatedAt)
    - Add foreign key relation from projects.creatorId to users.id with onDelete: Cascade
    - Add index on creatorId field
    - Add relation fields: users (relation to users model), campaigns (relation to campaigns array), blog_posts (relation to blog_posts array)
    - Generate migration with `npx prisma migrate dev --name add-projects-table`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 1.2 Add projectId to campaigns and blog_posts tables
    - Add nullable `projectId` field (String?) to campaigns model
    - Add relation from campaigns to projects with onDelete: SetNull
    - Add index on campaigns.projectId
    - Add nullable `projectId` field (String?) to blog_posts model
    - Add relation from blog_posts to projects with onDelete: SetNull
    - Add index on blog_posts.projectId
    - Generate migration with `npx prisma migrate dev --name add-project-associations`
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_
  
  - [x] 1.3 Verify migration idempotence and rollback capability
    - Create rollback migration script to remove projectId columns and projects table
    - Test running migrations multiple times on clean database
    - Verify foreign key constraints work correctly (CASCADE for users, SET NULL for projects)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 2. Implement project validation and types
  - [x] 2.1 Create TypeScript types for project requests and responses
    - Create `src/types/project.types.ts`
    - Define CreateProjectRequest, UpdateProjectRequest interfaces
    - Define ProjectResponse, ProjectDetailResponse, ProjectListResponse interfaces
    - Define ErrorResponse interface with nested error structure
    - Ensure all timestamp fields are typed as string (ISO 8601)
    - Use camelCase for all property names
    - _Requirements: 19.1, 19.2, 19.3, 19.5_
  
  - [x] 2.2 Create Zod validation schemas
    - Create `src/lib/project/project.validation.ts`
    - Implement createProjectSchema with title validation (required, 1-255 chars, trimmed) and description validation (optional, trimmed)
    - Implement updateProjectSchema with optional title and description, requiring at least one field
    - Implement paginationSchema with page (min 1, default 1) and limit (min 1, max 100, default 10)
    - Implement projectIdSchema validating CUID format
    - _Requirements: 4.3, 4.4, 5.5, 5.6, 5.7, 13.1, 13.2, 18.4_
  
  - [ ]* 2.3 Write property test for input validation and normalization
    - **Property 11: Input Validation and Normalization**
    - Generate random strings with leading/trailing whitespace
    - Verify system trims whitespace and rejects empty/whitespace-only titles
    - Run 100 iterations with fast-check
    - **Validates: Requirements 4.3, 13.1, 13.2**

- [x] 3. Implement project service layer
  - [x] 3.1 Create project service with CRUD operations
    - Create `src/lib/project/project.service.ts`
    - Implement createProject(creatorId, input) function
    - Implement getProjectById(projectId, userId) function with ownership validation
    - Implement listProjects(creatorId, pagination) function with counts
    - Implement updateProject(projectId, userId, input) function with partial updates
    - Implement deleteProject(projectId, userId) function
    - Implement validateProjectOwnership(projectId, userId, allowAdmin) helper function
    - Use Prisma client for all database operations with parameterized queries
    - _Requirements: 4.2, 5.1, 5.2, 6.2, 7.2, 12.1, 18.1, 18.2_
  
  - [x] 3.2 Implement project counts and aggregations
    - Add logic to count associated campaigns using Prisma aggregation
    - Add logic to count associated blog posts using Prisma aggregation
    - Use database joins instead of N+1 queries for efficiency
    - Return ProjectWithCounts interface with accurate counts
    - _Requirements: 5.3, 15.1, 15.4, 19.1_
  
  - [x] 3.3 Implement project detail with associated content
    - Create getProjectDetail function that returns project with full campaign and blog post objects
    - Include campaign fields: id, title, slug, status, goalAmount, currentAmount, imageUrl
    - Include blog post fields: id, title, slug, excerpt, coverImage, publishedAt
    - Use Prisma include clause for efficient querying
    - _Requirements: 20.2, 20.4, 20.5_
  
  - [ ]* 3.4 Write property tests for service layer operations
    - **Property 1: Automatic Timestamp Management**
    - Verify createdAt is set on creation and updatedAt increases on updates
    - **Property 6: Unique CUID Generation**
    - Create multiple projects and verify all IDs are unique and match CUID format
    - **Property 9: Partial Update Correctness**
    - Test updating subsets of fields leaves other fields unchanged
    - Run 100 iterations per property with fast-check
    - **Validates: Requirements 1.4, 1.5, 1.6, 6.2, 6.5, 6.6**

- [x] 4. Checkpoint - Verify service layer and database integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement project API endpoints
  - [x] 5.1 Create POST /api/projects endpoint
    - Create `src/app/api/projects/route.ts`
    - Implement POST handler with NextAuth session authentication
    - Validate user has creator role
    - Validate request body with createProjectSchema
    - Call createProject service method
    - Return 201 with ProjectResponse on success
    - Handle errors: 401 (unauthenticated), 403 (non-creator), 400 (validation), 500 (internal)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 5.2 Create GET /api/projects endpoint
    - Implement GET handler in same route file
    - Validate pagination query parameters with paginationSchema
    - Call listProjects service method with authenticated user's ID
    - Return 200 with ProjectListResponse including pagination metadata
    - Sort results by createdAt descending
    - Handle errors: 401 (unauthenticated), 400 (invalid pagination), 500 (internal)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 19.4_
  
  - [x] 5.3 Create GET /api/projects/[id] endpoint
    - Create `src/app/api/projects/[id]/route.ts`
    - Implement GET handler with dynamic route parameter
    - Validate projectId format with projectIdSchema
    - Call getProjectDetail service method
    - Validate user owns project or is admin
    - Return 200 with ProjectDetailResponse
    - Handle errors: 401 (unauthenticated), 403 (not authorized), 404 (not found), 500 (internal)
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_
  
  - [ ] 5.4 Create PATCH /api/projects/[id] endpoint
    - Implement PATCH handler in same [id] route file
    - Validate request body with updateProjectSchema
    - Validate user owns project (call validateProjectOwnership)
    - Call updateProject service method
    - Return 200 with updated ProjectResponse
    - Handle errors: 401, 403, 404, 400 (validation), 500
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [~] 5.5 Create DELETE /api/projects/[id] endpoint
    - Implement DELETE handler in same [id] route file
    - Validate user owns project or is admin
    - Call deleteProject service method (orphans campaigns and blog posts via SET NULL)
    - Log deletion operation with userId, projectId, and timestamp
    - Return 204 No Content on success
    - Handle errors: 401, 403, 404, 500
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 18.5_
  
  - [ ]* 5.6 Write property test for authorization enforcement
    - **Property 7: Authorization Enforcement**
    - Generate random projects with different owners
    - Verify users cannot access/modify projects they don't own
    - Verify admin users can access all projects
    - Run 100 iterations with fast-check
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 6.4, 7.5**

- [ ] 6. Implement error handling and logging
  - [~] 6.1 Add structured error logging
    - Create error logging utility in `src/lib/project/project.errors.ts`
    - Define ErrorLog interface with timestamp, operation, userId, projectId, errorType, errorMessage, errorStack, requestMetadata
    - Implement logError function that sanitizes sensitive data
    - Add console.error calls for all caught errors with structured JSON format
    - _Requirements: 14.4_
  
  - [~] 6.2 Implement error response handlers
    - Create error mapping utility that converts service errors to HTTP responses
    - Handle authentication errors (401), authorization errors (403), validation errors (400), not found (404), conflict (409), service unavailable (503), internal server (500)
    - Ensure error responses follow ErrorResponse structure with nested error object
    - Never expose internal database errors or stack traces to clients
    - Support multiple validation errors in single response array
    - _Requirements: 14.1, 14.2, 14.3, 14.5, 18.6, 19.2_
  
  - [ ]* 6.3 Write property test for SQL injection protection
    - **Property 25: SQL Injection Protection**
    - Generate inputs with SQL injection attempts ('; DROP TABLE--, etc.)
    - Verify system handles malicious input safely without errors
    - Confirm parameterized queries prevent SQL execution
    - Run 100 iterations with fast-check
    - **Validates: Requirements 18.1, 18.2**

- [~] 7. Checkpoint - Verify API layer and error handling
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Update campaign API to support project association
  - [~] 8.1 Add projectId to campaign creation endpoint
    - Update POST /api/campaigns handler to accept optional projectId parameter
    - Validate projectId format if provided
    - Validate project exists and is owned by authenticated user
    - Set campaigns.projectId on creation if valid projectId provided
    - Allow campaigns without projectId (standalone campaigns)
    - Handle errors: 400 (invalid projectId), 403 (not authorized to add to project)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [~] 8.2 Add projectId to campaign update endpoint
    - Update PATCH /api/campaigns/[id] handler to accept optional projectId parameter
    - Support setting projectId to null to make campaign standalone
    - Validate new projectId is owned by campaign owner if provided
    - Update campaigns.projectId in database
    - Return updated campaign object
    - Handle errors: 400, 403
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [~] 8.3 Add projectId filter to campaign query endpoint
    - Update GET /api/campaigns handler to accept optional projectId query parameter
    - Filter campaigns by projectId when parameter provided
    - Support special values "null" or "standalone" to filter for campaigns with NULL projectId
    - Return only campaigns matching filter criteria
    - _Requirements: 11.1, 11.2, 11.5_
  
  - [ ]* 8.4 Write property tests for campaign-project association
    - **Property 15: Campaign-Project Association Validation**
    - Generate random campaign creation/update requests with projectId
    - Verify validation checks project existence and ownership
    - Verify appropriate error codes (400 for invalid, 403 for unauthorized)
    - **Property 17: Campaign Project Reassignment**
    - Test moving campaigns between projects and to standalone
    - Run 100 iterations per property with fast-check
    - **Validates: Requirements 8.2, 8.3, 8.4, 9.2, 9.5, 13.3, 13.5**

- [ ] 9. Update blog post API to support project association
  - [~] 9.1 Add projectId to blog post creation endpoint
    - Update POST /api/blog/posts handler to accept optional projectId parameter
    - Validate projectId format and ownership if provided
    - Set blog_posts.projectId on creation
    - Allow blog posts without projectId (platform blog posts)
    - Handle errors: 400 (invalid projectId), 403 (not authorized)
    - _Requirements: 10.1, 10.3, 10.4, 10.5_
  
  - [~] 9.2 Add projectId to blog post update endpoint
    - Update PATCH /api/blog/posts/[id] handler to accept optional projectId parameter
    - Support setting projectId to null for platform blog posts
    - Validate ownership before associating with project
    - Return updated blog post object
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  
  - [~] 9.3 Add projectId filter to blog post query endpoint
    - Update GET /api/blog/posts handler to accept optional projectId query parameter
    - Filter blog posts by projectId when parameter provided
    - Support "null"/"standalone" values to filter for NULL projectId
    - _Requirements: 11.3, 11.4, 11.5_
  
  - [ ]* 9.4 Write property tests for blog-project association
    - **Property 16: Blog Post-Project Association Validation**
    - Generate random blog post requests with projectId
    - Verify validation of project existence and ownership
    - Verify appropriate error responses
    - Run 100 iterations with fast-check
    - **Validates: Requirements 10.3, 10.4, 10.5, 13.3, 13.5**

- [ ] 10. Implement cascade delete and orphaning behavior
  - [ ]* 10.1 Write property tests for project deletion behavior
    - **Property 2: Project Deletion Orphans Campaigns**
    - Create projects with campaigns, delete project, verify campaigns.projectId is NULL
    - **Property 3: Project Deletion Orphans Blog Posts**
    - Create projects with blog posts, delete project, verify blog_posts.projectId is NULL
    - **Property 10: Successful Deletion Response**
    - Verify deletion returns 204 No Content
    - Run 100 iterations per property with fast-check
    - **Validates: Requirements 2.3, 3.3, 7.2, 7.3, 7.4, 7.6**
  
  - [ ]* 10.2 Write integration tests for database constraints
    - Test foreign key CASCADE constraint on users.id → projects.creatorId
    - Test SET NULL constraint on projects.id → campaigns.projectId
    - Test SET NULL constraint on projects.id → blog_posts.projectId
    - Verify constraint violations throw appropriate errors
    - _Requirements: 1.2, 2.2, 2.3, 3.2, 3.3, 13.4_

- [~] 11. Checkpoint - Verify association endpoints and cascade behavior
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement filtering and querying
  - [ ]* 12.1 Write property tests for query filtering
    - **Property 4: Campaign Filtering by Project**
    - Generate projects with campaigns, query by projectId, verify results match
    - **Property 5: Blog Post Filtering by Project**
    - Generate projects with blog posts, query by projectId, verify results match
    - **Property 18: Standalone Item Filtering**
    - Query with "null"/"standalone" parameter, verify only NULL projectId items returned
    - Run 100 iterations per property with fast-check
    - **Validates: Requirements 2.5, 3.5, 11.2, 11.4, 11.5**
  
  - [ ]* 12.2 Write property tests for pagination
    - **Property 13: Pagination Correctness**
    - Generate random page/limit values, verify correct subset returned with accurate metadata
    - Verify results sorted by createdAt descending
    - **Property 14: Pagination Boundary Validation**
    - Test page < 1 and limit > 100, verify 400 errors
    - Run 100 iterations per property with fast-check
    - **Validates: Requirements 5.2, 5.5, 5.6, 5.7, 19.4**

- [ ] 13. Implement count accuracy and response formatting
  - [ ]* 13.1 Write property tests for counts and response format
    - **Property 19: Associated Count Accuracy**
    - Create projects with varying numbers of campaigns/blogs, verify counts match actual records
    - **Property 20: Response Format Consistency**
    - Verify all responses use camelCase, ISO 8601 timestamps, and correct structure
    - **Property 21: Error Response Structure**
    - Generate various error conditions, verify error response structure
    - **Property 23: Project Detail Completeness**
    - Verify detail endpoint returns complete campaign and blog post objects with all required fields
    - **Property 24: Null ProjectId Representation**
    - Verify NULL projectId is represented as null (not undefined or empty string)
    - Run 100 iterations per property with fast-check
    - **Validates: Requirements 5.3, 17.4, 19.1, 19.2, 19.3, 19.5, 20.2, 20.4, 20.5**

- [ ] 14. Implement security and rate limiting
  - [~] 14.1 Add rate limiting for project creation endpoint
    - Add rate limiting middleware to POST /api/projects
    - Limit to 100 requests per minute per user
    - Return 429 Too Many Requests when limit exceeded
    - Store rate limit state in Redis or in-memory cache
    - _Requirements: 18.3_
  
  - [ ]* 14.2 Write property tests for security features
    - **Property 26: CUID Format Validation**
    - Generate invalid projectId formats, verify system returns 400 before database queries
    - **Property 27: Migration Idempotence**
    - Run migration script multiple times, verify no errors or duplicate changes
    - Run 100 iterations with fast-check
    - **Validates: Requirements 16.4, 18.4**
  
  - [ ]* 14.3 Write unit tests for authentication and authorization flows
    - Test unauthenticated requests return 401
    - Test non-creator users cannot create projects (403)
    - Test users cannot access other users' projects (403)
    - Test admin users can access all projects
    - Test multiple validation errors returned together
    - _Requirements: 4.6, 4.7, 12.2, 12.5, 12.6, 14.5_

- [ ] 15. Performance optimization and monitoring
  - [ ]* 15.1 Write integration tests for performance requirements
    - Test project list query executes in < 500ms for 1000 projects
    - Test queries use indexed columns (verify EXPLAIN output)
    - Test database aggregation functions used for counts (no N+1 queries)
    - Test migration completes in < 60s for 10,000 records
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 16.6_
  
  - [~] 15.2 Add response caching headers
    - Add Cache-Control headers to GET /api/projects endpoint
    - Configure appropriate cache TTL based on data volatility
    - Add ETag support for conditional requests
    - _Requirements: 15.5_

- [ ] 16. Backward compatibility verification
  - [ ]* 16.1 Write integration tests for backward compatibility
    - Verify existing campaigns work without projectId
    - Verify existing blog posts work without projectId
    - Verify queries without projectId filter return all campaigns/blogs
    - Verify standalone items (NULL projectId) function correctly
    - Verify project creation is optional, not required before campaign creation
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 17. Final checkpoint and integration testing
  - [ ]* 17.1 Write end-to-end tests for complete user flows
    - Test complete project lifecycle: create → add campaigns → add blogs → retrieve → update → delete
    - Test moving campaign from project to standalone
    - Test pagination and filtering across multiple projects
    - Test authorization flow with different user roles
    - _Requirements: All requirements_
  
  - [~] 17.2 Run full test suite and verify coverage
    - Run all property tests (minimum 100 iterations each)
    - Run all unit tests
    - Run all integration tests
    - Verify test coverage meets goals: properties (27 tests), units (comprehensive), integrations (database/API)
    - Ensure all tests pass

- [~] 18. Final checkpoint - Complete implementation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test-related sub-tasks and can be skipped for faster MVP
- Property tests use fast-check library with minimum 100 iterations per test
- Each property test references its design document property number and validates specific requirements
- Database operations use Prisma ORM with parameterized queries for SQL injection protection
- All API endpoints use NextAuth.js session-based authentication
- Error responses follow consistent structure with nested error object
- Timestamps use ISO 8601 format in API responses
- Cascade delete behavior: users → projects (CASCADE), projects → campaigns/blogs (SET NULL)
- Checkpoints ensure incremental validation and opportunity for user feedback
