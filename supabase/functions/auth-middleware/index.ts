import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "@shared/cors.ts";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "moderator";
  permissions: string[];
  status: string;
  last_login: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify the JWT token
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get admin user profile
    const { data: adminUser, error: profileError } = await supabaseClient
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !adminUser) {
      return new Response(
        JSON.stringify({ error: "Admin user not found or inactive" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user account is active
    if (adminUser.status !== "active") {
      return new Response(
        JSON.stringify({
          error: "Account is inactive",
          status: adminUser.status,
          message:
            adminUser.status === "pending"
              ? "Your account is pending approval. Please contact an administrator."
              : "Your account has been suspended. Please contact an administrator.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update last login timestamp
    await supabaseClient
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Return user profile
    const userProfile: AdminUser = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      permissions: adminUser.permissions || [],
      status: adminUser.status,
      last_login: adminUser.last_login || new Date().toISOString(),
    };

    return new Response(JSON.stringify({ user: userProfile }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
