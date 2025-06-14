import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { errorMessage } = await req.json();

    if (!errorMessage) {
      return new Response(
        JSON.stringify({ error: "Error message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          "x-pica-connection-key":
            "live::perplexity::default::f15ef0b2ce07497299528750df4db97e|ad00c9b9-1ddf-4a3a-84b1-986a2ad3399d",
          "x-pica-action-id":
            "conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "user",
              content: `I encountered an error message when trying to load my project on Expo. Please analyze the following error message and provide detailed diagnostic insights and recommended fixes to resolve the loading error:\n\n${errorMessage}`,
            },
          ],
          temperature: 0.2,
          return_citations: true,
          return_related_questions: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        analysis: data.choices[0]?.message?.content || "No analysis received",
        citations: data.citations || [],
        relatedQuestions: data.related_questions || [],
        usage: data.usage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error analyzing Expo error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze Expo error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
