import { corsHeaders } from "@shared/cors.ts";

interface TroubleshootRequest {
  errorType: string;
  componentName: string;
  errorMessage?: string;
  stackTrace?: string;
  userAgent?: string;
  timestamp: string;
  dashboardType: "technician" | "partner" | "admin" | "customer";
  context?: string;
  userId?: string;
  sessionInfo?: any;
}

interface TroubleshootResponse {
  troubleshootingGuide: string;
  specificSteps: string[];
  possibleCauses: string[];
  quickFixes: string[];
  preventionTips: string[];
  severity: "low" | "medium" | "high" | "critical";
  estimatedFixTime: string;
  requiresRestart: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: TroubleshootRequest = await req.json();

    if (
      !requestData.errorType ||
      !requestData.componentName ||
      !requestData.dashboardType
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: errorType, componentName, or dashboardType",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Enhanced error logging for better debugging
    console.log("Troubleshooting request:", {
      errorType: requestData.errorType,
      componentName: requestData.componentName,
      dashboardType: requestData.dashboardType,
      context: requestData.context,
      timestamp: requestData.timestamp,
    });

    // Call Perplexity AI for comprehensive troubleshooting
    const troubleshootingGuide =
      await getPerplexityTroubleshootingGuide(requestData);

    // Enhanced response with additional debugging info
    const enhancedResponse = {
      ...troubleshootingGuide,
      debugInfo: {
        timestamp: requestData.timestamp,
        dashboardType: requestData.dashboardType,
        errorType: requestData.errorType,
        hasUserSession: !!requestData.userId,
        contextProvided: !!requestData.context,
      },
    };

    return new Response(JSON.stringify(enhancedResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in dashboard troubleshooting:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
        fallbackGuide: getFallbackTroubleshootingGuide({
          errorType: "UnknownError",
          componentName: "Dashboard",
          dashboardType: "technician",
          timestamp: new Date().toISOString(),
        }),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function getPerplexityTroubleshootingGuide(
  requestData: TroubleshootRequest,
): Promise<TroubleshootResponse> {
  try {
    const contextualInfo = getContextualErrorInfo(requestData);
    const specificErrorContext = getSpecificErrorContext(requestData);

    const prompt = `You are an expert React Native and Expo troubleshooting specialist with deep knowledge of Supabase integration, CORS issues, and dashboard applications. Analyze and provide a comprehensive solution for the following critical error:

**CRITICAL ERROR CONTEXT:**
- Dashboard Type: ${requestData.dashboardType}
- Component: ${requestData.componentName}
- Error Type: ${requestData.errorType}
- Error Message: ${requestData.errorMessage || "Persistent 'something went wrong' error"}
- Context: ${requestData.context || "Dashboard component rendering failure"}
- Timestamp: ${requestData.timestamp}
- User Agent: ${requestData.userAgent || "React Native Expo"}
- User Session: ${requestData.userId ? "Authenticated" : "Not authenticated"}
- Session Info: ${JSON.stringify(requestData.sessionInfo || {})}
- Environment: ${JSON.stringify(requestData.environmentInfo || {})}

**SPECIFIC ERROR PATTERNS DETECTED:**
${specificErrorContext}

**CRITICAL CORS ERROR ANALYSIS:**
This error appears to be related to CORS (Cross-Origin Resource Sharing) issues specifically affecting the Tempo platform (https://app.tempo.new). This is a common issue caused by browser extensions that intercept and block HTTP requests for security or privacy reasons.

**BROWSER EXTENSION INTERFERENCE:**
- Ad blockers (uBlock Origin, AdBlock Plus, etc.)
- Privacy extensions (Privacy Badger, Ghostery, etc.)
- Security extensions (NoScript, ScriptSafe, etc.)
- VPN extensions that modify request headers
- Corporate security software

**IMMEDIATE RESOLUTION PRIORITY:**
1. HIGHEST: Disable all browser extensions
2. HIGH: Use incognito/private browsing mode
3. MEDIUM: Clear all browser data and cache
4. LOW: Try different browsers

**TECHNICAL STACK & ENVIRONMENT:**
- React Native 0.79.3 with Expo SDK 53
- Supabase client v2.49.9 for backend/auth
- Tempo AI platform integration (tempo-devtools v2.0.106)
- NativeWind v4.1.23 for styling
- Lucide React Native for icons
- React Native Chart Kit for data visualization
- PICA API integration for Perplexity AI
- Metro bundler with potential cache issues
- CORS middleware conflicts detected

**DASHBOARD-SPECIFIC CONTEXT:**
${contextualInfo}

**ENHANCED ERROR PATTERN ANALYSIS:**
Based on the error context and recent development errors, this appears to be related to:

1. **File System and Bundle Issues:**
   - ENOENT errors indicating missing files in annotated working directory
   - Metro bundler cache corruption
   - File path resolution problems
   - Bundle generation failures

2. **CORS and Network Issues:**
   - Unauthorized requests from Tempo platform
   - Browser extension conflicts
   - CORS middleware blocking requests
   - Network connectivity problems

3. **Authentication State Management Issues:**
   - Session token expiration or corruption
   - Authentication flow race conditions
   - Supabase client initialization timing
   - User profile data loading failures

4. **Component Lifecycle Problems:**
   - useEffect dependency array issues
   - Async operations not properly handled
   - State updates on unmounted components
   - Memory leaks from uncleared timeouts/intervals

5. **Environment and Configuration:**
   - Missing or incorrect environment variables
   - Supabase URL/key configuration issues
   - Expo configuration conflicts
   - Platform-specific rendering issues

**COMPREHENSIVE DIAGNOSTIC & RESOLUTION STRATEGY:**

## IMMEDIATE DIAGNOSTIC STEPS (Priority Order):

1. **File System and Bundle Verification:**
   - Clear Metro bundler cache: npx expo start --clear
   - Verify file paths and bundle integrity
   - Check for missing files in annotated directory
   - Restart development server completely

2. **CORS and Network Resolution:**
   - Disable browser extensions temporarily
   - Test in incognito/private browsing mode
   - Verify CORS headers and middleware configuration
   - Check network connectivity and firewall settings

3. **Authentication Verification:**
   - Check if supabase.auth.getSession() returns valid session
   - Verify environment variables: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
   - Test authentication with: console.log(await supabase.auth.getUser())
   - Validate session expiration: console.log(session?.expires_at)

4. **Component State Analysis:**
   - Add console.log statements in useEffect hooks to track execution order
   - Monitor state changes with: console.log('State update:', { user, isLoading, hasError })
   - Check for infinite re-render loops in useEffect dependencies
   - Verify cleanup functions are properly implemented

5. **Environment Validation:**
   - Verify all required environment variables are set
   - Check Expo configuration in app.json/app.config.js
   - Validate Metro bundler configuration
   - Test on different devices and platforms

## STEP-BY-STEP RESOLUTION GUIDE:

### Phase 1: Bundle and File System Fixes
1. **Clear All Caches:**
   - Run: npx expo start --clear
   - Clear browser cache and data
   - Restart development server
   - Clear node_modules and reinstall if needed

2. **Fix File Path Issues:**
   - Verify all import paths are correct
   - Check for missing files in the bundle
   - Ensure proper file extensions
   - Validate Metro configuration

### Phase 2: CORS and Network Resolution
1. **Browser Extension Conflicts:**
   - Disable all browser extensions
   - Test in incognito/private mode
   - Check for ad blockers or security extensions
   - Verify network proxy settings

2. **CORS Configuration:**
   - Update CORS middleware settings
   - Verify allowed origins and headers
   - Check for conflicting CORS policies
   - Test with different browsers

### Phase 3: Authentication & Session Management
1. **Implement Robust Session Handling:**
   - Add session validation with proper error handling
   - Implement automatic token refresh mechanisms
   - Add fallback authentication flows
   - Test with expired and invalid sessions

2. **Enhanced Error Boundaries:**
   - Implement component-specific error boundaries
   - Add detailed error logging and reporting
   - Provide user-friendly error recovery options
   - Test error boundary fallback components

### Phase 4: Component Lifecycle Optimization
1. **Fix useEffect Dependencies:**
   - Review all useEffect dependency arrays
   - Implement proper cleanup functions
   - Add loading states for async operations
   - Prevent state updates on unmounted components

2. **Memory Management:**
   - Clear all timeouts and intervals on unmount
   - Implement proper event listener cleanup
   - Monitor and fix memory leaks
   - Optimize component re-rendering

## CODE-LEVEL FIXES & IMPROVEMENTS:

### Enhanced Development Server Restart:
\`\`\`bash
# Complete cache clearing and restart sequence
npx expo start --clear
# If issues persist:
rm -rf node_modules
npm install
npx expo start --clear
\`\`\`

### CORS Issue Resolution:
\`\`\`javascript
// Test in browser console to check CORS
fetch(window.location.origin + '/api/test')
  .then(response => console.log('CORS test:', response.status))
  .catch(error => console.error('CORS error:', error));
\`\`\`

### Enhanced Authentication Flow:
\`\`\`typescript
// Improved session management with proper error handling
const checkAuthStatus = async () => {
  try {
    setIsLoading(true);
    
    // Validate environment variables first
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      // Handle specific session errors
      if (sessionError.message.includes('Invalid JWT')) {
        await supabase.auth.signOut();
        return;
      }
      throw sessionError;
    }
    
    if (session) {
      // Validate session expiration
      const now = new Date().getTime() / 1000;
      if (session.expires_at && session.expires_at < now) {
        console.log('Session expired, refreshing...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          await supabase.auth.signOut();
          return;
        }
      }
      
      // Load user profile with timeout and retry
      await loadUserProfile(session.user.id);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    handleAuthError(error);
  } finally {
    setIsLoading(false);
  }
};
\`\`\`

### Memory Management & Cleanup:
\`\`\`typescript
// Improved useEffect with proper cleanup
useEffect(() => {
  let isMounted = true;
  const timeouts = [];
  const intervals = [];
  
  const loadData = async () => {
    try {
      if (!isMounted) return;
      
      const { data, error } = await supabase.from('table').select('*');
      
      if (!isMounted) return;
      
      if (error) throw error;
      
      setData(data);
    } catch (error) {
      if (!isMounted) return;
      handleError(error, 'data_loading');
    }
  };
  
  loadData();
  
  // Cleanup function
  return () => {
    isMounted = false;
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);
  };
}, []);
\`\`\`

## TESTING & VALIDATION STRATEGIES:

1. **Bundle and File System Testing:**
   - Test after clearing all caches
   - Verify file paths and imports
   - Test on different devices and browsers
   - Monitor bundle size and loading times

2. **Network and CORS Testing:**
   - Test in incognito mode
   - Test with different browsers
   - Test with extensions disabled
   - Monitor network requests in dev tools

3. **Authentication Testing:**
   - Test with various session states
   - Test session expiration scenarios
   - Test with different user roles
   - Test authentication recovery flows

4. **Component Lifecycle Testing:**
   - Test component mounting/unmounting
   - Test with rapid navigation
   - Test memory usage patterns
   - Test error recovery mechanisms

## MONITORING & PREVENTION:

1. **Development Environment Health:**
   - Regular cache clearing schedules
   - Bundle integrity monitoring
   - File system health checks
   - Development server stability monitoring

2. **Network and CORS Monitoring:**
   - CORS policy validation
   - Network request monitoring
   - Browser compatibility testing
   - Extension conflict detection

3. **Error Tracking:**
   - Comprehensive error logging
   - User session tracking
   - Performance metrics collection
   - Crash reporting integration

Provide specific, actionable solutions with complete code examples. Prioritize fixes by impact and implementation difficulty. Focus on resolving the immediate file system and CORS issues first, then address authentication and component lifecycle problems.`;

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
                "You are an expert React Native and Expo troubleshooting specialist with deep knowledge of Supabase integration, Metro bundler issues, CORS problems, and dashboard applications. Provide comprehensive, actionable solutions with specific code examples.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      },
    );

    if (!response.ok) {
      console.error(
        `Perplexity API error: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text();
      console.error("Perplexity API response:", errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const troubleshootingContent =
      data.choices[0]?.message?.content ||
      "Unable to generate troubleshooting guide";

    console.log(
      "Enhanced Perplexity response received, length:",
      troubleshootingContent.length,
    );

    // Parse the response into structured format
    return parsePerplexityResponse(troubleshootingContent, requestData);
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    // Return enhanced fallback troubleshooting guide
    return getFallbackTroubleshootingGuide(requestData);
  }
}

function getContextualErrorInfo(requestData: TroubleshootRequest): string {
  const dashboardSpecificInfo = {
    technician: `
- Authentication issues with technician credentials
- Chart rendering problems with react-native-chart-kit
- GPS/location service integration errors
- Real-time job updates not loading
- Profile data loading failures
- Network connectivity issues affecting job dispatch
- Metro bundler cache issues affecting component loading
- CORS issues preventing API calls`,

    partner: `
- Partner authentication and authorization issues
- Feature access control problems
- White-label configuration errors
- Partner-specific API endpoint failures
- Billing/subscription status verification issues
- Multi-tenant data isolation problems
- File system issues in annotated working directory
- Browser extension conflicts`,

    admin: `
- Admin permission and role verification issues
- Dashboard component loading failures
- Analytics data fetching problems
- User management interface errors
- System monitoring component failures
- Bundle generation and file path issues
- CORS middleware configuration problems`,

    customer: `
- Customer authentication flow issues
- Service request submission problems
- Location services integration errors
- Payment processing interface issues
- Service history loading failures
- Component mounting and lifecycle issues
- Network request authorization problems`,
  };

  return (
    dashboardSpecificInfo[requestData.dashboardType] ||
    "General dashboard loading issues with potential file system and network problems"
  );
}

function getSpecificErrorContext(requestData: TroubleshootRequest): string {
  const errorMessage = requestData.errorMessage || "";
  const errorType = requestData.errorType || "";

  let specificContext = "";

  // Check for specific error patterns
  if (
    errorMessage.includes("ENOENT") ||
    errorMessage.includes("no such file")
  ) {
    specificContext +=
      "\n- FILE SYSTEM ERROR: Missing files in annotated working directory";
    specificContext += "\n- Likely caused by Metro bundler cache corruption";
    specificContext +=
      "\n- Solution: Clear Metro cache with 'npx expo start --clear'";
  }

  if (
    errorMessage.includes("Unauthorized request") ||
    errorMessage.includes("CORS") ||
    errorMessage.includes("app.tempo.new")
  ) {
    specificContext +=
      "\n- CRITICAL CORS ERROR: Browser extension conflicts with Tempo platform detected";
    specificContext +=
      "\n- Requests from https://app.tempo.new being blocked by CORS middleware";
    specificContext +=
      "\n- This is a known issue with browser extensions intercepting HTTP requests";
    specificContext +=
      "\n- IMMEDIATE SOLUTION: Disable ALL browser extensions and use incognito/private mode";
    specificContext +=
      "\n- ALTERNATIVE: Clear browser cache completely and hard refresh (Ctrl+F5)";
    specificContext +=
      "\n- ROOT CAUSE: Ad blockers, privacy extensions, or security extensions blocking cross-origin requests";
  }

  if (
    errorMessage.includes("something went wrong") ||
    errorType.includes("ComponentError")
  ) {
    specificContext +=
      "\n- COMPONENT RENDERING ERROR: Dashboard component failed to mount";
    specificContext +=
      "\n- Likely caused by authentication state issues or async operation failures";
    specificContext +=
      "\n- Solution: Check authentication flow and component lifecycle management";
  }

  if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    specificContext += "\n- NETWORK ERROR: API requests failing";
    specificContext +=
      "\n- Could be related to Supabase connectivity or CORS issues";
    specificContext +=
      "\n- Solution: Verify network connectivity and API endpoints";
  }

  return (
    specificContext ||
    "\n- GENERAL ERROR: Component or system failure requiring comprehensive diagnosis"
  );
}

function parsePerplexityResponse(
  content: string,
  requestData: TroubleshootRequest,
): TroubleshootResponse {
  // Extract specific sections from the Perplexity response
  const specificSteps = extractSteps(content);
  const possibleCauses = extractCauses(content, requestData);
  const quickFixes = extractQuickFixes(content, requestData);
  const preventionTips = extractPreventionTips(content);
  const severity = determineSeverity(requestData, content);
  const estimatedFixTime = estimateFixTime(severity, quickFixes.length);
  const requiresRestart = checkIfRestartRequired(content, requestData);

  return {
    troubleshootingGuide: content,
    specificSteps,
    possibleCauses,
    quickFixes,
    preventionTips,
    severity,
    estimatedFixTime,
    requiresRestart,
  };
}

function determineSeverity(
  requestData: TroubleshootRequest,
  content: string,
): "low" | "medium" | "high" | "critical" {
  const errorType = requestData.errorType.toLowerCase();
  const errorMessage = (requestData.errorMessage || "").toLowerCase();
  const contentLower = content.toLowerCase();

  // Critical issues
  if (
    errorType.includes("crash") ||
    errorType.includes("fatal") ||
    errorMessage.includes("cannot read") ||
    contentLower.includes("critical") ||
    contentLower.includes("fatal")
  ) {
    return "critical";
  }

  // High severity issues
  if (
    errorType.includes("auth") ||
    errorType.includes("network") ||
    errorMessage.includes("failed to fetch") ||
    contentLower.includes("authentication") ||
    contentLower.includes("database")
  ) {
    return "high";
  }

  // Medium severity issues
  if (
    errorType.includes("render") ||
    errorType.includes("component") ||
    contentLower.includes("chart") ||
    contentLower.includes("ui")
  ) {
    return "medium";
  }

  return "low";
}

function estimateFixTime(severity: string, quickFixCount: number): string {
  if (quickFixCount > 3) {
    return "5-15 minutes";
  }

  switch (severity) {
    case "critical":
      return "30-60 minutes";
    case "high":
      return "15-30 minutes";
    case "medium":
      return "10-20 minutes";
    default:
      return "5-10 minutes";
  }
}

function checkIfRestartRequired(
  content: string,
  requestData: TroubleshootRequest,
): boolean {
  const contentLower = content.toLowerCase();
  const errorType = requestData.errorType.toLowerCase();

  return (
    contentLower.includes("restart") ||
    contentLower.includes("reload") ||
    contentLower.includes("refresh") ||
    errorType.includes("bundle") ||
    errorType.includes("metro") ||
    contentLower.includes("dev server") ||
    contentLower.includes("environment")
  );
}

function extractSteps(content: string): string[] {
  const steps = [];

  // Enhanced patterns to extract troubleshooting steps with better context
  const patterns = [
    // Numbered steps with various formats
    /(?:^|\n)\s*(?:Step\s+)?\d+[.):]\s*[^\n]{20,}/gi,
    // Phase/Section headers with content
    /(?:^|\n)\s*(?:Phase|Section)\s+\d+[:\-]\s*[^\n]{15,}/gi,
    // Bullet points with substantial content
    /(?:^|\n)\s*[\-\*•]\s+[^\n]{25,}/gm,
    // Action items starting with action verbs
    /(?:^|\n)\s*(?:Implement|Add|Check|Verify|Test|Fix|Update|Configure|Validate|Monitor|Clear|Restart|Disable|Enable)[^\n]{20,}/gi,
    // Code block descriptions
    /(?:^|\n)\s*(?:Enhanced|Improved|Better)[^\n]{20,}/gi,
    // Diagnostic steps
    /(?:^|\n)\s*\d+\.\s*\*\*[^*]+\*\*[^\n]{10,}/gi,
    // Command-based steps
    /(?:^|\n)\s*(?:Run|Execute|Use):\s*[^\n]{15,}/gi,
  ];

  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      const cleanedSteps = matches
        .map((step) => {
          // Clean up the step text
          let cleaned = step.replace(/^\s*[\n\r]+/, "").trim();
          // Remove markdown formatting
          cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
          // Remove code block markers
          cleaned = cleaned.replace(/```[^`]*```/g, "[Code Example]");
          // Remove excessive whitespace
          cleaned = cleaned.replace(/\s+/g, " ");
          // Remove leading numbers and bullets
          cleaned = cleaned.replace(/^\d+[.):]\s*/, "");
          cleaned = cleaned.replace(/^[\-\*•]\s*/, "");
          return cleaned;
        })
        .filter((step) => step.length > 20 && step.length < 350)
        .slice(0, 18);
      steps.push(...cleanedSteps);
      if (steps.length >= 15) break;
    }
  }

  // Enhanced instruction extraction with more context
  if (steps.length < 8) {
    const sentences = content.split(/[.!?]\s+/);
    const instructionWords = [
      "check",
      "verify",
      "ensure",
      "restart",
      "clear",
      "update",
      "install",
      "configure",
      "test",
      "debug",
      "examine",
      "validate",
      "refresh",
      "reload",
      "reset",
      "fix",
      "modify",
      "add",
      "remove",
      "replace",
      "implement",
      "enable",
      "disable",
      "monitor",
      "analyze",
      "optimize",
      "enhance",
      "troubleshoot",
      "diagnose",
      "resolve",
      "prevent",
      "npx",
      "run",
      "execute",
    ];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (
        instructionWords.some((word) => lowerSentence.includes(word)) &&
        sentence.length > 25 &&
        sentence.length < 300 &&
        !sentence.includes("```") // Avoid code blocks
      ) {
        steps.push(sentence.trim());
        if (steps.length >= 15) break;
      }
    }
  }

  // Enhanced fallback steps with more comprehensive actions addressing specific errors
  return steps.length > 0
    ? steps.slice(0, 15)
    : [
        "Clear Metro bundler cache completely by running 'npx expo start --clear' in your terminal",
        "Disable all browser extensions temporarily and test the application in incognito/private browsing mode",
        "Open browser developer console (F12) and check for specific error messages, particularly ENOENT or CORS errors",
        "Verify Supabase connection by checking Network tab for failed requests to your Supabase URL",
        "Clear all browser data: cache, local storage, session storage, and cookies, then perform a hard refresh (Ctrl+F5)",
        "Check authentication status by running 'console.log(await supabase.auth.getSession())' in browser console",
        "Verify all environment variables are properly set: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY",
        "If file system errors persist, delete node_modules folder and run 'npm install' to reinstall dependencies",
        "Test authentication with demo credentials or create a new test user account to isolate auth issues",
        "Check component imports and ensure all file paths are correct, especially for images and assets",
        "Examine useEffect hooks for infinite loops by adding console.log statements to track execution order",
        "Validate that all required props are being passed to dashboard components and check for undefined values",
        "Monitor memory usage in browser Performance tab during component mounting to detect memory leaks",
        "Test the application on different browsers (Chrome, Firefox, Safari) to isolate browser-specific issues",
        "Check for conflicting CORS policies by testing API endpoints directly in browser or Postman",
      ];
}

function extractCauses(
  content: string,
  requestData: TroubleshootRequest,
): string[] {
  const causes = [];

  // Component-specific causes
  if (requestData.dashboardType === "technician") {
    causes.push(
      "Authentication session expired for technician user",
      "Missing or invalid technician profile data",
      "Chart rendering library not properly loaded",
      "Supabase RLS policies blocking technician data access",
    );
  } else if (requestData.dashboardType === "partner") {
    causes.push(
      "Partner authentication credentials invalid",
      "Missing partner profile or company data",
      "Feature access permissions not properly configured",
      "Partner-specific API endpoints unreachable",
    );
  }

  // General causes
  causes.push(
    "Network connectivity issues",
    "Supabase service temporarily unavailable",
    "JavaScript bundle loading failures",
    "CORS policy blocking API requests",
    "Environment variables not properly configured",
  );

  return causes;
}

function extractQuickFixes(
  content: string,
  requestData: TroubleshootRequest,
): string[] {
  const fixes = [];
  const errorMessage = requestData.errorMessage || "";

  // CORS-specific fixes (highest priority)
  if (
    errorMessage.includes("Unauthorized request") ||
    errorMessage.includes("CORS") ||
    errorMessage.includes("app.tempo.new")
  ) {
    fixes.push(
      "IMMEDIATE: Disable ALL browser extensions (especially ad blockers, privacy tools, security extensions)",
      "CRITICAL: Open application in incognito/private browsing mode to bypass extension conflicts",
      "Clear all browser data: Go to Settings > Privacy > Clear browsing data > Select 'All time' and check all boxes",
      "Hard refresh the page multiple times: Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)",
      "Try a different browser (Chrome, Firefox, Safari, Edge) to isolate browser-specific issues",
      "Check if you have corporate firewall or proxy settings that might be blocking requests",
      "Temporarily disable antivirus software web protection features",
      "Copy the URL and paste it in a fresh incognito window",
    );
  }

  // Component-specific quick fixes
  if (requestData.dashboardType === "technician") {
    fixes.push(
      "Sign out and sign back in to refresh authentication",
      "Clear technician dashboard cache and reload",
      "Check if technician profile exists in database",
      "Verify technician permissions and role assignments",
    );
  } else if (requestData.dashboardType === "partner") {
    fixes.push(
      "Refresh partner authentication session",
      "Verify partner account status and permissions",
      "Check partner feature access configuration",
      "Validate partner API keys and credentials",
    );
  } else if (requestData.dashboardType === "admin") {
    fixes.push(
      "Verify admin user permissions and access levels",
      "Check admin dashboard component loading",
      "Test analytics data fetching capabilities",
      "Validate system monitoring components",
    );
  }

  // General quick fixes (if not CORS-related)
  if (
    !errorMessage.includes("CORS") &&
    !errorMessage.includes("Unauthorized request")
  ) {
    fixes.push(
      "Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)",
      "Clear browser cache and cookies",
      "Try accessing from incognito/private browsing mode",
      "Check browser developer console for specific errors",
      "Restart the application development server",
    );
  }

  return fixes;
}

function extractPreventionTips(content: string): string[] {
  return [
    "Implement proper error boundaries in React components",
    "Add comprehensive logging for debugging purposes",
    "Set up monitoring and alerting for critical errors",
    "Regularly update dependencies and security patches",
    "Test authentication flows in different scenarios",
    "Monitor Supabase service status and performance",
    "Implement graceful fallbacks for API failures",
    "Use proper error handling in async operations",
  ];
}

function getFallbackTroubleshootingGuide(
  requestData: TroubleshootRequest,
): TroubleshootResponse {
  const dashboardSpecific = getDashboardSpecificFallback(
    requestData.dashboardType,
  );

  return {
    troubleshootingGuide: `# ${requestData.dashboardType.charAt(0).toUpperCase() + requestData.dashboardType.slice(1)} Dashboard Troubleshooting Guide

The "something went wrong" error in your ${requestData.dashboardType} dashboard indicates a component rendering or data loading issue. This comprehensive guide will help you identify and resolve the problem.

## Error Context
- Component: ${requestData.componentName}
- Error Type: ${requestData.errorType}
- Timestamp: ${requestData.timestamp}

## Common Causes
This error typically occurs due to authentication issues, network connectivity problems, or component rendering failures.

${dashboardSpecific.description}`,
    specificSteps: dashboardSpecific.steps,
    possibleCauses: extractCauses("", requestData),
    quickFixes: dashboardSpecific.quickFixes,
    preventionTips: [
      "Implement proper error boundaries in React components",
      "Add comprehensive logging for debugging purposes",
      "Set up monitoring and alerting for critical errors",
      "Regularly update dependencies and security patches",
      "Test authentication flows in different scenarios",
      "Monitor Supabase service status and performance",
      "Implement graceful fallbacks for API failures",
      "Use proper error handling in async operations",
    ],
    severity: "medium",
    estimatedFixTime: "10-20 minutes",
    requiresRestart: true,
  };
}

function getDashboardSpecificFallback(dashboardType: string) {
  const fallbacks = {
    technician: {
      description:
        "## Technician Dashboard Issues\nTechnician dashboards commonly fail due to authentication problems, chart rendering issues, or GPS service integration errors.",
      steps: [
        "Verify technician authentication credentials",
        "Check if react-native-chart-kit is properly installed",
        "Test GPS/location services functionality",
        "Verify Supabase technician table access",
        "Check network connectivity for job dispatch",
        "Clear app cache and restart development server",
        "Test with demo technician credentials",
        "Verify all required environment variables",
      ],
      quickFixes: [
        "Sign out and sign back in to refresh authentication",
        "Clear technician dashboard cache and reload",
        "Check if technician profile exists in database",
        "Verify technician permissions and role assignments",
        "Test with incognito/private browsing mode",
      ],
    },
    partner: {
      description:
        "## Partner Dashboard Issues\nPartner dashboards often fail due to multi-tenant authentication issues, feature access control problems, or white-label configuration errors.",
      steps: [
        "Verify partner authentication and authorization",
        "Check partner feature access permissions",
        "Test white-label configuration settings",
        "Verify partner-specific API endpoints",
        "Check billing/subscription status",
        "Test multi-tenant data isolation",
        "Clear partner dashboard cache",
        "Verify partner domain configuration",
      ],
      quickFixes: [
        "Refresh partner authentication session",
        "Verify partner account status and permissions",
        "Check partner feature access configuration",
        "Validate partner API keys and credentials",
        "Test with different partner account",
      ],
    },
    admin: {
      description:
        "## Admin Dashboard Issues\nAdmin dashboards typically fail due to permission issues, component loading failures, or analytics data problems.",
      steps: [
        "Verify admin user permissions and roles",
        "Check dashboard component loading",
        "Test analytics data fetching",
        "Verify user management interface",
        "Check system monitoring components",
        "Test database connectivity",
        "Clear admin dashboard cache",
        "Verify all admin environment variables",
      ],
      quickFixes: [
        "Refresh admin authentication session",
        "Check admin role and permissions",
        "Clear browser cache and cookies",
        "Test with different admin account",
        "Restart development server",
      ],
    },
    customer: {
      description:
        "## Customer Dashboard Issues\nCustomer dashboards commonly fail due to authentication flow issues, service request problems, or location service errors.",
      steps: [
        "Verify customer authentication flow",
        "Check service request submission",
        "Test location services integration",
        "Verify payment processing interface",
        "Check service history loading",
        "Test emergency request functionality",
        "Clear customer dashboard cache",
        "Verify customer profile data",
      ],
      quickFixes: [
        "Sign out and sign back in",
        "Clear customer app cache",
        "Check location permissions",
        "Test with demo customer account",
        "Verify network connectivity",
      ],
    },
  };

  return fallbacks[dashboardType] || fallbacks.customer;
}
