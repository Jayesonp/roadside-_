import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { authIssue, errorDetails, userAgent, platform } = await req.json();

    // Analyze authentication issues using Perplexity-style analysis
    const analysisPrompt = `
      Analyze this authentication issue for a React Native/Expo admin dashboard:
      
      Issue: ${authIssue}
      Error Details: ${JSON.stringify(errorDetails, null, 2)}
      User Agent: ${userAgent}
      Platform: ${platform}
      
      Provide a detailed analysis including:
      1. Root cause identification
      2. Platform-specific considerations (desktop vs mobile)
      3. Supabase authentication flow issues
      4. React Native rendering problems
      5. Step-by-step debugging approach
      6. Recommended fixes with code examples
      
      Focus on common issues like:
      - Session persistence problems
      - RLS policy conflicts
      - Email verification flow
      - Desktop browser compatibility
      - React Native Web rendering issues
    `;

    // Simulate comprehensive analysis (in production, this would call Perplexity API)
    const analysis = {
      rootCause: identifyRootCause(authIssue, errorDetails),
      platformIssues: analyzePlatformIssues(platform, userAgent),
      supabaseIssues: analyzeSupabaseIssues(errorDetails),
      renderingIssues: analyzeRenderingIssues(authIssue, platform),
      debuggingSteps: generateDebuggingSteps(authIssue),
      recommendedFixes: generateRecommendedFixes(authIssue, errorDetails),
      preventionMeasures: generatePreventionMeasures(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Auth debug analysis error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function identifyRootCause(authIssue: string, errorDetails: any): string {
  const commonIssues = {
    rendering:
      "React Native Web rendering incompatibility with desktop browsers",
    session: "Supabase session persistence or RLS policy conflicts",
    validation: "Form validation or input handling issues",
    network: "Network connectivity or CORS configuration problems",
    email: "Email verification flow or SMTP configuration issues",
  };

  for (const [key, cause] of Object.entries(commonIssues)) {
    if (
      authIssue.toLowerCase().includes(key) ||
      JSON.stringify(errorDetails).toLowerCase().includes(key)
    ) {
      return cause;
    }
  }

  return "Unknown authentication issue - requires detailed investigation";
}

function analyzePlatformIssues(platform: string, userAgent: string): any {
  const isDesktop =
    platform === "web" ||
    userAgent.includes("Chrome") ||
    userAgent.includes("Firefox");

  return {
    platform: platform,
    isDesktop: isDesktop,
    issues: isDesktop
      ? [
          "React Native Web may have styling inconsistencies on desktop",
          "Touch events might not work properly with mouse interactions",
          "Viewport sizing issues with responsive design",
          "Browser-specific CSS rendering differences",
        ]
      : [
          "Mobile-specific touch handling",
          "Keyboard behavior differences",
          "Screen size adaptations",
        ],
    recommendations: isDesktop
      ? [
          "Test with different desktop browsers",
          "Verify CSS-in-JS compatibility",
          "Check for hover state issues",
          "Validate form input focus behavior",
        ]
      : [
          "Test on different mobile devices",
          "Verify touch interactions",
          "Check keyboard overlay behavior",
        ],
  };
}

function analyzeSupabaseIssues(errorDetails: any): any {
  const errorString = JSON.stringify(errorDetails).toLowerCase();

  const issues = [];
  const fixes = [];

  if (errorString.includes("rls") || errorString.includes("policy")) {
    issues.push("Row Level Security policy conflicts");
    fixes.push("Review and update RLS policies for admin_users table");
  }

  if (errorString.includes("email") || errorString.includes("verification")) {
    issues.push("Email verification flow problems");
    fixes.push("Check SMTP configuration and email templates");
  }

  if (errorString.includes("session") || errorString.includes("token")) {
    issues.push("Session management or token handling issues");
    fixes.push("Verify session persistence and token refresh logic");
  }

  return {
    detectedIssues: issues,
    recommendedFixes: fixes,
    configurationChecks: [
      "Verify SUPABASE_URL and SUPABASE_ANON_KEY environment variables",
      "Check Supabase project settings and authentication providers",
      "Validate database schema and RLS policies",
      "Test email delivery and verification links",
    ],
  };
}

function analyzeRenderingIssues(authIssue: string, platform: string): any {
  const isRenderingIssue =
    authIssue.toLowerCase().includes("render") ||
    authIssue.toLowerCase().includes("display") ||
    authIssue.toLowerCase().includes("ui");

  if (!isRenderingIssue) {
    return { hasRenderingIssues: false };
  }

  return {
    hasRenderingIssues: true,
    commonCauses: [
      "React Native Web CSS-in-JS compilation issues",
      "Tailwind CSS class conflicts or missing styles",
      "Component state management problems",
      "Async rendering and loading state handling",
    ],
    debuggingApproach: [
      "Check browser developer tools for CSS errors",
      "Verify component mounting and unmounting cycles",
      "Test with simplified component versions",
      "Validate prop passing and state updates",
    ],
    fixes: [
      "Add explicit style props for critical elements",
      "Implement proper loading states and error boundaries",
      "Use platform-specific styling when necessary",
      "Add key props to prevent React reconciliation issues",
    ],
  };
}

function generateDebuggingSteps(authIssue: string): string[] {
  return [
    "1. Check browser console for JavaScript errors and warnings",
    "2. Verify network requests in browser DevTools Network tab",
    "3. Test authentication flow in incognito/private browsing mode",
    "4. Check Supabase dashboard for authentication logs and errors",
    "5. Validate environment variables and configuration",
    "6. Test with different browsers and devices",
    "7. Review component render cycles and state management",
    "8. Check for memory leaks or infinite re-renders",
    "9. Validate form input handling and validation logic",
    "10. Test email verification flow end-to-end",
  ];
}

function generateRecommendedFixes(authIssue: string, errorDetails: any): any {
  return {
    immediate: [
      "Add comprehensive error boundaries around authentication components",
      "Implement proper loading states for all async operations",
      "Add input validation and sanitization",
      "Ensure all text content is wrapped in <Text> components",
    ],
    shortTerm: [
      "Implement retry logic for failed authentication attempts",
      "Add offline detection and handling",
      "Create fallback authentication methods",
      "Improve error messaging and user feedback",
    ],
    longTerm: [
      "Implement comprehensive logging and monitoring",
      "Add automated testing for authentication flows",
      "Create platform-specific optimizations",
      "Implement progressive enhancement for desktop users",
    ],
  };
}

function generatePreventionMeasures(): string[] {
  return [
    "Implement comprehensive error boundaries throughout the application",
    "Add automated testing for authentication flows across platforms",
    "Set up monitoring and alerting for authentication failures",
    "Create detailed logging for debugging authentication issues",
    "Implement graceful degradation for network failures",
    "Add comprehensive input validation and sanitization",
    "Create platform-specific testing strategies",
    "Implement proper session management and cleanup",
    "Add comprehensive documentation for authentication flows",
    "Set up continuous integration testing across different environments",
  ];
}
