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
    const { code, componentName } = await req.json();

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
              content: `URGENT ERROR DETECTION REQUEST: Please perform an exhaustive error analysis of this ${componentName} React Native component. I need you to identify ALL errors, bugs, and issues - no matter how small.

FOCUS ON FINDING:
1. SYNTAX ERRORS - Any code that won't compile
2. TYPE ERRORS - TypeScript type mismatches, missing types
3. RUNTIME ERRORS - Code that will crash at runtime
4. IMPORT/EXPORT ERRORS - Missing imports, incorrect paths
5. UNDEFINED VARIABLES - Variables used but not defined
6. ASYNC/AWAIT ISSUES - Promise handling problems
7. STATE MANAGEMENT ERRORS - useState, useEffect issues
8. EVENT HANDLER PROBLEMS - Incorrect event handling
9. PERFORMANCE ISSUES - Memory leaks, unnecessary re-renders
10. PLATFORM COMPATIBILITY - Cross-platform issues

For EVERY error found:
- Show the EXACT problematic code
- Explain WHY it's an error
- Provide the COMPLETE fix
- Rate severity (CRITICAL/HIGH/MEDIUM/LOW)

Component: ${componentName}
Code to analyze:

\`\`\`typescript
${code}
\`\`\`

Be extremely thorough - assume this code has multiple errors that need immediate fixing. Provide step-by-step fixes for each issue.`,
            },
          ],
          return_related_questions: true,
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
        review: data.choices[0].message.content,
        citations: data.citations || [],
        relatedQuestions: data.related_questions || [],
        usage: data.usage,
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
    console.error("Error during code review:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      },
    );
  }
});
