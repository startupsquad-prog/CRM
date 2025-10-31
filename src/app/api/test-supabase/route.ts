import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{ name: string; status: "pass" | "fail"; message: string; details?: any }>,
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  // Test 1: Environment Variables
  results.tests.push({
    name: "Environment Variables",
    status: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
      ? "pass" 
      : "fail",
    message: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "Environment variables are configured"
      : "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    results.summary.total = results.tests.length;
    results.summary.failed = results.tests.filter(t => t.status === "fail").length;
    results.summary.passed = results.tests.filter(t => t.status === "pass").length;
    return NextResponse.json(results, { status: 500 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // Test 2: Server Connection
    try {
      // Try to access a non-existent table to test connection
      // This will fail gracefully if connection works
      const { error: connectionError } = await supabase
        .from("__test_connection__")
        .select("*")
        .limit(1);

      // Any error that's not "table doesn't exist" is a real connection issue
      if (connectionError && !connectionError.message.includes("does not exist") && connectionError.code !== "PGRST116") {
        throw connectionError;
      }

      results.tests.push({
        name: "Server Connection",
        status: "pass",
        message: "Successfully connected to Supabase server",
      });
    } catch (error: any) {
      results.tests.push({
        name: "Server Connection",
        status: "fail",
        message: error.message || "Failed to connect to server",
        details: error.code,
      });
    }

    // Test 3: Auth Module
    try {
      const { data: session, error: authError } = await supabase.auth.getSession();
      
      if (authError && !authError.message.includes("No session")) {
        throw authError;
      }

      results.tests.push({
        name: "Auth Module",
        status: "pass",
        message: "Auth module is accessible",
        details: {
          hasSession: !!session?.session,
        },
      });
    } catch (error: any) {
      results.tests.push({
        name: "Auth Module",
        status: "fail",
        message: error.message || "Auth module not accessible",
        details: error.code,
      });
    }

    // Test 4: Storage Module
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();

      if (storageError) {
        throw storageError;
      }

      results.tests.push({
        name: "Storage Module",
        status: "pass",
        message: "Storage module is accessible",
        details: {
          bucketCount: buckets?.length || 0,
        },
      });
    } catch (error: any) {
      results.tests.push({
        name: "Storage Module",
        status: "fail",
        message: error.message || "Storage module not accessible",
        details: error.code,
      });
    }

    // Test 5: Database Query (if we have tables)
    try {
      // Try to query a test table - this will fail if no tables exist, which is okay
      const { error: queryError } = await supabase
        .from("_supabase_migrations")
        .select("version")
        .limit(1);

      if (queryError && queryError.code === "PGRST116") {
        // Table doesn't exist - this is expected in new projects
        results.tests.push({
          name: "Database Query",
          status: "pass",
          message: "Database connection verified (no migrations table found - expected for new projects)",
        });
      } else if (queryError) {
        throw queryError;
      } else {
        results.tests.push({
          name: "Database Query",
          status: "pass",
          message: "Database queries are working",
        });
      }
    } catch (error: any) {
      results.tests.push({
        name: "Database Query",
        status: "fail",
        message: error.message || "Database query failed",
        details: error.code,
      });
    }

  } catch (error: any) {
    results.tests.push({
      name: "General Connection",
      status: "fail",
      message: error.message || "Unexpected error during testing",
      details: error,
    });
  }

  // Calculate summary
  results.summary.total = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.status === "pass").length;
  results.summary.failed = results.tests.filter(t => t.status === "fail").length;

  const status = results.summary.failed > 0 ? 500 : 200;

  return NextResponse.json(results, { status });
}

