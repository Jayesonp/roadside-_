import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const errorDetails = await req.json();

    // Construct the AI prompt for troubleshooting
    const troubleshootingPrompt = `You are an expert React Native and Expo troubleshooting assistant. Analyze the following error details and provide a comprehensive troubleshooting guide.

Error Details:
- Error Type: ${errorDetails.errorType}
- Error Message: ${errorDetails.errorMessage}
- Component: ${errorDetails.componentName}
- Context: ${errorDetails.context}
- Platform: ${errorDetails.environmentInfo?.platform}
- Authentication Status: ${errorDetails.sessionInfo?.isAuthenticated ? "Authenticated" : "Not Authenticated"}
- Network Status: ${errorDetails.environmentInfo?.networkOnline ? "Online" : "Offline"}
- Stack Trace: ${errorDetails.stackTrace}

Session Info:
${JSON.stringify(errorDetails.sessionInfo, null, 2)}

Environment Info:
${JSON.stringify(errorDetails.environmentInfo, null, 2)}

Please provide:
1. Root cause analysis
2. Step-by-step troubleshooting guide
3. Quick fixes
4. Prevention tips
5. Severity assessment

Format your response as a structured troubleshooting guide.`;

    // Call Perplexity AI via PICA passthrough
    const perplexityResponse = await fetch(
      "https://api.picaos.com/v1/passthrough/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
          "x-pica-connection-key": Deno.env.get(
            "PICA_PERPLEXITY_CONNECTION_KEY",
          )!,
          "x-pica-action-id": "conn_mod_def::GCY0iKGks::TKAh9sv2Ts2HJdLJc5a60A",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "user",
              content: troubleshootingPrompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          frequency_penalty: 1,
        }),
      },
    );

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const aiResponse = await perplexityResponse.json();
    const troubleshootingContent =
      aiResponse.choices?.[0]?.message?.content || "";

    // Parse and structure the AI response
    const structuredGuide = {
      troubleshootingGuide: troubleshootingContent,
      specificSteps: extractSteps(troubleshootingContent),
      possibleCauses: extractCauses(troubleshootingContent),
      quickFixes: extractQuickFixes(troubleshootingContent),
      preventionTips: extractPreventionTips(troubleshootingContent),
      severity: determineSeverity(errorDetails),
      estimatedFixTime: estimateFixTime(errorDetails),
      requiresRestart: requiresRestart(errorDetails),
    };

    return new Response(JSON.stringify(structuredGuide), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Troubleshooting function error:", error);

    // Return fallback guide on error
    const fallbackGuide = {
      troubleshootingGuide: `# Technician Dashboard Troubleshooting Guide\n\nAn error occurred while generating the AI troubleshooting guide. Here are some general troubleshooting steps:\n\n## Quick Actions\n- Restart the development server\n- Clear browser cache and hard refresh\n- Check network connectivity\n- Verify environment variables`,
      specificSteps: [
        "Check browser console for detailed error messages",
        "Restart Expo development server with 'npx expo start --clear'",
        "Clear browser cache and hard refresh (Ctrl+F5)",
        "Verify Supabase environment variables are configured",
        "Test authentication status",
        "Check network connectivity",
      ],
      possibleCauses: [
        "Network connectivity issues",
        "Authentication session expired",
        "Environment configuration problems",
        "Component lifecycle issues",
      ],
      quickFixes: [
        "Hard refresh the browser",
        "Restart development server",
        "Sign out and sign back in",
        "Check environment variables",
      ],
      preventionTips: [
        "Implement proper error boundaries",
        "Add comprehensive logging",
        "Use proper cleanup in useEffect hooks",
        "Monitor component lifecycle",
      ],
      severity: "medium",
      estimatedFixTime: "5-15 minutes",
      requiresRestart: true,
      fallbackGuide: true,
    };

    return new Response(JSON.stringify(fallbackGuide), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  }
});

// Helper functions to extract structured information from AI response
function extractSteps(content: string): string[] {
  const stepRegex = /(?:step|\d+\.|-)\s*(.+?)(?=\n|$)/gi;
  const matches = content.match(stepRegex) || [];
  return matches
    .map((step) => step.replace(/^(?:step|\d+\.|-)\s*/i, "").trim())
    .slice(0, 10);
}

function extractCauses(content: string): string[] {
  const causeSection =
    content.match(
      /(?:possible causes?|root causes?)[\s\S]*?(?=\n\n|$)/i,
    )?.[0] || "";
  const causes = causeSection.match(/(?:-|\*|\d+\.)\s*(.+?)(?=\n|$)/g) || [];
  return causes
    .map((cause) => cause.replace(/^(?:-|\*|\d+\.)\s*/, "").trim())
    .slice(0, 8);
}

function extractQuickFixes(content: string): string[] {
  const fixSection =
    content.match(
      /(?:quick fixes?|immediate actions?)[\s\S]*?(?=\n\n|$)/i,
    )?.[0] || "";
  const fixes = fixSection.match(/(?:-|\*|\d+\.)\s*(.+?)(?=\n|$)/g) || [];
  return fixes
    .map((fix) => fix.replace(/^(?:-|\*|\d+\.)\s*/, "").trim())
    .slice(0, 8);
}

function extractPreventionTips(content: string): string[] {
  const preventionSection =
    content.match(/(?:prevention|best practices?)[\s\S]*?(?=\n\n|$)/i)?.[0] ||
    "";
  const tips = preventionSection.match(/(?:-|\*|\d+\.)\s*(.+?)(?=\n|$)/g) || [];
  return tips
    .map((tip) => tip.replace(/^(?:-|\*|\d+\.)\s*/, "").trim())
    .slice(0, 8);
}

function determineSeverity(errorDetails: any): string {
  const errorType = errorDetails.errorType?.toLowerCase() || "";
  const errorMessage = errorDetails.errorMessage?.toLowerCase() || "";

  if (errorType.includes("syntax") || errorMessage.includes("syntax")) {
    return "high";
  }
  if (errorType.includes("network") || errorMessage.includes("network")) {
    return "medium";
  }
  if (errorType.includes("auth") || errorMessage.includes("auth")) {
    return "high";
  }

  return "medium";
}

function estimateFixTime(errorDetails: any): string {
  const severity = determineSeverity(errorDetails);

  switch (severity) {
    case "high":
      return "15-30 minutes";
    case "medium":
      return "5-15 minutes";
    default:
      return "2-10 minutes";
  }
}

function requiresRestart(errorDetails: any): boolean {
  const errorType = errorDetails.errorType?.toLowerCase() || "";
  const errorMessage = errorDetails.errorMessage?.toLowerCase() || "";

  return (
    errorType.includes("syntax") ||
    errorType.includes("bundl") ||
    errorMessage.includes("metro") ||
    errorMessage.includes("bundl")
  );
}
