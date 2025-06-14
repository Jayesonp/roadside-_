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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
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
} from "lucide-react-native";

interface CustomerDashboardProps {
  userName?: string;
  membershipType?: "Premium" | "Standard";
}

interface CustomerUser {
  id: string;
  email: string;
  name: string;
  membershipType: "Premium" | "Standard";
}

const CustomerDashboard = React.memo(function CustomerDashboard({
  userName = "Sarah",
  membershipType = "Premium",
}: CustomerDashboardProps) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleServiceRequest = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service?.available) {
      Alert.alert("Service Request", `Request ${service.name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Service",
          onPress: () => {
            Alert.alert(
              "Service Requested",
              "We're finding the nearest provider for you!",
            );
          },
        },
      ]);
    } else {
      Alert.alert(
        "Service Unavailable",
        "This service is currently unavailable in your area.",
      );
    }
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
                  className={`bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl py-4 items-center mb-4 ${authLoading ? "opacity-50" : ""}`}
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
                        <Text className="text-blue-400 text-sm font-medium">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => switchAuthMode("reset")}
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
                    onPress={() => switchAuthMode("login")}
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

      {/* Header */}
      <View className="px-6 py-4 bg-slate-800/60 backdrop-blur-lg border-b border-white/10 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <Image
            source={require("../../public/images/Main-Brand-Logo.png")}
            className="w-10 h-10 mr-3"
            resizeMode="contain"
          />
          <View>
            <Text className="text-2xl font-bold text-white">
              Good evening, {user.name}
            </Text>
            <Text className="text-slate-400">Stay safe on the road</Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center relative">
            <Bell size={20} color="#94a3b8" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
            onPress={handleSignOut}
          >
            <User size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 bg-slate-900/30 px-4 pb-24">
        {/* Emergency Banner */}
        <TouchableOpacity
          onPress={handleEmergencyRequest}
          className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-6 my-6 relative overflow-hidden"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-1">
                Need Help Now?
              </Text>
              <Text className="text-white/90">
                Tap for instant emergency roadside assistance
              </Text>
            </View>
            <View className="w-15 h-15 bg-white/20 rounded-full items-center justify-center">
              <AlertTriangle size={32} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Membership Status */}
        <View className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-5 mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-lg font-bold">
              {user.membershipType} Member
            </Text>
            <Text className="text-white/90">
              Unlimited services • Priority support
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
            <Crown size={24} color="white" />
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-4 mb-6">
          {stats.map((stat, index) => (
            <View
              key={index}
              className="flex-1 bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-4 items-center"
            >
              <Text className="text-white text-2xl font-bold mb-1">
                {stat.number}
              </Text>
              <Text className="text-slate-400 text-xs text-center">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Current Status */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-semibold">
              Your Status
            </Text>
            <View className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-lg">
              <Text className="text-green-400 text-xs font-semibold uppercase">
                All Good
              </Text>
            </View>
          </View>

          <View className="bg-white/5 rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl items-center justify-center mr-4">
              <MapPin size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">
                {currentLocation}
              </Text>
              <Text className="text-green-400 text-sm flex-row items-center">
                • GPS Active • Location confirmed
              </Text>
            </View>
            <TouchableOpacity className="bg-white/10 border border-white/10 rounded-lg px-4 py-2">
              <Text className="text-white text-sm font-medium">Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Services */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Quick Services
          </Text>

          <View className="flex-row flex-wrap gap-4">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => handleServiceRequest(service.id)}
                  className="flex-1 min-w-[140px] bg-slate-700/50 border border-white/10 rounded-2xl p-4 items-center relative"
                >
                  <View
                    className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                      service.available ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <View className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl items-center justify-center mb-3">
                    <IconComponent size={24} color="white" />
                  </View>
                  <Text className="text-white font-semibold text-sm mb-1">
                    {service.name}
                  </Text>
                  <Text className="text-slate-400 text-xs text-center">
                    {service.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-lg font-semibold">
              Recent Activity
            </Text>
            <TouchableOpacity>
              <Text className="text-red-400 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          {activities.map((activity) => (
            <View
              key={activity.id}
              className="flex-row items-center py-4 border-b border-white/5 last:border-b-0"
            >
              <View
                className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${getActivityIconBg(
                  activity.status,
                )}`}
              >
                <Text className="text-lg">{activity.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold mb-1">
                  {activity.service}
                </Text>
                <Text className="text-slate-400 text-sm mb-1">
                  {activity.date}
                </Text>
                <Text className="text-slate-500 text-xs">
                  {activity.location}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-lg ${getStatusColor(
                  activity.status,
                )}`}
              >
                <Text className="text-xs font-semibold uppercase">
                  {activity.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-white/10 px-4 py-4 flex-row justify-around items-center">
        <TouchableOpacity
          onPress={() => setActiveView("home")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "home" ? "bg-red-500/20" : ""
          }`}
        >
          <Home
            size={20}
            color={activeView === "home" ? "#ef4444" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-semibold mt-1 ${
              activeView === "home" ? "text-red-400" : "text-slate-400"
            }`}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveView("services")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "services" ? "bg-red-500/20" : ""
          }`}
        >
          <Wrench
            size={20}
            color={activeView === "services" ? "#ef4444" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-semibold mt-1 ${
              activeView === "services" ? "text-red-400" : "text-slate-400"
            }`}
          >
            Services
          </Text>
        </TouchableOpacity>

        {/* Emergency FAB */}
        <TouchableOpacity
          onPress={handleEmergencyRequest}
          className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-full items-center justify-center -mt-6 border-4 border-slate-800"
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveView("history")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "history" ? "bg-red-500/20" : ""
          }`}
        >
          <BarChart3
            size={20}
            color={activeView === "history" ? "#ef4444" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-semibold mt-1 ${
              activeView === "history" ? "text-red-400" : "text-slate-400"
            }`}
          >
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveView("profile")}
          className={`items-center py-2 px-4 rounded-xl ${
            activeView === "profile" ? "bg-red-500/20" : ""
          }`}
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
});

export default CustomerDashboard;
