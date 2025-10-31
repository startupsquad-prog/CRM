# Create Test Users

This document explains how to create test users for development and testing purposes.

## Quick Method (Recommended)

### Using the Web Interface

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/create-test-users.html
   ```

3. Click the "Create Test Users" button

4. The system will create 3 test users and display their credentials

## Created Test Users

After running the script, you'll have access to these test accounts:

### Admin User
- **Email:** `admin@crm-test.com`
- **Password:** `Admin123!@#`
- **Role:** Admin (full access)
- **Redirects to:** `/admin/dashboard`

### Employee User
- **Email:** `employee@crm-test.com`
- **Password:** `Employee123!@#`
- **Role:** Employee (limited access)
- **Redirects to:** `/employee/dashboard`

### Manager User
- **Email:** `manager@crm-test.com`
- **Password:** `Manager123!@#`
- **Role:** Employee (limited access, useful for testing manager scenarios)
- **Redirects to:** `/employee/dashboard`

## Testing the Quick Login Widget

1. Sign in with any of the test users at `/marketing` or `/`

2. You'll see the **Quick Login Widget** appear below the sign-up section

3. Click any role button to instantly switch roles:
   - The widget will update your role in Clerk and Supabase
   - You'll be automatically redirected to the appropriate dashboard

## Manual Method (Alternative)

If you prefer to create users manually via the API:

### Using cURL

```bash
curl -X POST http://localhost:3000/api/admin/create-test-users
```

### Using Fetch (Browser Console)

```javascript
fetch('/api/admin/create-test-users', {
  method: 'POST'
})
.then(res => res.json())
.then(data => console.log(data));
```

## Notes

- ⚠️ **Production Safety:** The create-test-users endpoint only works in development mode
- 🔒 **Security:** These are test passwords for development only
- 🔄 **Existing Users:** If users already exist, they will be skipped gracefully
- 📊 **Sync:** All users are automatically synced to Supabase `users` table

## Troubleshooting

### Users Not Creating

1. Check that you're running in development mode:
   - Set `NODE_ENV=development` if running manually

2. Verify environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Clerk secret key should be automatically configured

3. Check browser console for errors

### Can't Sign In

1. Make sure users were created successfully
2. Check Clerk dashboard for the users
3. Verify passwords match exactly (case-sensitive)

### Quick Login Not Working

1. Sign in first with one of the test users
2. The widget only appears when authenticated
3. Check browser console for API errors

## Clean Up

To remove test users:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users section
3. Search for emails ending in `@crm-test.com`
4. Delete the test users

Or use Supabase SQL Editor:

```sql
DELETE FROM users WHERE email LIKE '%@crm-test.com';
```

## Related Documentation

- [Quick Login Widget](./src/components/quick-login-widget.tsx)
- [User Management System](./docs/USER_MANAGEMENT_SYSTEM.md)
- [Clerk Setup](./docs/clerk-roles-setup.md)

