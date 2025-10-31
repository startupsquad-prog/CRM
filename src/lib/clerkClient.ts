/**
 * Clerk helper utilities
 * Note: In Clerk v6+, use clerkClient directly from @clerk/nextjs/server
 * instead of creating a custom client instance.
 */

export function getClerkPublishableKey() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  return key;
}



