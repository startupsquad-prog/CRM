# Clerk Webhook Setup Guide

## Overview

This guide explains how to set up Clerk webhooks to automatically sync user profiles to Supabase when users are created, updated, or deleted in Clerk.

## Prerequisites

1. Clerk account with an application
2. Supabase project
3. Deployment URL for your Next.js app (or use ngrok for local development)

## Step 1: Get Webhook Secret

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
6. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Copy the **Signing Secret** (starts with `whsec_`)

## Step 2: Add Environment Variable

Add the webhook secret to your `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_...
```

## Step 3: Add Supabase Service Role Key

For the webhook to write to Supabase, you need the service role key:

1. Go to your Supabase project
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (keep this secret!)
4. Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Test the Webhook

### Local Development with ngrok

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/)
2. Start your Next.js dev server: `npm run dev`
3. In another terminal, expose port 3000: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. In Clerk Dashboard → Webhooks, add endpoint: `https://abc123.ngrok.io/api/webhooks/clerk`
6. Create a test user in Clerk and verify it appears in Supabase

### Production

1. Deploy your Next.js app
2. Add webhook endpoint in Clerk Dashboard
3. Test by creating/updating a user

## What Happens

### When a user is created (`user.created`)

1. Clerk sends webhook to `/api/webhooks/clerk`
2. Webhook verifies the signature
3. User data is synced to Supabase `users` table:
   - `clerk_user_id` = Clerk user ID
   - `email`, `full_name`, `phone`, `avatar_url` from Clerk
   - `role` from Clerk `publicMetadata.role` (defaults to 'employee')
   - `is_active` = true

### When a user is updated (`user.updated`)

1. Same process as creation
2. Updates existing user record in Supabase

### When a user is deleted (`user.deleted`)

1. Sets `is_active = false` in Supabase (soft delete)
2. Preserves user data for historical records

## Troubleshooting

### Webhook not receiving events

1. Check Clerk Dashboard → Webhooks → Logs for delivery status
2. Verify webhook URL is accessible (not behind firewall)
3. Check server logs for errors

### User not syncing to Supabase

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Check Supabase logs for errors
3. Ensure users table exists and has correct schema
4. Verify RLS policies allow service role operations

### Signature verification failing

1. Verify `CLERK_WEBHOOK_SECRET` matches the secret in Clerk Dashboard
2. Ensure you're using the signing secret, not the webhook URL

## Manual User Sync

You can also manually sync users:

```typescript
import { syncUserToSupabase } from '@/lib/user-sync'

// Sync a specific user
await syncUserToSupabase('user_123abc')
```

This is useful for:
- Migrating existing users
- Fixing sync issues
- Testing

## Security Notes

1. **Never commit** `CLERK_WEBHOOK_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` to git
2. Always verify webhook signatures (done automatically in the handler)
3. Use HTTPS for webhook endpoints
4. Service role key has full database access - keep it secret!

