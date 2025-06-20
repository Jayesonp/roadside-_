import { corsHeaders } from "@shared/cors.ts";

// Define the request body type
interface RequestBody {
  errorType: string;
  errorMessage: string;
  componentName: string;
  stackTrace?: string;
  userAgent?: string;
  timestamp: string;
}

// Define the response type
interface AnalysisResponse {
  errorId: string;
  analysis: string;
  possibleSolutions: string[];
  severity: "low" | "medium" | "high" | "critical";
  relatedComponents?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData: RequestBody = await req.json();

    // Validate required fields
    if (
      !requestData.errorType ||
      !requestData.componentName ||
      !requestData.timestamp
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: errorType, componentName, or timestamp",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Analyze the error based on component and error type
    const analysis = analyzeError(requestData);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing dashboard error analysis:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Function to analyze errors and provide solutions
function analyzeError(errorData: RequestBody): AnalysisResponse {
  const { errorType, componentName, errorMessage } = errorData;
  const errorId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Default response
  let analysis = "Unknown error occurred";
  let possibleSolutions = ["Refresh the application", "Clear browser cache"];
  let severity: "low" | "medium" | "high" | "critical" = "medium";
  let relatedComponents: string[] = [];

  // Analyze based on component
  if (componentName === "TechnicianDashboard") {
    relatedComponents = ["TechnicianDashboard", "Auth", "supabase"];

    if (errorType.includes("TypeError") || errorType.includes("undefined")) {
      analysis =
        "Data access error in Technician Dashboard. This is likely due to missing or undefined data when rendering the dashboard components.";
      possibleSolutions = [
        "Check Supabase connection and authentication status",
        "Verify that the technician data is properly loaded",
        "Ensure all required props have default values",
        "Clear application cache and reload",
      ];
      severity = "high";
    } else if (
      errorType.includes("ChunkLoadError") ||
      errorType.includes("Loading chunk")
    ) {
      analysis =
        "Failed to load required JavaScript chunks for the Technician Dashboard.";
      possibleSolutions = [
        "Clear browser cache and reload",
        "Check network connectivity",
        "Verify that all required assets are available",
      ];
      severity = "medium";
    } else {
      analysis = `Error in Technician Dashboard: ${errorMessage || errorType}`;
      possibleSolutions = [
        "Restart the application",
        "Check Supabase connection",
        "Verify authentication status",
        "Contact support if the issue persists",
      ];
    }
  } else if (componentName === "PartnerManagement") {
    relatedComponents = ["PartnerManagement", "Auth", "supabase"];

    if (errorType.includes("TypeError") || errorType.includes("undefined")) {
      analysis =
        "Data access error in Partner Management. This is likely due to missing or undefined data when rendering partner information.";
      possibleSolutions = [
        "Check Supabase connection and authentication status",
        "Verify that partner data is properly loaded",
        "Ensure all required props have default values",
        "Clear application cache and reload",
      ];
      severity = "high";
    } else if (
      errorType.includes("NetworkError") ||
      errorType.includes("Failed to fetch")
    ) {
      analysis = "Network error when loading Partner Management data.";
      possibleSolutions = [
        "Check network connectivity",
        "Verify Supabase API endpoints",
        "Check if Supabase service is operational",
      ];
      severity = "high";
    } else {
      analysis = `Error in Partner Management: ${errorMessage || errorType}`;
      possibleSolutions = [
        "Restart the application",
        "Check Supabase connection",
        "Verify authentication status",
        "Contact support if the issue persists",
      ];
    }
  } else {
    // Generic error analysis
    if (errorType.includes("ChartError") || errorMessage?.includes("chart")) {
      analysis = "Error rendering charts or visualizations.";
      possibleSolutions = [
        "Check if chart data is properly formatted",
        "Verify that chart libraries are properly loaded",
        "Try disabling complex visualizations",
      ];
      severity = "medium";
      relatedComponents = ["Charts", "Visualizations"];
    } else if (
      errorType.includes("AuthError") ||
      errorMessage?.includes("auth") ||
      errorMessage?.includes("unauthorized")
    ) {
      analysis = "Authentication error occurred.";
      possibleSolutions = [
        "Sign out and sign in again",
        "Check if your session has expired",
        "Verify your account permissions",
      ];
      severity = "high";
      relatedComponents = ["Auth", "Supabase"];
    } else {
      analysis = `General application error: ${errorMessage || errorType}`;
      possibleSolutions = [
        "Refresh the application",
        "Clear browser cache and cookies",
        "Try accessing from a different browser or device",
        "Contact support if the issue persists",
      ];
    }
  }

  return {
    errorId,
    analysis,
    possibleSolutions,
    severity,
    relatedComponents,
  };
}
