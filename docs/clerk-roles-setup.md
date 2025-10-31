# Setting Up Clerk Roles for Admin/Employee Access

This CRM system uses role-based access control (RBAC) through Clerk's user metadata.

## How Roles Work

- **Admin**: Full access to all features including team management, analytics, and company management
- **Employee**: Access to their own tasks, calendar, messages, and profile settings

## Setting User Roles in Clerk

### Method 1: Through Clerk Dashboard (Recommended for Development)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Users** section
3. Select the user you want to set as admin
4. Go to **Metadata** tab
5. In **Public Metadata**, add:
   ```json
   {
     "role": "admin"
   }
   ```
6. For employees, you can either:
   - Set `"role": "employee"` explicitly
   - Or leave it unset (defaults to employee)

### Method 2: Through API (For Production)

You can set roles programmatically using Clerk's API:

```typescript
import { clerkClient } from '@clerk/nextjs/server'

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'admin' // or 'employee'
  }
})
```

### Method 3: During User Creation

If you're creating users programmatically:

```typescript
const user = await clerkClient.users.createUser({
  emailAddress: ['user@example.com'],
  publicMetadata: {
    role: 'admin'
  }
})
```

## Default Behavior

- Users without a role set will default to **employee** role
- Admins are automatically redirected to `/admin/dashboard`
- Employees are automatically redirected to `/employee/dashboard`
- Admins cannot access employee routes (and vice versa) - automatic redirects are in place

## Testing Roles

1. Create test users in Clerk Dashboard
2. Set one user's role to `admin` in public metadata
3. Set another user's role to `employee` (or leave unset)
4. Sign in as each user to verify:
   - Admin sees admin sidebar with full navigation
   - Employee sees employee sidebar with limited navigation
   - Redirects work correctly based on role

## Security Notes

- Always validate roles server-side (already implemented in layout files)
- Never trust client-side role checks alone
- The `requireAdmin()` function in `src/lib/clerk-auth.ts` ensures admin-only routes are protected
- Roles are stored in Clerk's public metadata, which is safe for client-side access but validated server-side


