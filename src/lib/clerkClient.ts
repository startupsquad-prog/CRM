import { Clerk } from '@clerk/nextjs/server';

export function getClerkServer() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing CLERK_SECRET_KEY');
  }
  return Clerk({ secretKey });
}

export function getClerkPublishableKey() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  return key;
}


