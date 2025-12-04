# Community platform MVP

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

## Overview

A community platform MVP built with Next.js, featuring user authentication, community management, and interactive features.

## Features

- User authentication and profile management
- Community creation and management
- Community membership and interactions
- Dashboard for managing communities
- Responsive design with modern UI components

## Deployment

Your project is live at:

**[https://vercel.com](https://vercel.com)**

## Tech Stack

- Next.js
- TypeScript
- Supabase
- Stripe
- Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see `.env.example` if available)
4. **Run database migrations** (see [Database Setup](#database-setup) below)
5. Run the development server: `pnpm dev`

## Database Setup

This project uses Supabase for the database. Migrations are managed via Supabase CLI.

### Prerequisites

- Supabase CLI installed (`brew install supabase/tap/supabase` or see [Supabase CLI docs](https://supabase.com/docs/guides/cli))
- A Supabase project (create one at [supabase.com](https://supabase.com))

### Running Migrations

1. **Link your Supabase project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in your Supabase dashboard URL.

2. **Push migrations to your database:**
   ```bash
   supabase db push
   ```

   This will run all migrations in `supabase/migrations/` in order:
   - Create tables (profiles, communities, memberships, posts, comments, likes, journal_entries)
   - Enable Row Level Security (RLS)
   - Create database functions and triggers
   - Fix RLS policies
   - Add admin fields and transactions table

3. **Verify migrations:**
   ```bash
   supabase migration list
   ```

For more details, see [supabase/README.md](./supabase/README.md)

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```
