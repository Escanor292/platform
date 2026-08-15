// ============================================================
// PROJECT ERROR LOGGING UTILITY - TESTS
// ============================================================
// Validates: Requirement 14.4

import { logError, ErrorContext } from './project.errors';

describe('project.errors', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Mock console.error to capture log output
        consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('logError', () => {
        it('should log error with structured JSON format', () => {
            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'createProject',
                userId: 'user123',
                projectId: 'proj456',
                method: 'POST',
                path: '/api/projects',
                body: { title: 'Test Project' },
            };

            logError(error, context);

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(
                '[PROJECT_ERROR]',
                expect.any(String)
            );

            // Parse the logged JSON
            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);

            expect(loggedJson).toMatchObject({
                operation: 'createProject',
                userId: 'user123',
                projectId: 'proj456',
                errorType: 'Error',
                errorMessage: 'Test error',
                requestMetadata: {
                    method: 'POST',
                    path: '/api/projects',
                    body: { title: 'Test Project' },
                },
            });

            expect(loggedJson.timestamp).toBeDefined();
            expect(typeof loggedJson.timestamp).toBe('string');
        });

        it('should sanitize sensitive data from request body', () => {
            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'createProject',
                userId: 'user123',
                method: 'POST',
                path: '/api/projects',
                body: {
                    title: 'Test Project',
                    password: 'secret123',
                    apiKey: 'key456',
                    token: 'token789',
                },
            };

            logError(error, context);

            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);

            expect(loggedJson.requestMetadata.body).toEqual({
                title: 'Test Project',
                password: '[REDACTED]',
                apiKey: '[REDACTED]',
                token: '[REDACTED]',
            });
        });

        it('should sanitize nested sensitive data', () => {
            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'createProject',
                method: 'POST',
                path: '/api/projects',
                body: {
                    user: {
                        name: 'John',
                        password: 'secret123',
                        settings: {
                            theme: 'dark',
                            apiKey: 'key456',
                        },
                    },
                },
            };

            logError(error, context);

            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);

            expect(loggedJson.requestMetadata.body).toEqual({
                user: {
                    name: 'John',
                    password: '[REDACTED]',
                    settings: {
                        theme: 'dark',
                        apiKey: '[REDACTED]',
                    },
                },
            });
        });

        it('should include error stack in development mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'createProject',
                method: 'POST',
                path: '/api/projects',
            };

            logError(error, context);

            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);
            expect(loggedJson.errorStack).toBeDefined();

            process.env.NODE_ENV = originalEnv;
        });

        it('should not include error stack in production mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'createProject',
                method: 'POST',
                path: '/api/projects',
            };

            logError(error, context);

            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);
            expect(loggedJson.errorStack).toBeUndefined();

            process.env.NODE_ENV = originalEnv;
        });

        it('should handle missing optional context fields', () => {
            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'listProjects',
                method: 'GET',
                path: '/api/projects',
            };

            logError(error, context);

            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);

            expect(loggedJson.userId).toBeUndefined();
            expect(loggedJson.projectId).toBeUndefined();
            expect(loggedJson.requestMetadata.params).toBeUndefined();
            expect(loggedJson.requestMetadata.body).toBeUndefined();
        });

        it('should sanitize sensitive data in params', () => {
            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'getProject',
                method: 'GET',
                path: '/api/projects/123',
                params: {
                    id: '123',
                    token: 'secret-token',
                },
            };

            logError(error, context);

            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);

            expect(loggedJson.requestMetadata.params).toEqual({
                id: '123',
                token: '[REDACTED]',
            });
        });

        it('should handle array values in body', () => {
            const error = new Error('Test error');
            const context: ErrorContext = {
                operation: 'createProject',
                method: 'POST',
                path: '/api/projects',
                body: {
                    title: 'Test',
                    tags: ['tag1', 'tag2'],
                    secrets: ['secret1', 'secret2'],
                },
            };

            logError(error, context);

            const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);

            expect(loggedJson.requestMetadata.body).toEqual({
                title: 'Test',
                tags: ['tag1', 'tag2'],
                secrets: '[REDACTED]',
            });
        });
    });
});
