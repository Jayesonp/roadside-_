import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { errorMessage, projectConfig, includeDetailedAnalysis } =
      await req.json();

    // Construct detailed prompt based on the specific error and project configuration
    let prompt = `URGENT EXPO PROJECT ERROR ANALYSIS REQUEST:

I need comprehensive analysis and step-by-step fixes for this Expo React Native project error:

ERROR MESSAGE:
${errorMessage}

`;

    if (projectConfig && includeDetailedAnalysis) {
      prompt += `PROJECT CONFIGURATION CONTEXT:

package.json dependencies:
${JSON.stringify(projectConfig.packageJson, null, 2)}

Babel Configuration:
${JSON.stringify(projectConfig.babelConfig, null, 2)}

Metro Configuration:
${JSON.stringify(projectConfig.metroConfig, null, 2)}

TypeScript Configuration:
${JSON.stringify(projectConfig.tsConfig, null, 2)}

`;
    }

    prompt += `ANALYSIS REQUIREMENTS:

1. ERROR ROOT CAUSE ANALYSIS:
   - Identify the exact cause of this error
   - Explain why this error occurs in Expo/React Native projects
   - Analyze any configuration conflicts or missing dependencies

2. STEP-BY-STEP DIAGNOSTIC PROCESS:
   - How to reproduce and verify this error
   - What files and configurations to check
   - How to isolate the problem

3. SPECIFIC FIXES (provide exact code/config changes):
   - Metro bundler configuration fixes
   - Babel preset and plugin adjustments
   - Package.json dependency updates
   - TypeScript configuration changes
   - File structure or import path corrections
   - Environment variable setup

4. PREVENTION STRATEGIES:
   - Best practices to avoid this error
   - Configuration recommendations
   - Development workflow improvements

5. RELATED ISSUES:
   - Common related errors that might occur
   - Additional troubleshooting steps

Provide ACTIONABLE, COPY-PASTE READY solutions with complete code examples. Focus on practical fixes that can be implemented immediately.`;

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
          role: "system",
          content:
            "You are an expert React Native and Expo developer with deep expertise in debugging Metro bundler errors, Babel transformation issues, TypeScript configuration problems, and Expo Router setup. You specialize in providing precise, actionable solutions for project loading and bundling errors. Always provide specific code examples and step-by-step fixes that developers can implement immediately.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
      return_citations: true,
      return_related_questions: true,
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
    const investigation =
      result.choices[0]?.message?.content || "No analysis available";

    // Extract suggested fixes from the investigation text
    const fixes = [];
    const fixSections = investigation.match(
      /(?:FIX|SOLUTION|STEP \d+):[^\n]*\n(?:[^\n]*\n)*/gi,
    );
    if (fixSections) {
      fixes.push(...fixSections.map((fix) => fix.trim()));
    }

    return new Response(
      JSON.stringify({
        success: true,
        scope: "Expo Project Error Analysis",
        investigation,
        citations: result.citations || [],
        relatedQuestions: result.related_questions || [],
        fixes:
          fixes.length > 0
            ? fixes
            : [
                "Check Metro bundler configuration for resolver issues",
                "Verify all package dependencies are properly installed",
                "Review Babel configuration for transformation conflicts",
                "Ensure TypeScript paths are correctly configured",
                "Clear Metro cache and restart development server",
              ],
        timestamp: new Date().toISOString(),
        errorAnalyzed: errorMessage,
        configIncluded: !!projectConfig,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error investigating Expo project errors:", error);

    return new Response(
      JSON.stringify({
        success: false,
        scope: "Expo Project Error Analysis",
        error: error.message || "Failed to analyze project error",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      },
    );
  }
});
