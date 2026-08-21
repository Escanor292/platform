/**
 * Unit tests for Project Response Handlers
 * 
 * Tests centralized error response handling utilities
 * Validates: Requirements 14.1, 14.2, 14.3, 14.5, 18.6, 19.2
 */

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
} from '@/lib/project/project.response-handlers';

describe('Project Response Handlers', () => {
    describe('Response builders', () => {
        describe('unauthorizedResponse', () => {
            it('should return 401 status code', async () => {
                const response = unauthorizedResponse();
                expect(response.status).toBe(401);
            });

            it('should return correct structure with default message', async () => {
                const response = unauthorizedResponse();
                const json = await response.json();

                expect(json).toHaveProperty('error');
                expect(json.error).toHaveProperty('message');
                expect(json.error).toHaveProperty('code');
                expect(json.error.message).toBe('Authentication required');
                expect(json.error.code).toBe('UNAUTHORIZED');
            });

            it('should accept custom message', async () => {
                const response = unauthorizedResponse('Custom auth error');
                const json = await response.json();

                expect(json.error.message).toBe('Custom auth error');
            });
        });

        describe('forbiddenResponse', () => {
            it('should return 403 status code', async () => {
                const response = forbiddenResponse('Not authorized');
                expect(response.status).toBe(403);
            });

            it('should return correct structure', async () => {
                const response = forbiddenResponse('Not authorized to update this project');
                const json = await response.json();

                expect(json).toEqual({
                    error: {
                        message: 'Not authorized to update this project',
                        code: 'FORBIDDEN',
                    },
                });
            });
        });

        describe('notFoundResponse', () => {
            it('should return 404 status code', async () => {
                const response = notFoundResponse();
                expect(response.status).toBe(404);
            });

            it('should use default message when not provided', async () => {
                const response = notFoundResponse();
                const json = await response.json();

                expect(json.error.message).toBe('Resource not found');
            });

            it('should use custom message when provided', async () => {
                const response = notFoundResponse('Project not found');
                const json = await response.json();

                expect(json.error.message).toBe('Project not found');
            });
        });

        describe('validationErrorResponse', () => {
            it('should return 400 status code', async () => {
                const response = validationErrorResponse('Title is required');
                expect(response.status).toBe(400);
            });

            it('should handle single error message as string', async () => {
                const response = validationErrorResponse('Title is required');
                const json = await response.json();

                expect(json).toEqual({
                    error: {
                        message: 'Title is required',
                        code: 'VALIDATION_ERROR',
                    },
                });
            });

            it('should handle multiple validation errors (Requirement 14.5)', async () => {
                const errors = [
                    { field: 'title', message: 'Title is required', constraint: 'required' },
                    { field: 'limit', message: 'Limit must not exceed 100', constraint: 'max' },
                ];
                const response = validationErrorResponse(errors);
                const json = await response.json();

                expect(json).toEqual({
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: errors,
                    },
                });
            });
        });

        describe('conflictResponse', () => {
            it('should return 409 status code', async () => {
                const response = conflictResponse('Constraint violation');
                expect(response.status).toBe(409);
            });

            it('should return correct structure', async () => {
                const response = conflictResponse('Cannot delete user with existing projects');
                const json = await response.json();

                expect(json).toEqual({
                    error: {
                        message: 'Cannot delete user with existing projects',
                        code: 'CONSTRAINT_VIOLATION',
                    },
                });
            });
        });

        describe('serviceUnavailableResponse', () => {
            it('should return 503 status code', async () => {
                const response = serviceUnavailableResponse();
                expect(response.status).toBe(503);
            });

            it('should use default message', async () => {
                const response = serviceUnavailableResponse();
                const json = await response.json();

                expect(json).toEqual({
                    error: {
                        message: 'Service temporarily unavailable',
                        code: 'SERVICE_UNAVAILABLE',
                    },
                });
            });
        });

        describe('internalServerErrorResponse', () => {
            it('should return 500 status code', async () => {
                const response = internalServerErrorResponse();
                expect(response.status).toBe(500);
            });

            it('should use generic message without exposing details (Requirement 18.6)', async () => {
                const response = internalServerErrorResponse();
                const json = await response.json();

                expect(json).toEqual({
                    error: {
                        message: 'Internal server error',
                        code: 'INTERNAL_ERROR',
                    },
                });
                expect(json.error).not.toHaveProperty('stack');
                expect(json.error).not.toHaveProperty('details');
            });
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
                fail('Should have thrown validation error');
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const mapped = mapZodErrors(error);

                    expect(mapped).toHaveLength(2);
                    expect(mapped[0]).toMatchObject({
                        field: 'title',
                        message: 'Title is required',
                        constraint: 'too_small',
                    });
                    expect(mapped[1]).toMatchObject({
                        field: 'limit',
                        message: 'Limit must not exceed 100',
                        constraint: 'too_big',
                    });
                }
            }
        });

        it('should handle nested field paths', () => {
            const schema = z.object({
                user: z.object({
                    email: z.string().email('Invalid email format'),
                }),
            });

            try {
                schema.parse({ user: { email: 'not-an-email' } });
                fail('Should have thrown validation error');
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const mapped = mapZodErrors(error);

                    expect(mapped[0].field).toBe('user.email');
                }
            }
        });
    });

    describe('handleServiceError', () => {
        it('should handle Zod validation errors with 400', async () => {
            const schema = z.object({ title: z.string().min(1) });
            try {
                schema.parse({ title: '' });
            } catch (error) {
                const response = handleServiceError(error);
                const json = await response.json();

                expect(response.status).toBe(400);
                expect(json.error.code).toBe('VALIDATION_ERROR');
            }
        });

        it('should handle database connection errors with 503 (Requirement 14.1)', async () => {
            const error = new Error('Connection refused');
            (error as any).code = 'ECONNREFUSED';

            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(503);
            expect(json.error.code).toBe('SERVICE_UNAVAILABLE');
        });

        it('should handle Prisma timeout errors with 503', async () => {
            const error = new Error('Timed out');
            (error as any).code = 'P1001';

            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(503);
            expect(json.error.code).toBe('SERVICE_UNAVAILABLE');
        });

        it('should handle Prisma constraint violations with 409 (Requirement 14.2)', async () => {
            const error = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed',
                {
                    code: 'P2002',
                    clientVersion: '5.0.0',
                }
            );

            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(409);
            expect(json.error.code).toBe('CONSTRAINT_VIOLATION');
            expect(json.error.message).toBe('A record with this value already exists');
        });

        it('should sanitize Prisma error codes (Requirement 18.6)', async () => {
            const error = new Prisma.PrismaClientKnownRequestError(
                'Foreign key constraint failed',
                {
                    code: 'P2003',
                    clientVersion: '5.0.0',
                }
            );

            const response = handleServiceError(error);
            const json = await response.json();

            expect(json.error.message).not.toContain('P2003');
            expect(json.error.message).toBe('Invalid reference to related record');
        });

        it('should handle "not found" errors with 404', async () => {
            const error = new Error('Project not found');
            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(404);
            expect(json.error.code).toBe('NOT_FOUND');
            expect(json.error.message).toBe('Project not found');
        });

        it('should handle "not authorized" errors with 403', async () => {
            const error = new Error('Not authorized to update this project');
            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(403);
            expect(json.error.code).toBe('FORBIDDEN');
        });

        it('should handle "authentication required" errors with 401', async () => {
            const error = new Error('Authentication required');
            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(401);
            expect(json.error.code).toBe('UNAUTHORIZED');
        });

        it('should handle "invalid" errors with 400', async () => {
            const error = new Error('Invalid project ID');
            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error.code).toBe('VALIDATION_ERROR');
        });

        it('should not expose internal errors (Requirements 14.3, 18.6)', async () => {
            const error = new Error('Database SELECT query failed with internal details');
            const response = handleServiceError(error);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error.code).toBe('INTERNAL_ERROR');
            expect(json.error.message).toBe('Internal server error');
            expect(json.error.message).not.toContain('SELECT');
            expect(json.error.message).not.toContain('Database');
        });

        it('should never expose stack traces to clients', async () => {
            const error = new Error('Something went wrong');
            error.stack = 'Error: Something went wrong\n at func (/path/to/file.js:10:5)';

            const response = handleServiceError(error);
            const json = await response.json();

            expect(json.error).not.toHaveProperty('stack');
            expect(JSON.stringify(json)).not.toContain('at func');
        });
    });

    describe('checkAuthentication', () => {
        it('should return null for valid session with user id', () => {
            const session = { user: { id: 'user123', role: 'CREATOR' } };
            const result = checkAuthentication(session);

            expect(result).toBeNull();
        });

        it('should return 401 for null session', async () => {
            const result = checkAuthentication(null);

            expect(result).not.toBeNull();
            expect(result!.status).toBe(401);
            const json = await result!.json();
            expect(json.error.code).toBe('UNAUTHORIZED');
        });

        it('should return 401 for session without user', async () => {
            const session = { user: null };
            const result = checkAuthentication(session);

            expect(result).not.toBeNull();
            expect(result!.status).toBe(401);
        });

        it('should return 401 for session without user id', async () => {
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

        it('should return 403 for USER role', async () => {
            const session = { user: { id: 'user123', role: 'USER' } };
            const result = checkCreatorRole(session);

            expect(result).not.toBeNull();
            expect(result!.status).toBe(403);
            const json = await result!.json();
            expect(json.error.message).toBe('Creator role required');
        });

        it('should return 403 for missing role', async () => {
            const session = { user: { id: 'user123' } };
            const result = checkCreatorRole(session);

            expect(result).not.toBeNull();
            expect(result!.status).toBe(403);
        });
    });

    describe('Error response structure (Requirement 19.2)', () => {
        it('should always follow ErrorResponse structure with nested error object', async () => {
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
                const json = await response.json();

                // Verify nested error object structure
                expect(json).toHaveProperty('error');
                expect(json.error).toHaveProperty('message');
                expect(json.error).toHaveProperty('code');
                expect(typeof json.error.message).toBe('string');
                expect(typeof json.error.code).toBe('string');
            }
        });

        it('should support optional details field for validation errors', async () => {
            const errors = [
                { field: 'title', message: 'Required', constraint: 'required' },
            ];
            const response = validationErrorResponse(errors);
            const json = await response.json();

            expect(json.error).toHaveProperty('details');
            expect(json.error.details).toEqual(errors);
        });
    });

    describe('Security - Never expose sensitive data (Requirement 18.6)', () => {
        it('should not expose database connection strings', async () => {
            const error = new Error('Connection failed to postgres://user:password@localhost:5432/db');
            const response = handleServiceError(error);
            const json = await response.json();

            expect(JSON.stringify(json)).not.toContain('postgres://');
            expect(JSON.stringify(json)).not.toContain('password');
            expect(json.error.message).toBe('Service temporarily unavailable');
        });

        it('should not expose stack traces', async () => {
            const error = new Error('Test error');
            error.stack = 'Error: Test error\n    at Object.<anonymous> (/path/to/file.ts:10:15)';

            const response = handleServiceError(error);
            const json = await response.json();

            expect(JSON.stringify(json)).not.toContain(error.stack!);
            expect(JSON.stringify(json)).not.toContain('/path/to/');
        });

        it('should not expose Prisma internals', async () => {
            const error = new Prisma.PrismaClientKnownRequestError(
                'Invalid `prisma.projects.create()` with internal connection details...',
                {
                    code: 'P2002',
                    clientVersion: '5.0.0',
                }
            );

            const response = handleServiceError(error);
            const json = await response.json();

            expect(json.error.message).not.toContain('prisma');
            expect(json.error.message).not.toContain('P2002');
            expect(json.error.message).not.toContain('connection');
        });
    });
});
