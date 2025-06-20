import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { componentCode, componentName } = await req.json();

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
              role: "system",
              content:
                'You are a React Native mobile responsiveness expert. Analyze the provided component code and provide detailed instructions and code changes to fix the "Unexpected text node" errors and improve mobile responsiveness. Focus on wrapping all text nodes properly in Text components, removing problematic emoji concatenations, improving flex layouts, text sizing, touch targets, spacing, scroll optimization, and accessibility. Include specific Tailwind CSS class recommendations and React Native best practices. Also address common runtime errors and Metro bundler issues related to text nodes and file system errors.',
            },
            {
              role: "user",
              content: `Here is the ${componentName} component code to analyze and fix:\n\n${componentCode}\n\nPlease provide detailed fixes and recommendations.`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.2,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        componentName,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Mobile responsiveness analysis error:", error);
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
