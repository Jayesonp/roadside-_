import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "./Auth";

interface AuthDebuggerProps {
  backgroundColor?: string;
}

interface DebugResult {
  test: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: any;
}

export default function AuthDebugger({
  backgroundColor = "#0f172a",
}: AuthDebuggerProps = {}) {
  const [debugResults, setDebugResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { user, loading } = useAuth();

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDebugResults([]);
    const results: DebugResult[] = [];

    try {
      // Test 1: Environment Variables
      const envTest = await testEnvironmentVariables();
      results.push(envTest);

      // Test 2: Supabase Connection
      const connectionTest = await testSupabaseConnection();
      results.push(connectionTest);

      // Test 3: Database Schema
      const schemaTest = await testDatabaseSchema();
      results.push(schemaTest);

      // Test 4: Authentication Service
      const authTest = await testAuthenticationService();
      results.push(authTest);

      // Test 5: RLS Policies
      const rlsTest = await testRLSPolicies();
      results.push(rlsTest);

      // Test 6: Platform Compatibility
      const platformTest = testPlatformCompatibility();
      results.push(platformTest);

      // Test 7: Session Management
      const sessionTest = await testSessionManagement();
      results.push(sessionTest);

      setDebugResults(results);

      // Run comprehensive analysis
      await runComprehensiveAnalysis(results);
    } catch (error) {
      console.error("Diagnostics error:", error);
      results.push({
        test: "Diagnostics Runner",
        status: "fail",
        message: "Failed to complete diagnostics",
        details: error,
      });
      setDebugResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const testEnvironmentVariables = async (): Promise<DebugResult> => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return {
          test: "Environment Variables",
          status: "fail",
          message: "Missing required environment variables",
          details: {
            EXPO_PUBLIC_SUPABASE_URL: !!supabaseUrl,
            EXPO_PUBLIC_SUPABASE_ANON_KEY: !!supabaseKey,
          },
        };
      }

      if (!supabaseUrl.startsWith("https://")) {
        return {
          test: "Environment Variables",
          status: "warning",
          message: "Supabase URL should use HTTPS",
          details: { url: supabaseUrl },
        };
      }

      return {
        test: "Environment Variables",
        status: "pass",
        message: "All environment variables are properly configured",
      };
    } catch (error) {
      return {
        test: "Environment Variables",
        status: "fail",
        message: "Error checking environment variables",
        details: error,
      };
    }
  };

  const testSupabaseConnection = async (): Promise<DebugResult> => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("count");

      if (error) {
        return {
          test: "Supabase Connection",
          status: "fail",
          message: "Failed to connect to Supabase",
          details: error,
        };
      }

      return {
        test: "Supabase Connection",
        status: "pass",
        message: "Successfully connected to Supabase",
      };
    } catch (error) {
      return {
        test: "Supabase Connection",
        status: "fail",
        message: "Connection error",
        details: error,
      };
    }
  };

  const testDatabaseSchema = async (): Promise<DebugResult> => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, email, name, role, permissions, status")
        .limit(1);

      if (error) {
        return {
          test: "Database Schema",
          status: "fail",
          message: "Database schema validation failed",
          details: error,
        };
      }

      return {
        test: "Database Schema",
        status: "pass",
        message: "Database schema is properly configured",
      };
    } catch (error) {
      return {
        test: "Database Schema",
        status: "fail",
        message: "Schema validation error",
        details: error,
      };
    }
  };

  const testAuthenticationService = async (): Promise<DebugResult> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return {
          test: "Authentication Service",
          status: "warning",
          message: "Authentication service error",
          details: error,
        };
      }

      return {
        test: "Authentication Service",
        status: "pass",
        message: session
          ? "User is authenticated"
          : "Authentication service is working (no active session)",
        details: { hasSession: !!session },
      };
    } catch (error) {
      return {
        test: "Authentication Service",
        status: "fail",
        message: "Authentication service test failed",
        details: error,
      };
    }
  };

  const testRLSPolicies = async (): Promise<DebugResult> => {
    try {
      // Test if we can access admin_users table (should work with proper RLS)
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .limit(1);

      if (error && error.code === "42501") {
        return {
          test: "RLS Policies",
          status: "warning",
          message: "RLS policies may be too restrictive",
          details: error,
        };
      }

      return {
        test: "RLS Policies",
        status: "pass",
        message: "RLS policies are properly configured",
      };
    } catch (error) {
      return {
        test: "RLS Policies",
        status: "fail",
        message: "RLS policy test failed",
        details: error,
      };
    }
  };

  const testPlatformCompatibility = (): DebugResult => {
    const platform = Platform.OS;
    const isWeb = platform === "web";
    const userAgent = isWeb ? navigator.userAgent : "Native App";

    const issues = [];
    if (isWeb && userAgent.includes("Chrome")) {
      // Chrome-specific checks
    } else if (isWeb && userAgent.includes("Firefox")) {
      // Firefox-specific checks
    } else if (isWeb && userAgent.includes("Safari")) {
      issues.push("Safari may have session storage limitations");
    }

    return {
      test: "Platform Compatibility",
      status: issues.length > 0 ? "warning" : "pass",
      message:
        issues.length > 0
          ? "Platform compatibility issues detected"
          : "Platform compatibility looks good",
      details: {
        platform,
        userAgent,
        issues,
      },
    };
  };

  const testSessionManagement = async (): Promise<DebugResult> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return {
          test: "Session Management",
          status: "warning",
          message: "No active session found",
        };
      }

      // Check if session is valid and not expired
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;

      if (expiresAt < now) {
        return {
          test: "Session Management",
          status: "warning",
          message: "Session has expired",
          details: { expiresAt, now },
        };
      }

      return {
        test: "Session Management",
        status: "pass",
        message: "Session is valid and active",
        details: { expiresAt, now },
      };
    } catch (error) {
      return {
        test: "Session Management",
        status: "fail",
        message: "Session management test failed",
        details: error,
      };
    }
  };

  const runComprehensiveAnalysis = async (results: DebugResult[]) => {
    try {
      const failedTests = results.filter((r) => r.status === "fail");
      const warningTests = results.filter((r) => r.status === "warning");

      const analysisData = {
        authIssue: `Authentication diagnostics completed with ${failedTests.length} failures and ${warningTests.length} warnings`,
        errorDetails: {
          failures: failedTests,
          warnings: warningTests,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        },
        userAgent: Platform.OS === "web" ? navigator.userAgent : "React Native",
        platform: Platform.OS,
      };

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-auth-debug-analysis",
        {
          body: analysisData,
        },
      );

      if (error) {
        console.error("Analysis error:", error);
        return;
      }

      setAnalysisResult(data.analysis);
    } catch (error) {
      console.error("Comprehensive analysis error:", error);
    }
  };

  const getStatusIcon = (status: "pass" | "fail" | "warning") => {
    switch (status) {
      case "pass":
        return <CheckCircle size={20} color="#22c55e" />;
      case "fail":
        return <XCircle size={20} color="#ef4444" />;
      case "warning":
        return <AlertTriangle size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: "pass" | "fail" | "warning") => {
    switch (status) {
      case "pass":
        return "text-green-400";
      case "fail":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Bug size={24} color="#3b82f6" />
            <Text className="text-white text-2xl font-bold ml-3">
              Authentication Debugger
            </Text>
          </View>
          <Text className="text-slate-400 text-base mb-4">
            Comprehensive diagnostics for authentication issues
          </Text>

          <TouchableOpacity
            onPress={runDiagnostics}
            disabled={isRunning}
            className={`bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl py-3 px-6 flex-row items-center justify-center ${
              isRunning ? "opacity-50" : ""
            }`}
          >
            <RefreshCw
              size={20}
              color="white"
              style={{
                transform: [{ rotate: isRunning ? "360deg" : "0deg" }],
              }}
            />
            <Text className="text-white font-semibold text-base ml-2">
              {isRunning ? "Running Diagnostics..." : "Run Diagnostics"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Status */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Current Status
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300">Authentication State</Text>
              <Text className={user ? "text-green-400" : "text-red-400"}>
                {loading
                  ? "Loading..."
                  : user
                    ? "Authenticated"
                    : "Not Authenticated"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300">Platform</Text>
              <View className="flex-row items-center">
                {Platform.OS === "web" ? (
                  <Monitor size={16} color="#94a3b8" />
                ) : (
                  <Smartphone size={16} color="#94a3b8" />
                )}
                <Text className="text-slate-400 ml-2">
                  {Platform.OS === "web" ? "Desktop/Web" : "Mobile"}
                </Text>
              </View>
            </View>
            {user && (
              <>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">User Role</Text>
                  <Text className="text-blue-400">{user.role}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">User Email</Text>
                  <Text className="text-slate-400">{user.email}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Diagnostic Results */}
        {debugResults.length > 0 && (
          <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Diagnostic Results
            </Text>
            <View className="space-y-3">
              {debugResults.map((result, index) => (
                <View
                  key={index}
                  className="bg-slate-900/50 rounded-xl p-4 border border-white/5"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      {getStatusIcon(result.status)}
                      <Text className="text-white font-medium ml-3">
                        {result.test}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${getStatusColor(result.status)}`}
                    >
                      {result.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-slate-300 text-sm">
                    {result.message}
                  </Text>
                  {result.details && (
                    <View className="mt-2 p-2 bg-slate-800/50 rounded-lg">
                      <Text className="text-slate-400 text-xs font-mono">
                        {JSON.stringify(result.details, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Comprehensive Analysis
            </Text>

            {/* Root Cause */}
            <View className="mb-6">
              <Text className="text-blue-400 font-semibold mb-2">
                Root Cause Analysis
              </Text>
              <Text className="text-slate-300 text-sm">
                {analysisResult.rootCause}
              </Text>
            </View>

            {/* Platform Issues */}
            {analysisResult.platformIssues && (
              <View className="mb-6">
                <Text className="text-yellow-400 font-semibold mb-2">
                  Platform-Specific Issues
                </Text>
                {analysisResult.platformIssues.issues.map(
                  (issue: string, index: number) => (
                    <Text key={index} className="text-slate-300 text-sm mb-1">
                      ΓÇó {issue}
                    </Text>
                  ),
                )}
              </View>
            )}

            {/* Recommended Fixes */}
            {analysisResult.recommendedFixes && (
              <View className="mb-6">
                <Text className="text-green-400 font-semibold mb-2">
                  Immediate Fixes
                </Text>
                {analysisResult.recommendedFixes.immediate.map(
                  (fix: string, index: number) => (
                    <Text key={index} className="text-slate-300 text-sm mb-1">
                      ΓÇó {fix}
                    </Text>
                  ),
                )}
              </View>
            )}

            {/* Debugging Steps */}
            {analysisResult.debuggingSteps && (
              <View>
                <Text className="text-purple-400 font-semibold mb-2">
                  Debugging Steps
                </Text>
                {analysisResult.debuggingSteps
                  .slice(0, 5)
                  .map((step: string, index: number) => (
                    <Text key={index} className="text-slate-300 text-sm mb-1">
                      {step}
                    </Text>
                  ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
