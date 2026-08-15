// ============================================================
// PROJECT ERROR RESPONSE HANDLERS - UNIT TESTS
// ============================================================
// Tests for centralized error response handling
// Validates: Requirements 14.1, 14.2, 14.3, 14.5, 18.6, 19.2

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    validationErrorResponse,
    conflictResponse,
    serviceUnavailableResponse,
    internalServerErrorResponse,
    mapZodErrors,
    handleServiceError,
    checkAuthentication,
    checkCreatorRole,
} from '../project.response-handlers';

describe('Error Response Handlers', () => {
    describe('unauthorizedResponse', () => {
        it('should return 401 with correct structure', async () => {
            const response = unauthorizedResponse();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                error: {
                    message: 'Authentication required',
                    code: 'UNAUTHORIZED',
                },
            });
        });

        it('should accept custom message', async () => {
            const response = unauthorizedResponse('Custom auth message');
            const data = await response.json();

            expect(data.error.message).toBe('Custom auth message');
        });
    });

    describe('forbiddenResponse', () => {
        it('should return 403 with correct structure', async () => {
            const response = forbiddenResponse('Not authorized');
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data).toEqual({
                error: {
                    message: 'Not authorized',
                    code: 'FORBIDDEN',
                },
            });
        });
    });

    describe('notFoundResponse', () => {
        it('should return 404 with correct structure', async () => {
            const response = notFoundResponse('Project not found');
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({
                error: {
                    message: 'Project not found',
                    code: 'NOT_FOUND',
                },
            });
        });

        it('should use default message', async () => {
            const response = notFoundResponse();
            const data = await response.json();

            expect(data.error.message).toBe('Resource not found');
        });
    });

    describe('validationErrorResponse', () => {
        it('should handle single error message', async () => {
            const response = validationErrorResponse('Title is required');
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: {
                    message: 'Title is required',
                    code: 'VALIDATION_ERROR',
                },
            });
        });

        it('should handle multiple validation errors', async () => {
            const errors = [
                { field: 'title', message: 'Title is required', constraint: 'required' },
                { field: 'limit', message: 'Limit must not exceed 100', constraint: 'max' },
            ];
            const response = validationErrorResponse(errors);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: errors,
                },
            });
        });
    });

    describe('conflictResponse', () => {
        it('should return 409 with correct structure', async () => {
            const response = conflictResponse('Database constraint violation');
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data).toEqual({
                error: {
                    message: 'Database constraint violation',
                    code: 'CONSTRAINT_VIOLATION',
                },
            });
        });
    });

    describe('serviceUnavailableResponse', () => {
        it('should return 503 with correct structure', async () => {
            const response = serviceUnavailableResponse();
            const data = await response.json();

            expect(response.status).toBe(503);
            expect(data).toEqual({
                error: {
                    message: 'Service temporarily unavailable',
                    code: 'SERVICE_UNAVAILABLE',
                },
            });
        });
    });

    describe('internalServerErrorResponse', () => {
        it('should return 500 with correct structure', async () => {
            const response = internalServerErrorResponse();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                error: {
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR',
                },
            });
        });

        it('should never expose sensitive details', async () => {
            const response = internalServerErrorResponse();
            const data = await response.json();

            // Verify no stack traces or internal details are exposed
            expect(data.error.details).toBeUndefined();
            expect(JSON.stringify(data)).not.toContain('stack');
            expect(JSON.stringify(data)).not.toContain('database');
        });
    });

    describe('mapZodErrors', () => {
        it('should convert Zod errors to ValidationErrorDetail array', () => {
            const schema = z.object({
                title: z.string().min(1, 'Title is required'),
                limit: z.number().max(100, 'Limit must not exceed 100'),
            });

            try {
                schema.parse({ title: '', limit: 150 });
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const mapped = mapZodErrors(error);

                    expect(mapped).toHaveLength(2);
                    expect(mapped[0]).toEqual({
                        field: 'title',
                        message: 'Title is required',
                        constraint: 'too_small',
                    });
                    expect(mapped[1]).toEqual({
                        field: 'limit',
                        message: 'Limit must not exceed 100',
                        constraint: 'too_big',
                    });
                }
            }
        });
    });

    describe('handleServiceError', () => {
        it('should handle Zod validation errors', async () => {
            const schema = z.object({ title: z.string().min(1) });
            try {
                schema.parse({ title: '' });
            } catch (error) {
                const response = handleServiceError(error);
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.error.code).toBe('VALIDATION_ERROR');
            }
        });

        it('should handle not found errors', async () => {
            const error = new Error('Project not found');
            const response = handleServiceError(error);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error.code).toBe('NOT_FOUND');
            expect(data.error.message).toBe('Project not found');
        });

        it('should handle authorization errors', async () => {
            const error = new Error('Not authorized to access this project');
            const response = handleServiceError(error);
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.error.code).toBe('FORBIDDEN');
        });

        it('should handle authentication errors', async () => {
            const error = new Error('Authentication required');
            const response = handleServiceError(error);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error.code).toBe('UNAUTHORIZED');
        });

        it('should handle database connection errors', async () => {
            const error = { code: 'ECONNREFUSED', message: 'Connection refused' };
            const response = handleServiceError(error);
            const data = await response.json();

            expect(response.status).toBe(503);
            expect(data.error.code).toBe('SERVICE_UNAVAILABLE');
        });

        it('should handle Prisma timeout errors', async () => {
            const error = { code: 'P1001', message: 'Can\'t reach database' };
            const response = handleServiceError(error);
            const data = await response.json();

            expect(response.status).toBe(503);
            expect(data.error.code).toBe('SERVICE_UNAVAILABLE');
        });

        it('should handle Prisma constraint violations', async () => {
            const error = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed',
                {
                    code: 'P2002',
                    clientVersion: '5.0.0',
                }
            );
            const response = handleServiceError(error);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.error.code).toBe('CONSTRAINT_VIOLATION');
            expect(data.error.message).not.toContain('P2002'); // Should not expose Prisma codes
        });

        it('should return 500 for unknown errors without exposing details', async () => {
            const error = new Error('Some internal database error with sensitive info');
            const response = handleServiceError(error);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error.code).toBe('INTERNAL_ERROR');
            expect(data.error.message).toBe('Internal server error');
            expect(data.error.message).not.toContain('database');
            expect(data.error.message).not.toContain('sensitive');
        });
    });

    describe('checkAuthentication', () => {
        it('should return null for authenticated session', () => {
            const session = { user: { id: 'user123' } };
            const result = checkAuthentication(session);

            expect(result).toBeNull();
        });

        it('should return 401 response for null session', async () => {
            const result = checkAuthentication(null);

            expect(result).not.toBeNull();
            const data = await result!.json();
            expect(result!.status).toBe(401);
            expect(data.error.code).toBe('UNAUTHORIZED');
        });

        it('should return 401 response for session without user', async () => {
            const session = { user: null };
            const result = checkAuthentication(session);

            expect(result).not.toBeNull();
            expect(result!.status).toBe(401);
        });

        it('should return 401 response for session without user.id', async () => {
            const session = { user: {} };
            const result = checkAuthentication(session);

            expect(result).not.toBeNull();
            expect(result!.status).toBe(401);
        });
    });

    describe('checkCreatorRole', () => {
        it('should return null for CREATOR role', () => {
            const session = { user: { id: 'user123', role: 'CREATOR' } };
            const result = checkCreatorRole(session);

            expect(result).toBeNull();
        });

        it('should return null for ADMIN role', () => {
            const session = { user: { id: 'admin123', role: 'ADMIN' } };
            const result = checkCreatorRole(session);

            expect(result).toBeNull();
        });

        it('should return 403 response for USER role', async () => {
            const session = { user: { id: 'user123', role: 'USER' } };
            const result = checkCreatorRole(session);

            expect(result).not.toBeNull();
            const data = await result!.json();
            expect(result!.status).toBe(403);
            expect(data.error.message).toBe('Creator role required');
        });

        it('should return 403 response for missing role', async () => {
            const session = { user: { id: 'user123' } };
            const result = checkCreatorRole(session);

            expect(result).not.toBeNull();
            expect(result!.status).toBe(403);
        });
    });

    describe('Error response structure compliance (Requirement 19.2)', () => {
        it('should always follow ErrorResponse structure', async () => {
            const responses = [
                unauthorizedResponse(),
                forbiddenResponse('test'),
                notFoundResponse(),
                validationErrorResponse('test'),
                conflictResponse('test'),
                serviceUnavailableResponse(),
                internalServerErrorResponse(),
            ];

            for (const response of responses) {
                const data = await response.json();

                // Verify nested error object structure
                expect(data).toHaveProperty('error');
                expect(data.error).toHaveProperty('message');
                expect(data.error).toHaveProperty('code');
                expect(typeof data.error.message).toBe('string');
                expect(typeof data.error.code).toBe('string');
            }
        });
    });

    describe('Security - No sensitive data exposure (Requirement 18.6)', () => {
        it('should not expose database connection strings', async () => {
            const error = new Error('Connection failed to postgres://user:password@localhost:5432/db');
            const response = handleServiceError(error);
            const data = await response.json();

            expect(JSON.stringify(data)).not.toContain('postgres://');
            expect(JSON.stringify(data)).not.toContain('password');
        });

        it('should not expose stack traces', async () => {
            const error = new Error('Test error');
            error.stack = 'Error: Test error\n    at Object.<anonymous> (/path/to/file.ts:10:15)';

            const response = handleServiceError(error);
            const data = await response.json();

            expect(JSON.stringify(data)).not.toContain(error.stack);
            expect(JSON.stringify(data)).not.toContain('/path/to/');
        });

        it('should not expose Prisma error codes in user messages', async () => {
            const error = new Prisma.PrismaClientKnownRequestError(
                'Foreign key constraint failed',
                {
                    code: 'P2003',
                    clientVersion: '5.0.0',
                }
            );
            const response = handleServiceError(error);
            const data = await response.json();

            expect(data.error.message).not.toContain('P2003');
            expect(data.error.message).not.toContain('Prisma');
        });
    });
});
