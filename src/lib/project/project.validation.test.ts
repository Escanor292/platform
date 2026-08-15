import { describe, it, expect } from '@jest/globals';
import {
    createProjectSchema,
    updateProjectSchema,
    paginationSchema,
    projectIdSchema,
} from './project.validation';

describe('Project Validation Schemas', () => {
    describe('createProjectSchema', () => {
        it('should validate a valid project creation request', () => {
            const validData = {
                title: 'My New Project',
                description: 'A detailed description',
            };
            const result = createProjectSchema.parse(validData);
            expect(result.title).toBe('My New Project');
            expect(result.description).toBe('A detailed description');
        });

        it('should trim whitespace from title and description', () => {
            const dataWithWhitespace = {
                title: '  Project Title  ',
                description: '  Description text  ',
            };
            const result = createProjectSchema.parse(dataWithWhitespace);
            expect(result.title).toBe('Project Title');
            expect(result.description).toBe('Description text');
        });

        it('should reject empty title', () => {
            const invalidData = { title: '' };
            expect(() => createProjectSchema.parse(invalidData)).toThrow('Title is required');
        });

        it('should reject title with only whitespace', () => {
            const invalidData = { title: '   ' };
            expect(() => createProjectSchema.parse(invalidData)).toThrow('Title is required');
        });

        it('should reject title exceeding 255 characters', () => {
            const invalidData = { title: 'a'.repeat(256) };
            expect(() => createProjectSchema.parse(invalidData)).toThrow(
                'Title must not exceed 255 characters'
            );
        });

        it('should accept title at 255 characters', () => {
            const validData = { title: 'a'.repeat(255) };
            const result = createProjectSchema.parse(validData);
            expect(result.title.length).toBe(255);
        });

        it('should accept project without description', () => {
            const validData = { title: 'Project Title' };
            const result = createProjectSchema.parse(validData);
            expect(result.title).toBe('Project Title');
            expect(result.description).toBeUndefined();
        });
    });

    describe('updateProjectSchema', () => {
        it('should validate a valid project update with title', () => {
            const validData = { title: 'Updated Title' };
            const result = updateProjectSchema.parse(validData);
            expect(result.title).toBe('Updated Title');
        });

        it('should validate a valid project update with description', () => {
            const validData = { description: 'Updated Description' };
            const result = updateProjectSchema.parse(validData);
            expect(result.description).toBe('Updated Description');
        });

        it('should validate a valid project update with both fields', () => {
            const validData = {
                title: 'Updated Title',
                description: 'Updated Description',
            };
            const result = updateProjectSchema.parse(validData);
            expect(result.title).toBe('Updated Title');
            expect(result.description).toBe('Updated Description');
        });

        it('should trim whitespace from title and description', () => {
            const dataWithWhitespace = {
                title: '  Updated Title  ',
                description: '  Updated Description  ',
            };
            const result = updateProjectSchema.parse(dataWithWhitespace);
            expect(result.title).toBe('Updated Title');
            expect(result.description).toBe('Updated Description');
        });

        it('should reject update with no fields', () => {
            const invalidData = {};
            expect(() => updateProjectSchema.parse(invalidData)).toThrow(
                'At least one field must be provided'
            );
        });

        it('should reject empty title in update', () => {
            const invalidData = { title: '' };
            expect(() => updateProjectSchema.parse(invalidData)).toThrow('Title cannot be empty');
        });

        it('should reject title exceeding 255 characters in update', () => {
            const invalidData = { title: 'a'.repeat(256) };
            expect(() => updateProjectSchema.parse(invalidData)).toThrow(
                'Title must not exceed 255 characters'
            );
        });
    });

    describe('paginationSchema', () => {
        it('should use default values when not provided', () => {
            const result = paginationSchema.parse({});
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });

        it('should validate valid pagination parameters', () => {
            const validData = { page: '5', limit: '25' };
            const result = paginationSchema.parse(validData);
            expect(result.page).toBe(5);
            expect(result.limit).toBe(25);
        });

        it('should coerce string numbers to integers', () => {
            const validData = { page: '2', limit: '50' };
            const result = paginationSchema.parse(validData);
            expect(typeof result.page).toBe('number');
            expect(typeof result.limit).toBe('number');
            expect(result.page).toBe(2);
            expect(result.limit).toBe(50);
        });

        it('should reject page less than 1', () => {
            const invalidData = { page: 0 };
            expect(() => paginationSchema.parse(invalidData)).toThrow('Page must be at least 1');
        });

        it('should reject negative page', () => {
            const invalidData = { page: -1 };
            expect(() => paginationSchema.parse(invalidData)).toThrow('Page must be at least 1');
        });

        it('should reject limit exceeding 100', () => {
            const invalidData = { limit: 101 };
            expect(() => paginationSchema.parse(invalidData)).toThrow('Limit must not exceed 100');
        });

        it('should accept limit at maximum 100', () => {
            const validData = { limit: 100 };
            const result = paginationSchema.parse(validData);
            expect(result.limit).toBe(100);
        });

        it('should accept limit at minimum 1', () => {
            const validData = { limit: 1 };
            const result = paginationSchema.parse(validData);
            expect(result.limit).toBe(1);
        });
    });

    describe('projectIdSchema', () => {
        it('should validate a valid CUID', () => {
            const validCuid = 'clh3x2y5z0000qz8r7g9x5h3k';
            const result = projectIdSchema.parse(validCuid);
            expect(result).toBe(validCuid);
        });

        it('should reject invalid CUID format', () => {
            const invalidId = 'not-a-cuid';
            expect(() => projectIdSchema.parse(invalidId)).toThrow('Invalid project ID format');
        });

        it('should reject empty string', () => {
            const invalidId = '';
            expect(() => projectIdSchema.parse(invalidId)).toThrow('Invalid project ID format');
        });

        it('should reject UUID format', () => {
            const uuidFormat = '550e8400-e29b-41d4-a716-446655440000';
            expect(() => projectIdSchema.parse(uuidFormat)).toThrow('Invalid project ID format');
        });
    });
});
