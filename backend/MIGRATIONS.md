# Database Migrations Guide

GR-attitude uses **TypeORM migrations** for production database schema management.

## Quick Reference

```bash
# Generate a new migration (after modifying entities)
npm run migration:generate -- src/migrations/YourMigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

---

## Why Migrations?

**Before (POC):**  
We used `synchronize: true` in production — TypeORM auto-created/modified tables at startup.  
❌ **Risk:** Data loss on schema conflicts or production restarts.

**Now (Production-ready):**  
- **Dev:** `synchronize: true` → fast iteration, auto-sync entities
- **Prod:** `synchronize: false` + `migrationsRun: true` → controlled, versioned schema changes

---

## Configuration

### Development
- **`synchronize: true`** — entities changes reflect immediately in DB
- Migrations are optional (but recommended for testing migration flow)

### Production
- **`synchronize: false`** — schema changes ONLY via migrations
- **`migrationsRun: true`** — migrations auto-run on app startup
- Safer, versioned, rollback-able

Config: `backend/src/config/database.config.ts`

---

## Workflow: Making Schema Changes

### 1. Modify an Entity

Example: Add a new field to `User`:

```typescript
// src/users/entities/user.entity.ts
@Column({ nullable: true })
bio?: string;
```

### 2. Generate Migration

```bash
cd backend
npm run migration:generate -- src/migrations/AddUserBio
```

This creates: `src/migrations/1772190361842-AddUserBio.ts`

TypeORM compares entities vs current DB schema and generates SQL.

### 3. Review Migration

Open the generated file — verify SQL looks correct:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
}
```

### 4. Test Locally

```bash
# Run migration
npm run migration:run

# Verify DB schema (SQLite)
sqlite3 gr_attitude.sqlite ".schema users"

# If wrong, revert and fix
npm run migration:revert
```

### 5. Commit & Deploy

```bash
git add src/migrations/
git commit -m "feat(db): add user bio field"
git push
```

On Render deploy:
1. App builds (`npm run build`)
2. App starts → `migrationsRun: true` runs pending migrations
3. Schema updated safely ✅

---

## Common Tasks

### Create Empty Migration (Manual SQL)

```bash
npx typeorm migration:create src/migrations/CustomTask
```

Edit the file manually with SQL:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`CREATE INDEX idx_missions_status ON missions(status)`);
}
```

### Check Migration Status

```bash
# List all migrations + status
npx typeorm-ts-node-commonjs migration:show -d src/data-source.ts
```

### Rollback Last Migration

```bash
npm run migration:revert
```

⚠️ **Only run in dev/staging!** Rolling back in production requires careful planning.

---

## Production Deployment Checklist

Before deploying schema changes:

1. ✅ Migration generated & tested locally
2. ✅ `npm run test` passes (no broken tests)
3. ✅ Migration reviewed for data safety (no `DROP TABLE` without backup plan)
4. ✅ Rollback plan documented (in case migration breaks prod)
5. ✅ Render env vars include `NODE_ENV=production`

Render will:
- Build the backend
- Start the app
- Detect pending migrations → run them automatically

---

## Troubleshooting

### "No changes in database schema were found"

TypeORM compares entities vs **current DB state**. If DB already matches entities, nothing to generate.

**Fix:** Ensure:
1. Entities are saved
2. DB is in a known state (run `npm run migration:run` first)
3. Modify entity → try again

### Migration Fails in Production

**Symptoms:** App crashes on startup with SQL error

**Fix:**
1. Check Render logs → identify SQL error
2. Revert deploy (Render dashboard → redeploy previous commit)
3. Fix migration locally, test, redeploy

### Multiple Devs / Merge Conflicts

If two devs generate migrations simultaneously → conflicts.

**Resolution:**
1. Keep both migration files
2. Rename timestamps to sequential order (if needed)
3. Test migration order locally
4. Commit both

---

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `migration:generate` | `typeorm-ts-node-commonjs migration:generate -d src/data-source.ts` | Generate migration from entity changes |
| `migration:run` | `typeorm-ts-node-commonjs migration:run -d src/data-source.ts` | Run pending migrations |
| `migration:revert` | `typeorm-ts-node-commonjs migration:revert -d src/data-source.ts` | Rollback last migration |

---

## Initial Migration

The initial schema migration (`InitialSchema`) was generated from existing entities on 2026-02-27.

It includes:
- Users (auth, OAuth, profile)
- Missions (help requests)
- Offers (help proposals)
- Correlations (mission-offer matches)
- Contributions (user activity)
- Notifications

All subsequent schema changes must go through migrations.

---

## Further Reading

- [TypeORM Migrations Docs](https://typeorm.io/migrations)
- [NestJS Database Guide](https://docs.nestjs.com/techniques/database)
