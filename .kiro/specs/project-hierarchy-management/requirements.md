# Requirements Document

## Introduction

The Project Hierarchy Management System introduces a new top-level entity called "Project" (Dự án) to organize and group multiple Campaigns and Blog Posts under a common portfolio item. This enhancement allows creators to manage their work more effectively by grouping related campaigns and content under broader project umbrellas.

Currently, the system only supports Campaigns as the primary entity, with direct ownership by Users (creators). This feature adds an optional hierarchical layer where a Project can contain multiple Campaigns and Blog Posts, while maintaining backward compatibility for standalone campaigns.

## Glossary

- **Project**: A top-level portfolio entity owned by a Creator that groups related Campaigns and Blog Posts
- **Campaign**: A crowdfunding campaign entity that can optionally belong to a Project
- **Blog_Post**: A blog post entity that can optionally belong to a Project
- **Creator**: A User with the role of creator who can own Projects, Campaigns, and Blog Posts
- **System**: The Project Hierarchy Management System including database, API, and UI components
- **Database**: The PostgreSQL database storing project, campaign, and blog_post records
- **API**: The REST API endpoints for managing projects
- **Project_Manager**: The backend service component responsible for project CRUD operations
- **Authorization_Service**: The backend service component that validates user permissions

## Requirements

### Requirement 1: Project Database Schema

**User Story:** As a system architect, I want a projects table in the database, so that I can store project records with proper referential integrity.

#### Acceptance Criteria

1. THE Database SHALL contain a table named "projects" with columns: id (primary key), creatorId (foreign key to users), title (varchar 255), description (nullable text), createdAt (timestamp), updatedAt (timestamp)
2. THE Database SHALL enforce a foreign key constraint from projects.creatorId to users.id with CASCADE delete behavior
3. THE Database SHALL create an index on projects.creatorId for query performance
4. THE Database SHALL generate a unique CUID for projects.id when a new project record is inserted
5. THE Database SHALL set projects.createdAt to the current timestamp when a new project record is inserted
6. THE Database SHALL update projects.updatedAt to the current timestamp when a project record is modified

### Requirement 2: Campaign-Project Relationship

**User Story:** As a creator, I want to optionally associate my campaigns with a project, so that I can organize related campaigns together.

#### Acceptance Criteria

1. THE Database SHALL add a nullable column "projectId" to the campaigns table as a foreign key to projects.id
2. THE Database SHALL create an index on campaigns.projectId for query performance
3. WHEN a project is deleted, THE Database SHALL set campaigns.projectId to NULL (SET NULL behavior)
4. THE System SHALL allow campaigns to exist without a projectId (standalone campaigns)
5. WHEN querying a project, THE System SHALL return all campaigns where campaigns.projectId matches the project.id

### Requirement 3: Blog Post-Project Relationship

**User Story:** As a creator, I want to optionally associate my blog posts with a project, so that I can group project-related content.

#### Acceptance Criteria

1. THE Database SHALL add a nullable column "projectId" to the blog_posts table as a foreign key to projects.id
2. THE Database SHALL create an index on blog_posts.projectId for query performance
3. WHEN a project is deleted, THE Database SHALL set blog_posts.projectId to NULL (SET NULL behavior)
4. THE System SHALL allow blog posts to exist without a projectId (platform blog posts)
5. WHEN querying a project, THE System SHALL return all blog posts where blog_posts.projectId matches the project.id

### Requirement 4: Project Creation API

**User Story:** As a creator, I want to create a new project via API, so that I can start organizing my campaigns and blog posts.

#### Acceptance Criteria

1. THE API SHALL provide a POST endpoint at "/api/projects" that accepts title (string, required) and description (string, optional)
2. WHEN a valid project creation request is received, THE Project_Manager SHALL create a new project record with the authenticated user as creatorId
3. WHEN a project creation request is received with an empty title, THE API SHALL return HTTP 400 with error message "Title is required"
4. WHEN a project creation request is received with a title exceeding 255 characters, THE API SHALL return HTTP 400 with error message "Title must not exceed 255 characters"
5. WHEN a project is successfully created, THE API SHALL return HTTP 201 with the created project object including id, creatorId, title, description, createdAt, and updatedAt
6. WHEN an unauthenticated user attempts to create a project, THE API SHALL return HTTP 401 with error message "Authentication required"
7. WHEN a user without creator role attempts to create a project, THE API SHALL return HTTP 403 with error message "Creator role required"

### Requirement 5: Project Retrieval API

**User Story:** As a creator, I want to retrieve my projects via API, so that I can display them in the user interface.

#### Acceptance Criteria

1. THE API SHALL provide a GET endpoint at "/api/projects" that returns projects owned by the authenticated user
2. WHEN a projects list request is received, THE API SHALL return HTTP 200 with an array of project objects sorted by createdAt descending
3. THE API SHALL include the count of associated campaigns and blog posts for each project in the response
4. WHEN an unauthenticated user requests the projects list, THE API SHALL return HTTP 401 with error message "Authentication required"
5. THE API SHALL support pagination with query parameters "page" (default 1) and "limit" (default 10, maximum 100)
6. WHEN the page parameter is less than 1, THE API SHALL return HTTP 400 with error message "Page must be at least 1"
7. WHEN the limit parameter exceeds 100, THE API SHALL return HTTP 400 with error message "Limit must not exceed 100"

### Requirement 6: Project Update API

**User Story:** As a creator, I want to update my project details via API, so that I can maintain accurate project information.

#### Acceptance Criteria

1. THE API SHALL provide a PATCH endpoint at "/api/projects/[id]" that accepts title (string, optional) and description (string, optional)
2. WHEN a valid project update request is received, THE Project_Manager SHALL update only the provided fields in the project record
3. WHEN a project update request is received for a non-existent project, THE API SHALL return HTTP 404 with error message "Project not found"
4. WHEN a user attempts to update a project they do not own, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to update this project"
5. WHEN a project is successfully updated, THE API SHALL return HTTP 200 with the updated project object
6. THE System SHALL update projects.updatedAt to the current timestamp when any field is modified

### Requirement 7: Project Deletion API

**User Story:** As a creator, I want to delete a project via API, so that I can remove projects I no longer need.

#### Acceptance Criteria

1. THE API SHALL provide a DELETE endpoint at "/api/projects/[id]" that removes the project record
2. WHEN a valid project deletion request is received, THE Project_Manager SHALL delete the project record from the database
3. WHEN a project is deleted, THE Database SHALL set campaigns.projectId to NULL for all associated campaigns (orphan campaigns)
4. WHEN a project is deleted, THE Database SHALL set blog_posts.projectId to NULL for all associated blog posts (orphan blog posts)
5. WHEN a user attempts to delete a project they do not own, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to delete this project"
6. WHEN a project deletion is successful, THE API SHALL return HTTP 204 with no content
7. WHEN a project deletion request is received for a non-existent project, THE API SHALL return HTTP 404 with error message "Project not found"

### Requirement 8: Campaign Creation with Project Association

**User Story:** As a creator, I want to associate a campaign with a project during creation, so that the campaign is automatically grouped under the project.

#### Acceptance Criteria

1. THE API SHALL accept an optional "projectId" parameter in the POST "/api/campaigns" endpoint
2. WHEN a campaign creation request includes a valid projectId, THE System SHALL set campaigns.projectId to the provided value
3. WHEN a campaign creation request includes an invalid projectId, THE API SHALL return HTTP 400 with error message "Invalid project ID"
4. WHEN a campaign creation request includes a projectId for a project not owned by the authenticated user, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to add campaigns to this project"
5. WHEN a campaign creation request omits projectId, THE System SHALL create a standalone campaign with campaigns.projectId as NULL

### Requirement 9: Campaign Update with Project Association

**User Story:** As a creator, I want to move a campaign to a different project or make it standalone, so that I can reorganize my campaigns.

#### Acceptance Criteria

1. THE API SHALL accept an optional "projectId" parameter in the PATCH "/api/campaigns/[id]" endpoint
2. WHEN a campaign update request includes a valid projectId, THE System SHALL update campaigns.projectId to the provided value
3. WHEN a campaign update request includes projectId as null, THE System SHALL set campaigns.projectId to NULL (make standalone)
4. WHEN a campaign update request includes a projectId for a project not owned by the campaign owner, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to add campaigns to this project"
5. WHEN a campaign is successfully moved to a project, THE API SHALL return HTTP 200 with the updated campaign object

### Requirement 10: Blog Post Project Association

**User Story:** As a creator, I want to associate blog posts with projects, so that project-related content is grouped together.

#### Acceptance Criteria

1. THE API SHALL accept an optional "projectId" parameter in the POST "/api/blog/posts" endpoint for blog creation
2. THE API SHALL accept an optional "projectId" parameter in the PATCH "/api/blog/posts/[id]" endpoint for blog updates
3. WHEN a blog post is associated with a projectId, THE System SHALL validate that the project exists and is owned by the authenticated user
4. WHEN an invalid projectId is provided, THE API SHALL return HTTP 400 with error message "Invalid project ID"
5. WHEN a projectId for a project not owned by the user is provided, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to add blog posts to this project"

### Requirement 11: Project Query Filters

**User Story:** As a developer, I want to filter campaigns and blog posts by project, so that I can display project-specific content.

#### Acceptance Criteria

1. THE API SHALL accept a query parameter "projectId" in the GET "/api/campaigns" endpoint
2. WHEN the projectId query parameter is provided, THE System SHALL return only campaigns where campaigns.projectId matches the provided value
3. THE API SHALL accept a query parameter "projectId" in the GET "/api/blog/posts" endpoint
4. WHEN the projectId query parameter is provided, THE System SHALL return only blog posts where blog_posts.projectId matches the provided value
5. WHEN projectId query parameter is "null" or "standalone", THE System SHALL return only campaigns or blog posts where the projectId field is NULL

### Requirement 12: Authorization and Ownership

**User Story:** As a system administrator, I want to enforce that users can only manage their own projects, so that data security is maintained.

#### Acceptance Criteria

1. WHEN any project management operation is attempted, THE Authorization_Service SHALL verify that the authenticated user's id matches the project's creatorId
2. WHEN a user attempts to read another user's project, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to view this project"
3. WHEN a user attempts to modify another user's project, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to modify this project"
4. WHEN a user attempts to delete another user's project, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to delete this project"
5. THE System SHALL allow admin users to read all projects regardless of ownership
6. THE System SHALL allow admin users to modify or delete any project with appropriate audit logging

### Requirement 13: Data Validation and Constraints

**User Story:** As a system administrator, I want to enforce data quality rules, so that the database maintains integrity.

#### Acceptance Criteria

1. THE System SHALL reject project title values that are empty strings or contain only whitespace characters with HTTP 400 error
2. THE System SHALL trim leading and trailing whitespace from project title and description before storage
3. THE System SHALL validate that projectId references exist in the projects table before allowing campaign or blog post association
4. THE Database SHALL prevent deletion of the users record when associated projects exist (foreign key constraint)
5. WHEN a campaign or blog post is associated with a project, THE System SHALL validate that both the item and project belong to the same creator

### Requirement 14: Error Handling and Resilience

**User Story:** As a developer, I want clear error messages and graceful failure handling, so that I can debug issues quickly.

#### Acceptance Criteria

1. WHEN a database connection error occurs during project operations, THE API SHALL return HTTP 503 with error message "Service temporarily unavailable"
2. WHEN a database constraint violation occurs, THE API SHALL return HTTP 409 with a descriptive error message
3. WHEN an unexpected error occurs, THE API SHALL return HTTP 500 with error message "Internal server error" without exposing sensitive details
4. THE System SHALL log all errors with timestamp, user context, operation attempted, and full error details for debugging
5. WHEN multiple validation errors occur, THE API SHALL return all validation errors in a single response array

### Requirement 15: Performance and Scalability

**User Story:** As a system administrator, I want efficient database queries, so that the system performs well under load.

#### Acceptance Criteria

1. WHEN querying projects with associated campaigns and blog posts, THE System SHALL use database joins instead of N+1 queries
2. THE System SHALL execute project list queries in less than 500 milliseconds for datasets up to 1000 projects per user
3. THE Database SHALL use indexed columns (creatorId, projectId) for all foreign key lookups
4. WHEN counting associated campaigns and blog posts, THE System SHALL use database aggregation functions instead of loading all records
5. THE API SHALL support response caching with appropriate cache headers for project list endpoints

### Requirement 16: Database Migration

**User Story:** As a database administrator, I want a safe migration strategy, so that existing data is preserved during schema changes.

#### Acceptance Criteria

1. THE Migration Script SHALL create the projects table before adding foreign key columns to campaigns and blog_posts
2. THE Migration Script SHALL add projectId columns as nullable to preserve existing campaign and blog post records
3. THE Migration Script SHALL create all indexes after data migration to optimize performance
4. THE Migration Script SHALL be idempotent (can be run multiple times safely without duplicate changes)
5. THE System SHALL provide a rollback migration script that removes projectId columns and the projects table
6. THE Migration Script SHALL complete execution within 60 seconds for databases containing up to 10,000 campaign and blog post records

### Requirement 17: Backward Compatibility

**User Story:** As a product manager, I want existing campaigns and blog posts to work without projects, so that we don't break current functionality.

#### Acceptance Criteria

1. THE System SHALL continue to support campaigns with NULL projectId (standalone campaigns)
2. THE System SHALL continue to support blog posts with NULL projectId (platform blog posts)
3. THE API SHALL return existing campaigns when queried without projectId filter
4. WHEN the projectId field is NULL, THE API responses SHALL omit the projectId field or return it as null
5. THE System SHALL not require project creation before campaign creation (projectId remains optional)

### Requirement 18: Security Considerations

**User Story:** As a security engineer, I want protection against common vulnerabilities, so that user data remains secure.

#### Acceptance Criteria

1. THE API SHALL validate and sanitize all input parameters to prevent SQL injection attacks
2. THE API SHALL use parameterized queries for all database operations involving user input
3. THE System SHALL implement rate limiting of 100 requests per minute per user for project creation endpoints
4. THE API SHALL validate that projectId values match the expected CUID format before database queries
5. THE System SHALL log all project deletion operations with user ID, project ID, and timestamp for audit purposes
6. THE API SHALL not expose internal database errors or stack traces in HTTP responses to clients

### Requirement 19: API Response Format

**User Story:** As a frontend developer, I want consistent API response formats, so that I can parse responses reliably.

#### Acceptance Criteria

1. THE API SHALL return project objects with the structure: { id, creatorId, title, description, createdAt, updatedAt, campaignCount, blogPostCount }
2. WHEN an error occurs, THE API SHALL return responses with the structure: { error: { message, code, details } }
3. THE API SHALL return timestamp fields in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
4. THE API SHALL return pagination metadata with the structure: { data, pagination: { page, limit, total, totalPages } }
5. THE API SHALL use camelCase for all JSON property names in request and response payloads

### Requirement 20: Project Detail Endpoint

**User Story:** As a frontend developer, I want to retrieve a single project with all associated data, so that I can display a project detail page.

#### Acceptance Criteria

1. THE API SHALL provide a GET endpoint at "/api/projects/[id]" that returns a single project by ID
2. WHEN a valid project ID is provided, THE API SHALL return HTTP 200 with the project object including associated campaigns and blog posts arrays
3. WHEN an invalid project ID is provided, THE API SHALL return HTTP 404 with error message "Project not found"
4. THE API SHALL include full campaign objects (not just IDs) in the campaigns array with fields: id, title, slug, status, goalAmount, currentAmount, imageUrl
5. THE API SHALL include full blog post objects (not just IDs) in the blogPosts array with fields: id, title, slug, excerpt, coverImage, publishedAt
6. WHEN a user requests a project they do not own, THE Authorization_Service SHALL return HTTP 403 with error message "Not authorized to view this project"
