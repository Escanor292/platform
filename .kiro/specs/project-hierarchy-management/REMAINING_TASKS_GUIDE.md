# Project Hierarchy Management - Remaining Tasks Implementation Guide

## Progress: 64% Complete (18/28 required tasks done)

## ✅ Completed Tasks Summary

### Phase 1-5 (18 tasks completed):
- ✅ Database schema and migrations (Tasks 1.1-1.3, Task 1)
- ✅ TypeScript types and Zod validation (Tasks 2.1-2.2, Task 2)
- ✅ Service layer CRUD operations (Tasks 3.1-3.3, Task 3)
- ✅ Service layer checkpoint (Task 4)
- ✅ All 5 project API endpoints (Tasks 5.1-5.5)
- ✅ Structured error logging (Task 6.1)

## 🔄 Remaining Tasks (10 required tasks)

---

### **TASK 6.2: Implement error response handlers**
**Priority:** HIGH
**Estimated Time:** 30 minutes

#### What to implement:
Create `src/lib/project/project.responses.ts` with:

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Error response structure
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Array<{
      field: string;
      message: string;
      constraint: string;
    }>;
  };
}

// Error codes enum
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Create standardized error responses
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  details?: any[]
): NextResponse {
  const response: ErrorResponse = {
    error: {
      message,
      code,
      ...(details && { details }),
    },
  };
  return NextResponse.json(response, { status });
}

// Helper functions for common errors
export const ErrorResponses = {
  unauthorized: (message = 'Authentication required') =>
    createErrorResponse(message, ErrorCode.UNAUTHORIZED, 401),

  forbidden: (message = 'Access forbidden') =>
    createErrorResponse(message, ErrorCode.FORBIDDEN, 403),

  notFound: (message = 'Resource not found') =>
    createErrorResponse(message, ErrorCode.NOT_FOUND, 404),

  validation: (errors: z.ZodError) =>
    createErrorResponse(
      'Validation failed',
      ErrorCode.VALIDATION_ERROR,
      400,
      errors.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        constraint: e.code,
      }))
    ),

  conflict: (message = 'Resource conflict') =>
    createErrorResponse(message, ErrorCode.CONFLICT, 409),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    createErrorResponse(message, ErrorCode.SERVICE_UNAVAILABLE, 503),

  internal: (message = 'Internal server error') =>
    createErrorResponse(message, ErrorCode.INTERNAL_ERROR, 500),
};
```

#### Testing:
Create `__tests__/unit/project-responses.test.ts`

#### Integration:
Update all API endpoints to use `ErrorResponses` instead of inline error creation.

**Requirements validated:** 14.1, 14.2, 14.3, 14.5, 18.6, 19.2

---

### **TASK 7: Checkpoint - Verify API layer and error handling**
**Priority:** HIGH
**Estimated Time:** 15 minutes

#### What to verify:
1. Run all project API tests
2. Verify error responses follow consistent structure
3. Check that no stack traces are exposed
4. Confirm all endpoints use error logging

**Command:** `npm test -- projects`

---

### **TASK 8.1: Add projectId to campaign creation endpoint**
**Priority:** HIGH
**Estimated Time:** 45 minutes

#### What to implement:
1. Update `src/app/api/campaigns/route.ts` POST handler:
   - Add optional `projectId` field to request body schema
   - Validate projectId format if provided
   - Check project exists and user owns it
   - Set `campaigns.projectId` on creation

```typescript
// In POST handler
if (body.projectId) {
  // Validate format
  const validatedProjectId = projectIdSchema.parse(body.projectId);
  
  // Verify project exists and user owns it
  const project = await prisma.projects.findUnique({
    where: { id: validatedProjectId },
    select: { creatorId: true },
  });
  
  if (!project) {
    return ErrorResponses.notFound('Project not found');
  }
  
  if (project.creatorId !== session.user.id) {
    return ErrorResponses.forbidden('Not authorized to add to this project');
  }
  
  // Add to campaign data
  campaignData.projectId = validatedProjectId;
}
```

**Requirements:** 8.1, 8.2, 8.3, 8.4, 8.5

---

### **TASK 8.2: Add projectId to campaign update endpoint**
**Priority:** HIGH
**Estimated Time:** 30 minutes

#### What to implement:
Update `src/app/api/campaigns/[id]/route.ts` PATCH handler to accept `projectId`:
- Allow setting to null (standalone campaign)
- Validate ownership if new projectId provided

**Requirements:** 9.1, 9.2, 9.3, 9.4, 9.5

---

### **TASK 8.3: Add projectId filter to campaign query endpoint**
**Priority:** MEDIUM
**Estimated Time:** 30 minutes

#### What to implement:
Update `src/app/api/campaigns/route.ts` GET handler:
- Accept `projectId` query parameter
- Filter campaigns by projectId
- Support "null" or "standalone" for NULL projectId

```typescript
const projectIdFilter = searchParams.get('projectId');

if (projectIdFilter) {
  if (projectIdFilter === 'null' || projectIdFilter === 'standalone') {
    where.projectId = null;
  } else {
    where.projectId = projectIdFilter;
  }
}
```

**Requirements:** 11.1, 11.2, 11.5

---

### **TASK 9.1: Add projectId to blog post creation endpoint**
**Priority:** HIGH
**Estimated Time:** 45 minutes

#### What to implement:
Update `src/app/api/blog/posts/route.ts` POST handler - same pattern as Task 8.1

**Requirements:** 10.1, 10.3, 10.4, 10.5

---

### **TASK 9.2: Add projectId to blog post update endpoint**
**Priority:** HIGH
**Estimated Time:** 30 minutes

#### What to implement:
Update blog post PATCH handler - same pattern as Task 8.2

**Requirements:** 10.2, 10.3, 10.4, 10.5

---

### **TASK 9.3: Add projectId filter to blog post query endpoint**
**Priority:** MEDIUM
**Estimated Time:** 30 minutes

#### What to implement:
Update blog post GET handler - same pattern as Task 8.3

**Requirements:** 11.3, 11.4, 11.5

---

### **TASK 11: Checkpoint - Verify association endpoints**
**Priority:** MEDIUM
**Estimated Time:** 20 minutes

#### What to verify:
1. Test creating campaigns with projectId
2. Test creating blog posts with projectId
3. Test filtering by projectId
4. Test orphaning behavior (delete project, verify campaigns/blogs still exist with NULL projectId)

---

### **TASK 14.1: Add rate limiting**
**Priority:** LOW
**Estimated Time:** 45 minutes

#### What to implement:
Simple in-memory rate limiter for POST /api/projects:

```typescript
// src/lib/project/rate-limiter.ts
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}
```

**Requirements:** 18.3

---

### **TASK 15.2: Add response caching headers**
**Priority:** LOW
**Estimated Time:** 15 minutes

#### What to implement:
Add Cache-Control headers to GET endpoints:

```typescript
return NextResponse.json(response, {
  status: 200,
  headers: {
    'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
  },
});
```

**Requirements:** 15.5

---

### **TASK 17.2: Run full test suite**
**Priority:** HIGH
**Estimated Time:** 10 minutes

#### Commands:
```bash
npm test -- projects
npm test -- campaigns
npm test -- blog
```

Verify all tests pass.

---

### **TASK 18: Final checkpoint**
**Priority:** HIGH
**Estimated Time:** 15 minutes

#### Final verification:
1. All required tasks completed
2. All tests passing
3. No TypeScript errors
4. Build succeeds
5. API endpoints functional

---

## Quick Start Commands

When usage limit resets, run:

```bash
# Continue autopilot
tiếp tục autopilot
```

The orchestrator will automatically execute remaining tasks in order.

---

## Manual Execution Order (if needed)

If you need to execute manually:

1. Task 6.2 (Error handlers)
2. Task 7 (Checkpoint)
3. Task 8.1 (Campaign creation with projectId)
4. Task 8.2 (Campaign update with projectId)  
5. Task 8.3 (Campaign filter by projectId)
6. Task 9.1 (Blog creation with projectId)
7. Task 9.2 (Blog update with projectId)
8. Task 9.3 (Blog filter by projectId)
9. Task 11 (Association checkpoint)
10. Task 14.1 (Rate limiting)
11. Task 15.2 (Caching headers)
12. Task 17.2 (Full test suite)
13. Task 18 (Final checkpoint)

---

## Current Implementation Status

### Files Created:
- ✅ `prisma/migrations/20260809151306_add_projects_table/migration.sql`
- ✅ `prisma/migrations/rollback_add_projects_table.sql`
- ✅ `src/types/project.types.ts`
- ✅ `src/lib/project/project.validation.ts`
- ✅ `src/lib/project/project.service.ts`
- ✅ `src/lib/project/project.errors.ts`
- ✅ `src/app/api/projects/route.ts` (POST, GET)
- ✅ `src/app/api/projects/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `__tests__/unit/project-types.test.ts` (15 tests)
- ✅ `__tests__/unit/project-validation.test.ts` (26 tests)
- ✅ `__tests__/unit/project-service.test.ts` (26 tests)
- ✅ `__tests__/unit/project.errors.test.ts` (8 tests)
- ✅ `__tests__/api/projects/delete.test.ts` (4 tests)

### Test Results:
- **Total tests passing:** 79/79 ✅
- **Code coverage:** Service layer, types, validation fully covered

### API Endpoints Ready:
- ✅ POST /api/projects
- ✅ GET /api/projects
- ✅ GET /api/projects/[id]
- ✅ PATCH /api/projects/[id]
- ✅ DELETE /api/projects/[id]

---

## Notes

- All optional test tasks (marked with `*`) are skipped for MVP
- Focus on required functionality first
- Database CASCADE behavior already configured in Prisma schema
- Authentication and authorization patterns established in existing endpoints
