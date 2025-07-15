import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
} from "./responsive/ResponsiveComponents";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import {
  BarChart3,
  Plus,
  Settings,
  Eye,
  ArrowUp,
  Check,
  Trash2,
  X,
  Mail,
  Lock,
  EyeOff,
  Shield,
  ArrowLeft,
  User,
  Building,
  CheckCircle,
} from "lucide-react-native";

interface Feature {
  name: string;
  description: string;
  badge: "core" | "pro" | "enterprise";
  enabled: boolean;
}

interface Partner {
  id: string;
  name: string;
  domain: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "inactive" | "pending";
  stats: {
    customers: number;
    jobs: number;
    revenue: string;
    techs: number;
  };
  features: Feature[];
}

interface PartnerManagementProps {
  backgroundColor?: string;
}

interface PartnerUser {
  id: string;
  email: string;
  name: string;
  companyName: string;
}

const PartnerManagement = React.memo(function PartnerManagement({
  backgroundColor = "#0f172a",
}: PartnerManagementProps) {
  // Error handling state
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [troubleshootingGuide, setTroubleshootingGuide] = useState<any>(null);
  const [showTroubleshootingModal, setShowTroubleshootingModal] =
    useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<PartnerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">(
    "login",
  );
  const [authLoading, setAuthLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: "",
    subdomain: "",
    plan: "",
    brandColor: "#2563eb",
  });

  const [partners, setPartners] = useState<Partner[]>([
    {
      id: "quicktow",
      name: "QuickTow Pro",
      domain: "quicktowpro.roadside.app",
      plan: "starter",
      status: "active",
      stats: {
        customers: 247,
        jobs: 89,
        revenue: "$12.8K",
        techs: 8,
      },
      features: [
        {
          name: "Job Dispatch",
          description: "Create and manage service requests",
          badge: "core",
          enabled: true,
        },
        {
          name: "User Management",
          description: "Manage customer accounts",
          badge: "pro",
          enabled: false,
        },
        {
          name: "Technician Management",
          description: "Manage service providers",
          badge: "pro",
          enabled: false,
        },
        {
          name: "Analytics Dashboard",
          description: "Detailed performance metrics",
          badge: "pro",
          enabled: false,
        },
        {
          name: "Billing & Revenue",
          description: "Financial management tools",
          badge: "pro",
          enabled: false,
        },
        {
          name: "Support Access",
          description: "Customer support tools",
          badge: "core",
          enabled: true,
        },
      ],
    },
    {
      id: "roadhelp",
      name: "RoadHelp Services",
      domain: "roadhelp.roadside.app",
      plan: "pro",
      status: "active",
      stats: {
        customers: 856,
        jobs: 342,
        revenue: "$45.2K",
        techs: 23,
      },
      features: [
        {
          name: "Job Dispatch",
          description: "Create and manage service requests",
          badge: "core",
          enabled: true,
        },
        {
          name: "User Management",
          description: "Manage customer accounts",
          badge: "pro",
          enabled: true,
        },
        {
          name: "Technician Management",
          description: "Manage service providers",
          badge: "pro",
          enabled: true,
        },
        {
          name: "Analytics Dashboard",
          description: "Detailed performance metrics",
          badge: "pro",
          enabled: true,
        },
        {
          name: "Billing & Revenue",
          description: "Financial management tools",
          badge: "pro",
          enabled: true,
        },
        {
          name: "API Access",
          description: "Developer integration tools",
          badge: "enterprise",
          enabled: false,
        },
      ],
    },
    {
      id: "cityemergency",
      name: "City Emergency Auto",
      domain: "cityemergency.roadside.app",
      plan: "enterprise",
      status: "pending",
      stats: {
        customers: 0,
        jobs: 0,
        revenue: "$0",
        techs: 0,
      },
      features: [
        {
          name: "Job Dispatch",
          description: "Create and manage service requests",
          badge: "core",
          enabled: true,
        },
        {
          name: "Full Platform Access",
          description: "Complete white-label solution",
          badge: "enterprise",
          enabled: true,
        },
      ],
    },
  ]);

  const toggleFeature = (partnerId: string, featureIndex: number) => {
    setPartners((prev) =>
      prev.map((partner) => {
        if (partner.id === partnerId) {
          const updatedFeatures = [...partner.features];
          updatedFeatures[featureIndex].enabled =
            !updatedFeatures[featureIndex].enabled;
          return { ...partner, features: updatedFeatures };
        }
        return partner;
      }),
    );
  };

  const getEnabledFeaturesCount = (features: Feature[]) => {
    return features.filter((f) => f.enabled).length;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "starter":
        return "bg-blue-500/20 text-blue-400";
      case "pro":
        return "bg-yellow-500/20 text-yellow-400";
      case "enterprise":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "core":
        return "bg-green-500/20 text-green-400";
      case "pro":
        return "bg-yellow-500/20 text-yellow-400";
      case "enterprise":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleManagePartner = (partnerId: string) => {
    Alert.alert("Manage Partner", `Managing partner: ${partnerId}`);
  };

  const handleViewDashboard = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    Alert.alert(
      "View Dashboard",
      `Opening dashboard for ${partner?.name}\n${partner?.domain}`,
    );
  };

  const handleUpgradePartner = (partnerId: string) => {
    Alert.alert("Upgrade Partner", `Upgrading partner: ${partnerId}`);
  };

  const handleActivatePartner = (partnerId: string) => {
    setPartners((prev) =>
      prev.map((partner) =>
        partner.id === partnerId
          ? { ...partner, status: "active" as const }
          : partner,
      ),
    );
    Alert.alert(
      "Partner Activated",
      "Partner has been successfully activated!",
    );
  };

  const handleDeletePartner = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    Alert.alert(
      "Delete Partner",
      `Are you sure you want to delete ${partner?.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPartners((prev) => prev.filter((p) => p.id !== partnerId));
          },
        },
      ],
    );
  };

  const handleCreatePartner = () => {
    if (
      !newPartnerForm.name ||
      !newPartnerForm.subdomain ||
      !newPartnerForm.plan
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const newPartner: Partner = {
      id: newPartnerForm.subdomain.toLowerCase(),
      name: newPartnerForm.name,
      domain: `${newPartnerForm.subdomain}.roadside.app`,
      plan: newPartnerForm.plan as "starter" | "pro" | "enterprise",
      status: "pending",
      stats: {
        customers: 0,
        jobs: 0,
        revenue: "$0",
        techs: 0,
      },
      features: [
        {
          name: "Job Dispatch",
          description: "Create and manage service requests",
          badge: "core",
          enabled: true,
        },
        {
          name: "Support Access",
          description: "Customer support tools",
          badge: "core",
          enabled: true,
        },
      ],
    };

    setPartners((prev) => [...prev, newPartner]);
    setNewPartnerForm({
      name: "",
      subdomain: "",
      plan: "",
      brandColor: "#2563eb",
    });
    setShowAddModal(false);
    Alert.alert("Success", "New partner created successfully!");
  };

  // Enhanced error handling function with comprehensive error capture
  const handleError = useCallback(
    async (error: any, context?: string) => {
      console.error("PartnerManagement error:", error, "Context:", context);

      // Prevent error handling loops
      if (hasError) {
        console.warn("Error handling already in progress, skipping duplicate");
        return;
      }

      // Capture additional debugging information
      const debugInfo = {
        url: typeof window !== "undefined" ? window.location.href : "N/A",
        userAgent:
          typeof navigator !== "undefined"
            ? navigator.userAgent
            : "React Native",
        timestamp: new Date().toISOString(),
        memoryUsage:
          typeof performance !== "undefined" && performance.memory
            ? {
                used: Math.round(
                  performance.memory.usedJSHeapSize / 1024 / 1024,
                ),
                total: Math.round(
                  performance.memory.totalJSHeapSize / 1024 / 1024,
                ),
                limit: Math.round(
                  performance.memory.jsHeapSizeLimit / 1024 / 1024,
                ),
              }
            : null,
        networkStatus:
          typeof navigator !== "undefined" ? navigator.onLine : true,
        deviceInfo: {
          platform: typeof Platform !== "undefined" ? Platform.OS : "web",
          version:
            typeof Platform !== "undefined" ? Platform.Version : "unknown",
        },
      };

      // Enhanced error details with comprehensive context
      const errorDetails = {
        errorType:
          error?.name || error?.constructor?.name || "ComponentRenderError",
        errorMessage:
          error?.message ||
          error?.toString() ||
          "Partner management dashboard failed to render properly - persistent component error",
        componentName: "PartnerManagement",
        dashboardType: "partner" as const,
        stackTrace: error?.stack,
        timestamp: debugInfo.timestamp,
        context: context || "dashboard_initialization",
        userAgent: debugInfo.userAgent,
        userId: user?.id,
        sessionInfo: {
          isAuthenticated: !!user,
          userEmail: user?.email,
          companyName: user?.companyName,
          partnersCount: partners.length,
          isLoading,
          authLoading,
          showAddModal,
          hasValidSession: !!user?.id,
          sessionAge: user ? Date.now() - (user.lastLogin || 0) : 0,
          componentMountTime: Date.now(),
          activePartnersCount: partners.filter((p) => p.status === "active")
            .length,
          pendingPartnersCount: partners.filter((p) => p.status === "pending")
            .length,
        },
        environmentInfo: {
          platform: debugInfo.deviceInfo.platform,
          platformVersion: debugInfo.deviceInfo.version,
          isDev: typeof __DEV__ !== "undefined" ? __DEV__ : false,
          networkOnline: debugInfo.networkStatus,
          supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL
            ? "configured"
            : "missing",
          supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
            ? "configured"
            : "missing",
        },
        debugInfo,
        errorFrequency: {
          isRecurring: context === "recurring_error",
          lastErrorTime: errorTimeoutRef.current ? Date.now() : null,
        },
      };

      setErrorDetails(errorDetails);
      setHasError(true);

      // Get AI-powered troubleshooting guide with enhanced retry logic
      try {
        console.log(
          "Requesting enhanced troubleshooting guide for partner management:",
          errorDetails.errorType,
          "Context:",
          errorDetails.context,
        );

        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Troubleshooting request timeout")),
            15000,
          ),
        );

        const troubleshootingPromise = supabase.functions.invoke(
          "supabase-functions-perplexity-dashboard-troubleshoot",
          {
            body: errorDetails,
          },
        );

        const { data: guide, error: guideError } = (await Promise.race([
          troubleshootingPromise,
          timeoutPromise,
        ])) as any;

        if (guideError) {
          console.warn("Troubleshooting guide error:", guideError);
          // Use fallback guide from error response if available
          if (guideError.fallbackGuide) {
            setTroubleshootingGuide(guideError.fallbackGuide);
          } else {
            setTroubleshootingGuide(
              getEnhancedPartnerFallbackGuide(errorDetails),
            );
          }
        } else if (guide) {
          console.log("Enhanced partner troubleshooting guide received:", {
            severity: guide.severity,
            stepsCount: guide.specificSteps?.length || 0,
            causesCount: guide.possibleCauses?.length || 0,
            fixesCount: guide.quickFixes?.length || 0,
          });
          setTroubleshootingGuide(guide);
        } else {
          setTroubleshootingGuide(
            getEnhancedPartnerFallbackGuide(errorDetails),
          );
        }
      } catch (guideError) {
        console.warn(
          "Failed to get partner troubleshooting guide:",
          guideError,
        );
        setTroubleshootingGuide(getEnhancedPartnerFallbackGuide(errorDetails));
      }

      // Auto-reset error state after 20 seconds with exponential backoff
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      const resetDelay = context === "recurring_error" ? 30000 : 20000;
      errorTimeoutRef.current = setTimeout(() => {
        console.log(
          "Auto-resetting partner error state after",
          resetDelay / 1000,
          "seconds",
        );
        setHasError(false);
        setErrorDetails(null);
        setTroubleshootingGuide(null);
      }, resetDelay);
    },
    [user, partners.length, isLoading, showAddModal, hasError],
  );

  // Enhanced fallback guide generator for partner management
  const getEnhancedPartnerFallbackGuide = (errorDetails: any) => {
    return {
      troubleshootingGuide: `# Enhanced Partner Management Dashboard Troubleshooting Guide\n\nA critical error occurred in the partner management dashboard component. This comprehensive guide will help you identify and resolve the issue.\n\n## Error Analysis\n- Error Type: ${errorDetails.errorType}\n- Context: ${errorDetails.context}\n- Authentication Status: ${errorDetails.sessionInfo.isAuthenticated ? "Authenticated" : "Not Authenticated"}\n- Network Status: ${errorDetails.environmentInfo.networkOnline ? "Online" : "Offline"}\n- Partners Count: ${errorDetails.sessionInfo.partnersCount}\n\n## Root Cause Analysis\nBased on the error context and system state, this appears to be related to partner data management, authentication state synchronization, or component lifecycle issues.`,
      specificSteps: [
        "Check browser console (F12) for detailed error messages and partner-specific API failures",
        "Verify Supabase environment variables and partner table access permissions",
        "Test partner authentication by running 'await supabase.auth.getSession()' in browser console",
        "Clear all browser data (cache, localStorage, sessionStorage) and perform hard refresh (Ctrl+F5)",
        "Restart Expo development server with 'npx expo start --clear' to clear Metro bundler cache",
        "Check network connectivity and test Supabase connection with partner table queries",
        "Verify partner profile exists in database and has proper role assignments",
        "Test with demo partner credentials to isolate authentication-specific issues",
        "Monitor memory usage in browser Performance tab during partner data loading",
        "Check for infinite re-render loops in partner list rendering and state management",
        "Validate all partner component props and ensure no undefined partner data",
        "Test partner feature access control and permission validation",
        "Check partner modal state management and form validation logic",
        "Verify partner creation and update API endpoints are functioning correctly",
      ],
      possibleCauses: [
        "Partner authentication session expired or invalid, requiring re-authentication",
        "Supabase partner table access denied due to RLS policies or missing permissions",
        "Component lifecycle race condition in partner data loading or state updates",
        "Network connectivity issues preventing partner API calls from completing",
        "Memory pressure causing partner component rendering failures",
        "Infinite re-render loop in partner list or modal state management",
        "Partner feature access control validation failing due to role/permission issues",
        "Database schema changes affecting partner table structure or relationships",
        "Partner form validation errors causing component crashes",
        "Multi-tenant partner data isolation issues causing access conflicts",
      ],
      quickFixes: [
        "Sign out completely and sign back in to refresh partner authentication session",
        "Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R) to clear partner data cache",
        "Clear browser application data and restart the partner management session",
        "Restart development server: Stop process and run 'npx expo start --clear'",
        "Test with demo partner credentials: Use 'partner@roadside.com' / 'demo123'",
        "Check network connection and verify Supabase partner table accessibility",
        "Close any open partner modals and refresh the partner list",
        "Verify partner role and permissions in the database",
        "Test partner operations in incognito mode to rule out browser conflicts",
        "Check partner feature flags and access control settings",
      ],
      preventionTips: [
        "Implement comprehensive error boundaries around partner management components",
        "Add proper cleanup functions to partner data loading useEffect hooks",
        "Use proper dependency arrays in partner-related useEffect to prevent infinite loops",
        "Implement partner session validation and automatic refresh mechanisms",
        "Add network connectivity monitoring for partner API operations",
        "Regularly validate partner permissions and role assignments",
        "Implement proper loading states for all partner data operations",
        "Add comprehensive logging for partner management operations and errors",
        "Monitor partner feature access patterns and usage analytics",
        "Implement partner data caching and offline state handling",
      ],
      severity: "high",
      estimatedFixTime: "15-30 minutes",
      requiresRestart: true,
    };
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Auth functions
  useEffect(() => {
    try {
      checkAuthStatus();
    } catch (error) {
      handleError(error);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log("Checking partner auth status...");

      // Validate environment variables first
      if (
        !process.env.EXPO_PUBLIC_SUPABASE_URL ||
        !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.error("Missing Supabase configuration");
        throw new Error("Missing Supabase environment variables");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        // Handle specific session errors
        if (sessionError.message.includes("Invalid JWT")) {
          console.log("Invalid JWT detected, signing out...");
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        throw new Error(`Session retrieval failed: ${sessionError.message}`);
      }

      if (session) {
        console.log("Session found, validating and loading partner profile...");

        // Validate session expiration
        const now = new Date().getTime() / 1000;
        if (session.expires_at && session.expires_at < now) {
          console.log("Session expired, attempting refresh...");
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Session refresh failed:", refreshError);
            await supabase.auth.signOut();
            setUser(null);
            return;
          }
        }

        try {
          // Load partner profile with enhanced timeout and retry logic
          const profilePromise = supabase
            .from("partners")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Profile loading timeout")),
              8000,
            ),
          );

          const { data, error } = (await Promise.race([
            profilePromise,
            timeoutPromise,
          ])) as any;

          if (error && error.code !== "PGRST116") {
            // PGRST116 is "not found" which is acceptable
            console.warn("Profile loading error:", error);
          }

          if (data) {
            console.log("Partner profile loaded successfully");
            setUser({
              id: data.id,
              email: data.email,
              name: data.name,
              companyName: data.company_name || "Partner Company",
            });
          } else {
            console.log("No partner profile found, using session data");
            // Fallback user data from session
            setUser({
              id: session.user.id,
              email: session.user.email || "partner@roadside.com",
              name: session.user.user_metadata?.name || "Partner User",
              companyName: "Partner Company",
            });
          }
        } catch (profileError) {
          console.error("Error loading partner profile:", profileError);
          // Don't call handleError here to avoid infinite loops during initialization
          console.warn("Using fallback user data due to profile error");
          // Set default user data if profile loading fails
          setUser({
            id: session.user.id,
            email: session.user.email || "partner@roadside.com",
            name: session.user.user_metadata?.name || "Partner User",
            companyName: "Partner Company",
          });
        }
      } else {
        console.log("No session found, using demo user");
        // If no session, set demo user for testing
        setUser({
          id: "demo-id",
          email: "partner@roadside.com",
          name: "Partner User",
          companyName: "Demo Partner Company",
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't call handleError during initialization to avoid loops
      console.warn("Using fallback user data due to auth error");
      // Set fallback user data even if auth check fails
      setUser({
        id: "demo-id",
        email: "partner@roadside.com",
        name: "Partner User",
        companyName: "Demo Partner Company",
      });
    } finally {
      setIsLoading(false);
      console.log("Partner auth status check completed");
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Sign In Error", error.message);
        return;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || "Partner User",
          companyName: "Partner Company",
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            user_type: "partner",
          },
        },
      });

      if (error) {
        Alert.alert("Registration Error", error.message);
        return;
      }

      setSuccessMessage(
        "Registration successful! Please check your email to verify your account.",
      );
      setShowSuccessModal(true);
      resetForm();
      setAuthMode("login");
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        Alert.alert("Password Reset Error", error.message);
        return;
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email.",
      );
      setShowSuccessModal(true);
      setAuthMode("login");
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchAuthMode = (mode: "login" | "register" | "reset") => {
    resetForm();
    setAuthMode(mode);
  };

  const handleDemoLogin = async () => {
    setAuthLoading(true);
    try {
      const success = await handleSignInWithCredentials(
        "partner@roadside.com",
        "demo123",
      );
      if (!success) {
        setEmail("partner@roadside.com");
        setPassword("demo123");
        Alert.alert(
          "Demo Login",
          "Demo credentials have been filled in. Please try signing in manually.",
        );
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setEmail("partner@roadside.com");
      setPassword("demo123");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignInWithCredentials = async (
    email: string,
    password: string,
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return false;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || "Partner User",
          companyName: "Partner Company",
        });
        return true;
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
    return false;
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-2xl items-center justify-center mb-4">
            <Building size={32} color="white" />
          </View>
          <ActivityIndicator size="large" color="#eab308" />
          <ResponsiveText className="text-white text-lg font-semibold mt-4">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center px-6 py-8">
            {/* Back Button */}
            {authMode !== "login" && (
              <TouchableOpacity
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> switchAuthMode("login")}
                className="absolute top-8 left-6 w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
               accessibilityRole="button" accessibilityLabel="Interactive button">
                <ArrowLeft size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}

            {/* Logo and Title */}
            <View className="items-center mb-12">
              <Image
                source={require("../../public/images/Main-Brand-Logo.png")}
                className="w-32 h-16 mb-6"
                resizeMode="contain"
              />
              <ResponsiveText className="text-white text-3xl font-bold mb-2">
                RoadSide+ Partner
              </Text>
              <ResponsiveText className="text-slate-400 text-center text-base">
                {authMode === "login" &&
                  "Access your partner management portal"}
                {authMode === "register" && "Create your partner account"}
                {authMode === "reset" && "Reset your password"}
              </Text>
            </View>

            {/* Auth Form */}
            <View className="w-full max-w-sm">
              <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                <ResponsiveText className="text-white text-xl font-bold mb-6 text-center">
                  {authMode === "login" && "Sign In"}
                  {authMode === "register" && "Create Account"}
                  {authMode === "reset" && "Reset Password"}
                </Text>

                {/* Name Input - Only for Registration */}
                {authMode === "register" && (
                  <View className="mb-4">
                    <ResponsiveText className="text-slate-200 font-semibold mb-2">
                      Full Name
                    </Text>
                    <View className="flex-row items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                      <User size={20} color="#94a3b8" />
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#64748b"
                        className="flex-1 text-white text-base ml-3"
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                )}

                {/* Email Input */}
                <View className="mb-4">
                  <ResponsiveText className="text-slate-200 font-semibold mb-2">
                    Email
                  </Text>
                  <View className="flex-row items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                    <Mail size={20} color="#94a3b8" />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#64748b"
                      className="flex-1 text-white text-base ml-3"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input - Not for Reset */}
                {authMode !== "reset" && (
                  <View className="mb-4">
                    <ResponsiveText className="text-slate-200 font-semibold mb-2">
                      Password
                    </Text>
                    <View className="flex-row items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                      <Lock size={20} color="#94a3b8" />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder={
                          authMode === "register"
                            ? "Create a password (min 6 chars)"
                            : "Enter your password"
                        }
                        placeholderTextColor="#64748b"
                        className="flex-1 text-white text-base ml-3"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowPassword(!showPassword)}
                        className="ml-2"
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        {showPassword ? (
                          <EyeOff size={20} color="#94a3b8" />
                        ) : (
                          <Eye size={20} color="#94a3b8" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Confirm Password Input - Only for Registration */}
                {authMode === "register" && (
                  <View className="mb-6">
                    <ResponsiveText className="text-slate-200 font-semibold mb-2">
                      Confirm Password
                    </Text>
                    <View className="flex-row items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                      <Lock size={20} color="#94a3b8" />
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm your password"
                        placeholderTextColor="#64748b"
                        className="flex-1 text-white text-base ml-3"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button">
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="ml-2"
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        {showConfirmPassword ? (
                          <EyeOff size={20} color="#94a3b8" />
                        ) : (
                          <Eye size={20} color="#94a3b8" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Main Action Button */}
                <TouchableOpacity
                  onPress={
                    authMode === "login"
                      ? handleSignIn
                      : authMode === "register"
                        ? handleSignUp
                        : handlePasswordReset
                  }
                  disabled={authLoading}
                  className={`bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl py-4 items-center mb-4 ${authLoading ? "opacity-50" : ""}`}
                 accessibilityRole="button" accessibilityLabel="Interactive button">
                  {authLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" size="small" />
                      <ResponsiveText className="text-white font-bold text-base ml-2">
                        {authMode === "login" && "Signing In..."}
                        {authMode === "register" && "Creating Account..."}
                        {authMode === "reset" && "Sending Reset Link..."}
                      </Text>
                    </View>
                  ) : (
                    <ResponsiveText className="text-white font-bold text-base">
                      {authMode === "login" && "Sign In"}
                      {authMode === "register" && "Create Account"}
                      {authMode === "reset" && "Send Reset Link"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Secondary Actions */}
                {authMode === "login" && (
                  <>
                    <ResponsiveButton
                      onPress={handleDemoLogin}
                      disabled={authLoading}
                      className="bg-white/10 border border-white/10 rounded-xl py-3 items-center mb-4"
                     accessibilityRole="button" style={{ minHeight: designSystem.spacing.touchTarget.min }}>
                      <ResponsiveText className="text-slate-300 font-semibold text-sm">
                        Demo Login
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> switchAuthMode("register")}
                        disabled={authLoading}
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        <ResponsiveText className="text-yellow-400 text-sm font-medium">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> switchAuthMode("reset")}
                        disabled={authLoading}
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        <ResponsiveText className="text-yellow-400 text-sm font-medium">
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {authMode === "register" && (
                  <TouchableOpacity
                    onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> switchAuthMode("login")}
                    disabled={authLoading}
                    className="items-center"
                   accessibilityRole="button" accessibilityLabel="Interactive button">
                    <ResponsiveText className="text-yellow-400 text-sm font-medium">
                      Already have an account? Sign In
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Security Notice */}
              <View className="bg-slate-800/50 border border-white/10 rounded-xl p-4 mt-6">
                <View className="flex-row items-center mb-2">
                  <Shield size={16} color="#22c55e" />
                  <ResponsiveText className="text-green-400 font-semibold text-sm ml-2">
                    Secure Authentication
                  </Text>
                </View>
                <ResponsiveText className="text-slate-400 text-xs leading-relaxed">
                  Your partner credentials are encrypted and protected. Manage
                  your business operations securely.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() = accessibilityViewIsModal={true}> setShowSuccessModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-slate-800 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-green-500/20 rounded-full items-center justify-center mb-4">
                  <CheckCircle size={32} color="#22c55e" />
                </View>
                <ResponsiveText className="text-white text-xl font-bold text-center mb-2">
                  Success!
                </Text>
                <ResponsiveText className="text-slate-300 text-center text-sm leading-relaxed">
                  {successMessage}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowSuccessModal(false)}
                className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-3 items-center"
               accessibilityRole="button" accessibilityLabel="Interactive button">
                <ResponsiveText className="text-white font-bold text-base">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // If there's an error, show enhanced error UI with troubleshooting
  if (hasError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <ScrollView className="flex-1 p-4">
          <View className="bg-slate-800/80 backdrop-blur-lg border border-yellow-500/50 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center mb-4">
              <AlertTriangle size={24} color="#eab308" />
              <ResponsiveText className="text-white text-xl font-bold ml-3">
                Partner Management Error
              </Text>
            </View>

            <ResponsiveText className="text-slate-300 mb-4">
              There was a problem loading the partner management dashboard.
              Here's what we know:
            </Text>

            {errorDetails && (
              <View className="bg-slate-900/50 rounded-xl p-4 mb-4">
                <ResponsiveText className="text-yellow-400 font-semibold mb-2">
                  Error Details:
                </Text>
                <ResponsiveText className="text-slate-300 text-sm mb-1">
                  Type: {errorDetails.errorType}
                </Text>
                <ResponsiveText className="text-slate-300 text-sm mb-1">
                  Message: {errorDetails.errorMessage}
                </Text>
                <ResponsiveText className="text-slate-300 text-sm">
                  Time: {new Date(errorDetails.timestamp).toLocaleString()}
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> {
                  setHasError(false);
                  setErrorDetails(null);
                  setTroubleshootingGuide(null);
                }}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl py-3 items-center"
               accessibilityRole="button" accessibilityLabel="Interactive button">
                <ResponsiveText className="text-white font-bold">Try Again</Text>
              </TouchableOpacity>

              {troubleshootingGuide && (
                <TouchableOpacity
                  onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowTroubleshootingModal(true)}
                  className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
                 accessibilityRole="button" accessibilityLabel="Interactive button">
                  <ResponsiveText className="text-white font-bold">Get Help</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {troubleshootingGuide && (
            <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <ResponsiveText className="text-white text-lg font-bold mb-4">
                Quick Fixes:
              </Text>
              {troubleshootingGuide.quickFixes
                ?.slice(0, 3)
                .map((fix: string, index: number) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <ResponsiveText className="text-green-400 mr-2">ΓÇó</Text>
                    <ResponsiveText className="text-slate-300 text-sm flex-1">{fix}</Text>
                  </View>
                ))}
            </View>
          )}
        </ScrollView>

        {/* Troubleshooting Modal */}
        <Modal
          visible={showTroubleshootingModal}
          transparent
          animationType="slide"
          onRequestClose={() = accessibilityViewIsModal={true}> setShowTroubleshootingModal(false)}
        >
          <View className="flex-1 bg-black/50">
            <View className="flex-1 bg-slate-900 mt-20 rounded-t-3xl">
              <View className="p-6 border-b border-white/10">
                <View className="flex-row justify-between items-center">
                  <ResponsiveText className="text-white text-xl font-bold">
                    AI Troubleshooting Guide
                  </Text>
                  <TouchableOpacity
                    onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowTroubleshootingModal(false)}
                    className="w-8 h-8 bg-white/10 rounded-full items-center justify-center" style={{ minHeight: designSystem.spacing.touchTarget.min }}
                   accessibilityRole="button" accessibilityLabel="Interactive button">
                    <X size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView className="flex-1 p-6">
                {troubleshootingGuide && (
                  <>
                    <View className="mb-6">
                      <ResponsiveText className="text-white text-lg font-semibold mb-3">
                        Possible Causes:
                      </Text>
                      {troubleshootingGuide.possibleCauses?.map(
                        (cause: string, index: number) => (
                          <View
                            key={index}
                            className="flex-row items-start mb-2"
                          >
                            <ResponsiveText className="text-yellow-400 mr-2">ΓÇó</Text>
                            <ResponsiveText className="text-slate-300 text-sm flex-1">
                              {cause}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>

                    <View className="mb-6">
                      <ResponsiveText className="text-white text-lg font-semibold mb-3">
                        Step-by-Step Solutions:
                      </Text>
                      {troubleshootingGuide.specificSteps?.map(
                        (step: string, index: number) => (
                          <View
                            key={index}
                            className="bg-slate-800/50 rounded-xl p-4 mb-3"
                          >
                            <ResponsiveText className="text-blue-400 font-semibold mb-1">
                              Step {index + 1}
                            </Text>
                            <ResponsiveText className="text-slate-300 text-sm">
                              {step}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>

                    <View className="mb-6">
                      <ResponsiveText className="text-white text-lg font-semibold mb-3">
                        Prevention Tips:
                      </Text>
                      {troubleshootingGuide.preventionTips?.map(
                        (tip: string, index: number) => (
                          <View
                            key={index}
                            className="flex-row items-start mb-2"
                          >
                            <ResponsiveText className="text-green-400 mr-2">ΓÇó</Text>
                            <ResponsiveText className="text-slate-300 text-sm flex-1">
                              {tip}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Wrap the entire render in a try-catch to prevent crashes
  try {
    return (
      <View style={{ backgroundColor }} className="flex-1 p-3 sm:p-6">
        {/* Real-time Indicator */}
        <View className="absolute top-4 right-4 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 flex-row items-center z-10">
          <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          <ResponsiveText className="text-white text-xs font-semibold">
            Live Monitoring
          </Text>
          <ResponsiveButton onPress={handleSignOut} className="ml-4" accessibilityRole="button" style={{ minHeight: designSystem.spacing.touchTarget.min }}>
            <User size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-4 sm:p-8 mb-6">
            <View className="mb-4">
              <ResponsiveText className="text-white text-2xl sm:text-3xl font-bold mb-2">
                Partner Management
              </Text>
              <ResponsiveText className="text-slate-400 text-sm sm:text-base">
                Welcome {user.name} - Manage white-label partners and their
                feature access
              </Text>
            </View>
            <View className="flex-row gap-2 sm:gap-4">
              <ResponsiveButton className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 sm:px-6 sm:py-3 flex-row items-center justify-center" accessibilityRole="button" style={{ minHeight: designSystem.spacing.touchTarget.min }}>
                <BarChart3 size={14} color="#e2e8f0" />
                <ResponsiveText className="text-slate-200 font-semibold ml-2 text-xs sm:text-sm">
                  Export
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowAddModal(true)}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 rounded-xl px-3 py-2 sm:px-6 sm:py-3 flex-row items-center justify-center"
               accessibilityRole="button" accessibilityLabel="Interactive button">
                <Plus size={14} color="white" />
                <ResponsiveText className="text-white font-semibold ml-2 text-xs sm:text-sm">
                  Add Partner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Partners Grid */}
          <View className="gap-6">
            {partners.map((partner) => (
              <View
                key={partner.id}
                className={`bg-slate-800/80 border border-white/10 rounded-2xl p-6 ${
                  partner.status === "active"
                    ? "border-t-4 border-t-green-500"
                    : partner.status === "pending"
                      ? "border-t-4 border-t-slate-500"
                      : ""
                }`}
              >
                {/* Partner Header */}
                <View className="flex-row justify-between items-start mb-5">
                  <View className="flex-1">
                    <ResponsiveText className="text-white text-xl font-bold mb-1">
                      {partner.name}
                    </Text>
                    <ResponsiveText className="text-slate-500 text-xs font-mono mb-2">
                      {partner.domain}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-md self-start ${getPlanColor(
                        partner.plan,
                      )}`}
                    >
                      <ResponsiveText className="text-xs font-bold uppercase">
                        {partner.plan} Plan
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className={`w-2 h-2 rounded-full mr-2 ${
                        partner.status === "active"
                          ? "bg-green-500"
                          : "bg-slate-500"
                      }`}
                    />
                    <ResponsiveText className="text-xs font-semibold text-slate-300 capitalize">
                      {partner.status === "pending"
                        ? "Setup Pending"
                        : partner.status}
                    </Text>
                  </View>
                </View>

                {/* Partner Stats */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {[
                    { label: "Customers", value: partner.stats.customers },
                    { label: "Jobs", value: partner.stats.jobs },
                    { label: "Revenue", value: partner.stats.revenue },
                    { label: "Techs", value: partner.stats.techs },
                  ].map((stat, index) => (
                    <View
                      key={index}
                      className="bg-white/5 rounded-lg p-2 sm:p-3 flex-1 min-w-[70px] items-center"
                    >
                      <ResponsiveText className="text-white text-sm sm:text-lg font-bold mb-1">
                        {stat.value}
                      </Text>
                      <ResponsiveText className="text-slate-400 text-xs text-center">
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Feature Authorization Panel */}
                <View className="bg-white/5 rounded-xl p-5 mb-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <ResponsiveText className="text-white text-base font-semibold">
                      Feature Access Control
                    </Text>
                    <ResponsiveText className="text-slate-400 text-xs">
                      {getEnabledFeaturesCount(partner.features)} of{" "}
                      {partner.features.length} features enabled
                    </Text>
                  </View>

                  <View className="gap-3">
                    {partner.features.map((feature, featureIndex) => (
                      <TouchableOpacity
                        key={featureIndex}
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> toggleFeature(partner.id, featureIndex)}
                        className="flex-row items-center bg-white/5 rounded-lg p-3"
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        <View
                          className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                            feature.enabled
                              ? "bg-green-500 border-green-500"
                              : "border-slate-500"
                          }`}
                        >
                          {feature.enabled && <Check size={12} color="white" />}
                        </View>
                        <View className="flex-1">
                          <ResponsiveText className="text-slate-200 font-semibold text-sm mb-1">
                            {feature.name}
                          </Text>
                          <ResponsiveText className="text-slate-400 text-xs">
                            {feature.description}
                          </Text>
                        </View>
                        <View
                          className={`px-2 py-1 rounded ${getBadgeColor(
                            feature.badge,
                          )}`}
                        >
                          <ResponsiveText className="text-xs font-bold uppercase">
                            {feature.badge}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Partner Actions */}
                <View className="gap-2">
                  {partner.status === "pending" ? (
                    <>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> handleActivatePartner(partner.id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg py-3 px-3 flex-row items-center justify-center min-h-[44px]"
                         accessibilityRole="button" accessibilityLabel="Interactive button">
                          <Check size={14} color="white" />
                          <ResponsiveText className="text-white font-semibold text-xs ml-1">
                            Activate
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> handleManagePartner(partner.id)}
                          className="flex-1 bg-white/10 border border-white/10 rounded-lg py-3 px-3 flex-row items-center justify-center min-h-[44px]"
                         accessibilityRole="button" accessibilityLabel="Interactive button">
                          <Settings size={14} color="#e2e8f0" />
                          <ResponsiveText className="text-slate-200 font-semibold text-xs ml-1">
                            Configure
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> handleDeletePartner(partner.id)}
                        className="bg-red-500/20 border border-red-500/30 rounded-lg py-3 px-3 flex-row items-center justify-center min-h-[44px]"
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        <Trash2 size={14} color="#ef4444" />
                        <ResponsiveText className="text-red-400 font-semibold text-xs ml-1">
                          Delete Partner
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> handleManagePartner(partner.id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg py-3 px-3 flex-row items-center justify-center min-h-[44px]"
                         accessibilityRole="button" accessibilityLabel="Interactive button">
                          <Settings size={14} color="white" />
                          <ResponsiveText className="text-white font-semibold text-xs ml-1">
                            Manage
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> handleViewDashboard(partner.id)}
                          className="flex-1 bg-white/10 border border-white/10 rounded-lg py-3 px-3 flex-row items-center justify-center min-h-[44px]"
                         accessibilityRole="button" accessibilityLabel="Interactive button">
                          <Eye size={14} color="#e2e8f0" />
                          <ResponsiveText className="text-slate-200 font-semibold text-xs ml-1">
                            Dashboard
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> handleUpgradePartner(partner.id)}
                        className="bg-white/10 border border-white/10 rounded-lg py-3 px-3 flex-row items-center justify-center min-h-[44px]"
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        <ArrowUp size={14} color="#e2e8f0" />
                        <ResponsiveText className="text-slate-200 font-semibold text-xs ml-1">
                          Upgrade Plan
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Add Partner Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() = accessibilityViewIsModal={true}> setShowAddModal(false)}
        >
          <View className="flex-1 bg-black/80 justify-center items-center p-6">
            <View className="bg-slate-800 border border-white/10 rounded-2xl p-8 w-full max-w-md">
              <View className="mb-6">
                <ResponsiveText className="text-white text-2xl font-bold mb-2">
                  Add New Partner
                </Text>
                <ResponsiveText className="text-slate-400">
                  Create a new white-label partner with customized feature
                  access
                </Text>
              </View>

              <View className="gap-4">
                <View>
                  <ResponsiveText className="text-slate-200 font-semibold mb-2">
                    Partner Name
                  </Text>
                  <TextInput
                    value={newPartnerForm.name}
                    onChangeText={(text) =>
                      setNewPartnerForm((prev) => ({ ...prev, name: text }))
                    }
                    placeholder="e.g., QuickTow Pro"
                    placeholderTextColor="#64748b"
                    className="bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white"
                  />
                </View>

                <View>
                  <ResponsiveText className="text-slate-200 font-semibold mb-2">
                    Subdomain
                  </Text>
                  <TextInput
                    value={newPartnerForm.subdomain}
                    onChangeText={(text) =>
                      setNewPartnerForm((prev) => ({
                        ...prev,
                        subdomain: text,
                      }))
                    }
                    placeholder="e.g., quicktowpro"
                    placeholderTextColor="#64748b"
                    className="bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white"
                  />
                </View>

                <View>
                  <ResponsiveText className="text-slate-200 font-semibold mb-2">
                    Subscription Plan
                  </Text>
                  <View className="gap-2">
                    {[
                      {
                        value: "starter",
                        label: "Starter - $99/month (3 features)",
                      },
                      { value: "pro", label: "Pro - $299/month (8 features)" },
                      {
                        value: "enterprise",
                        label: "Enterprise - $799/month (All features)",
                      },
                    ].map((plan) => (
                      <TouchableOpacity
                        key={plan.value}
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button">
                          setNewPartnerForm((prev) => ({
                            ...prev,
                            plan: plan.value,
                          }))
                        }
                        className={`border rounded-lg p-3 flex-row items-center ${
                          newPartnerForm.plan === plan.value
                            ? "border-red-500 bg-red-500/10"
                            : "border-white/10 bg-white/5"
                        }`}
                       accessibilityRole="button" accessibilityLabel="Interactive button">
                        <View
                          className={`w-4 h-4 border-2 rounded-full mr-3 ${
                            newPartnerForm.plan === plan.value
                              ? "border-red-500 bg-red-500"
                              : "border-slate-500"
                          }`}
                        />
                        <ResponsiveText className="text-slate-200 text-sm">
                          {plan.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowAddModal(false)}
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg py-3 items-center"
                 accessibilityRole="button" accessibilityLabel="Interactive button">
                  <ResponsiveText className="text-slate-200 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <ResponsiveButton
                  onPress={handleCreatePartner}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 rounded-lg py-3 items-center"
                 accessibilityRole="button" style={{ minHeight: designSystem.spacing.touchTarget.min }}>
                  <ResponsiveText className="text-white font-semibold">
                    Create Partner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  } catch (error) {
    // If rendering fails, handle the error
    handleError(error);
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8 m-4">
          <ResponsiveText className="text-white text-xl font-bold mb-4 text-center">
            Something went wrong
          </Text>
          <ResponsiveText className="text-slate-300 text-center mb-6">
            There was a problem loading the partner management dashboard. Please
            try again.
          </Text>
          <TouchableOpacity
            onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setHasError(false)}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl py-3 items-center"
           accessibilityRole="button" accessibilityLabel="Interactive button">
            <ResponsiveText className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
});

export default PartnerManagement;
