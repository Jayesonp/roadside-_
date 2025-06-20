import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { errorDetails, projectConfig } = await req.json();

    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
          "x-pica-connection-key": Deno.env.get(
            "PICA_PERPLEXITY_CONNECTION_KEY",
          )!,
          "x-pica-action-id":
            "conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "user",
              content: `URGENT METRO BUNDLER TROUBLESHOOTING REQUEST:

I need a comprehensive, step-by-step investigation and fix for critical Metro bundler serialization errors in a React Native Expo project.

CURRENT ERROR:
${errorDetails}

PROJECT CONFIGURATION:
${JSON.stringify(projectConfig, null, 2)}

SPECIFIC REQUIREMENTS:

1. DETAILED ROOT CAUSE ANALYSIS:
   - Why does Metro bundler fail with "Serializer did not return expected format" error?
   - What causes "Unexpected token 'v', 'var __BUND'... is not valid JSON" errors?
   - How do OCI runtime errors relate to Metro serialization issues?
   - What are the common causes of expo/metro-config compatibility problems?

2. STEP-BY-STEP DIAGNOSTIC PROCESS:
   - How to identify which specific Metro configuration is causing the issue
   - How to verify dependency compatibility between Expo, Metro, and React Native
   - How to detect corrupted cache files and build artifacts
   - How to isolate serializer vs transformer vs resolver issues

3. COMPREHENSIVE FIX STRATEGY (provide exact commands):
   - Dependency update and compatibility verification commands
   - Metro configuration simplification and standardization
   - Cache clearing procedures (Metro, Expo, Node modules)
   - Development server restart procedures
   - Fallback configurations for resource-constrained environments

4. PREVENTION AND OPTIMIZATION:
   - Best practices for Metro configuration in Expo projects
   - How to avoid serialization conflicts with NativeWind and custom transformers
   - Resource optimization for Docker/container environments
   - Long-term maintenance strategies

5. TROUBLESHOOTING CHECKLIST:
   - Terminal commands to verify each fix step
   - How to validate that the fix is working
   - Common follow-up issues and their solutions

Provide ACTIONABLE, COPY-PASTE READY terminal commands and configuration changes. Focus on ensuring the project loads easily and terminal commands work reliably. Include explanations for why each step is necessary.

The goal is to have a working Expo development server that starts without errors and loads the project successfully.`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        investigation:
          data.choices[0]?.message?.content || "No analysis available",
        citations: data.citations || [],
        usage: data.usage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in metro-bundler-troubleshoot:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
