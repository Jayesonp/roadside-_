import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import TechnicianDashboard from "./components/TechnicianDashboard";
import PartnerManagement from "./components/PartnerManagement";
import SecurityOperationsCenter from "./components/SecurityOperationsCenter";
import ActivityFeed from "./components/ActivityFeed";
import LiveServiceMap from "./components/LiveServiceMap";
import SystemAlertsView from "./components/SystemAlertsView";
import PerplexityAssistant from "./components/PerplexityAssistant";
import { AuthGuard } from "./components/Auth";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null, errorComponent: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);

    // Enhanced error component detection with more specific patterns
    let errorComponent = "application";
    let errorContext = "general";
    let severity = "medium";
    let dashboardType = "customer";

    if (errorInfo && errorInfo.componentStack) {
      const componentStack = errorInfo.componentStack;

      if (componentStack.includes("TechnicianDashboard")) {
        errorComponent = "technician";
        errorContext = "technician_dashboard_render";
        dashboardType = "technician";
        severity = "high";
      } else if (componentStack.includes("PartnerManagement")) {
        errorComponent = "partner";
        errorContext = "partner_management_render";
        dashboardType = "partner";
        severity = "high";
      } else if (componentStack.includes("AdminDashboard")) {
        errorComponent = "admin";
        errorContext = "admin_dashboard_render";
        dashboardType = "admin";
        severity = "critical";
      } else if (componentStack.includes("CustomerDashboard")) {
        errorComponent = "customer";
        errorContext = "customer_dashboard_render";
        dashboardType = "customer";
        severity = "medium";
      } else if (componentStack.includes("SecurityOperationsCenter")) {
        errorComponent = "security";
        errorContext = "security_dashboard_render";
        dashboardType = "admin";
        severity = "critical";
      }
    }

    // Capture comprehensive environment information
    const environmentInfo = {
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "N/A",
      timestamp: new Date().toISOString(),
      memoryUsage:
        typeof performance !== "undefined" && performance.memory
          ? {
              used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
              total: Math.round(
                performance.memory.totalJSHeapSize / 1024 / 1024,
              ),
              limit: Math.round(
                performance.memory.jsHeapSizeLimit / 1024 / 1024,
              ),
            }
          : null,
      networkStatus: typeof navigator !== "undefined" ? navigator.onLine : true,
      platform: typeof Platform !== "undefined" ? Platform.OS : "web",
      deviceInfo: {
        screen:
          typeof window !== "undefined"
            ? {
                width: window.screen.width,
                height: window.screen.height,
                pixelRatio: window.devicePixelRatio || 1,
              }
            : null,
        viewport:
          typeof window !== "undefined"
            ? {
                width: window.innerWidth,
                height: window.innerHeight,
              }
            : null,
      },
    };

    // Enhanced error state with comprehensive details
    this.setState({
      errorInfo,
      errorComponent,
      severity,
      dashboardType,
      errorDetails: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: environmentInfo.timestamp,
        context: errorContext,
        errorType: error.name || "ComponentError",
        environmentInfo,
        errorFrequency: {
          isRecurring: this.state.hasError,
          previousErrorTime: this.state.errorDetails?.timestamp,
        },
      },
    });

    // Enhanced logging for debugging
    console.group("≡ƒÜ¿ Enhanced Application Error Details");
    console.log("Error Component:", errorComponent);
    console.log("Dashboard Type:", dashboardType);
    console.log("Error Context:", errorContext);
    console.log("Severity Level:", severity);
    console.log("Error Message:", error.message);
    console.log("Error Type:", error.name);
    console.log("Error Stack:", error.stack);
    console.log("Component Stack:", errorInfo.componentStack);
    console.log("Environment Info:", environmentInfo);
    console.log("Timestamp:", new Date().toISOString());
    console.groupEnd();

    // Try to report error to enhanced troubleshooting system
    this.reportErrorToTroubleshooting({
      errorType: error.name || "ComponentError",
      errorMessage:
        error.message ||
        "Dashboard component failed to render - persistent error",
      componentName: errorComponent,
      dashboardType: dashboardType as any,
      stackTrace: error.stack,
      timestamp: new Date().toISOString(),
      context: errorContext,
      userAgent: environmentInfo.userAgent,
      sessionInfo: {
        hasError: this.state.hasError,
        errorComponent: errorComponent,
        severity: severity,
        networkOnline: environmentInfo.networkStatus,
        isRecurring: this.state.hasError,
        errorFrequency: this.state.errorDetails?.errorFrequency || {},
        componentMountTime: Date.now(),
        memoryPressure:
          environmentInfo.memoryUsage?.used > 100 ? "high" : "normal",
      },
      environmentInfo: {
        platform: environmentInfo.platform,
        networkOnline: environmentInfo.networkStatus,
        memoryUsage: environmentInfo.memoryUsage,
        deviceInfo: environmentInfo.deviceInfo,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL
          ? "configured"
          : "missing",
        supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
          ? "configured"
          : "missing",
        isDev: typeof __DEV__ !== "undefined" ? __DEV__ : false,
      },
    });
  }

  async reportErrorToTroubleshooting(errorDetails) {
    try {
      console.log("Reporting error to enhanced troubleshooting system:", {
        errorType: errorDetails.errorType,
        componentName: errorDetails.componentName,
        dashboardType: errorDetails.dashboardType,
        context: errorDetails.context,
      });

      // Use Supabase edge function for enhanced error reporting
      const { supabase } = await import("../lib/supabase");

      // This is a fire-and-forget error reporting with timeout
      const reportPromise = supabase.functions.invoke(
        "supabase-functions-perplexity-dashboard-troubleshoot",
        {
          body: errorDetails,
        },
      );

      // Add timeout to prevent hanging with enhanced retry logic
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Error reporting timeout")), 12000),
      );

      Promise.race([reportPromise, timeoutPromise])
        .then((result) => {
          console.log(
            "Error reported successfully to enhanced troubleshooting system",
          );
          if (result?.data) {
            console.log("Enhanced troubleshooting guidance received:", {
              severity: result.data.severity,
              estimatedFixTime: result.data.estimatedFixTime,
              stepsCount: result.data.specificSteps?.length || 0,
              causesCount: result.data.possibleCauses?.length || 0,
              quickFixesCount: result.data.quickFixes?.length || 0,
              requiresRestart: result.data.requiresRestart,
            });

            // Store troubleshooting data for user access
            try {
              localStorage.setItem(
                "latest_troubleshooting_guide",
                JSON.stringify({
                  ...result.data,
                  timestamp: new Date().toISOString(),
                  errorContext: errorDetails,
                }),
              );
            } catch (storageError) {
              console.warn(
                "Failed to store troubleshooting guide:",
                storageError,
              );
            }
          }
        })
        .catch((err) => {
          console.warn("Enhanced error reporting failed:", err.message);
          // Enhanced fallback with retry attempt
          if (err.message.includes("timeout")) {
            console.log("Attempting retry with shorter timeout...");
            const retryPromise = supabase.functions.invoke(
              "supabase-functions-perplexity-dashboard-troubleshoot",
              {
                body: { ...errorDetails, retryAttempt: true },
              },
            );

            const shortTimeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Retry timeout")), 5000),
            );

            Promise.race([retryPromise, shortTimeoutPromise])
              .then((retryResult) => {
                console.log("Retry successful:", retryResult?.data?.severity);
              })
              .catch(() => {
                console.warn("Retry also failed, using local fallback");
                this.logErrorLocally(errorDetails);
              });
          } else {
            // Fallback to enhanced local error logging
            this.logErrorLocally(errorDetails);
          }
        });
    } catch (err) {
      console.warn("Error reporting setup failed:", err);
      this.logErrorLocally(errorDetails);
    }
  }

  logErrorLocally(errorDetails) {
    try {
      // Store error details in localStorage for debugging
      const errorLog = {
        ...errorDetails,
        localTimestamp: new Date().toISOString(),
        reportingMethod: "local_fallback",
      };

      const existingErrors = JSON.parse(
        localStorage.getItem("roadside_error_log") || "[]",
      );

      existingErrors.push(errorLog);

      // Keep only last 10 errors to prevent storage bloat
      const recentErrors = existingErrors.slice(-10);

      localStorage.setItem("roadside_error_log", JSON.stringify(recentErrors));

      console.log("Error logged locally for debugging:", errorLog);
    } catch (storageError) {
      console.warn("Failed to log error locally:", storageError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-slate-900 justify-center items-center p-4">
          <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">ΓÜá∩╕Å</Text>
              </View>
              <Text className="text-white text-xl font-bold mb-2 text-center">
                Dashboard Error
              </Text>
              <Text className="text-slate-400 text-sm text-center">
                {this.state.errorComponent} ΓÇó {new Date().toLocaleTimeString()}
              </Text>
            </View>

            <Text className="text-slate-300 text-center mb-6 leading-relaxed">
              {this.state.errorComponent === "technician"
                ? "The technician dashboard encountered a React hooks error. This is typically caused by conditional hook calls, component lifecycle issues, or inconsistent hook usage between renders. The component has been fixed to ensure hooks are called consistently."
                : this.state.errorComponent === "partner"
                  ? "The partner management dashboard failed to load properly. This may be due to file system errors in the annotated directory, authentication token expiration, browser extension conflicts, or API connectivity problems. Test in incognito mode."
                  : this.state.errorComponent === "admin"
                    ? "The admin dashboard encountered a critical error. This could be due to bundle generation failures, insufficient permissions, CORS middleware issues, or database connectivity problems. Check browser console for specific errors."
                    : this.state.errorComponent === "customer"
                      ? "The customer dashboard failed to load. This may be due to component mounting issues, authentication flow problems, network authorization errors, or service request API failures. Verify environment variables."
                      : this.state.errorComponent === "security"
                        ? "The security operations center encountered a critical error. This could be due to security policy violations, monitoring system failures, or access control issues."
                        : "An unexpected application error occurred. This may be related to React hooks being called conditionally or inconsistently. The component structure has been optimized to prevent hook-related errors."}
            </Text>

            {this.state.errorDetails && (
              <View className="bg-slate-900/50 rounded-xl p-4 mb-6">
                <Text className="text-red-400 font-semibold mb-2 text-sm">
                  Error Details:
                </Text>
                <Text className="text-slate-400 text-xs mb-1">
                  {this.state.errorDetails.message}
                </Text>
                <Text className="text-slate-500 text-xs">
                  Context: {this.state.errorDetails.context}
                </Text>
              </View>
            )}

            <View className="space-y-3">
              <TouchableOpacity
                onPress={() =>
                  this.setState({
                    hasError: false,
                    errorInfo: null,
                    errorComponent: null,
                    errorDetails: null,
                  })
                }
                className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold">Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  // Reset error state and navigate to safe dashboard
                  this.setState({
                    hasError: false,
                    errorInfo: null,
                    errorComponent: null,
                    errorDetails: null,
                    severity: null,
                  });
                  // Force navigation to customer dashboard as safe fallback
                  setTimeout(() => {
                    if (this.props.onNavigateToSafe) {
                      this.props.onNavigateToSafe("customer");
                    }
                  }, 100);
                }}
                className="bg-white/10 border border-white/10 rounded-xl py-3 items-center"
              >
                <Text className="text-slate-300 font-medium">
                  Go to Safe Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  // Attempt to get AI troubleshooting for this error
                  if (this.state.errorDetails) {
                    console.log(
                      "Requesting AI troubleshooting for:",
                      this.state.errorDetails,
                    );
                    // This would trigger the troubleshooting system
                    // For now, just log the error details for debugging
                  }
                  // Reset and try again
                  this.setState({
                    hasError: false,
                    errorInfo: null,
                    errorComponent: null,
                    errorDetails: null,
                    severity: null,
                  });
                }}
                className="bg-blue-600 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-medium">
                  Get AI Help & Retry
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-slate-500 text-xs text-center mt-4">
              If this error persists, please contact support with the error
              details above.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

type PanelType =
  | "customer"
  | "admin"
  | "technician"
  | "partner"
  | "security"
  | "activity"
  | "map"
  | "alerts"
  | "ai";

// Memoize panels array to prevent re-creation on every render
const panels = [
  { id: "customer", name: "Customer Dashboard", icon: "≡ƒæñ" },
  { id: "admin", name: "Admin Dashboard", icon: "ΓÜÖ∩╕Å" },
  { id: "technician", name: "Technician Dashboard", icon: "≡ƒöº" },
  { id: "partner", name: "Partner Management", icon: "≡ƒñ¥" },
  { id: "security", name: "Security Operations", icon: "≡ƒ¢í∩╕Å" },
  { id: "activity", name: "Activity Feed", icon: "≡ƒôè" },
  { id: "map", name: "Live Service Map", icon: "≡ƒù║∩╕Å" },
  { id: "alerts", name: "System Alerts", icon: "≡ƒÜ¿" },
  { id: "ai", name: "AI Assistant", icon: "≡ƒñû" },
];

export default function App() {
  const [activePanel, setActivePanel] = useState<PanelType>("customer");

  // Memoize panel change handler to prevent unnecessary re-renders
  const handlePanelChange = useCallback((panelId: PanelType) => {
    setActivePanel(panelId);
  }, []);

  // Memoize the rendered panel to prevent re-creation on every render
  const renderPanel = useMemo(() => {
    // Wrap in error boundary to catch rendering errors
    try {
      switch (activePanel) {
        case "customer":
          return (
            <CustomerDashboard userName="Sarah" membershipType="Premium" />
          );
        case "admin":
          return (
            <AuthGuard>
              <AdminDashboard />
            </AuthGuard>
          );
        case "technician":
          return <TechnicianDashboard />;
        case "partner":
          return <PartnerManagement />;
        case "security":
          return <SecurityOperationsCenter />;
        case "activity":
          return <ActivityFeed />;
        case "map":
          return <LiveServiceMap />;
        case "alerts":
          return <SystemAlertsView />;
        case "ai":
          return <PerplexityAssistant />;
        default:
          return (
            <CustomerDashboard userName="Sarah" membershipType="Premium" />
          );
      }
    } catch (error) {
      console.error("Error rendering panel:", error);
      return (
        <View className="flex-1 bg-slate-900 justify-center items-center p-4">
          <Text className="text-white text-lg font-bold mb-4">
            Error loading dashboard
          </Text>
          <Text className="text-slate-300 text-center mb-4">
            There was a problem loading this component. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => setActivePanel("customer")}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">
              Go to Customer Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }, [activePanel]);

  return (
    <ErrorBoundary>
      <SafeAreaView
        className="flex-1 bg-slate-900"
        testID="roadside-app-container"
      >
        {/* Panel Navigation */}
        <View className="bg-slate-800 border-b border-white/10 p-4">
          <Text className="text-white text-lg font-bold mb-4">
            RoadSide+ Dashboard Panels
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {panels.map((panel) => (
                <TouchableOpacity
                  key={panel.id}
                  onPress={() => handlePanelChange(panel.id as PanelType)}
                  className={`px-4 py-2 rounded-lg flex-row items-center ${
                    activePanel === panel.id ? "bg-red-600" : "bg-slate-700"
                  }`}
                >
                  <Text className="text-lg mr-2">{panel.icon}</Text>
                  <Text
                    className={`text-sm font-medium ${
                      activePanel === panel.id ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {panel.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Active Panel */}
        <View className="flex-1">{renderPanel}</View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
