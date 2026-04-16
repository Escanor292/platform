# Bug Fix: Date Handling in Project Discovery

## Issue
```
TypeError: endDate.getTime is not a function
```

## Root Cause
API responses return dates as strings (ISO format), but the code expected Date objects.

## Solution
Updated all date-related functions to handle both Date objects and strings.

## Files Changed

### 1. `src/types/project.ts`
Changed date fields to accept both Date and string:
```typescript
// Before
createdAt: Date;
updatedAt: Date;
startDate: Date | null;
endDate: Date | null;

// After
createdAt: Date | string;
updatedAt: Date | string;
startDate: Date | string | null;
endDate: Date | string | null;
```

### 2. `src/lib/project-helpers.ts`
Updated functions to convert strings to Date when needed:

#### `getDaysRemaining()`
```typescript
// Before
export function getDaysRemaining(endDate: Date | null): number | null {
  if (!endDate) return null;
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// After
export function getDaysRemaining(endDate: Date | string | null): number | null {
  if (!endDate) return null;
  const now = new Date();
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diff = endDateObj.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
```

#### `formatDaysRemaining()`
```typescript
// Updated signature
export function formatDaysRemaining(endDate: Date | string | null): string
```

#### `calculateCompletionState()`
```typescript
// Updated to handle string dates
if (startDate) {
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
  if (startDateObj > now) return "NOT_STARTED";
}

if (endDate) {
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  if (endDateObj < now) {
    if (progressPercent >= 100) return "COMPLETED";
    return "FAILED";
  }
}
```

### 3. `src/lib/project-filters.ts`
Updated sorting and filtering logic:

#### Sort by date
```typescript
case "newest":
  return sorted.sort((a, b) => {
    const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
    const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
    return bDate.getTime() - aDate.getTime();
  });
```

#### Filter by date range
```typescript
if (filters.createdWithin) {
  const cutoffDate = getDateFromTimeRange(filters.createdWithin);
  if (cutoffDate) {
    filtered = filtered.filter((p) => {
      const createdAt = typeof p.createdAt === 'string' ? new Date(p.createdAt) : p.createdAt;
      return createdAt >= cutoffDate;
    });
  }
}
```

## Testing

### Test Cases
1. ✅ Load projects page
2. ✅ Display project cards with dates
3. ✅ Sort by newest/oldest
4. ✅ Sort by ending soon
5. ✅ Filter by created within
6. ✅ Display "days remaining" correctly

### Test URLs
```
# Basic load
http://localhost:3000/projects

# Sort by ending soon
http://localhost:3000/projects?sort=ending_soon

# Filter by time range
http://localhost:3000/projects?createdWithin=30d

# Sort by newest
http://localhost:3000/projects?sort=newest
```

## Prevention
To prevent similar issues in the future:

1. **Type Safety**: Always define types that match API responses
2. **Date Handling**: Create utility functions for date conversion
3. **Validation**: Validate data types at API boundaries
4. **Testing**: Test with real API data, not just mock data

## Related Files
- `src/types/project.ts` - Type definitions
- `src/lib/project-helpers.ts` - Helper functions
- `src/lib/project-filters.ts` - Filter logic
- `src/components/projects/ProjectCard.tsx` - UI component
- `src/data/mock-projects.ts` - Mock data

## Status
✅ Fixed and tested

## Notes
- Mock data uses Date objects
- API responses use ISO strings
- Code now handles both formats seamlessly
- No breaking changes to existing functionality
