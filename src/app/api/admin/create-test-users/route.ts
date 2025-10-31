import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// POST /api/admin/create-test-users - Create test users for development
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      )
    }

    const testUsers = [
      {
        email: "admin@crm-test.com",
        password: "Admin123!@#",
        firstName: "Admin",
        lastName: "User",
        role: "admin" as const,
        description: "Admin user with full access"
      },
      {
        email: "employee@crm-test.com",
        password: "Employee123!@#",
        firstName: "Employee",
        lastName: "User",
        role: "employee" as const,
        description: "Employee user with limited access"
      },
      {
        email: "manager@crm-test.com",
        password: "Manager123!@#",
        firstName: "Manager",
        lastName: "User",
        role: "employee" as const,
        description: "Manager user (employee role)"
      }
    ];

    const results = [];
    const supabase = createServerSupabaseClient();

    for (const userData of testUsers) {
      try {
        // Create user in Clerk
        const clerkUser = await clerkClient.users.createUser({
          emailAddresses: [userData.email],
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          publicMetadata: {
            role: userData.role
          },
          skipPasswordChecks: true, // Allow for testing
        });

        // Sync to Supabase
        const supabaseUserData = {
          clerk_user_id: clerkUser.id,
          email: userData.email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          phone: null,
          avatar_url: clerkUser.imageUrl || null,
          is_active: !clerkUser.banned,
        };

        const { error: supabaseError } = await supabase
          .from('users')
          .upsert(supabaseUserData, {
            onConflict: 'clerk_user_id'
          });

        results.push({
          email: userData.email,
          password: userData.password,
          role: userData.role,
          clerkId: clerkUser.id,
          success: true,
          supabaseError: supabaseError?.message
        });
      } catch (error: any) {
        if (error.errors) {
          const existingUser = error.errors.find((e: any) => e.message?.includes('already'));
          if (existingUser) {
            results.push({
              email: userData.email,
              role: userData.role,
              success: false,
              error: 'User already exists'
            });
            continue;
          }
        }
        results.push({
          email: userData.email,
          role: userData.role,
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Test users creation completed',
      results,
      summary: {
        total: testUsers.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/create-test-users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

