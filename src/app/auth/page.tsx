"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useMemo } from "react";

export default function AuthPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({ provider: "github" });
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <button
        className="mt-4 rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        onClick={signInWithGithub}
      >
        Continue with GitHub
      </button>
    </main>
  );
}



