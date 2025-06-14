import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      errorDetails,
      errorType = "general",
      projectStructure,
    } = await req.json();

    if (!errorDetails) {
      return new Response(
        JSON.stringify({ error: "Error details are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

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
                "You are an expert React Native and Expo developer specializing in debugging and fixing errors. Provide detailed, step-by-step analysis and solutions.",
            },
            {
              role: "user",
              content: `Analyze and provide a fix for the following error in a React Native Expo application:\n\n${errorDetails}\n\n${projectStructure ? `Project context:\n${projectStructure}\n\n` : ""}The user is conditionally loading react-native-chart-kit charts (LineChart, BarChart, PieChart, ProgressChart) and wants to handle cases where the chart kit is not available gracefully. The fix should include:\n1) Adding a flag to detect if react-native-chart-kit is available,\n2) Updating the conditional rendering logic to check this flag before rendering charts,\n3) Displaying appropriate fallback UI messages when charts are loading or not available,\n4) Ensuring the AdminDashboard component handles screen width responsiveness for chart sizes,\n5) Integrating error handling in the main app index to catch rendering errors and display a fallback UI,\n6) Using the Perplexity connection to analyze and fix errors related to chart rendering and module resolution.\n\nProvide code snippets for the str_replace commands to update AdminDashboard.tsx and app/index.tsx as described.`,
            },
          ],
          temperature: 0.2,
          return_citations: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        analysis: data.choices[0]?.message?.content || "No analysis available",
        citations: data.citations || [],
        errorType,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error analyzing with Perplexity:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze error with Perplexity",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
