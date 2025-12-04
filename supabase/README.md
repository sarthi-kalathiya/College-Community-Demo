# Supabase Migrations

This directory contains database migrations for the Community Platform MVP.

## Migration Files

Migrations are run in chronological order based on their timestamp prefix:

1. **20250101000001_create_tables.sql** - Creates all base tables (profiles, communities, memberships, posts, comments, likes, journal_entries)
2. **20250101000002_enable_rls.sql** - Enables Row Level Security and creates initial RLS policies
3. **20250101000003_create_functions.sql** - Creates database functions, triggers, and enables realtime
4. **20250101000004_fix_rls_policies.sql** - Fixes RLS policy recursion issues
5. **20250101000005_add_admin_fields.sql** - Adds admin role, community status, and transactions table

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

#### Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

#### Push migrations to remote:
```bash
supabase db push
```

#### Or apply migrations locally first (for testing):
```bash
supabase start
supabase migration up
```

### Option 2: Manual Application

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order (001 → 002 → 003 → 004 → 005)

## Creating New Migrations

To create a new migration:

```bash
supabase migration new your_migration_name
```

This will create a new timestamped file in `supabase/migrations/` that you can edit.

## Checking Migration Status

```bash
supabase migration list
```

## Resetting Database (Development Only)

⚠️ **Warning**: This will delete all data!

```bash
supabase db reset
```

## Migration Best Practices

1. **Always test migrations locally first** before pushing to production
2. **Use IF NOT EXISTS** for tables/columns that might already exist
3. **Use DROP IF EXISTS** when dropping policies/functions
4. **Never modify existing migration files** - create new migrations instead
5. **Keep migrations idempotent** when possible (safe to run multiple times)

