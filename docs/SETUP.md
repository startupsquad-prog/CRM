# CRM System Setup Guide

## Overview

This CRM system uses:
- **Clerk** for authentication and user management
- **Supabase** for database and data storage
- **Next.js 16** with App Router
- **Shadcn/ui** for UI components

## Prerequisites

1. Node.js 18+ and npm
2. Clerk account ([clerk.com](https://clerk.com))
3. Supabase account ([supabase.com](https://supabase.com))

## Initial Setup

### 1. Environment Variables

Create `.env.local` in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Keep secret!

# Optional: For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Clerk

1. Create a Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Copy your keys to `.env.local`
3. Configure authentication methods (Email, Social, etc.)
4. Set up webhook (see `docs/clerk-webhook-setup.md`)

### 4. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and keys to `.env.local`
3. Run the migration: `docs/sql/migrations/001_initial_schema.sql`
4. Or use the Supabase SQL Editor to execute the migration

### 5. Configure User Roles in Clerk

For each user in Clerk Dashboard:
1. Go to **Users** → Select user
2. **Metadata** tab → **Public Metadata**
3. Add:
   ```json
   {
     "role": "admin"
   }
   ```
   or leave unset for employee (default)

### 6. Set Up Clerk Webhook

Follow the guide in `docs/clerk-webhook-setup.md` to:
- Add webhook endpoint in Clerk Dashboard
- Subscribe to `user.created`, `user.updated`, `user.deleted`
- Add `CLERK_WEBHOOK_SECRET` to `.env.local`

## Running the Application

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm start
```

## Project Structure

```
crm-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (marketing)/  # Public marketing pages
│   │   ├── admin/        # Admin-only routes
│   │   ├── employee/    # Employee routes
│   │   └── api/          # API routes (webhooks)
│   ├── components/       # React components
│   │   ├── leads-table/  # Leads management components
│   │   └── ui/           # Shadcn UI components
│   ├── lib/              # Utilities and helpers
│   │   ├── clerk-auth.ts # Clerk auth utilities
│   │   ├── user-sync.ts  # User sync logic
│   │   └── supabase/     # Supabase clients
│   └── types/            # TypeScript types
├── docs/                 # Documentation
│   ├── supabase-schema.md
│   ├── rls-implementation-guide.md
│   └── clerk-webhook-setup.md
└── .env.local            # Environment variables (gitignored)
```

## Key Features

### Authentication & Authorization

- Clerk handles all authentication
- User roles: `admin` or `employee`
- Automatic user sync to Supabase via webhooks
- RLS policies configured for data security

### Leads Management

- Kanban view (default) for visual lead tracking
- Table view for detailed data
- Primary filters (tabs): All, Hot, Warm, Cold, Follow-ups, Assigned
- Secondary filters (dropdowns): Source, Product, Tags, Date Range
- Sample data generator with dicebear avatars

### Data Security

- Row Level Security (RLS) policies in Supabase
- Application-level authorization checks
- Service role for server operations
- User data isolated by role

## Troubleshooting

### Users not syncing to Supabase

1. Check webhook is configured in Clerk Dashboard
2. Verify `CLERK_WEBHOOK_SECRET` matches
3. Check `SUPABASE_SERVICE_ROLE_KEY` is set
4. Review server logs for errors

### Role not working

1. Ensure role is set in Clerk Dashboard → Users → Metadata
2. Format: `{ "role": "admin" }` or `{ "role": "employee" }`
3. Default is `employee` if not set

### Database connection errors

1. Verify Supabase keys in `.env.local`
2. Check Supabase project is active
3. Ensure migration has been run

## Next Steps

1. Set up webhook in Clerk Dashboard
2. Run database migration in Supabase
3. Create test users and assign roles
4. Configure departments and teams
5. Start adding leads and data

For detailed guides, see:
- `docs/supabase-schema.md` - Database schema
- `docs/rls-implementation-guide.md` - RLS configuration
- `docs/clerk-webhook-setup.md` - Webhook setup

