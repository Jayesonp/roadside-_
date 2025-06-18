import { createClient } from "@supabase/supabase-js";

// Use fallback values if environment variables are not set
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://demo.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "demo-key";

// Check if we have valid Supabase credentials
const hasValidCredentials =
  supabaseUrl !== "https://demo.supabase.co" &&
  supabaseAnonKey !== "demo-key" &&
  supabaseUrl.includes("supabase.co");

if (!hasValidCredentials) {
  console.warn("⚠️ Supabase credentials not configured. Using demo mode.");
  console.log("To fix this:");
  console.log("1. Create a Supabase project at https://supabase.com");
  console.log("2. Add your credentials to .env file:");
  console.log("   EXPO_PUBLIC_SUPABASE_URL=your-project-url");
  console.log("   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: hasValidCredentials,
    persistSession: hasValidCredentials,
    detectSessionInUrl: false,
  },
});

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasValidCredentials;
