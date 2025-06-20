import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { errorDetails, componentCode } = await req.json();

    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
          "x-pica-connection-key":
            "live::perplexity::default::f15ef0b2ce07497299528750df4db97e|ad00c9b9-1ddf-4a3a-84b1-986a2ad3399d",
          "x-pica-action-id":
            "conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: `You are an expert React Native and Expo developer specializing in fixing Metro bundler and React Native rendering errors. I need you to analyze a SystemAlertsView component that has TWO CRITICAL ERRORS:

1. ENOENT: no such file or directory, open '/app-annotated/<anonymous>' - Metro bundler error
2. Unexpected text node: . A text node cannot be a child of a <View> - React Native rendering error

The component is part of an admin dashboard for a roadside assistance app built with Expo, React Native, and NativeWind (Tailwind CSS).

PLEASE FOCUS SPECIFICALLY ON:
1. Metro bundler file resolution issues and anonymous file path problems
2. Source map generation issues that cause ENOENT errors
3. React Native text rendering - ALL text must be wrapped in <Text> components
4. StyleSheet vs className conflicts that cause bundler issues
5. Import/export problems that create anonymous references
6. Event handler anonymous function issues
7. useEffect cleanup and memory leak prevention
8. NativeWind className usage vs React Native StyleSheet conflicts

Provide SPECIFIC, ACTIONABLE CODE FIXES for both the ENOENT error and the text node error. Include complete corrected code sections, not just descriptions.`,
            },
            {
              role: "user",
              content: `URGENT: Fix these TWO CRITICAL ERRORS in the SystemAlertsView component:

1. ENOENT: no such file or directory, open '/app-annotated/<anonymous>' - Metro bundler error
2. Unexpected text node: . A text node cannot be a child of a <View> - React Native rendering error

Component code to analyze:
\`\`\`typescript
${componentCode}
\`\`\`

Error details: ${errorDetails}

PROVIDE SPECIFIC FIXES FOR:
1. Metro bundler anonymous file resolution issues
2. All text nodes that need <Text> wrapper components
3. StyleSheet vs className conflicts
4. Import/export issues causing anonymous references
5. Complete corrected code sections for both errors

Focus on ACTIONABLE CODE CHANGES, not just explanations.`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.2,
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
        analysis: data.choices[0]?.message?.content || "No analysis available",
        citations: data.citations || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in system-alerts-error-analysis:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
