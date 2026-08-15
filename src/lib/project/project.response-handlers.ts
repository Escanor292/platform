// ============================================================
// PROJECT ERROR RESPONSE HANDLERS
// ============================================================
// Validates: Requirements 14.1, 14.2, 14.3, 14.5, 18.6, 19.2
//
// Centralized error response handling for project API endpoints.
// Converts service layer errors to consistent HTTP responses.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Error response structure following Requirement 19.2
 */
export interface ErrorResponse {
    error: {
        message: string;
        code: string;
        details?: any;
    };
}

/**
 * Validation error detail structure
 */
interface ValidationErrorDetail {
    field: string;
    message: string;
    constraint: string;
}

// ============================================================
// Error Type Checkers
// ============================================================

/**
 * Check if error is a database connection error
 */
function isDatabaseConnectionError(error: any): boolean {
    return (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'P1001' || // Prisma: Can't reach database
        error.code === 'P1002' || // Prisma: Database timeout
        error.message?.toLowerCase().includes('connection') ||
        error.message?.toLowerCase().includes('timeout')
    );
}

/**
 * Check if error is a Prisma constraint violation
 */
function isConstraintViolation(error: any): boolean {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || // Unique constraint violation
            error.code === 'P2003' || // Foreign key constraint violation
            error.code === 'P2014' || // Relation violation
            error.code === 'P2025') // Record not found
    );
}

// ============================================================
// Response Builders
// ============================================================

/**
 * Create a 401 Unauthorized response
 * Validates: Requirement 14.1
 */
export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse {
    const response: ErrorResponse = {
        error: {
            message,
            code: 'UNAUTHORIZED',
        },
    };
    return NextResponse.json(response, { status: 401 });
}

/**
 * Create a 403 Forbidden response
 * Validates: Requirement 14.1
 */
export function forbiddenResponse(message: string): NextResponse {
    const response: ErrorResponse = {
        error: {
            message,
            code: 'FORBIDDEN',
        },
    };
    return NextResponse.json(response, { status: 403 });
}

/**
 * Create a 404 Not Found response
 * Validates: Requirement 14.1
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
    const response: ErrorResponse = {
        error: {
            message,
            code: 'NOT_FOUND',
        },
    };
    return NextResponse.json(response, { status: 404 });
}

/**
 * Create a 400 Bad Request response for validation errors
 * Validates: Requirements 14.1, 14.5
 * 
 * Supports both single and multiple validation errors
 */
export function validationErrorResponse(
    errors: ValidationErrorDetail[] | string
): NextResponse {
    if (typeof errors === 'string') {
        // Single error message
        const response: ErrorResponse = {
            error: {
                message: errors,
                code: 'VALIDATION_ERROR',
            },
        };
        return NextResponse.json(response, { status: 400 });
    }

    // Multiple validation errors
    const response: ErrorResponse = {
        error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
        },
    };
    return NextResponse.json(response, { status: 400 });
}

/**
 * Create a 409 Conflict response for constraint violations
 * Validates: Requirement 14.2
 */
export function conflictResponse(message: string): NextResponse {
    const response: ErrorResponse = {
        error: {
            message,
            code: 'CONSTRAINT_VIOLATION',
        },
    };
    return NextResponse.json(response, { status: 409 });
}

/**
 * Create a 503 Service Unavailable response
 * Validates: Requirement 14.1
 */
export function serviceUnavailableResponse(
    message: string = 'Service temporarily unavailable'
): NextResponse {
    const response: ErrorResponse = {
        error: {
            message,
            code: 'SERVICE_UNAVAILABLE',
        },
    };
    return NextResponse.json(response, { status: 503 });
}

/**
 * Create a 500 Internal Server Error response
 * Validates: Requirements 14.3, 18.6
 * 
 * Never exposes internal database errors or stack traces
 */
export function internalServerErrorResponse(
    message: string = 'Internal server error'
): NextResponse {
    const response: ErrorResponse = {
        error: {
            message,
            code: 'INTERNAL_ERROR',
        },
    };
    return NextResponse.json(response, { status: 500 });
}

// ============================================================
// Error Mappers
// ============================================================

/**
 * Convert Zod validation errors to ValidationErrorDetail array
 * Validates: Requirement 14.5
 */
export function mapZodErrors(zodError: z.ZodError): ValidationErrorDetail[] {
    return zodError.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        constraint: e.code,
    }));
}

/**
 * Get user-friendly message for Prisma constraint violations
 * Validates: Requirements 14.2, 18.6
 * 
 * Sanitizes database errors to prevent exposure of internal details
 */
function getPrismaConstraintMessage(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
        case 'P2002':
            return 'A record with this value already exists';
        case 'P2003':
            return 'Invalid reference to related record';
        case 'P2014':
            return 'The change would violate a required relation';
        case 'P2025':
            return 'Record not found';
        default:
            return 'Database constraint violation';
    }
}

// ============================================================
// Main Error Handler
// ============================================================

/**
 * Main error handler that maps service errors to HTTP responses
 * Validates: Requirements 14.1, 14.2, 14.3, 14.5, 18.6, 19.2
 * 
 * @param error - The error thrown from service layer
 * @returns NextResponse with appropriate status code and error structure
 * 
 * @example
 * ```typescript
 * try {
 *   await createProject(userId, input);
 * } catch (error) {
 *   return handleServiceError(error);
 * }
 * ```
 */
export function handleServiceError(error: unknown): NextResponse {
    // Handle Zod validation errors (400)
    if (error instanceof z.ZodError) {
        return validationErrorResponse(mapZodErrors(error));
    }

    // Handle database connection errors (503)
    if (isDatabaseConnectionError(error)) {
        return serviceUnavailableResponse();
    }

    // Handle Prisma constraint violations (409)
    if (isConstraintViolation(error)) {
        const message = getPrismaConstraintMessage(error as Prisma.PrismaClientKnownRequestError);
        return conflictResponse(message);
    }

    // Handle known service errors with specific messages
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Not Found errors (404)
        if (message.includes('not found')) {
            return notFoundResponse(error.message);
        }

        // Authorization errors (403)
        if (message.includes('not authorized')) {
            return forbiddenResponse(error.message);
        }

        // Authentication errors (401)
        if (message.includes('authentication required')) {
            return unauthorizedResponse(error.message);
        }

        // Validation errors (400)
        if (message.includes('invalid') || message.includes('required')) {
            return validationErrorResponse(error.message);
        }
    }

    // Unknown errors - return 500 without exposing details (Requirement 18.6)
    return internalServerErrorResponse();
}

// ============================================================
// Specialized Error Handlers
// ============================================================

/**
 * Handle authentication check and return 401 if not authenticated
 * 
 * @param session - NextAuth session object
 * @returns NextResponse if not authenticated, null if authenticated
 * 
 * @example
 * ```typescript
 * const session = await auth();
 * const authError = checkAuthentication(session);
 * if (authError) return authError;
 * ```
 */
export function checkAuthentication(session: any): NextResponse | null {
    if (!session?.user?.id) {
        return unauthorizedResponse();
    }
    return null;
}

/**
 * Handle creator role check and return 403 if not a creator
 * 
 * @param session - NextAuth session object
 * @returns NextResponse if not a creator, null if authorized
 * 
 * @example
 * ```typescript
 * const roleError = checkCreatorRole(session);
 * if (roleError) return roleError;
 * ```
 */
export function checkCreatorRole(session: any): NextResponse | null {
    const userRole = session.user?.role;
    if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
        return forbiddenResponse('Creator role required');
    }
    return null;
}
