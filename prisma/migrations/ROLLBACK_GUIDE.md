# Rollback Guide: Project Hierarchy Migration

## Quick Reference

This guide provides step-by-step instructions for rolling back the Project Hierarchy Management migration.

## Prerequisites

- Database backup completed
- Database connection string available
- PostgreSQL client (psql) installed
- Write access to the database

## Rollback Script Location

```
prisma/migrations/rollback_add_projects_table.sql
```

## Step-by-Step Rollback Process

### Step 1: Verify Migration Status

Check if the migration is currently applied:

```bash
psql $DATABASE_URL -c "SELECT migration_name, finished_at FROM _prisma_migrations WHERE migration_name LIKE '%add_projects%' ORDER BY finished_at DESC;"
```

Expected output: One row showing the migration was applied.

### Step 2: Create Database Backup (MANDATORY)

**⚠️ CRITICAL: Always backup before rollback**

```bash
# Create timestamped backup
pg_dump $DATABASE_URL > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file created
ls -lh backup_before_rollback_*.sql
```

### Step 3: Check for Dependent Data

Before rolling back, check if any projects exist:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as project_count FROM projects;"
```

**⚠️ WARNING**: Rollback will DELETE all project records. Ensure this is acceptable.

Check for campaigns and blog posts with project associations:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as campaigns_with_projects FROM campaigns WHERE projectId IS NOT NULL;"
psql $DATABASE_URL -c "SELECT COUNT(*) as blogs_with_projects FROM blog_posts WHERE projectId IS NOT NULL;"
```

**Note**: After rollback, these associations will be lost (projectId columns removed).

### Step 4: Stop Application Services

Stop all application instances to prevent write operations during rollback:

```bash
# Example for systemd service
sudo systemctl stop crowdfunding-app

# Example for Docker
docker-compose down

# Example for PM2
pm2 stop crowdfunding-app
```

### Step 5: Execute Rollback Script

Run the rollback SQL script:

```bash
psql $DATABASE_URL -f prisma/migrations/rollback_add_projects_table.sql
```

Expected output:
```
ALTER TABLE
DROP INDEX
DROP INDEX
DROP INDEX
ALTER TABLE
ALTER TABLE
DROP TABLE
```

### Step 6: Verify Rollback Completion

Verify projects table is removed:

```bash
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_name = 'projects';"
```

Expected: No rows returned.

Verify projectId columns removed from campaigns:

```bash
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'projectId';"
```

Expected: No rows returned.

Verify projectId columns removed from blog_posts:

```bash
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'projectId';"
```

Expected: No rows returned.

### Step 7: Update Prisma Migration State

Remove the migration record from Prisma's tracking table:

```bash
psql $DATABASE_URL -c "DELETE FROM _prisma_migrations WHERE migration_name LIKE '%add_projects%';"
```

Verify removal:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name LIKE '%add_projects%';"
```

Expected: 0

### Step 8: Update Prisma Schema

Edit `prisma/schema.prisma` and remove:

1. The entire `projects` model:
```prisma
// DELETE THIS:
model projects {
  id          String       @id @default(cuid())
  creatorId   String
  title       String       @db.VarChar(255)
  description String?      @db.Text
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  users       users        @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  campaigns   campaigns[]
  blog_posts  blog_posts[]

  @@index([creatorId])
}
```

2. Remove `projectId` field from `campaigns` model:
```prisma
// DELETE THIS LINE:
projectId   String?

// DELETE THIS RELATION:
projects    projects?             @relation(fields: [projectId], references: [id], onDelete: SetNull)

// DELETE THIS INDEX:
@@index([projectId])
```

3. Remove `projectId` field from `blog_posts` model:
```prisma
// DELETE THIS LINE:
projectId            String?

// DELETE THIS RELATION:
projects             projects?              @relation(fields: [projectId], references: [id], onDelete: SetNull)

// DELETE THIS INDEX:
@@index([projectId])
```

4. Remove `projects` relation from `users` model:
```prisma
// DELETE THIS LINE:
projects                                   projects[]
```

### Step 9: Regenerate Prisma Client

After updating schema, regenerate the Prisma client:

```bash
npx prisma generate
```

Expected output: "Generated Prisma Client" with no errors.

### Step 10: Verify Application Compatibility

Check that the application code doesn't reference projects:

```bash
# Search for project references (should return minimal results)
grep -r "projects\." src/
grep -r "projectId" src/
```

**⚠️ WARNING**: If code references found, you must update or remove that code before restarting the application.

### Step 11: Restart Application Services

Restart application instances:

```bash
# Example for systemd
sudo systemctl start crowdfunding-app

# Example for Docker
docker-compose up -d

# Example for PM2
pm2 start crowdfunding-app
```

### Step 12: Post-Rollback Verification

Run verification checks:

```bash
# Check application starts without errors
curl http://localhost:3000/api/health

# Verify campaigns are accessible
psql $DATABASE_URL -c "SELECT COUNT(*) FROM campaigns;"

# Verify blog posts are accessible
psql $DATABASE_URL -c "SELECT COUNT(*) FROM blog_posts;"
```

## Troubleshooting

### Error: "relation does not exist"

**Cause**: Trying to rollback when migration was never applied.

**Solution**: Check migration status (Step 1). If migration doesn't exist, no rollback needed.

### Error: "cannot drop table because other objects depend on it"

**Cause**: Unexpected foreign key constraints exist.

**Solution**: 
```bash
# Find dependent constraints
psql $DATABASE_URL -c "SELECT conname, conrelid::regclass FROM pg_constraint WHERE confrelid = 'projects'::regclass;"

# Drop those constraints manually before running rollback
```

### Error: "column does not exist"

**Cause**: Rollback script trying to drop already-removed column.

**Solution**: This is safe to ignore. The script uses `IF EXISTS` to handle this.

### Application Fails to Start After Rollback

**Cause**: Code still references projects/projectId.

**Solution**:
1. Check application logs for specific errors
2. Search codebase for project references
3. Remove or update code that uses projects
4. Regenerate Prisma client
5. Restart application

## Recovery from Failed Rollback

If rollback fails midway:

1. **Restore from backup**:
```bash
psql $DATABASE_URL < backup_before_rollback_TIMESTAMP.sql
```

2. **Check database state**:
```bash
# List all tables
psql $DATABASE_URL -c "\dt"

# Check specific structures
psql $DATABASE_URL -c "\d projects"
psql $DATABASE_URL -c "\d campaigns"
psql $DATABASE_URL -c "\d blog_posts"
```

3. **Contact support** with:
   - Error messages from rollback attempt
   - Database state output
   - Application logs

## Important Notes

- ✅ **Always backup before rollback**
- ✅ **Stop application before rollback**
- ✅ **Verify each step before proceeding**
- ⚠️ **Rollback deletes all project data**
- ⚠️ **Rollback removes project associations from campaigns/blogs**
- ⚠️ **Code changes may be needed after rollback**

## Rollback Checklist

- [ ] Database backup created
- [ ] Migration status verified
- [ ] Dependent data checked
- [ ] Application services stopped
- [ ] Rollback script executed
- [ ] Tables/columns verified removed
- [ ] Prisma migration state updated
- [ ] Prisma schema updated
- [ ] Prisma client regenerated
- [ ] Application code verified
- [ ] Application services restarted
- [ ] Post-rollback verification completed

## Support

For issues with rollback:
1. Review troubleshooting section
2. Check application logs
3. Restore from backup if needed
4. Contact development team with error details

---

**Last Updated**: 2026-08-09
**Migration**: 20260809151306_add_projects_table
**Rollback Script**: rollback_add_projects_table.sql
