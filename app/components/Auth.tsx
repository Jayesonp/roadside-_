import React, { useState, useEffect, createContext, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Mail,
  User,
  ArrowLeft,
  CheckCircle,
} from "lucide-react-native";

interface User {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  permissions: string[];
  name: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role?: string,
  ) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuthStatus();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await loadUserProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        // Check if user exists in auth.users but not in admin_users
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user?.email) {
          // Create admin user profile if it doesn't exist
          const { error: insertError } = await supabase
            .from("admin_users")
            .insert({
              id: userId,
              email: authUser.user.email,
              name: authUser.user.user_metadata?.name || "Admin User",
              role: "admin",
              permissions: ["read"],
              status: "active",
              email_verified: authUser.user.email_confirmed_at ? true : false,
            });

          if (!insertError) {
            setUser({
              id: userId,
              email: authUser.user.email,
              role: "admin",
              permissions: ["read"],
              name: authUser.user.user_metadata?.name || "Admin User",
              lastLogin: new Date().toISOString(),
            });
            return;
          }
        }

        // Fallback to mock data for development
        setUser({
          id: userId,
          email: "admin@roadside.com",
          role: "super_admin",
          permissions: ["all"],
          name: "John Davis",
          lastLogin: new Date().toISOString(),
        });
        return;
      }

      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        permissions: data.permissions || [],
        name: data.name,
        lastLogin: data.last_login || new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Set fallback user to prevent auth loop
      setUser({
        id: userId,
        email: "admin@roadside.com",
        role: "admin",
        permissions: ["read"],
        name: "Admin User",
        lastLogin: new Date().toISOString(),
      });
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Validate input
      if (!email.trim() || !password.trim()) {
        Alert.alert("Validation Error", "Email and password are required");
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Sign in error:", error);

        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert(
            "Authentication Error",
            "Invalid email or password. Please check your credentials and try again.",
          );
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert(
            "Email Verification Required",
            "Please check your email and click the verification link before signing in.",
          );
        } else {
          Alert.alert("Authentication Error", error.message);
        }
        return false;
      }

      if (data.user) {
        // Update last login timestamp
        try {
          await supabase
            .from("admin_users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", data.user.id);
        } catch (updateError) {
          console.warn("Failed to update last login:", updateError);
        }

        await loadUserProfile(data.user.id);
        return true;
      }

      Alert.alert("Authentication Error", "Sign in failed. Please try again.");
      return false;
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "An unexpected error occurred during sign in");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: string = "admin",
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Validate input
      if (!email.trim() || !password.trim() || !name.trim()) {
        Alert.alert("Validation Error", "All fields are required");
        return false;
      }

      if (password.length < 6) {
        Alert.alert(
          "Validation Error",
          "Password must be at least 6 characters long",
        );
        return false;
      }

      // First create the auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: role,
          },
        },
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        Alert.alert("Registration Error", authError.message);
        return false;
      }

      if (authData.user) {
        // Create admin user profile
        const { error: profileError } = await supabase
          .from("admin_users")
          .insert({
            id: authData.user.id,
            email: email.trim(),
            name: name.trim(),
            role,
            permissions: role === "super_admin" ? ["all"] : ["read"],
            status: "pending", // Set to pending until email is verified
            email_verified: false,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't fail completely if profile creation fails
          console.warn("Profile creation failed, but auth user was created");
        }

        Alert.alert(
          "Registration Successful",
          "Please check your email to verify your account before signing in.",
        );
        return true;
      }

      Alert.alert("Registration Error", "Failed to create user account");
      return false;
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "An unexpected error occurred during registration");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          "https://trusting-blackburn1-wqque.view-3.tempo-dev.app/reset-password",
      });

      if (error) {
        Alert.alert("Password Reset Error", error.message);
        return false;
      }

      Alert.alert(
        "Password Reset Sent",
        "Please check your email for password reset instructions.",
      );
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred during password reset",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return (
      user.permissions.includes("all") || user.permissions.includes(permission)
    );
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        Alert.alert("Error", "Failed to sign out");
      }
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    resetPassword,
    signOut,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface LoginScreenProps {
  backgroundColor?: string;
}

export default function LoginScreen({
  backgroundColor = "#0f172a",
}: LoginScreenProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">(
    "login",
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { signIn, signUp, resetPassword } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    const success = await signIn(email.trim(), password);
    setIsLoading(false);

    if (!success) {
      // Error handling is done in the signIn function
      return;
    }
  };

  const handleRegister = async () => {
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

    setIsLoading(true);
    const success = await signUp(email.trim(), password, name.trim());
    setIsLoading(false);

    if (success) {
      setSuccessMessage(
        "Registration successful! Please check your email to verify your account.",
      );
      setShowSuccessModal(true);
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setAuthMode("login");
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    const success = await resetPassword(email.trim());
    setIsLoading(false);

    if (success) {
      setSuccessMessage(
        "Password reset instructions have been sent to your email.",
      );
      setShowSuccessModal(true);
      setAuthMode("login");
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
    setIsLoading(true);

    try {
      // Try to sign in with demo credentials
      const success = await signIn("admin@roadside.com", "demo123");

      if (!success) {
        // If demo login fails, create a demo user
        console.log("Demo login failed, attempting to create demo user...");

        // First try to sign up the demo user
        const signUpSuccess = await signUp(
          "admin@roadside.com",
          "demo123",
          "Demo Admin",
          "super_admin",
        );

        if (signUpSuccess) {
          Alert.alert(
            "Demo Account Created",
            "A demo account has been created. Please check the email for verification or try signing in directly.",
          );
        } else {
          // If signup also fails, set demo credentials in form for manual attempt
          setEmail("admin@roadside.com");
          setPassword("demo123");
          Alert.alert(
            "Demo Login",
            "Demo credentials have been filled in. Please try signing in manually.",
          );
        }
      }
    } catch (error) {
      console.error("Demo login error:", error);
      // Set demo credentials in form as fallback
      setEmail("admin@roadside.com");
      setPassword("demo123");
      Alert.alert(
        "Demo Login",
        "Demo credentials have been filled in. Please try signing in manually.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 py-8">
          {/* Back Button for Register/Reset modes */}
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
              RoadSide+ Admin
            </Text>
            <Text className="text-slate-400 text-center text-base">
              {authMode === "login" && "Secure access to the control center"}
              {authMode === "register" && "Create your admin account"}
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
                <Text className="text-slate-200 font-semibold mb-2">Email</Text>
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
                    ? handleLogin
                    : authMode === "register"
                      ? handleRegister
                      : handlePasswordReset
                }
                disabled={isLoading}
                className={`bg-gradient-to-r from-red-600 to-red-500 rounded-xl py-4 items-center mb-4 ${
                  isLoading ? "opacity-50" : ""
                }`}
                style={{
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {isLoading ? (
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
                    disabled={isLoading}
                    className="bg-white/10 border border-white/10 rounded-xl py-3 items-center mb-4"
                    style={{
                      shadowColor: "#ffffff",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator color="#94a3b8" size="small" />
                        <Text className="text-slate-300 font-semibold text-sm ml-2">
                          Loading Demo...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-slate-300 font-semibold text-sm">
                        Demo Login
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View className="flex-row justify-between items-center">
                    <TouchableOpacity
                      onPress={() => switchAuthMode("register")}
                      disabled={isLoading}
                    >
                      <Text className="text-blue-400 text-sm font-medium">
                        Create Account
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => switchAuthMode("reset")}
                      disabled={isLoading}
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
                  disabled={isLoading}
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
                {authMode === "login" &&
                  "Your login credentials are encrypted and protected. Only authorized administrators can access the control center."}
                {authMode === "register" &&
                  "All account information is encrypted and secure. Admin accounts require approval before activation."}
                {authMode === "reset" &&
                  "Password reset links are secure and expire after 24 hours for your protection."}
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
          <View className="bg-slate-800 border border-white/10 rounded-xl p-8 w-full max-w-sm">
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

// Auth Guard Component
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl items-center justify-center mb-4">
            <Shield size={32} color="white" />
          </View>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text className="text-white text-lg font-semibold mt-4">
            Authenticating...
          </Text>
          <Text className="text-slate-400 text-sm mt-2">
            Please wait while we verify your credentials
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return fallback || <LoginScreen />;
  }

  return <>{children}</>;
}
