import { corsHeaders } from "@shared/cors.ts";

interface CodeReviewRequest {
  components: Array<{
    name: string;
    code: string;
    filePath: string;
  }>;
  reviewType: "individual" | "comprehensive";
}

interface ComponentReview {
  componentName: string;
  filePath: string;
  issues: Array<{
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    line?: number;
    fix: string;
  }>;
  fixedCode: string;
  summary: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { components, reviewType }: CodeReviewRequest = await req.json();

    const reviews: ComponentReview[] = [];

    for (const component of components) {
      console.log(`Reviewing component: ${component.name}`);

      const reviewPrompt = `You are an expert React Native/TypeScript error detection specialist and code reviewer. Your primary job is to identify ALL errors, bugs, and issues in code - from critical syntax errors to subtle runtime problems. You excel at finding compilation errors, type mismatches, missing imports, undefined variables, async/await issues, state management problems, and performance bottlenecks. Provide extremely detailed error analysis with precise fixes.

PRIMARY FOCUS - ERROR IDENTIFICATION:
1. Syntax errors and compilation issues
2. Runtime errors and exceptions
3. Type errors and TypeScript issues
4. Import/export errors
5. Missing dependencies or undefined variables
6. Async/await and Promise handling errors
7. State management errors
8. Event handler errors
9. Memory leaks and performance issues
10. Platform-specific compatibility errors

SECONDARY ANALYSIS:
- Performance bottlenecks
- Accessibility compliance
- Security vulnerabilities
- Code maintainability
- Best practices violations

For EACH ERROR/ISSUE found:
- Identify the EXACT line or code block with the error
- Explain WHY it's an error and what problems it causes
- Provide the EXACT fix with complete code snippets
- Rate severity: CRITICAL (breaks app), HIGH (causes crashes), MEDIUM (degrades performance), LOW (style/best practice)

Component: ${component.name}
File: ${component.filePath}

Code to analyze for errors:
\`\`\`typescript
${component.code}
\`\`\`

STRUCTURE YOUR RESPONSE AS:
1. CRITICAL ERRORS (must fix immediately)
2. HIGH PRIORITY ERRORS (causes crashes/major issues)
3. MEDIUM PRIORITY ISSUES (performance/functionality problems)
4. LOW PRIORITY IMPROVEMENTS (best practices)
5. COMPLETE FIXED CODE (fully corrected component)
6. ERROR SUMMARY (brief overview of all fixes applied)

Be extremely thorough in error detection - assume this code has multiple issues that need fixing.`;

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
                content:
                  "You are an expert React Native/TypeScript error detection specialist and code reviewer. Your primary job is to identify ALL errors, bugs, and issues in code - from critical syntax errors to subtle runtime problems. You excel at finding compilation errors, type mismatches, missing imports, undefined variables, async/await issues, state management problems, and performance bottlenecks. Provide extremely detailed error analysis with precise fixes.",
              },
              {
                role: "user",
                content: reviewPrompt,
              },
            ],
            max_tokens: 6000,
            temperature: 0.1,
            top_p: 0.8,
            return_related_questions: true,
            stream: false,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Perplexity API error for ${component.name}: ${response.status}`,
        );
      }

      const data = await response.json();
      const reviewContent = data.choices[0].message.content;

      // Parse the review content to extract structured information
      const issues = parseIssues(reviewContent);
      const fixedCode = extractFixedCode(reviewContent);
      const summary = extractSummary(reviewContent);

      reviews.push({
        componentName: component.name,
        filePath: component.filePath,
        issues,
        fixedCode: fixedCode || component.code,
        summary: summary || "Review completed",
      });

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Generate comprehensive report
    const overallReport = generateOverallReport(reviews);

    return new Response(
      JSON.stringify({
        success: true,
        reviews,
        overallReport,
        totalComponents: components.length,
        totalIssues: reviews.reduce(
          (sum, review) => sum + review.issues.length,
          0,
        ),
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
    console.error("Error during comprehensive code review:", error);
    return new Response(
      JSON.stringify({
        success: false,
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

function parseIssues(reviewContent: string): Array<{
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  line?: number;
  fix: string;
}> {
  const issues = [];
  const lines = reviewContent.split("\n");
  let currentIssue: any = null;

  for (const line of lines) {
    if (
      line.includes("CRITICAL:") ||
      line.includes("HIGH:") ||
      line.includes("MEDIUM:") ||
      line.includes("LOW:")
    ) {
      if (currentIssue) {
        issues.push(currentIssue);
      }

      const severity = line.includes("CRITICAL:")
        ? "critical"
        : line.includes("HIGH:")
          ? "high"
          : line.includes("MEDIUM:")
            ? "medium"
            : "low";

      currentIssue = {
        type: "Code Issue",
        severity,
        description: line.replace(/^.*?(CRITICAL|HIGH|MEDIUM|LOW):\s*/, ""),
        fix: "",
      };
    } else if (currentIssue && line.trim()) {
      if (line.includes("Fix:") || line.includes("Solution:")) {
        currentIssue.fix = line.replace(/^.*?(Fix|Solution):\s*/, "");
      } else if (!currentIssue.fix) {
        currentIssue.description += " " + line.trim();
      }
    }
  }

  if (currentIssue) {
    issues.push(currentIssue);
  }

  return issues;
}

function extractFixedCode(reviewContent: string): string | null {
  const codeBlockRegex =
    /```(?:typescript|tsx|javascript|jsx)?\n([\s\S]*?)\n```/g;
  const matches = [...reviewContent.matchAll(codeBlockRegex)];

  // Return the largest code block (likely the fixed component)
  if (matches.length > 0) {
    return matches.reduce(
      (longest, current) =>
        current[1].length > longest.length ? current[1] : longest,
      "",
    );
  }

  return null;
}

function extractSummary(reviewContent: string): string | null {
  const summaryMatch = reviewContent.match(
    /SUMMARY[:\s]*([\s\S]*?)(?=\n\n|$)/i,
  );
  return summaryMatch ? summaryMatch[1].trim() : null;
}

function generateOverallReport(reviews: ComponentReview[]): {
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  mostProblematicComponents: string[];
  commonIssues: string[];
  recommendations: string[];
} {
  const allIssues = reviews.flatMap((review) => review.issues);

  const criticalIssues = allIssues.filter(
    (issue) => issue.severity === "critical",
  ).length;
  const highIssues = allIssues.filter(
    (issue) => issue.severity === "high",
  ).length;
  const mediumIssues = allIssues.filter(
    (issue) => issue.severity === "medium",
  ).length;
  const lowIssues = allIssues.filter(
    (issue) => issue.severity === "low",
  ).length;

  const componentIssueCount = reviews
    .map((review) => ({
      name: review.componentName,
      count: review.issues.length,
    }))
    .sort((a, b) => b.count - a.count);

  const mostProblematicComponents = componentIssueCount
    .slice(0, 3)
    .map((c) => c.name);

  const issueTypes = allIssues.map((issue) => issue.type);
  const commonIssues = [...new Set(issueTypes)].slice(0, 5);

  const recommendations = [
    "Implement proper error boundaries for better error handling",
    "Add comprehensive TypeScript types for better type safety",
    "Optimize component re-renders with React.memo and useMemo",
    "Improve accessibility with proper ARIA labels and roles",
    "Add proper cleanup in useEffect hooks to prevent memory leaks",
  ];

  return {
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues,
    mostProblematicComponents,
    commonIssues,
    recommendations,
  };
}
