import { z } from 'zod';

/**
 * Validation schema for creating a project
 * Validates: Requirements 4.3, 4.4, 13.1, 13.2
 */
export const createProjectSchema = z.object({
    title: z
        .string()
        .transform((val) => val.trim())
        .pipe(
            z
                .string()
                .min(1, 'Title is required')
                .max(255, 'Title must not exceed 255 characters')
        ),
    description: z
        .string()
        .optional()
        .transform((val) => val?.trim() || undefined),
});

/**
 * Validation schema for updating a project
 * Validates: Requirements 5.5, 5.6, 5.7, 13.1, 13.2
 * At least one field must be provided
 */
export const updateProjectSchema = z
    .object({
        title: z
            .string()
            .transform((val) => val.trim())
            .pipe(
                z
                    .string()
                    .min(1, 'Title cannot be empty')
                    .max(255, 'Title must not exceed 255 characters')
            )
            .optional(),
        description: z
            .string()
            .transform((val) => val?.trim() || undefined)
            .optional(),
    })
    .refine((data) => data.title !== undefined || data.description !== undefined, {
        message: 'At least one field must be provided',
    });

/**
 * Validation schema for pagination parameters
 * Validates: Requirements 5.5, 5.6, 5.7
 */
export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1, 'Page must be at least 1')
        .default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100, 'Limit must not exceed 100')
        .default(10),
});

/**
 * Validation schema for project ID (CUID format)
 * Validates: Requirements 18.4
 */
export const projectIdSchema = z.string().cuid('Invalid project ID format');
