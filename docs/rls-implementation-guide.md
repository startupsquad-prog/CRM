# RLS Implementation Guide for Clerk + Supabase

## Overview

Since we're using Clerk for authentication instead of Supabase Auth, RLS policies need to be handled differently. We use a **service role key** for server-side operations and handle authorization in application code.

## Approach

1. **Service Role for Database Operations**: All server-side database operations use the service role key
2. **Application-Level Authorization**: We check user roles and permissions in application code before database operations
3. **Clerk User ID Mapping**: We map Clerk user IDs to Supabase user IDs via the `users.clerk_user_id` field
4. **RLS as Safety Net**: RLS policies are set to allow service role but provide safety for direct database access

## Database Setup

### 1. Create Helper Functions

```sql
-- Function to get current clerk user ID from context
CREATE OR REPLACE FUNCTION get_current_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Set by application: SELECT set_config('app.current_clerk_user_id', clerk_user_id, true);
  -- For service role operations, this returns NULL
  RETURN current_setting('app.current_clerk_user_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get Supabase user ID from Clerk user ID
CREATE OR REPLACE FUNCTION get_user_id_from_clerk(clerk_user_id TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.users WHERE users.clerk_user_id = get_user_id_from_clerk.clerk_user_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(clerk_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.clerk_user_id = is_admin.clerk_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### 2. RLS Policy Pattern

Since we use service role (which bypasses RLS), policies provide safety for:
- Direct database access
- Future migration to Supabase Auth (if needed)
- Additional security layers

Pattern:
```sql
CREATE POLICY "Policy name"
  ON table_name FOR operation
  USING (
    -- Check with clerk user context
    condition_with_clerk_context()
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );
```

## Application-Level Authorization

### Server Actions / API Routes

```typescript
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/clerk-auth'

export async function getLeads() {
  // 1. Authenticate with Clerk
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // 2. Get user role from Clerk
  const role = await getUserRole()
  
  // 3. Get Supabase client (service role)
  const supabase = createServerSupabaseClient()
  
  // 4. Build query based on role
  let query = supabase.from('leads').select('*')
  
  if (role === 'employee') {
    // Employees only see their assigned leads
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    
    if (user) {
      query = query.eq('assigned_to', user.id)
    }
  }
  // Admins see all (no filter)
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}
```

## User Profile Sync

### Automatic Sync via Webhook

1. Set up Clerk webhook endpoint: `/api/webhooks/clerk`
2. Webhook syncs users on:
   - `user.created` → Create user in Supabase
   - `user.updated` → Update user in Supabase
   - `user.deleted` → Soft delete (set `is_active = false`)

### Manual Sync

```typescript
import { syncUserToSupabase, getOrSyncCurrentUser } from '@/lib/user-sync'

// Sync specific user
await syncUserToSupabase(clerkUserId)

// Get or sync current user
const user = await getOrSyncCurrentUser()
```

## Environment Variables

Add to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Keep secret!

# Clerk Webhook
CLERK_WEBHOOK_SECRET=your-webhook-secret
```

## Clerk Webhook Setup

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

## Best Practices

1. **Always authenticate first** with Clerk before database operations
2. **Check roles in application code** before querying
3. **Use service role key** for all server-side Supabase operations
4. **Never expose service role key** to client-side code
5. **Map Clerk user ID** to Supabase user ID when filtering data
6. **Handle errors gracefully** if user doesn't exist in Supabase yet

## Example: Creating a Lead

```typescript
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSupabaseUserIdFromClerk } from '@/lib/user-sync'

export async function createLead(leadData: CreateLeadInput) {
  // 1. Authenticate
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // 2. Get Supabase user ID
  const supabaseUserId = await getSupabaseUserIdFromClerk(userId)
  if (!supabaseUserId) {
    // Sync user if not exists
    await syncUserToSupabase(userId)
    const syncedId = await getSupabaseUserIdFromClerk(userId)
    if (!syncedId) throw new Error('User not found')
  }

  // 3. Create lead
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...leadData,
      created_by: supabaseUserId, // Use Supabase user ID
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

## Migration Notes

- RLS policies use helper functions that work with Clerk user IDs
- Service role bypasses RLS for application operations
- All authorization logic is in application code
- RLS provides additional safety layer for direct database access

