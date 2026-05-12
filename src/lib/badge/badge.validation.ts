import { z } from 'zod';

// Badge type validation
export const badgeTypeSchema = z.enum(['custom', 'achievement'], {
  errorMap: () => ({ message: 'Badge type must be "custom" or "achievement"' }),
});

// Badge rarity validation
export const badgeRaritySchema = z.enum(['common', 'rare', 'epic', 'legendary'], {
  errorMap: () => ({ message: 'Invalid badge rarity' }),
});

// Hex color validation
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
  .optional();

// Create badge validation
export const createBadgeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  iconUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  iconName: z.string().max(100, 'Icon name too long').optional(),
  color: hexColorSchema,
  backgroundColor: hexColorSchema,
  type: badgeTypeSchema,
  rarity: badgeRaritySchema.optional(),
  isActive: z.boolean().optional(),
});

// Update badge validation
export const updateBadgeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  iconUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  iconName: z.string().max(100, 'Icon name too long').optional(),
  color: hexColorSchema,
  backgroundColor: hexColorSchema,
  type: badgeTypeSchema.optional(),
  rarity: badgeRaritySchema.optional(),
  isActive: z.boolean().optional(),
});

// Assign badge validation
export const assignBadgeSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  reason: z.string().max(500, 'Reason too long').optional(),
  note: z.string().max(500, 'Note too long').optional(),
  expiresAt: z.string().datetime('Invalid date format').optional(),
});

// Revoke badge validation
export const revokeBadgeSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
});

// Badge list query validation
export const badgeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  type: badgeTypeSchema.optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});
