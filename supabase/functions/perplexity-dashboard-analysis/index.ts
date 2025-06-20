import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { componentCode, analysisType = "design-review" } = await req.json();

    if (!componentCode) {
      return new Response(
        JSON.stringify({ error: "Component code is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const analysisPrompts = {
      "design-review": `Analyze this React Native TechnicianDashboard component for design improvements, organization, and mobile responsiveness:\n\n${componentCode}\n\nProvide specific recommendations for:\n1. Component structure and organization\n2. Mobile responsiveness improvements\n3. UI/UX design enhancements\n4. Performance optimizations\n5. Code quality and maintainability\n6. Accessibility improvements\n7. Error handling and edge cases\n\nFocus on practical, actionable suggestions with specific code examples where applicable.`,
      "mobile-responsive": `Review this React Native component for mobile responsiveness issues:\n\n${componentCode}\n\nAnalyze and provide solutions for:\n1. Screen size adaptability\n2. Touch target sizes\n3. Layout flexibility\n4. Text scaling\n5. Navigation usability on mobile\n6. Performance on mobile devices`,
      "error-analysis": `Examine this React Native component for potential errors and issues:\n\n${componentCode}\n\nIdentify:\n1. Potential runtime errors\n2. Memory leaks\n3. Performance bottlenecks\n4. State management issues\n5. Prop validation problems\n6. Accessibility violations`,
    };

    const prompt =
      analysisPrompts[analysisType as keyof typeof analysisPrompts] ||
      analysisPrompts["design-review"];

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
              content: prompt,
            },
          ],
          max_tokens: 4000,
          temperature: 0.2,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Perplexity API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        analysis: data.choices[0]?.message?.content || "No analysis available",
        citations: data.citations || [],
        usage: data.usage || {},
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in perplexity-dashboard-analysis:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze dashboard component",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
