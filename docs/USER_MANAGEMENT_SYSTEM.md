# User Management System

A comprehensive, industry-grade user management system similar to Softr's capabilities, with profiles, roles, groups, and granular access control.

## Features

### 1. **User Profiles**
- Extended user profiles with additional fields (bio, job title, timezone, language)
- User status management (active/inactive)
- Last login tracking
- User preferences storage (JSONB)

### 2. **Roles System**
- Custom role definitions with hierarchy (level 0-100)
- System roles (admin, employee) that cannot be deleted
- Role-based permissions assignment
- Multiple roles per user support

### 3. **Groups System**
- User groups for organization and team management
- Nested groups support (parent-child relationships)
- Group-level permissions
- Color-coded groups for visual organization

### 4. **Granular Permissions**
- Resource-action based permissions (e.g., `leads:create`, `users:manage`)
- Permission categories (Sales, Management, Administration)
- Role-based and group-based permission inheritance
- Permission checking functions for server-side validation

### 5. **Admin Interface**
- **Users Management** (`/admin/users`)
  - User listing with advanced filters (search, role, status)
  - User editing and profile management
  - User invitation via Clerk
  - Bulk operations support
  - User groups and roles visualization

- **Groups Management** (`/admin/users/groups`)
  - Create and manage user groups
  - Assign permissions to groups
  - View group membership
  - Group hierarchy management

- **Roles & Permissions** (`/admin/users/roles`)
  - Create custom roles
  - Configure role permissions
  - Permission matrix view
  - Role hierarchy management

## Database Schema

### Core Tables

1. **roles** - Role definitions
   - System roles (admin, employee) cannot be deleted
   - Custom roles can be created with custom permissions
   - Level field for hierarchy (0-100)

2. **permissions** - Granular permissions
   - Resource + action combination
   - Categories for organization
   - Pre-defined permissions for common resources

3. **role_permissions** - Role to permissions mapping

4. **groups** - User groups
   - Nested groups support
   - Color and icon support
   - Active/inactive status

5. **group_permissions** - Group to permissions mapping

6. **user_roles** - User to roles mapping (many-to-many)
   - Primary role designation

7. **user_groups** - User to groups mapping (many-to-many)
   - Primary group designation

### Helper Functions

- `user_has_permission(user_id, resource, action)` - Check if user has specific permission
- `get_user_permissions(user_id)` - Get all effective permissions for a user
- `get_user_roles(user_id)` - Get all roles for a user
- `get_user_groups(user_id)` - Get all groups for a user

## API Endpoints

### Users
- `GET /api/users` - List users with filters
- `GET /api/users/[id]` - Get user details
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Deactivate user
- `POST /api/users/invite` - Invite new user via Clerk

### Groups
- `GET /api/groups` - List groups
- `GET /api/groups/[id]` - Get group details
- `POST /api/groups` - Create group
- `PATCH /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group

### Roles
- `GET /api/roles` - List roles
- `GET /api/roles/[id]` - Get role details
- `POST /api/roles` - Create role
- `PATCH /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role (non-system only)

### Permissions
- `GET /api/permissions` - List all permissions (grouped by category/resource)

## Setup Instructions

### 1. Run Database Migration

Execute the migration file in Supabase SQL Editor:

```sql
-- Run: docs/sql/migrations/006_user_management_system.sql
```

This will create all necessary tables, indexes, RLS policies, and helper functions.

### 2. Verify Migration

The migration includes:
- Default system roles (admin, employee, manager, viewer)
- Pre-defined permissions for common resources
- Default role-permission assignments
- Migration of existing users to user_roles table

### 3. Access Admin Interface

1. Log in as admin user
2. Navigate to `/admin/users` from the sidebar
3. You'll see three sections:
   - **All Users** - Manage all system users
   - **Groups** - Organize users into groups
   - **Roles & Permissions** - Configure roles and permissions

## Usage Examples

### Assign Role to User

```typescript
// Via API
await fetch('/api/users/[userId]', {
  method: 'PATCH',
  body: JSON.stringify({
    roles: ['role-id-1', 'role-id-2'], // First role is primary
  }),
})
```

### Check User Permission (Server-side)

```sql
-- In SQL
SELECT user_has_permission(user_id, 'leads', 'create');

-- Or in application code
const hasPermission = await supabase.rpc('user_has_permission', {
  p_user_id: userId,
  p_resource: 'leads',
  p_action: 'create'
})
```

### Create Custom Role

```typescript
// Via API
await fetch('/api/roles', {
  method: 'POST',
  body: JSON.stringify({
    name: 'sales_manager',
    display_name: 'Sales Manager',
    description: 'Manages sales team and leads',
    level: 75,
    permissions: ['permission-id-1', 'permission-id-2', ...],
  }),
})
```

### Create Group with Permissions

```typescript
// Via API
await fetch('/api/groups', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Sales Team',
    description: 'Sales department group',
    color: '#3b82f6',
    permissions: ['permission-id-1', 'permission-id-2', ...],
  }),
})
```

## Permission Checking in Routes

For server-side permission checks in API routes or page components:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSupabaseUserIdFromClerk } from '@/lib/user-sync'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const supabaseUserId = await getSupabaseUserIdFromClerk(userId)
  
  // Check permission
  const { data: hasPermission } = await supabase.rpc('user_has_permission', {
    p_user_id: supabaseUserId,
    p_resource: 'leads',
    p_action: 'create',
  })
  
  if (!hasPermission) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }
  
  // Continue with operation...
}
```

## Security Features

1. **Row Level Security (RLS)** - All tables have RLS policies
2. **Admin-only access** - User management routes require admin role
3. **System role protection** - System roles cannot be deleted
4. **Cascade deletion** - Related records are cleaned up automatically
5. **Permission inheritance** - Users get permissions from both roles and groups

## Integration with Clerk

- User roles are synced between Clerk public metadata and Supabase
- User invitations are sent via Clerk
- User status changes are reflected in Clerk metadata
- Admin role check uses both Clerk metadata and Supabase for validation

## Best Practices

1. **Use Groups for Organizational Structure**
   - Create groups for departments, teams, or projects
   - Assign permissions at group level for easier management

2. **Use Roles for Functional Access**
   - Create roles based on job functions
   - Assign roles to users based on their responsibilities

3. **Permission Naming Convention**
   - Resource: lowercase, singular (e.g., `lead`, `user`, `company`)
   - Action: lowercase, verb (e.g., `create`, `read`, `update`, `delete`, `manage`)

4. **Role Hierarchy**
   - Use level field to establish hierarchy (higher = more permissions)
   - Default: Admin (100), Manager (50), Employee (10), Viewer (5)

5. **Testing Permissions**
   - Always test permissions server-side
   - Use the helper functions for consistent permission checks
   - Never rely solely on client-side checks

## Migration Notes

The migration automatically:
- Creates default system roles (admin, employee)
- Sets up default permissions for common resources
- Migrates existing users to the new user_roles table
- Preserves existing user role assignments

After migration:
- Existing admin users will have admin role in user_roles table
- Existing employee users will have employee role in user_roles table
- All users will continue to work as before

## Troubleshooting

### Users not showing up
- Check if users are synced from Clerk to Supabase
- Verify RLS policies are correct
- Check user.is_active status

### Permissions not working
- Verify user has roles assigned
- Check role has permissions assigned
- Verify groups have permissions if using group-based access
- Check RLS policies allow the operation

### Role deletion fails
- System roles (admin, employee) cannot be deleted
- Roles with assigned users cannot be deleted (remove assignments first)

## Future Enhancements

- [ ] Permission inheritance from parent groups
- [ ] Role templates
- [ ] Bulk user operations
- [ ] User activity logs
- [ ] Permission audit trail
- [ ] Custom permission definitions
- [ ] Time-based role assignments
- [ ] Integration with departments table
