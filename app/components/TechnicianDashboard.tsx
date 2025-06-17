import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { supabase } from "../lib/supabase";
import designSystem from "../styles/MobileDesignSystem";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
  ResponsiveBottomNav,
  ResponsiveHeader,
} from "./responsive/ResponsiveComponents";
import {
  Bell,
  Settings,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Clock,
  Home,
  ClipboardList,
  DollarSign,
  User,
  AlertTriangle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  Wrench,

} from "lucide-react-native";

interface JobTimer {
  minutes: number;
  seconds: number;
}

interface Stat {
  number: string;
  label: string;
  change: string;
  type: "earnings" | "jobs" | "rating" | "time";
}

interface PendingJob {
  id: string;
  type: string;
  time: string;
  location: string;
  customer: string;
  icon: string;
  priority: "low" | "medium" | "high" | "emergency";
  estimatedEarnings: { min: number; max: number };
  distance: string;
  eta: string;
  duration: string;
  customerPhone?: string;
  coordinates?: { lat: number; lng: number };
}

interface TechnicianDashboardProps {
  technicianName?: string;
  technicianId?: string;
  isOnline?: boolean;
  onStatusChange?: (isOnline: boolean) => void;
  onJobAccept?: (jobId: string) => void;
  onEmergencyContact?: () => void;
}

interface TechnicianUser {
  id: string;
  email: string;
  name: string;
  technicianId: string;
  lastLogin?: number;
  phone?: string;
  rating?: number;
  totalJobs?: number;
  successRate?: number;
}

const TechnicianDashboard = React.memo(function TechnicianDashboard({
  technicianName = "Mike Chen",
  technicianId = "RSP-4857",
  isOnline = true,
  onStatusChange,
  onJobAccept,
  onEmergencyContact,
}: TechnicianDashboardProps) {
  // Error handling state
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [troubleshootingGuide, setTroubleshootingGuide] = useState<any>(null);
  const [showTroubleshootingModal, setShowTroubleshootingModal] =
    useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [user, setUser] = useState<TechnicianUser | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<boolean>(isOnline);
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  const [jobTimer, setJobTimer] = useState<JobTimer>({
    minutes: 12,
    seconds: 34,
  });
  const [stats, setStats] = useState<Stat[]>([
    {
      number: "$847",
      label: "Today's Earnings",
      change: "+$127 vs yesterday",
      type: "earnings",
    },
    {
      number: "8",
      label: "Jobs Completed",
      change: "+3 vs yesterday",
      type: "jobs",
    },
    {
      number: "4.9",
      label: "Rating",
      change: "+0.1 this week",
      type: "rating",
    },
    {
      number: "9.2h",
      label: "Hours Online",
      change: "Goal: 10h",
      type: "time",
    },
  ]);
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([
    {
      id: "RSJ-78953",
      type: "Tire Change",
      time: "15 min ago",
      location: "Highway 101, Mile 23",
      customer: "John Davis (Standard Member)",
      icon: "🛞",
      priority: "medium",
      estimatedEarnings: { min: 85, max: 120 },
      distance: "2.3 km",
      eta: "8 min",
      duration: "30 min",
      customerPhone: "+592-123-4567",
      coordinates: { lat: 6.8013, lng: -58.1551 },
    },
    {
      id: "RSJ-78954",
      type: "Towing Service",
      time: "28 min ago",
      location: "Mall Parking Lot, Georgetown",
      customer: "Emily Wilson (Premium Member)",
      icon: "🚛",
      priority: "high",
      estimatedEarnings: { min: 150, max: 200 },
      distance: "4.1 km",
      eta: "12 min",
      duration: "45 min",
      customerPhone: "+592-987-6543",
      coordinates: { lat: 6.8047, lng: -58.1626 },
    },
    {
      id: "RSJ-78955",
      type: "Lockout Service",
      time: "42 min ago",
      location: "Office Building, Camp Street",
      customer: "Alex Thompson (Standard Member)",
      icon: "🔑",
      priority: "low",
      estimatedEarnings: { min: 60, max: 90 },
      distance: "1.8 km",
      eta: "6 min",
      duration: "20 min",
      customerPhone: "+592-555-0123",
      coordinates: { lat: 6.8077, lng: -58.1578 },
    },
  ]);

  const toggleOnlineStatus = useCallback(() => {
    try {
      const newStatus = !onlineStatus;
      setOnlineStatus(newStatus);
      onStatusChange?.(newStatus);
      Alert.alert(
        "Status Changed",
        `You are now ${newStatus ? "online" : "offline"}`,
      );
    } catch (error) {
      console.error("Error toggling online status:", error);
      Alert.alert("Error", "Failed to update status. Please try again.");
    }
  }, [onlineStatus, onStatusChange]);

  const handleNavigateToCustomer = useCallback(async () => {
    try {
      const destination = "123 Main Street, Georgetown";
      const url = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(destination)}`,
        android: `geo:0,0?q=${encodeURIComponent(destination)}`,
        default: `https://maps.google.com/?q=${encodeURIComponent(destination)}`,
      });

      const canOpen = await Linking.canOpenURL(url!);
      if (canOpen) {
        await Linking.openURL(url!);
      } else {
        Alert.alert("Error", "Unable to open navigation app");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Failed to open navigation. Please try again.");
    }
  }, []);

  const handleContactCustomer = useCallback(async () => {
    try {
      const phoneNumber = "+592-123-4567";
      const url = `tel:${phoneNumber}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Alert.alert(
          "Contact Customer",
          `Call Sarah Mitchell at ${phoneNumber}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Call",
              onPress: async () => {
                try {
                  await Linking.openURL(url);
                } catch (error) {
                  console.error("Call error:", error);
                  Alert.alert(
                    "Error",
                    "Failed to make call. Please try again.",
                  );
                }
              },
            },
          ],
        );
      } else {
        Alert.alert("Error", "Unable to make phone calls on this device");
      }
    } catch (error) {
      console.error("Contact customer error:", error);
      Alert.alert("Error", "Failed to contact customer. Please try again.");
    }
  }, []);

  const handleMarkArrived = useCallback(() => {
    if (operationLoading) return;

    Alert.alert("Confirm Arrival", "Mark as arrived at customer location?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            setOperationLoading(true);
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            Alert.alert(
              "Status Updated",
              "You have been marked as arrived at the customer location.",
            );
          } catch (error) {
            console.error("Mark arrived error:", error);
            Alert.alert(
              "Error",
              "Failed to update arrival status. Please try again.",
            );
          } finally {
            setOperationLoading(false);
          }
        },
      },
    ]);
  }, [operationLoading]);

  const handleEmergencyContact = useCallback(() => {
    Alert.alert("Emergency Contact", "Contacting emergency support...", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Contact Support",
        style: "destructive",
        onPress: async () => {
          try {
            onEmergencyContact?.();
            Alert.alert("Emergency", "Emergency support has been contacted!");
          } catch (error) {
            console.error("Emergency contact error:", error);
            Alert.alert(
              "Error",
              "Failed to contact emergency support. Please try again.",
            );
          }
        },
      },
    ]);
  }, [onEmergencyContact]);

  const getStatCardStyle = useCallback((type: Stat["type"]) => {
    const styles = {
      earnings: "border-t-4 border-green-500",
      jobs: "border-t-4 border-blue-500",
      rating: "border-t-4 border-yellow-500",
      time: "border-t-4 border-red-500",
    };
    return styles[type] || "border-t-4 border-gray-500";
  }, []);

  const handleJobAccept = useCallback(
    (job: PendingJob) => {
      if (operationLoading) return;

      Alert.alert(
        "Accept Job",
        `Accept ${job.type} job for ${job.customer}?\n\nLocation: ${job.location}\nDistance: ${job.distance}\nEstimated earnings: $${job.estimatedEarnings.min}-$${job.estimatedEarnings.max}\nPriority: ${job.priority.toUpperCase()}`,
        [
          { text: "Decline", style: "cancel" },
          {
            text: "Accept",
            onPress: async () => {
              try {
                setOperationLoading(true);

                // Simulate API call to accept job
                await new Promise((resolve) => setTimeout(resolve, 1500));

                // Remove job from pending list
                setPendingJobs((prev) => prev.filter((j) => j.id !== job.id));

                // Update stats
                setStats(prev => prev.map(stat => {
                  if (stat.type === "jobs") {
                    return {
                      ...stat,
                      number: (parseInt(stat.number) + 1).toString(),
                      change: `+${parseInt(stat.number) + 1 - 8} vs yesterday`
                    };
                  }
                  return stat;
                }));

                Alert.alert(
                  "Job Accepted",
                  `You have accepted the ${job.type} job. Navigate to customer location to begin service.`,
                  [
                    {
                      text: "Navigate Now",
                      onPress: handleNavigateToCustomer
                    },
                    {
                      text: "OK",
                      style: "default"
                    }
                  ]
                );

                // Call parent callback if provided
                onJobAccept?.(job.id);
              } catch (error) {
                console.error("Job accept error:", error);
                Alert.alert("Error", "Failed to accept job. Please try again.");
              } finally {
                setOperationLoading(false);
              }
            },
          },
        ],
      );
    },
    [operationLoading, onJobAccept, handleNavigateToCustomer],
  );

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
    console.log(`${view} view selected`);
  }, []);

  // View rendering function
  const renderCurrentView = () => {
    switch (activeView) {
      case "jobs":
        return renderJobsView();
      case "earnings":
        return renderEarningsView();
      case "profile":
        return renderProfileView();
      default:
        return renderDashboardView();
    }
  };

  useEffect(() => {
    // Job timer simulation - increments every second
    const timer = setInterval(() => {
      setJobTimer((prev) => {
        const newSeconds = prev.seconds + 1;
        if (newSeconds >= 60) {
          return { minutes: prev.minutes + 1, seconds: 0 };
        }
        return { ...prev, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auth functions
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log("Checking technician auth status...");

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
        console.log(
          "Session found, validating and loading technician profile...",
        );

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
          // Load technician profile with enhanced timeout and retry logic
          const profilePromise = supabase
            .from("technicians")
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
            console.log("Technician profile loaded successfully");
            setUser({
              id: data.id,
              email: data.email,
              name: data.name,
              technicianId: data.technician_id || technicianId,
            });
          } else {
            console.log("No technician profile found, using session data");
            // Fallback user data from session
            setUser({
              id: session.user.id,
              email: session.user.email || "technician@roadside.com",
              name: session.user.user_metadata?.name || technicianName,
              technicianId: technicianId,
            });
          }
        } catch (profileError) {
          console.error("Error loading technician profile:", profileError);
          // Don't call handleError here to avoid infinite loops during initialization
          console.warn("Using fallback user data due to profile error");
          // Set default user data if profile loading fails
          setUser({
            id: session.user.id,
            email: session.user.email || "technician@roadside.com",
            name: session.user.user_metadata?.name || technicianName,
            technicianId: technicianId,
          });
        }
      } else {
        console.log("No session found, using demo user");
        // If no session, set demo user for testing
        setUser({
          id: "demo-id",
          email: "technician@roadside.com",
          name: technicianName,
          technicianId: technicianId,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't call handleError during initialization to avoid loops
      console.warn("Using fallback user data due to auth error");
      // Set fallback user data even if auth check fails
      setUser({
        id: "demo-id",
        email: "technician@roadside.com",
        name: technicianName,
        technicianId: technicianId,
      });
    } finally {
      setIsLoading(false);
      console.log("Technician auth status check completed");
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
          name: data.user.user_metadata?.name || "Technician",
          technicianId: "RSP-" + Math.floor(Math.random() * 10000),
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
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            user_type: "technician",
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
        "technician@roadside.com",
        "demo123",
      );
      if (!success) {
        setEmail("technician@roadside.com");
        setPassword("demo123");
        Alert.alert(
          "Demo Login",
          "Demo credentials have been filled in. Please try signing in manually.",
        );
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setEmail("technician@roadside.com");
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
          name: data.user.user_metadata?.name || "Technician",
          technicianId: "RSP-" + Math.floor(Math.random() * 10000),
        });
        return true;
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
    return false;
  };

  // Enhanced error handling function with comprehensive error capture
  const handleError = useCallback(
    async (error: any, context?: string) => {
      console.error("TechnicianDashboard error:", error, "Context:", context);

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
          typeof performance !== "undefined" && (performance as any).memory
            ? {
                used: Math.round(
                  (performance as any).memory.usedJSHeapSize / 1024 / 1024,
                ),
                total: Math.round(
                  (performance as any).memory.totalJSHeapSize / 1024 / 1024,
                ),
                limit: Math.round(
                  (performance as any).memory.jsHeapSizeLimit / 1024 / 1024,
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
          "Technician dashboard failed to render properly - persistent rendering error",
        componentName: "TechnicianDashboard",
        dashboardType: "technician" as const,
        stackTrace: error?.stack,
        timestamp: debugInfo.timestamp,
        context: context || "dashboard_initialization",
        userAgent: debugInfo.userAgent,
        userId: user?.id,
        sessionInfo: {
          isAuthenticated: !!user,
          userEmail: user?.email,
          technicianId: user?.technicianId,
          onlineStatus,
          activeView,
          isLoading,
          authLoading,
          hasValidSession: !!user?.id,
          sessionAge: user ? Date.now() - (user.lastLogin || 0) : 0,
          componentMountTime: Date.now(),
        },
        environmentInfo: {
          platform: debugInfo.deviceInfo.platform,
          platformVersion: debugInfo.deviceInfo.version,
          isDev: typeof __DEV__ !== "undefined" ? __DEV__ : false,
          expoVersion:
            typeof Constants !== "undefined"
              ? Constants.expoVersion
              : "unknown",
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
          "Requesting enhanced troubleshooting guide for:",
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
            setTroubleshootingGuide(getEnhancedFallbackGuide(errorDetails));
          }
        } else if (guide) {
          console.log("Enhanced troubleshooting guide received:", {
            severity: guide.severity,
            stepsCount: guide.specificSteps?.length || 0,
            causesCount: guide.possibleCauses?.length || 0,
            fixesCount: guide.quickFixes?.length || 0,
          });
          setTroubleshootingGuide(guide);
        } else {
          setTroubleshootingGuide(getEnhancedFallbackGuide(errorDetails));
        }
      } catch (guideError) {
        console.warn("Failed to get troubleshooting guide:", guideError);
        setTroubleshootingGuide(getEnhancedFallbackGuide(errorDetails));
      }

      // Auto-reset error state after 20 seconds with exponential backoff
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      const resetDelay = context === "recurring_error" ? 30000 : 20000;
      errorTimeoutRef.current = setTimeout(() => {
        console.log(
          "Auto-resetting error state after",
          resetDelay / 1000,
          "seconds",
        );
        setHasError(false);
        setErrorDetails(null);
        setTroubleshootingGuide(null);
      }, resetDelay);
    },
    [user, onlineStatus, activeView, isLoading, hasError],
  );
  }, [
    user,
    onlineStatus,
    activeView,
    operationLoading,
    jobTimer,
    stats,
    pendingJobs,
    toggleOnlineStatus,
    handleNavigateToCustomer,
    handleContactCustomer,
    handleMarkArrived,
    handleEmergencyContact,
    getStatCardStyle,
    handleJobAccept,
    handleViewChange,
    handleSignOut,
  ]);

  // Return the main dashboard UI
  // Enhanced error handling function with comprehensive error capture
  const handleError = useCallback(
    async (error: any, context?: string) => {
      console.error("TechnicianDashboard error:", error, "Context:", context);

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
          typeof performance !== "undefined" && (performance as any).memory
            ? {
                used: Math.round(
                  (performance as any).memory.usedJSHeapSize / 1024 / 1024,
                ),
                total: Math.round(
                  (performance as any).memory.totalJSHeapSize / 1024 / 1024,
                ),
                limit: Math.round(
                  (performance as any).memory.jsHeapSizeLimit / 1024 / 1024,
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
          "Technician dashboard failed to render properly - persistent rendering error",
        componentName: "TechnicianDashboard",
        dashboardType: "technician" as const,
        stackTrace: error?.stack,
        timestamp: debugInfo.timestamp,
        context: context || "dashboard_initialization",
        userAgent: debugInfo.userAgent,
        userId: user?.id,
        sessionInfo: {
          isAuthenticated: !!user,
          userEmail: user?.email,
          technicianId: user?.technicianId,
          onlineStatus,
          activeView,
          isLoading,
          authLoading,
          hasValidSession: !!user?.id,
          sessionAge: user ? Date.now() - (user.lastLogin || 0) : 0,
          componentMountTime: Date.now(),
        },
        environmentInfo: {
          platform: debugInfo.deviceInfo.platform,
          platformVersion: debugInfo.deviceInfo.version,
          isDev: typeof __DEV__ !== "undefined" ? __DEV__ : false,
          expoVersion:
            typeof Constants !== "undefined"
              ? Constants.expoVersion
              : "unknown",
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
          "Requesting enhanced troubleshooting guide for:",
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
            setTroubleshootingGuide(getEnhancedFallbackGuide(errorDetails));
          }
        } else if (guide) {
          console.log("Enhanced troubleshooting guide received:", {
            severity: guide.severity,
            stepsCount: guide.specificSteps?.length || 0,
            causesCount: guide.possibleCauses?.length || 0,
            fixesCount: guide.quickFixes?.length || 0,
          });
          setTroubleshootingGuide(guide);
        } else {
          setTroubleshootingGuide(getEnhancedFallbackGuide(errorDetails));
        }
      } catch (guideError) {
        console.warn("Failed to get troubleshooting guide:", guideError);
        setTroubleshootingGuide(getEnhancedFallbackGuide(errorDetails));
      }

      // Auto-reset error state after 20 seconds with exponential backoff
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      const resetDelay = context === "recurring_error" ? 30000 : 20000;
      errorTimeoutRef.current = setTimeout(() => {
        console.log(
          "Auto-resetting error state after",
          resetDelay / 1000,
          "seconds",
        );
        setHasError(false);
        setErrorDetails(null);
        setTroubleshootingGuide(null);
      }, resetDelay);
    },
    [user, onlineStatus, activeView, isLoading, hasError],
  );

  // Enhanced fallback guide generator
  const getEnhancedFallbackGuide = (errorDetails: any) => {
    return {
      troubleshootingGuide: `# Enhanced Technician Dashboard Troubleshooting Guide\n\nA critical error occurred in the technician dashboard component. This comprehensive guide will help you identify and resolve the issue.\n\n## Error Analysis\n- Error Type: ${errorDetails.errorType}\n- Context: ${errorDetails.context}\n- Authentication Status: ${errorDetails.sessionInfo.isAuthenticated ? "Authenticated" : "Not Authenticated"}\n- Network Status: ${errorDetails.environmentInfo.networkOnline ? "Online" : "Offline"}\n\n## Root Cause Analysis\nBased on the error context and system state, this appears to be related to component lifecycle management, authentication state synchronization, or network connectivity issues.`,
      specificSteps: [
        "Check browser console (F12) for detailed error messages and stack traces",
        "Verify Supabase environment variables are correctly configured in project settings",
        "Test authentication by running 'await supabase.auth.getSession()' in browser console",
        "Clear all browser data (cache, localStorage, sessionStorage) and hard refresh (Ctrl+F5)",
        "Restart Expo development server with 'npx expo start --clear' to clear Metro cache",
        "Check network connectivity and test Supabase connection with a simple query",
        "Verify technician profile exists in database and has proper permissions",
        "Test with demo credentials to isolate authentication-specific issues",
        "Monitor memory usage in browser Performance tab during component mounting",
        "Check for infinite re-render loops by adding console.log statements in useEffect hooks",
        "Validate all component props and ensure no undefined values are being passed",
        "Test in incognito/private browsing mode to rule out browser extension conflicts",
      ],
      possibleCauses: [
        "Authentication session expired or corrupted, requiring re-authentication",
        "Supabase client initialization failure due to missing or invalid environment variables",
        "Component lifecycle race condition causing state updates on unmounted components",
        "Network connectivity issues preventing API calls from completing successfully",
        "Memory pressure or performance issues on the device causing component failures",
        "Infinite re-render loop in useEffect hooks due to missing or incorrect dependencies",
        "Database permissions (RLS policies) blocking technician data access",
        "Metro bundler cache corruption causing module resolution failures",
      ],
      quickFixes: [
        "Sign out completely and sign back in to refresh authentication session",
        "Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R) to clear cached resources",
        "Clear browser application data: Settings > Privacy > Clear browsing data",
        "Restart the development server: Stop current process and run 'npx expo start --clear'",
        "Test with demo credentials: Use 'technician@roadside.com' / 'demo123'",
        "Check network connection and try switching between WiFi and cellular data",
        "Disable browser extensions temporarily and test in incognito mode",
        "Verify environment variables in project settings match your Supabase project",
      ],
      preventionTips: [
        "Implement comprehensive error boundaries around all dashboard components",
        "Add proper cleanup functions to all useEffect hooks to prevent memory leaks",
        "Use proper dependency arrays in useEffect to prevent infinite re-renders",
        "Implement session validation and automatic refresh mechanisms",
        "Add network connectivity monitoring and offline state handling",
        "Regularly update dependencies and monitor for security vulnerabilities",
        "Implement proper loading states and error handling for all async operations",
        "Add comprehensive logging and monitoring for production error tracking",
      ],
      severity: "high",
      estimatedFixTime: "10-25 minutes",
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

  // Sync external isOnline prop with internal state
  useEffect(() => {
    try {
      setOnlineStatus(isOnline);
    } catch (error) {
      handleError(error, "online_status_sync");
    }
  }, [isOnline, handleError]);

  // Error UI component - moved outside conditional rendering to ensure consistent hook calls
  const ErrorUI = useMemo(() => {
    if (!hasError) return null;

    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <ScrollView className="flex-1 p-4">
          <View className="bg-slate-800/80 backdrop-blur-lg border border-red-500/50 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center mb-4">
              <AlertTriangle size={24} color="#ef4444" />
              <Text className="text-white text-xl font-bold ml-3">
                Technician Dashboard Error
              </Text>
            </View>

            <Text className="text-slate-300 mb-4">
              There was a problem loading the technician dashboard. Here's what
              we know:
            </Text>

            {errorDetails && (
              <View className="bg-slate-900/50 rounded-xl p-4 mb-4">
                <Text className="text-red-400 font-semibold mb-2">
                  Error Details:
                </Text>
                <Text className="text-slate-300 text-sm mb-1">
                  Type: {errorDetails.errorType}
                </Text>
                <Text className="text-slate-300 text-sm mb-1">
                  Message: {errorDetails.errorMessage}
                </Text>
                <Text className="text-slate-300 text-sm">
                  Time: {new Date(errorDetails.timestamp).toLocaleString()}
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setHasError(false);
                  setErrorDetails(null);
                  setTroubleshootingGuide(null);
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold">Try Again</Text>
              </TouchableOpacity>

              {troubleshootingGuide && (
                <TouchableOpacity
                  onPress={() => setShowTroubleshootingModal(true)}
                  className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-bold">Get Help</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {troubleshootingGuide && (
            <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <Text className="text-white text-lg font-bold mb-4">
                Quick Fixes:
              </Text>
              {troubleshootingGuide.quickFixes
                ?.slice(0, 3)
                .map((fix: string, index: number) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-green-400 mr-2">•</Text>
                    <Text className="text-slate-300 text-sm flex-1">{fix}</Text>
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
          onRequestClose={() => setShowTroubleshootingModal(false)}
        >
          <View className="flex-1 bg-black/50">
            <View className="flex-1 bg-slate-900 mt-20 rounded-t-3xl">
              <View className="p-6 border-b border-white/10">
                <View className="flex-row justify-between items-center">
                  <Text className="text-white text-xl font-bold">
                    AI Troubleshooting Guide
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTroubleshootingModal(false)}
                    className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
                  >
                    <Text className="text-slate-400 text-lg">×</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView className="flex-1 p-6">
                {troubleshootingGuide && (
                  <>
                    <View className="mb-6">
                      <Text className="text-white text-lg font-semibold mb-3">
                        Possible Causes:
                      </Text>
                      {troubleshootingGuide.possibleCauses?.map(
                        (cause: string, index: number) => (
                          <View
                            key={index}
                            className="flex-row items-start mb-2"
                          >
                            <Text className="text-red-400 mr-2">•</Text>
                            <Text className="text-slate-300 text-sm flex-1">
                              {cause}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>

                    <View className="mb-6">
                      <Text className="text-white text-lg font-semibold mb-3">
                        Step-by-Step Solutions:
                      </Text>
                      {troubleshootingGuide.specificSteps?.map(
                        (step: string, index: number) => (
                          <View
                            key={index}
                            className="bg-slate-800/50 rounded-xl p-4 mb-3"
                          >
                            <Text className="text-blue-400 font-semibold mb-1">
                              Step {index + 1}
                            </Text>
                            <Text className="text-slate-300 text-sm">
                              {step}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>

                    <View className="mb-6">
                      <Text className="text-white text-lg font-semibold mb-3">
                        Prevention Tips:
                      </Text>
                      {troubleshootingGuide.preventionTips?.map(
                        (tip: string, index: number) => (
                          <View
                            key={index}
                            className="flex-row items-start mb-2"
                          >
                            <Text className="text-green-400 mr-2">•</Text>
                            <Text className="text-slate-300 text-sm flex-1">
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
  }, [hasError, errorDetails, troubleshootingGuide, showTroubleshootingModal]);

  // Loading UI component - moved outside conditional rendering
  const LoadingUI = useMemo(() => {
    if (!isLoading) return null;

    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl items-center justify-center mb-4">
            <Wrench size={32} color="white" />
          </View>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="text-white text-lg font-semibold mt-4">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }, [isLoading]);

  // Auth UI component - moved outside conditional rendering
  const AuthUI = useMemo(() => {
    if (user) return null;

    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center px-6 py-8">
            {/* Back Button */}
            {authMode !== "login" && (
              <TouchableOpacity
                onPress={() => switchAuthMode("login")}
                className="absolute top-8 left-6 w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
              >
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
              <Text className="text-white text-3xl font-bold mb-2">
                RoadSide+ Technician
              </Text>
              <Text className="text-slate-400 text-center text-base">
                {authMode === "login" && "Access your technician dashboard"}
                {authMode === "register" && "Create your technician account"}
                {authMode === "reset" && "Reset your password"}
              </Text>
            </View>

            {/* Auth Form */}
            <View className="w-full max-w-sm">
              <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                <Text className="text-white text-xl font-bold mb-6 text-center">
                  {authMode === "login" && "Sign In"}
                  {authMode === "register" && "Create Account"}
                  {authMode === "reset" && "Reset Password"}
                </Text>

                {/* Name Input - Only for Registration */}
                {authMode === "register" && (
                  <View className="mb-4">
                    <Text className="text-slate-200 font-semibold mb-2">
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
                  <Text className="text-slate-200 font-semibold mb-2">
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
                    <Text className="text-slate-200 font-semibold mb-2">
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
                        onPress={() => setShowPassword(!showPassword)}
                        className="ml-2"
                      >
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
                    <Text className="text-slate-200 font-semibold mb-2">
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
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="ml-2"
                      >
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
                  className={`bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-4 items-center mb-4 ${authLoading ? "opacity-50" : ""}`}
                >
                  {authLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-white font-bold text-base ml-2">
                        {authMode === "login" && "Signing In..."}
                        {authMode === "register" && "Creating Account..."}
                        {authMode === "reset" && "Sending Reset Link..."}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {authMode === "login" && "Sign In"}
                      {authMode === "register" && "Create Account"}
                      {authMode === "reset" && "Send Reset Link"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Secondary Actions */}
                {authMode === "login" && (
                  <>
                    <TouchableOpacity
                      onPress={handleDemoLogin}
                      disabled={authLoading}
                      className="bg-white/10 border border-white/10 rounded-xl py-3 items-center mb-4"
                    >
                      <Text className="text-slate-300 font-semibold text-sm">
                        Demo Login
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity
                        onPress={() => switchAuthMode("register")}
                        disabled={authLoading}
                      >
                        <Text className="text-green-400 text-sm font-medium">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => switchAuthMode("reset")}
                        disabled={authLoading}
                      >
                        <Text className="text-green-400 text-sm font-medium">
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {authMode === "register" && (
                  <TouchableOpacity
                    onPress={() => switchAuthMode("login")}
                    disabled={authLoading}
                    className="items-center"
                  >
                    <Text className="text-green-400 text-sm font-medium">
                      Already have an account? Sign In
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Security Notice */}
              <View className="bg-slate-800/50 border border-white/10 rounded-xl p-4 mt-6">
                <View className="flex-row items-center mb-2">
                  <Shield size={16} color="#22c55e" />
                  <Text className="text-green-400 font-semibold text-sm ml-2">
                    Secure Authentication
                  </Text>
                </View>
                <Text className="text-slate-400 text-xs leading-relaxed">
                  Your technician credentials are encrypted and protected.
                  Access your job dashboard securely.
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
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-slate-800 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-green-500/20 rounded-full items-center justify-center mb-4">
                  <CheckCircle size={32} color="#22c55e" />
                </View>
                <Text className="text-white text-xl font-bold text-center mb-2">
                  Success!
                </Text>
                <Text className="text-slate-300 text-center text-sm leading-relaxed">
                  {successMessage}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSuccessModal(false)}
                className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold text-base">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }, [
    user,
    authMode,
    email,
    password,
    name,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    authLoading,
    showSuccessModal,
    successMessage,
  ]);

  // Return early with consistent hook calls
  if (hasError) {
    return ErrorUI;
  }

  if (isLoading) {
    return LoadingUI;
  }

  if (!user) {
    return AuthUI;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {/* Connection Status */}
      <View className="absolute top-12 right-4 z-50 flex-row items-center bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-lg px-3 py-2">
        <View
          className={`w-2 h-2 rounded-full mr-2 ${
            onlineStatus ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <Text className="text-white text-xs">
          {onlineStatus ? "Connected to RoadSide+" : "Connection Lost"}
        </Text>
      </View>

      {/* Header */}
      <View className="px-4 py-3 bg-slate-800/60 backdrop-blur-lg border-b border-white/10">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-sm sm:text-lg font-bold">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "T"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-base sm:text-lg font-bold">
                {user?.name || "Technician"}
              </Text>
              <Text className="text-slate-400 text-xs sm:text-sm">
                Tech ID: {user?.technicianId || "RSP-0000"}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center relative"
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              accessibilityHint="View notifications"
            >
              <Bell size={18} color="#94a3b8" />
              <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Emergency alert"
              accessibilityHint="Access emergency features"
            >
              <AlertTriangle size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
              accessibilityHint="Sign out of your account"
              onPress={handleSignOut}
            >
              <Settings size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={toggleOnlineStatus}
          className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 flex-row items-center justify-center"
        >
          <View
            className={`w-3 h-3 rounded-full mr-2 ${
              onlineStatus ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <Text className="text-white text-sm font-semibold">
            {onlineStatus ? "Online" : "Offline"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {renderCurrentView()}



      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-white/10 px-2 py-3 flex-row justify-around items-center">
        <TouchableOpacity
          onPress={() => handleViewChange("dashboard")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "dashboard" ? "bg-red-500/20" : ""
          }`}
          accessibilityRole="button"
          accessibilityLabel="Dashboard"
          accessibilityState={{ selected: activeView === "dashboard" }}
        >
          <Home
            size={20}
            color={activeView === "dashboard" ? "#ef4444" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-semibold mt-1 ${
              activeView === "dashboard" ? "text-red-400" : "text-slate-400"
            }`}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewChange("jobs")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "jobs" ? "bg-red-500/20" : ""
          }`}
          accessibilityRole="button"
          accessibilityLabel="Jobs"
          accessibilityState={{ selected: activeView === "jobs" }}
        >
          <ClipboardList
            size={20}
            color={activeView === "jobs" ? "#ef4444" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-semibold mt-1 ${
              activeView === "jobs" ? "text-red-400" : "text-slate-400"
            }`}
          >
            Jobs
          </Text>
        </TouchableOpacity>

        {/* Emergency SOS Button */}
        <TouchableOpacity
          onPress={handleEmergencyContact}
          className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-full items-center justify-center -mt-6 border-4 border-slate-800 shadow-lg"
          accessibilityRole="button"
          accessibilityLabel="Emergency SOS"
          accessibilityHint="Contact emergency support"
        >
          <Text className="text-white font-bold text-sm">SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewChange("earnings")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "earnings" ? "bg-red-500/20" : ""
          }`}
          accessibilityRole="button"
          accessibilityLabel="Earnings"
          accessibilityState={{ selected: activeView === "earnings" }}
        >
          <DollarSign
            size={20}
            color={activeView === "earnings" ? "#ef4444" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-semibold mt-1 ${
              activeView === "earnings" ? "text-red-400" : "text-slate-400"
            }`}
          >
            Earnings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleViewChange("profile")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "profile" ? "bg-red-500/20" : ""
          }`}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          accessibilityState={{ selected: activeView === "profile" }}
        >
          <User
            size={20}
            color={activeView === "profile" ? "#ef4444" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-semibold mt-1 ${
              activeView === "profile" ? "text-red-400" : "text-slate-400"
            }`}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Dashboard View (Main)
  function renderDashboardView() {
    return (
      <ScrollView
        className="flex-1 bg-slate-900/30 px-3 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View className="flex-row flex-wrap gap-3 my-6">
          {stats.map((stat, index) => (
            <View
              key={index}
              className={`flex-1 min-w-[150px] max-w-[48%] bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-3 ${getStatCardStyle(
                stat.type,
              )}`}
            >
              <Text className="text-white text-xl sm:text-2xl font-bold mb-1">
                {stat.number}
              </Text>
              <Text className="text-slate-400 text-xs mb-2 leading-4">
                {stat.label}
              </Text>
              <Text className="text-green-400 text-xs leading-4">
                {stat.change}
              </Text>
            </View>
          ))}
        </View>

        {/* Current Job */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-red-500/50 rounded-3xl p-6 mb-6 relative">
          <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-500 rounded-t-3xl" />

          <View className="flex-row justify-between items-start mb-5">
            <View>
              <Text className="text-white text-xl font-bold mb-1">
                Battery Jump Start
              </Text>
              <Text className="text-slate-400 text-sm">Job #RSJ-78952</Text>
            </View>
            <View className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-lg">
              <Text className="text-red-400 text-xs font-bold uppercase">
                Emergency
              </Text>
            </View>
          </View>

          {/* Job Timer */}
          <View className="bg-white/10 rounded-xl p-4 mb-5 flex-row items-center justify-center">
            <Clock size={16} color="#fbbf24" />
            <Text className="text-white text-lg font-bold mr-2 ml-2">
              {jobTimer.minutes}:{jobTimer.seconds.toString().padStart(2, "0")}
            </Text>
            <Text className="text-slate-400 text-sm">elapsed</Text>
          </View>

          {/* Customer Info */}
          <View className="bg-white/5 rounded-2xl p-4 mb-5 flex-row items-center">
            <View className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full items-center justify-center mr-4">
              <Text className="text-white font-bold">SM</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">
                Sarah Mitchell
              </Text>
              <View className="bg-yellow-500/20 px-2 py-1 rounded-md self-start mb-1">
                <Text className="text-yellow-400 text-xs font-semibold">
                  Premium Member
                </Text>
              </View>
              <Text className="text-slate-400 text-sm">
                Phone: +592-123-4567
              </Text>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-start mb-5">
            <View className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl items-center justify-center mr-3">
              <MapPin size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">
                123 Main Street, Georgetown
              </Text>
              <Text className="text-slate-400 text-sm mb-1">2.3 km away</Text>
              <Text className="text-green-400 text-sm font-semibold">
                ETA: 8 minutes
              </Text>
            </View>
          </View>

          {/* Job Actions */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleNavigateToCustomer}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-3 flex-row items-center justify-center min-h-[44px]"
                accessibilityRole="button"
                accessibilityLabel="Navigate to customer"
                accessibilityHint="Open navigation to customer location"
                disabled={operationLoading}
              >
                <Navigation size={16} color="white" />
                <Text className="text-white font-semibold ml-2 text-sm">
                  Navigate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContactCustomer}
                className="flex-1 bg-white/10 border border-white/10 rounded-xl p-3 flex-row items-center justify-center min-h-[44px]"
                accessibilityRole="button"
                accessibilityLabel="Call customer"
                accessibilityHint="Call Sarah Mitchell"
                disabled={operationLoading}
              >
                <Phone size={16} color="white" />
                <Text className="text-white font-semibold ml-2 text-sm">
                  Call
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleMarkArrived}
              className={`bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-3 flex-row items-center justify-center min-h-[44px] ${operationLoading ? "opacity-50" : ""}`}
              accessibilityRole="button"
              accessibilityLabel="Mark arrived"
              accessibilityHint="Mark as arrived at customer location"
              disabled={operationLoading}
            >
              <CheckCircle size={16} color="white" />
              <Text className="text-white font-semibold ml-2 text-sm">
                {operationLoading ? "Updating..." : "Mark Arrived"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Earnings */}
        <View className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-6 mb-6 relative overflow-hidden">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white/90 font-semibold">Weekly Earnings</Text>
            <Text className="text-white/80 text-sm">Nov 25 - Dec 1</Text>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">$3,240</Text>
          <Text className="text-white/90">+18% from last week</Text>
        </View>

        {/* Pending Jobs Preview */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-3xl p-6 mb-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-lg font-semibold">
              Pending Jobs
            </Text>
            <TouchableOpacity
              onPress={() => handleViewChange("jobs")}
              className="bg-red-500/20 px-3 py-1 rounded-lg"
            >
              <Text className="text-red-400 text-xs font-bold">
                View All ({pendingJobs.length})
              </Text>
            </TouchableOpacity>
          </View>

          {pendingJobs.slice(0, 2).map((job, index) => (
            <TouchableOpacity
              key={job.id}
              className={`bg-white/5 border border-white/10 rounded-xl p-4 ${index < 1 ? "mb-3" : ""}`}
              onPress={() => handleJobAccept(job)}
              accessibilityRole="button"
              accessibilityLabel={`${job.type} job`}
              accessibilityHint={`Accept ${job.type} job for ${job.customer} at ${job.location}`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <Text className="text-white font-semibold mr-2">
                    {job.icon}
                  </Text>
                  <Text className="text-white font-semibold">{job.type}</Text>
                </View>
                <Text className="text-slate-500 text-xs">{job.time}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="text-slate-400 text-sm mr-2">📍</Text>
                <Text className="text-slate-400 text-sm">{job.location}</Text>
              </View>
              <Text className="text-slate-500 text-xs">
                Customer: {job.customer}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Jobs View
  function renderJobsView() {
    return (
      <ScrollView
        className="flex-1 bg-slate-900/30 px-3 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center py-6">
          <Text className="text-white text-2xl font-bold">Available Jobs</Text>
          <View className="bg-red-500/20 px-3 py-1 rounded-lg">
            <Text className="text-red-400 text-xs font-bold">
              {pendingJobs.length} Jobs
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row bg-slate-800/50 rounded-xl p-1 mb-6">
          <TouchableOpacity className="flex-1 bg-red-500 rounded-lg py-3 items-center">
            <Text className="text-white font-semibold">All Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-3 items-center">
            <Text className="text-slate-400 font-semibold">Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-3 items-center">
            <Text className="text-slate-400 font-semibold">Nearby</Text>
          </TouchableOpacity>
        </View>

        {/* Job List */}
        <View className="gap-4">
          {pendingJobs.map((job) => (
            <View
              key={job.id}
              className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center flex-1">
                  <Text className="text-white font-semibold text-2xl mr-3">
                    {job.icon}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">
                      {job.type}
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      Job #{job.id}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-xs mb-1">{job.time}</Text>
                  <View className={`px-2 py-1 rounded-md ${
                    job.priority === "emergency" ? "bg-red-500/20" :
                    job.priority === "high" ? "bg-orange-500/20" :
                    job.priority === "medium" ? "bg-yellow-500/20" : "bg-green-500/20"
                  }`}>
                    <Text className={`text-xs font-semibold ${
                      job.priority === "emergency" ? "text-red-400" :
                      job.priority === "high" ? "text-orange-400" :
                      job.priority === "medium" ? "text-yellow-400" : "text-green-400"
                    }`}>
                      ${job.estimatedEarnings.min} - ${job.estimatedEarnings.max}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Customer Info */}
              <View className="bg-white/5 rounded-xl p-4 mb-4">
                <Text className="text-slate-400 text-sm mb-1">Customer</Text>
                <Text className="text-white font-semibold mb-2">
                  {job.customer}
                </Text>
                <View className="flex-row items-center">
                  <MapPin size={14} color="#94a3b8" />
                  <Text className="text-slate-400 text-sm ml-2">
                    {job.location}
                  </Text>
                </View>
              </View>

              {/* Job Details */}
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1 bg-white/5 rounded-xl p-3 items-center">
                  <Text className="text-white font-bold">{job.distance}</Text>
                  <Text className="text-slate-400 text-xs">Distance</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-xl p-3 items-center">
                  <Text className="text-white font-bold">{job.eta}</Text>
                  <Text className="text-slate-400 text-xs">ETA</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-xl p-3 items-center">
                  <Text className="text-white font-bold">{job.duration}</Text>
                  <Text className="text-slate-400 text-xs">Duration</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-slate-700/50 border border-white/10 rounded-xl py-3 items-center">
                  <Text className="text-white font-semibold">View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleJobAccept(job)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">Accept Job</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* No Jobs Message */}
        {pendingJobs.length === 0 && (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-slate-400 text-lg mb-4">No jobs available</Text>
            <Text className="text-slate-500 text-center">
              Check back later for new job opportunities
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  // Earnings View
  function renderEarningsView() {
    const earningsData = [
      { day: "Mon", amount: 420 },
      { day: "Tue", amount: 380 },
      { day: "Wed", amount: 520 },
      { day: "Thu", amount: 460 },
      { day: "Fri", amount: 680 },
      { day: "Sat", amount: 720 },
      { day: "Sun", amount: 580 },
    ];

    const recentPayments = [
      { id: "PAY-001", date: "Dec 1, 2024", amount: 847, status: "completed" },
      { id: "PAY-002", date: "Nov 30, 2024", amount: 720, status: "completed" },
      { id: "PAY-003", date: "Nov 29, 2024", amount: 580, status: "pending" },
    ];

    return (
      <ScrollView
        className="flex-1 bg-slate-900/30 px-3 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="py-6">
          <Text className="text-white text-2xl font-bold mb-2">Earnings</Text>
          <Text className="text-slate-400">Track your income and payments</Text>
        </View>

        {/* Today's Earnings */}
        <View className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 mb-6">
          <Text className="text-white/90 font-semibold mb-2">Today's Earnings</Text>
          <Text className="text-white text-4xl font-bold mb-2">$847</Text>
          <Text className="text-white/90">+$127 vs yesterday</Text>
        </View>

        {/* Earnings Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            <Text className="text-white text-xl font-bold mb-1">$3,240</Text>
            <Text className="text-slate-400 text-sm mb-1">This Week</Text>
            <Text className="text-green-400 text-xs">+18% vs last week</Text>
          </View>
          <View className="flex-1 bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            <Text className="text-white text-xl font-bold mb-1">$12,960</Text>
            <Text className="text-slate-400 text-sm mb-1">This Month</Text>
            <Text className="text-green-400 text-xs">+12% vs last month</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Weekly Overview</Text>

          <View className="flex-row items-end justify-between h-32 mb-4">
            {earningsData.map((day) => {
              const height = (day.amount / 720) * 100; // Normalize to percentage
              return (
                <View key={day.day} className="items-center flex-1">
                  <View
                    className="bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg w-6 mb-2"
                    style={{ height: `${height}%` }}
                  />
                  <Text className="text-slate-400 text-xs">{day.day}</Text>
                </View>
              );
            })}
          </View>

          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-sm">Nov 25 - Dec 1</Text>
            <Text className="text-white font-semibold">$4,760 total</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Payment Methods</Text>

          <View className="gap-4">
            <View className="flex-row items-center p-4 bg-white/5 rounded-xl">
              <View className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl items-center justify-center mr-4">
                <Text className="text-white font-bold">💳</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold mb-1">
                  Bank Account •••• 4567
                </Text>
                <Text className="text-slate-400 text-sm">
                  Primary payment method
                </Text>
              </View>
              <View className="bg-green-500/20 px-2 py-1 rounded-md">
                <Text className="text-green-400 text-xs font-semibold">Active</Text>
              </View>
            </View>

            <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl border border-dashed border-white/20">
              <View className="w-12 h-12 bg-slate-700 rounded-xl items-center justify-center mr-4">
                <Text className="text-slate-400 font-bold text-xl">+</Text>
              </View>
              <Text className="text-slate-400 font-semibold">
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Payments */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Recent Payments</Text>

          <View className="gap-4">
            {recentPayments.map((payment) => (
              <View key={payment.id} className="flex-row items-center justify-between p-4 bg-white/5 rounded-xl">
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">
                    Payment #{payment.id}
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    {payment.date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-white font-bold text-lg">
                    ${payment.amount}
                  </Text>
                  <View className={`px-2 py-1 rounded-md ${
                    payment.status === "completed"
                      ? "bg-green-500/20"
                      : "bg-yellow-500/20"
                  }`}>
                    <Text className={`text-xs font-semibold ${
                      payment.status === "completed"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // Profile View
  function renderProfileView() {
    return (
      <ScrollView
        className="flex-1 bg-slate-900/30 px-3 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="py-6">
          <Text className="text-white text-2xl font-bold mb-2">Profile</Text>
          <Text className="text-slate-400">Manage your account and settings</Text>
        </View>

        {/* Profile Header */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-full items-center justify-center mb-4">
              <User size={32} color="white" />
            </View>
            <Text className="text-white text-xl font-bold mb-1">
              {user?.name || technicianName}
            </Text>
            <Text className="text-slate-400 mb-2">{user?.email}</Text>
            <View className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-lg">
              <Text className="text-green-400 text-sm font-semibold">
                ID: {user?.technicianId || technicianId}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-white/5 rounded-xl p-4 items-center">
              <Text className="text-white text-2xl font-bold mb-1">4.9</Text>
              <Text className="text-slate-400 text-xs">Rating</Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-xl p-4 items-center">
              <Text className="text-white text-2xl font-bold mb-1">247</Text>
              <Text className="text-slate-400 text-xs">Jobs Done</Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-xl p-4 items-center">
              <Text className="text-white text-2xl font-bold mb-1">98%</Text>
              <Text className="text-slate-400 text-xs">Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Online Status */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-lg font-bold mb-1">
                Online Status
              </Text>
              <Text className="text-slate-400 text-sm">
                {onlineStatus ? "Available for jobs" : "Currently offline"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className={`w-16 h-8 rounded-full p-1 ${
                onlineStatus ? "bg-green-500" : "bg-slate-600"
              }`}
            >
              <View
                className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  onlineStatus ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Account Settings</Text>

          <View className="gap-4">
            <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
              <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-4">
                <User size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Personal Information</Text>
                <Text className="text-slate-400 text-sm">Update your profile details</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
              <View className="w-10 h-10 bg-green-500/20 rounded-lg items-center justify-center mr-4">
                <Settings size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Work Preferences</Text>
                <Text className="text-slate-400 text-sm">Set your availability and preferences</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
              <View className="w-10 h-10 bg-purple-500/20 rounded-lg items-center justify-center mr-4">
                <Bell size={20} color="#a855f7" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Notifications</Text>
                <Text className="text-slate-400 text-sm">Configure alert preferences</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
              <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center mr-4">
                <Shield size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Privacy & Security</Text>
                <Text className="text-slate-400 text-sm">Manage your privacy settings</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Support</Text>

          <View className="gap-4">
            <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
              <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-4">
                <Phone size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Contact Support</Text>
                <Text className="text-slate-400 text-sm">Get help from our support team</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
              <View className="w-10 h-10 bg-green-500/20 rounded-lg items-center justify-center mr-4">
                <Wrench size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Training Resources</Text>
                <Text className="text-slate-400 text-sm">Access training materials and guides</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500/20 border border-red-500/30 rounded-xl py-4 items-center mb-6"
        >
          <Text className="text-red-400 font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
});

export default TechnicianDashboard;
