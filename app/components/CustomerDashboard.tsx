import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
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
  User,
  MapPin,
  Truck,
  Zap,
  Settings,
  Home,
  Wrench,
  BarChart3,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Fuel,
  Key,
  Anchor,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  Navigation,
  Phone,
  CreditCard,
  Star,
  Calendar,
  DollarSign,
  MessageCircle,
  Camera,
  FileText,
  Share2,
} from "lucide-react-native";
import {
  renderServiceTracking,
  renderServiceHistory,
  renderProfile,
  renderPaymentMethods,
} from "./CustomerDashboardViews";

interface CustomerDashboardProps {
  userName?: string;
  membershipType?: "Premium" | "Standard";
}

interface CustomerUser {
  id: string;
  email: string;
  name: string;
  membershipType: "Premium" | "Standard";
  phone?: string;
  address?: string;
  emergencyContact?: string;
}

interface ServiceRequest {
  id: string;
  type: "towing" | "jumpstart" | "tire" | "lockout" | "fuel" | "emergency";
  status:
    | "pending"
    | "assigned"
    | "enroute"
    | "arrived"
    | "inprogress"
    | "completed"
    | "cancelled";
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  description: string;
  priority: "low" | "medium" | "high" | "emergency";
  estimatedCost: number;
  estimatedTime: number;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "apple_pay" | "google_pay";
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

type DashboardView =
  | "main"
  | "booking"
  | "tracking"
  | "history"
  | "profile"
  | "payment";

const CustomerDashboard = React.memo(function CustomerDashboard({
  userName = "Sarah",
  membershipType = "Premium",
}: CustomerDashboardProps) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>("main");

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

  // Service booking state
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [serviceLocation, setServiceLocation] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState(
    "123 Main Street, Georgetown",
  );
  const [activeView, setActiveView] = useState("home");

  // Memoize stats data to prevent re-creation
  const stats = useMemo(
    () => [
      { number: "12", label: "Services Used" },
      { number: "4.9", label: "Avg Rating" },
      { number: "$486", label: "Saved This Year" },
    ],
    [],
  );

  // Memoize activity data to prevent re-creation
  const activities = useMemo(
    () => [
      {
        id: 1,
        service: "Battery Jumpstart",
        date: "May 26, 2025 • 3:45 PM",
        location: "Downtown Area • Provider: QuickFix Auto",
        status: "completed",
        icon: "✅",
      },
      {
        id: 2,
        service: "Flat Tire Assistance",
        date: "May 19, 2025 • 8:20 AM",
        location: "Highway 101 • Provider: RoadHelp Services",
        status: "completed",
        icon: "✅",
      },
      {
        id: 3,
        service: "Towing Service",
        date: "May 12, 2025 • 6:15 PM",
        location: "Mall Parking • Reason: Issue resolved",
        status: "cancelled",
        icon: "❌",
      },
    ],
    [],
  );

  // Memoize service options to prevent re-creation
  const services = useMemo(
    () => [
      {
        id: "towing",
        name: "Towing",
        description: "Professional towing service",
        icon: Truck,
        available: true,
      },
      {
        id: "jumpstart",
        name: "Jump Start",
        description: "Battery assistance",
        icon: Zap,
        available: true,
      },
      {
        id: "tire",
        name: "Tire Change",
        description: "Flat tire replacement",
        icon: Settings,
        available: true,
      },
      {
        id: "lockout",
        name: "Lockout",
        description: "Vehicle lockout service",
        icon: Key,
        available: true,
      },
      {
        id: "fuel",
        name: "Fuel Delivery",
        description: "Emergency fuel service",
        icon: Fuel,
        available: true,
      },
      {
        id: "winch",
        name: "Winch Out",
        description: "Vehicle recovery service",
        icon: Anchor,
        available: false,
      },
    ],
    [],
  );

  const handleEmergencyRequest = () => {
    Alert.alert(
      "Emergency Request",
      "Are you sure you need emergency roadside assistance?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, I need help!",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Emergency Request Sent",
              "Help is on the way! We'll contact you shortly.",
            );
          },
        },
      ],
    );
  };

  // Enhanced service booking functions
  const handleServiceRequest = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service?.available) {
      setSelectedServiceType(serviceId);
      setCurrentView("booking");
      setBookingStep(1);
    } else {
      Alert.alert(
        "Service Unavailable",
        "This service is currently unavailable in your area.",
      );
    }
  };

  const handleBookingNext = () => {
    if (bookingStep < 4) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handleBookingBack = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    } else {
      setCurrentView("main");
      setBookingStep(1);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const selectedService = services.find(
        (s) => s.id === selectedServiceType,
      );
      if (!selectedService) return;

      const newRequest: ServiceRequest = {
        id: `req_${Date.now()}`,
        type: selectedServiceType as any,
        status: "pending",
        location: {
          address: serviceLocation || currentLocation,
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
        description: serviceDescription,
        priority: selectedServiceType === "emergency" ? "emergency" : "medium",
        estimatedCost:
          selectedService.id === "towing"
            ? 150
            : selectedService.id === "jumpstart"
              ? 75
              : selectedService.id === "tire"
                ? 100
                : selectedService.id === "lockout"
                  ? 85
                  : selectedService.id === "fuel"
                    ? 60
                    : 200,
        estimatedTime: selectedService.id === "emergency" ? 15 : 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setServiceRequests((prev) => [newRequest, ...prev]);
      setActiveRequest(newRequest);
      setCurrentView("tracking");

      // Reset booking form
      setSelectedServiceType("");
      setServiceLocation("");
      setServiceDescription("");
      setBookingStep(1);

      Alert.alert(
        "Service Requested",
        "Your request has been submitted! We're finding the nearest provider.",
      );
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("Error", "Failed to submit request. Please try again.");
    }
  };

  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      "Cancel Service",
      "Are you sure you want to cancel this service request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            setServiceRequests((prev) =>
              prev.map((req) =>
                req.id === requestId
                  ? { ...req, status: "cancelled" as const }
                  : req,
              ),
            );
            if (activeRequest?.id === requestId) {
              setActiveRequest(null);
              setCurrentView("main");
            }
          },
        },
      ],
    );
  };

  const handleCallTechnician = (phone?: string) => {
    const phoneNumber = phone || "+1-555-0123";
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to make phone call");
    });
  };

  const handleNavigateToTechnician = () => {
    const destination = "Current technician location";
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(destination)}`,
      android: `geo:0,0?q=${encodeURIComponent(destination)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(destination)}`,
    });

    Linking.openURL(url!).catch(() => {
      Alert.alert("Error", "Unable to open navigation app");
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getActivityIconBg = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20";
      case "cancelled":
        return "bg-red-500/20";
      case "pending":
        return "bg-yellow-500/20";
      default:
        return "bg-gray-500/20";
    }
  };

  // Auth functions
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Load customer profile
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
            membershipType: data.membership_type || "Standard",
          });
        } else {
          // Fallback user data
          setUser({
            id: session.user.id,
            email: session.user.email || "customer@roadside.com",
            name: session.user.user_metadata?.name || userName,
            membershipType: membershipType,
          });
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
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
          name: data.user.user_metadata?.name || "Customer",
          membershipType: "Premium",
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
            user_type: "customer",
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
        "customer@roadside.com",
        "demo123",
      );
      if (!success) {
        setEmail("customer@roadside.com");
        setPassword("demo123");
        Alert.alert(
          "Demo Login",
          "Demo credentials have been filled in. Please try signing in manually.",
        );
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setEmail("customer@roadside.com");
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
          name: data.user.user_metadata?.name || "Customer",
          membershipType: "Premium",
        });
        return true;
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
    return false;
  };

  // Navigation function
  const renderCurrentView = () => {
    switch (currentView) {
      case "booking":
        return renderBookingFlow();
      case "tracking":
        return renderServiceTracking(
          activeRequest,
          setCurrentView,
          handleCancelRequest,
          handleCallTechnician,
          handleNavigateToTechnician,
        );
      case "history":
        return renderServiceHistory(
          serviceRequests,
          setCurrentView,
          getStatusColor,
        );
      case "profile":
        return renderProfile(user, setCurrentView, handleSignOut);
      case "payment":
        return renderPaymentMethods(setCurrentView);
      default:
        return renderMainDashboard();
    }
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl items-center justify-center mb-4">
            <User size={32} color="white" />
          </View>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-white text-lg font-semibold mt-4">
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
                RoadSide+ Customer
              </Text>
              <Text className="text-slate-400 text-center text-base">
                {authMode === "login" &&
                  "Access your roadside assistance account"}
                {authMode === "register" && "Create your customer account"}
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
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowPassword(!showPassword)}
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
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button">
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
                  className={`bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl py-4 items-center mb-4 ${authLoading ? "opacity-50" : ""}`}
                 accessibilityRole="button" accessibilityLabel="Interactive button">
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
                     style={{ minHeight: 44 }} accessibilityRole="button" accessibilityLabel="Interactive button">
                      <Text className="text-slate-300 font-semibold text-sm">
                        Demo Login
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> switchAuthMode("register")}
                        disabled={authLoading}
                      >
                        <Text className="text-blue-400 text-sm font-medium">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> switchAuthMode("reset")}
                        disabled={authLoading}
                      >
                        <Text className="text-blue-400 text-sm font-medium">
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
                  >
                    <Text className="text-blue-400 text-sm font-medium">
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
                  Your account information is encrypted and protected. Access
                  your roadside assistance services securely.
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
                <Text className="text-white text-xl font-bold text-center mb-2">
                  Success!
                </Text>
                <Text className="text-slate-300 text-center text-sm leading-relaxed">
                  {successMessage}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setShowSuccessModal(false)}
                className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold text-base">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {/* Connection Status */}
      <View className="absolute top-12 right-4 z-50 flex-row items-center bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-lg px-3 py-2">
        <View
          className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <Text className="text-white text-xs">
          {isConnected ? "Connected" : "Offline"}
        </Text>
      </View>

      {/* Responsive Header */}
      <ResponsiveHeader
        title={`Good evening, ${user.name}`}
        subtitle="Stay safe on the road"
        leftAction={{
          icon: (
            <Image
              source={require("../../public/images/Main-Brand-Logo.png")}
              className={`${designSystem.utils.getResponsiveClass('w-8 h-8', 'w-10 h-10', 'w-12 h-12')}`}
              resizeMode="contain"
            />
          ),
          onPress: () => setCurrentView("main"),
          label: "Home"
        }}
        rightActions={[
          {
            icon: <Bell size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#94a3b8" />,
            onPress: () => {
              // Handle notifications
              Alert.alert("Notifications", "No new notifications");
            },
            label: "Notifications",
            badge: true
          },
          {
            icon: <User size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#94a3b8" />,
            onPress: handleSignOut,
            label: "Profile menu"
          }
        ]}
      />

      {/* Main Content */}
      {renderCurrentView()}

      {/* Responsive Bottom Navigation */}
      <ResponsiveBottomNav
        activeItem={currentView}
        onItemPress={(id) => {
          if (id === "emergency") {
            handleEmergencyRequest();
          } else {
            setCurrentView(id as any);
          }
        }}
        items={[
          {
            id: "main",
            label: "Home",
            icon: <Home size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#94a3b8" />,
            activeIcon: <Home size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#ef4444" />,
          },
          {
            id: "booking",
            label: "Services",
            icon: <Wrench size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#94a3b8" />,
            activeIcon: <Wrench size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#ef4444" />,
          },
          {
            id: "emergency",
            label: "Emergency",
            icon: (
              <View className={`${designSystem.utils.getResponsiveClass('w-14 h-14', 'w-16 h-16', 'w-18 h-18')} bg-gradient-to-br from-red-600 to-red-500 rounded-full items-center justify-center -mt-6 border-4 border-slate-800`}>
                <Plus size={designSystem.utils.getResponsiveValue(24, 28, 32)} color="white" />
              </View>
            ),
          },
          {
            id: "history",
            label: "History",
            icon: <BarChart3 size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#94a3b8" />,
            activeIcon: <BarChart3 size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#ef4444" />,
          },
          {
            id: "profile",
            label: "Profile",
            icon: <User size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#94a3b8" />,
            activeIcon: <User size={designSystem.utils.getResponsiveValue(18, 20, 22)} color="#ef4444" />,
          },
        ]}
      />
    </SafeAreaView>
  );

  // Main Dashboard View
  function renderMainDashboard() {
    return (
      <ScrollView
        className="flex-1 bg-slate-900/30"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: designSystem.spacing.responsive.xxl + 80 }}
      >
        <ResponsiveContainer>
          {/* Emergency Banner */}
          <ResponsiveCard
            variant="elevated"
            onPress={handleEmergencyRequest}
            className="bg-gradient-to-r from-red-600 to-red-500 border-red-500/30 my-6 relative overflow-hidden"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <ResponsiveText variant="h3" className="mb-2">
                  Need Help Now?
                </ResponsiveText>
                <ResponsiveText variant="body" className="text-white/90">
                  Tap for instant emergency roadside assistance
                </ResponsiveText>
              </View>
              <View className={`${designSystem.utils.getResponsiveClass('w-12 h-12', 'w-14 h-14', 'w-16 h-16')} bg-white/20 rounded-full items-center justify-center`}>
                <AlertTriangle size={designSystem.utils.getResponsiveValue(24, 28, 32)} color="white" />
              </View>
            </View>
          </ResponsiveCard>

        {/* Active Service Alert */}
        {activeRequest && (
          <TouchableOpacity
            onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setCurrentView("tracking")}
            className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 mb-6"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-1">
                  Service in Progress
                </Text>
                <Text className="text-white/90">
                  {services.find((s) => s.id === activeRequest.type)?.name} •{" "}
                  {activeRequest.status}
                </Text>
              </View>
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <Navigation size={24} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        )}

          {/* Membership Status */}
          <ResponsiveCard
            variant="elevated"
            className="bg-gradient-to-r from-green-600 to-green-500 border-green-500/30 mb-6"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <ResponsiveText variant="h4" className="mb-1">
                  {user.membershipType} Member
                </ResponsiveText>
                <ResponsiveText variant="body" className="text-white/90">
                  Unlimited services • Priority support
                </ResponsiveText>
              </View>
              <View className={`${designSystem.utils.getResponsiveClass('w-10 h-10', 'w-12 h-12', 'w-14 h-14')} bg-white/20 rounded-xl items-center justify-center`}>
                <Crown size={designSystem.utils.getResponsiveValue(20, 24, 28)} color="white" />
              </View>
            </View>
          </ResponsiveCard>

          {/* Quick Stats */}
          <ResponsiveGrid
            columns={{ mobile: 2, tablet: 4, desktop: 4 }}
            gap="md"
            className="mb-6"
          >
            {stats.map((stat, index) => (
              <ResponsiveMetricCard
                key={index}
                title={stat.label}
                value={stat.number}
                className={`${designSystem.deviceType.isPhone ? 'min-w-[140px]' : 'min-w-[160px]'}`}
              />
            ))}
          </ResponsiveGrid>

          {/* Current Status */}
          <ResponsiveCard variant="default" className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ResponsiveText variant="h4">
                Your Status
              </ResponsiveText>
              <View className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-lg">
                <ResponsiveText variant="caption" className="text-green-400 font-semibold uppercase">
                  All Good
                </ResponsiveText>
              </View>
            </View>

            <View className="bg-white/5 rounded-2xl p-4 flex-row items-center">
              <View className={`${designSystem.utils.getResponsiveClass('w-10 h-10', 'w-12 h-12', 'w-14 h-14')} bg-gradient-to-br from-red-600 to-red-500 rounded-xl items-center justify-center mr-4`}>
                <MapPin size={designSystem.utils.getResponsiveValue(18, 20, 24)} color="white" />
              </View>
              <View className="flex-1">
                <ResponsiveText variant="body" className="font-semibold mb-1">
                  {serviceLocation || currentLocation}
                </ResponsiveText>
                <ResponsiveText variant="caption" className="text-green-400">
                  • GPS Active • Location confirmed
                </ResponsiveText>
              </View>
              <ResponsiveButton
                variant="ghost"
                size="sm"
                className="bg-white/10 border border-white/10"
               style={{ minHeight: designSystem.spacing.touchTarget.min }}>
                Update
              </ResponsiveButton>
            </View>
          </ResponsiveCard>

          {/* Quick Services */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Quick Services
            </ResponsiveText>

            <ResponsiveGrid
              columns={{ mobile: 2, tablet: 3, desktop: 4 }}
              gap="md"
            >
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <ResponsiveCard
                    key={service.id}
                    variant="flat"
                    onPress={() => handleServiceRequest(service.id)}
                    className={`flex-1 ${designSystem.utils.getResponsiveClass(
                      'min-w-[140px] max-w-[48%]', // mobile
                      'min-w-[160px] max-w-[32%]', // tablet
                      'min-w-[180px] max-w-[24%]'  // desktop
                    )} items-center relative`}
                  >
                    <View
                      className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                        service.available ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <View className={`${designSystem.utils.getResponsiveClass('w-12 h-12', 'w-14 h-14', 'w-16 h-16')} bg-gradient-to-br from-red-600 to-red-500 rounded-2xl items-center justify-center mb-3`}>
                      <IconComponent size={designSystem.utils.getResponsiveValue(20, 24, 28)} color="white" />
                    </View>
                    <ResponsiveText variant="body" className="font-semibold mb-1 text-center">
                      {service.name}
                    </ResponsiveText>
                    <ResponsiveText variant="caption" color="secondary" className="text-center">
                      {service.description}
                    </ResponsiveText>
                  </ResponsiveCard>
                );
              })}
            </ResponsiveGrid>
          </ResponsiveCard>

          {/* Recent Activity */}
          <ResponsiveCard variant="default" className="mb-6">
            <View className="flex-row justify-between items-center mb-5">
              <ResponsiveText variant="h4">
                Recent Activity
              </ResponsiveText>
              <ResponsiveButton
                variant="ghost"
                size="sm"
                onPress={() => setCurrentView("history")}
                className="bg-transparent border-0 px-0"
              >
                <ResponsiveText variant="caption" className="text-red-400 font-medium">
                  View All
                </ResponsiveText>
              </ResponsiveButton>
            </View>

            {activities.map((activity, index) => (
              <View
                key={activity.id}
                className={`flex-row items-center py-4 ${index < activities.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <View
                  className={`${designSystem.utils.getResponsiveClass('w-10 h-10', 'w-11 h-11', 'w-12 h-12')} rounded-xl items-center justify-center mr-4 ${getActivityIconBg(
                    activity.status,
                  )}`}
                >
                  <Text className={`${designSystem.utils.getResponsiveClass('text-base', 'text-lg', 'text-xl')}`}>
                    {activity.icon}
                  </Text>
                </View>
                <View className="flex-1">
                  <ResponsiveText variant="body" className="font-semibold mb-1">
                    {activity.service}
                  </ResponsiveText>
                  <ResponsiveText variant="caption" color="secondary" className="mb-1">
                    {activity.date}
                  </ResponsiveText>
                  <ResponsiveText variant="caption" color="muted">
                    {activity.location}
                  </ResponsiveText>
                </View>
                <View
                  className={`px-3 py-1 rounded-lg ${getStatusColor(
                    activity.status,
                  )}`}
                >
                  <ResponsiveText variant="caption" className="font-semibold uppercase">
                    {activity.status}
                  </ResponsiveText>
                </View>
              </View>
            ))}
          </ResponsiveCard>
        </ResponsiveContainer>
      </ScrollView>
    );
  }

  // Booking Flow View
  function renderBookingFlow() {
    const selectedService = services.find((s) => s.id === selectedServiceType);

    return (
      <ScrollView className="flex-1 bg-slate-900/30 px-4 pb-24">
        {/* Header */}
        <View className="flex-row items-center justify-between py-6">
          <TouchableOpacity
            onPress={handleBookingBack}
            className="w-10 h-10 bg-slate-800/80 rounded-xl items-center justify-center"
           style={{ minHeight: 44 }} accessibilityRole="button" accessibilityLabel="Interactive button">
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Book Service</Text>
          <View className="w-10 h-10" />
        </View>

        {/* Progress Indicator */}
        <View className="flex-row items-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <View key={step} className="flex-1 flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step <= bookingStep ? "bg-red-500" : "bg-slate-700"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step <= bookingStep ? "text-white" : "text-slate-400"
                  }`}
                >
                  {step}
                </Text>
              </View>
              {step < 4 && (
                <View
                  className={`flex-1 h-0.5 mx-2 ${
                    step < bookingStep ? "bg-red-500" : "bg-slate-700"
                  }`}
                />
              )}
            </View>
          ))}
        </View>

        {/* Step Content */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          {bookingStep === 1 && (
            <View>
              <Text className="text-white text-xl font-bold mb-4">
                Select Service Type
              </Text>
              <View className="gap-4">
                {services
                  .filter((s) => s.available)
                  .map((service) => {
                    const IconComponent = service.icon;
                    const isSelected = selectedServiceType === service.id;
                    return (
                      <TouchableOpacity
                        key={service.id}
                        onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setSelectedServiceType(service.id)}
                        className={`flex-row items-center p-4 rounded-xl border ${
                          isSelected
                            ? "bg-red-500/20 border-red-500"
                            : "bg-slate-700/50 border-white/10"
                        }`}
                      >
                        <View className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl items-center justify-center mr-4">
                          <IconComponent size={20} color="white" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-semibold mb-1">
                            {service.name}
                          </Text>
                          <Text className="text-slate-400 text-sm">
                            {service.description}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-white font-bold">
                            $
                            {service.id === "towing"
                              ? "150"
                              : service.id === "jumpstart"
                                ? "75"
                                : service.id === "tire"
                                  ? "100"
                                  : service.id === "lockout"
                                    ? "85"
                                    : service.id === "fuel"
                                      ? "60"
                                      : "200"}
                          </Text>
                          <Text className="text-slate-400 text-xs">
                            ~{service.id === "emergency" ? "15" : "30"} min
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </View>
          )}

          {bookingStep === 2 && (
            <View>
              <Text className="text-white text-xl font-bold mb-4">
                Location & Details
              </Text>
              <View className="gap-4">
                <View>
                  <Text className="text-slate-200 font-semibold mb-2">
                    Service Location
                  </Text>
                  <View className="flex-row items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                    <MapPin size={20} color="#94a3b8" />
                    <TextInput
                      value={serviceLocation}
                      onChangeText={setServiceLocation}
                      placeholder={currentLocation}
                      placeholderTextColor="#64748b"
                      className="flex-1 text-white text-base ml-3"
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-slate-200 font-semibold mb-2">
                    Problem Description
                  </Text>
                  <View className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                    <TextInput
                      value={serviceDescription}
                      onChangeText={setServiceDescription}
                      placeholder="Describe the issue you're experiencing..."
                      placeholderTextColor="#64748b"
                      className="text-white text-base"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {bookingStep === 3 && (
            <View>
              <Text className="text-white text-xl font-bold mb-4">
                Payment Method
              </Text>
              <View className="gap-4">
                <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-slate-700/50 border border-white/10" style={{ minHeight: 44 }}>
                  <View className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl items-center justify-center mr-4">
                    <CreditCard size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold mb-1">
                      Credit Card •••• 4242
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      Expires 12/25
                    </Text>
                  </View>
                  <View className="w-4 h-4 bg-red-500 rounded-full" />
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-slate-700/50 border border-white/10" style={{ minHeight: 44 }}>
                  <View className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-xl items-center justify-center mr-4">
                    <DollarSign size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold mb-1">
                      Pay on Arrival
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      Cash or card payment to technician
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {bookingStep === 4 && (
            <View>
              <Text className="text-white text-xl font-bold mb-4">
                Confirm Booking
              </Text>
              <View className="gap-4">
                <View className="bg-white/5 rounded-xl p-4">
                  <Text className="text-slate-400 text-sm mb-2">Service</Text>
                  <Text className="text-white font-semibold">
                    {selectedService?.name}
                  </Text>
                </View>
                <View className="bg-white/5 rounded-xl p-4">
                  <Text className="text-slate-400 text-sm mb-2">Location</Text>
                  <Text className="text-white font-semibold">
                    {serviceLocation || currentLocation}
                  </Text>
                </View>
                <View className="bg-white/5 rounded-xl p-4">
                  <Text className="text-slate-400 text-sm mb-2">
                    Estimated Cost
                  </Text>
                  <Text className="text-white font-semibold">
                    $
                    {selectedService?.id === "towing"
                      ? "150"
                      : selectedService?.id === "jumpstart"
                        ? "75"
                        : selectedService?.id === "tire"
                          ? "100"
                          : selectedService?.id === "lockout"
                            ? "85"
                            : selectedService?.id === "fuel"
                              ? "60"
                              : "200"}
                  </Text>
                </View>
                <View className="bg-white/5 rounded-xl p-4">
                  <Text className="text-slate-400 text-sm mb-2">
                    Estimated Time
                  </Text>
                  <Text className="text-white font-semibold">
                    {selectedService?.id === "emergency" ? "15" : "30"} minutes
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4">
          {bookingStep > 1 && (
            <TouchableOpacity
              onPress={handleBookingBack}
              className="flex-1 bg-slate-700/50 border border-white/10 rounded-xl py-4 items-center"
             style={{ minHeight: 44 }} accessibilityRole="button" accessibilityLabel="Interactive button">
              <Text className="text-white font-semibold">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={
              bookingStep === 4 ? handleConfirmBooking : handleBookingNext
            }
            disabled={bookingStep === 1 && !selectedServiceType}
            className={`flex-1 rounded-xl py-4 items-center ${
              bookingStep === 1 && !selectedServiceType
                ? "bg-slate-600 opacity-50"
                : "bg-gradient-to-r from-red-600 to-red-500"
            }`}
           accessibilityRole="button" accessibilityLabel="Interactive button">
            <Text className="text-white font-semibold">
              {bookingStep === 4 ? "Confirm Booking" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
});

export default CustomerDashboard;
