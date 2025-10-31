# CRM System

A comprehensive Customer Relationship Management system built with Next.js, Clerk, and Supabase.

## Features

### Core Features
- **Authentication**: Clerk-based authentication with role-based access control
- **User Roles**: Admin and Employee roles with different access levels
- **Leads Management**: Kanban and Table views with advanced filtering
- **Dashboard**: Role-specific dashboards with analytics and data tables
- **Real-time Sync**: Automatic user profile sync from Clerk to Supabase

### User Management System 🆕
A comprehensive, industry-grade user management system similar to Softr's capabilities:

- **User Profiles**: Extended profiles with bio, job title, timezone, preferences, and activity tracking
- **Roles System**: Custom roles with hierarchy (0-100 levels), system role protection, multiple roles per user
- **Groups System**: Organizational groups with nested support, color-coded groups, group-level permissions
- **Granular Permissions**: Resource-action based permissions (e.g., `leads:create`, `users:manage`) with categories
- **Admin Interface**: 
  - **Users Management** (`/admin/users`) - Complete user CRUD, invitations, filtering, bulk operations
  - **Groups Management** (`/admin/users/groups`) - Create groups, assign permissions, manage membership
  - **Roles & Permissions** (`/admin/users/roles`) - Custom roles, permission matrix, role hierarchy

**Key Capabilities:**
- ✅ Multiple roles and groups per user
- ✅ Permission inheritance from roles and groups
- ✅ Server-side permission checking functions
- ✅ Softr-style user management interface
- ✅ Complete integration with Clerk authentication

### Development Tools 🛠️
- **Quick Login Widget**: Instantly switch between user roles for testing (development only)
- **Test User Creation**: One-click creation of test users (admin, employee, manager) via web interface
- **User Sync Analysis**: Comprehensive analysis of Clerk-Supabase synchronization (see `CLERK_SYNC_ANALYSIS.md`)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Clerk and Supabase keys
   ```

3. **Run database migrations**
   - Execute migrations in order in Supabase SQL Editor:
     - `docs/sql/migrations/001_initial_schema.sql` - Initial schema
     - `docs/sql/migrations/006_user_management_system.sql` - User management system 🆕

4. **Set up Clerk webhook**
   - Follow `docs/clerk-webhook-setup.md`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Create test users (optional)**
   - Navigate to `http://localhost:3000/create-test-users.html`
   - Click "Create Test Users" to create admin, employee, and manager test accounts
   - See `CREATE_TEST_USERS.md` for details

## Documentation

- **Setup Guide**: `docs/SETUP.md` - Complete setup instructions
- **Database Schema**: `docs/supabase-schema.md` - Full schema documentation
- **RLS Guide**: `docs/rls-implementation-guide.md` - Row Level Security implementation
- **Webhook Setup**: `docs/clerk-webhook-setup.md` - Clerk webhook configuration
- **User Management System**: `docs/USER_MANAGEMENT_SYSTEM.md` - Comprehensive user management guide 🆕
- **Test User Creation**: `CREATE_TEST_USERS.md` - Guide for creating test users 🆕
- **Sync Analysis**: `CLERK_SYNC_ANALYSIS.md` - Clerk-Supabase synchronization analysis and fixes 🆕

## Project Structure

```
src/
├── app/              # Next.js pages
│   ├── admin/       # Admin routes
│   │   └── users/   # User management pages 🆕
│   ├── employee/    # Employee routes
│   └── api/         # API routes
│       ├── users/   # User management APIs 🆕
│       ├── groups/  # Groups APIs 🆕
│       ├── roles/   # Roles APIs 🆕
│       └── permissions/ # Permissions API 🆕
├── components/       # React components
│   ├── admin/       # Admin components 🆕
│   │   ├── users-data-table.tsx
│   │   ├── groups-data-table.tsx
│   │   └── roles-data-table.tsx
│   ├── leads-table/ # Leads management
│   └── ui/          # UI components
└── lib/             # Utilities
    ├── clerk-auth.ts
    ├── user-sync.ts
    └── supabase/
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **UI**: Shadcn/ui, Tailwind CSS
- **Forms**: React Hook Form, Zod
- **Data Tables**: TanStack Table
- **Icons**: Lucide React, Tabler Icons

## License

MIT
