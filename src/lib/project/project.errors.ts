// ============================================================
// PROJECT ERROR LOGGING UTILITY
// ============================================================
// Validates: Requirement 14.4
//
// Provides structured error logging with sensitive data sanitization
// for all project management operations.

/**
 * Structured error log format for project operations
 */
export interface ErrorLog {
    /** ISO 8601 timestamp of when the error occurred */
    timestamp: string;

    /** Operation being performed (e.g., 'createProject', 'deleteProject') */
    operation: string;

    /** User ID who initiated the operation, if available */
    userId?: string;

    /** Project ID involved in the operation, if available */
    projectId?: string;

    /** Type/class of the error */
    errorType: string;

    /** Error message */
    errorMessage: string;

    /** Stack trace (only in development mode) */
    errorStack?: string;

    /** Request metadata for debugging */
    requestMetadata: {
        /** HTTP method (GET, POST, PATCH, DELETE) */
        method: string;

        /** Request path */
        path: string;

        /** URL/route parameters (sanitized) */
        params?: any;

        /** Request body (sanitized - no sensitive data) */
        body?: any;
    };
}

/**
 * Context information for error logging
 */
export interface ErrorContext {
    /** Operation identifier */
    operation: string;

    /** User ID if available */
    userId?: string;

    /** Project ID if available */
    projectId?: string;

    /** HTTP method */
    method: string;

    /** Request path */
    path: string;

    /** Request parameters */
    params?: any;

    /** Request body */
    body?: any;
}

/**
 * Sensitive field names that should be removed from logs
 */
const SENSITIVE_FIELDS = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'session',
    'sessionId',
    'accessToken',
    'refreshToken',
    'creditCard',
    'ssn',
    'privateKey',
];

/**
 * Recursively sanitize an object by removing sensitive fields
 * 
 * @param obj - Object to sanitize
 * @returns Sanitized copy of the object
 */
function sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
        // Check if field name matches sensitive patterns (case-insensitive)
        const isSensitive = SENSITIVE_FIELDS.some(
            field => key.toLowerCase().includes(field.toLowerCase())
        );

        if (isSensitive) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Sanitize request body by removing sensitive data
 * 
 * @param body - Request body to sanitize
 * @returns Sanitized copy of the body
 */
function sanitizeBody(body: any): any {
    return sanitizeObject(body);
}

/**
 * Log a structured error with sanitized sensitive data
 * 
 * Logs errors in JSON format with comprehensive debugging information
 * while protecting sensitive data. Stack traces are only included in
 * development mode.
 * 
 * @param error - The error object to log
 * @param context - Additional context about the operation and request
 * 
 * @example
 * ```typescript
 * try {
 *   await createProject(userId, input);
 * } catch (error) {
 *   logError(error as Error, {
 *     operation: 'createProject',
 *     userId: session.user.id,
 *     method: 'POST',
 *     path: '/api/projects',
 *     body: request.body
 *   });
 *   throw error;
 * }
 * ```
 */
export function logError(error: Error, context: ErrorContext): void {
    const log: ErrorLog = {
        timestamp: new Date().toISOString(),
        operation: context.operation,
        userId: context.userId,
        projectId: context.projectId,
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        requestMetadata: {
            method: context.method,
            path: context.path,
            params: context.params ? sanitizeObject(context.params) : undefined,
            body: context.body ? sanitizeBody(context.body) : undefined,
        },
    };

    // Log as structured JSON for easy parsing and monitoring
    console.error('[PROJECT_ERROR]', JSON.stringify(log, null, 2));
}
