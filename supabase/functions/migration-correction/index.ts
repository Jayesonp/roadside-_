import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const url = "https://api.picaos.com/v1/passthrough/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
      "x-pica-connection-key":
        "live::perplexity::default::f15ef0b2ce07497299528750df4db97e|ad00c9b9-1ddf-4a3a-84b1-986a2ad3399d",
      "x-pica-action-id": "conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A",
    };

    const data = {
      model: "sonar",
      messages: [
        {
          role: "user",
          content:
            "Remake the changes to the Supabase migration file '20240322000001_create_admin_users_table.sql' to correctly implement the admin_users table schema and associated RLS policies. Ensure the table includes fields for id, email, name, role (with allowed values 'super_admin', 'admin', 'moderator'), permissions array, status (including 'active', 'inactive', 'suspended', 'pending'), last_login timestamp, password reset token and expiry, email_verified boolean, failed login attempts, locked_until timestamp, created_at and updated_at timestamps. Implement RLS policies for select, update, and all operations with proper role and status checks, including allowing user registration inserts. Insert a default super_admin user with email_verified set to true. Add a trigger function to update the updated_at timestamp on row updates. Provide the complete corrected SQL migration script with these changes.",
        },
      ],
      temperature: 0.2,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const correctedSQL = result.choices[0].message.content;

    return new Response(JSON.stringify({ sql: correctedSQL }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting corrected migration:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get corrected migration" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
