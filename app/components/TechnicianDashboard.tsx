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

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  technicianName = "Mike Chen",
  technicianId = "RSP-4857",
  isOnline = true,
  onStatusChange,
  onJobAccept,
  onEmergencyContact,
}) => {
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
      icon: "≡ƒ¢₧",
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
      icon: "≡ƒÜ¢",
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
      icon: "≡ƒöæ",
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
                setStats((prev) =>
                  prev.map((stat) => {
                    if (stat.type === "jobs") {
                      return {
                        ...stat,
                        number: (parseInt(stat.number) + 1).toString(),
                        change: `+${parseInt(stat.number) + 1 - 8} vs yesterday`,
                      };
                    }
                    return stat;
                  }),
                );

                Alert.alert(
                  "Job Accepted",
                  `You have accepted the ${job.type} job. Navigate to customer location to begin service.`,
                  [
                    {
                      text: "Navigate Now",
                      onPress: handleNavigateToCustomer,
                    },
                    {
                      text: "OK",
                      style: "default",
                    },
                  ],
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

  // Dashboard View (Main)
  const renderDashboardView = useCallback(() => {
    return (
      <ScrollView
        className="flex-1 bg-slate-900/30"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: designSystem.spacing.responsive.xxl + 80,
        }}
      >
        <ResponsiveContainer>
          {/* Quick Stats */}
          <ResponsiveGrid
            columns={{ mobile: 2, tablet: 4, desktop: 4 }}
            gap="md"
            className="my-6"
          >
            {stats.map((stat, index) => (
              <ResponsiveMetricCard
                key={index}
                title={stat.label}
                value={stat.number}
                change={stat.change}
                changeType="positive"
                className={`${designSystem.deviceType.isPhone ? "min-w-[140px]" : "min-w-[160px]"}`}
              />
            ))}
          </ResponsiveGrid>

          {/* Current Job */}
          <ResponsiveCard
            variant="elevated"
            className="bg-slate-800/80 border border-red-500/50 mb-6 relative"
          >
            <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-500 rounded-t-3xl" />

            <View className="flex-row justify-between items-start mb-5">
              <View>
                <ResponsiveText variant="h3" className="mb-1">
                  Battery Jump Start
                </ResponsiveText>
                <ResponsiveText variant="caption" color="secondary">
                  Job #RSJ-78952
                </ResponsiveText>
              </View>
              <View className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-lg">
                <ResponsiveText
                  variant="caption"
                  className="text-red-400 font-bold uppercase"
                >
                  Emergency
                </ResponsiveText>
              </View>
            </View>

            {/* Job Timer */}
            <View className="bg-white/10 rounded-xl p-4 mb-5 flex-row items-center justify-center">
              <Clock size={16} color="#fbbf24" />
              <ResponsiveText variant="h4" className="mx-2">
                {jobTimer.minutes}:
                {jobTimer.seconds.toString().padStart(2, "0")}
              </ResponsiveText>
              <ResponsiveText variant="caption" color="secondary">
                elapsed
              </ResponsiveText>
            </View>

            {/* Customer Info */}
            <View className="bg-white/5 rounded-2xl p-4 mb-5 flex-row items-center">
              <View className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full items-center justify-center mr-4">
                <ResponsiveText variant="body" className="font-bold">
                  SM
                </ResponsiveText>
              </View>
              <View className="flex-1">
                <ResponsiveText variant="body" className="font-semibold mb-1">
                  Sarah Mitchell
                </ResponsiveText>
                <View className="bg-yellow-500/20 px-2 py-1 rounded-md self-start mb-1">
                  <ResponsiveText
                    variant="caption"
                    className="text-yellow-400 font-semibold"
                  >
                    Premium Member
                  </ResponsiveText>
                </View>
                <ResponsiveText variant="caption" color="secondary">
                  Phone: +592-123-4567
                </ResponsiveText>
              </View>
            </View>

            {/* Location */}
            <View className="flex-row items-start mb-5">
              <View className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl items-center justify-center mr-3">
                <MapPin size={20} color="white" />
              </View>
              <View className="flex-1">
                <ResponsiveText variant="body" className="font-semibold mb-1">
                  123 Main Street, Georgetown
                </ResponsiveText>
                <ResponsiveText
                  variant="caption"
                  color="secondary"
                  className="mb-1"
                >
                  2.3 km away
                </ResponsiveText>
                <ResponsiveText
                  variant="caption"
                  className="text-green-400 font-semibold"
                >
                  ETA: 8 minutes
                </ResponsiveText>
              </View>
            </View>

            {/* Job Actions */}
            <View className="gap-3">
              <View className="flex-row gap-3">
                <ResponsiveButton
                  variant="primary"
                  size="md"
                  onPress={handleNavigateToCustomer}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500"
                  disabled={operationLoading}
                  icon={<Navigation size={16} color="white" />}
                  iconPosition="left"
                >
                  Navigate
                </ResponsiveButton>
                <ResponsiveButton
                  variant="ghost"
                  size="md"
                  onPress={handleContactCustomer}
                  className="flex-1 bg-white/10 border border-white/10"
                  disabled={operationLoading}
                  icon={<Phone size={16} color="white" />}
                  iconPosition="left"
                >
                  Call
                </ResponsiveButton>
              </View>
              <ResponsiveButton
                variant="success"
                size="md"
                onPress={handleMarkArrived}
                fullWidth
                disabled={operationLoading}
                icon={<CheckCircle size={16} color="white" />}
                iconPosition="left"
              >
                {operationLoading ? "Updating..." : "Mark Arrived"}
              </ResponsiveButton>
            </View>
          </ResponsiveCard>

          {/* Weekly Earnings */}
          <ResponsiveCard
            variant="elevated"
            className="bg-gradient-to-r from-green-600 to-green-500 border-green-500/30 mb-6"
          >
            <View className="flex-row justify-between items-center mb-4">
              <ResponsiveText
                variant="body"
                className="text-white/90 font-semibold"
              >
                Weekly Earnings
              </ResponsiveText>
              <ResponsiveText variant="caption" className="text-white/80">
                Nov 25 - Dec 1
              </ResponsiveText>
            </View>
            <ResponsiveText variant="h2" className="mb-2">
              $3,240
            </ResponsiveText>
            <ResponsiveText variant="body" className="text-white/90">
              +18% from last week
            </ResponsiveText>
          </ResponsiveCard>

          {/* Pending Jobs Preview */}
          <ResponsiveCard variant="default" className="mb-6">
            <View className="flex-row justify-between items-center mb-5">
              <ResponsiveText variant="h4">Pending Jobs</ResponsiveText>
              <ResponsiveButton
                variant="ghost"
                size="sm"
                onPress={() => handleViewChange("jobs")}
                className="bg-red-500/20 px-3 py-1"
              >
                <ResponsiveText
                  variant="caption"
                  className="text-red-400 font-bold"
                >
                  View All ({pendingJobs.length})
                </ResponsiveText>
              </ResponsiveButton>
            </View>

            {pendingJobs.slice(0, 2).map((job, index) => (
              <ResponsiveCard
                key={job.id}
                variant="flat"
                onPress={() => handleJobAccept(job)}
                className={`bg-white/5 border border-white/10 ${index < 1 ? "mb-3" : ""}`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <ResponsiveText
                      variant="body"
                      className="font-semibold mr-2"
                    >
                      {job.icon}
                    </ResponsiveText>
                    <ResponsiveText variant="body" className="font-semibold">
                      {job.type}
                    </ResponsiveText>
                  </View>
                  <ResponsiveText variant="caption" color="muted">
                    {job.time}
                  </ResponsiveText>
                </View>
                <View className="flex-row items-center mb-2">
                  <ResponsiveText
                    variant="caption"
                    color="secondary"
                    className="mr-2"
                  >
                    ≡ƒôì
                  </ResponsiveText>
                  <ResponsiveText variant="caption" color="secondary">
                    {job.location}
                  </ResponsiveText>
                </View>
                <ResponsiveText variant="caption" color="muted">
                  Customer: {job.customer}
                </ResponsiveText>
              </ResponsiveCard>
            ))}
          </ResponsiveCard>
        </ResponsiveContainer>
      </ScrollView>
    );
  }, [
    stats,
    jobTimer,
    pendingJobs,
    operationLoading,
    handleNavigateToCustomer,
    handleContactCustomer,
    handleMarkArrived,
    handleJobAccept,
    handleViewChange,
  ]);

  // Jobs View
  const renderJobsView = useCallback(() => {
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
    const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
    const [showJobDetails, setShowJobDetails] = useState(false);

    // Mock job data
    const jobsData = {
      available: pendingJobs,
      active: [
        {
          id: "RSJ-78952",
          type: "Battery Jump Start",
          time: "In Progress",
          location: "123 Main Street, Georgetown",
          customer: "Sarah Mitchell (Premium Member)",
          icon: "🔋",
          priority: "emergency" as const,
          estimatedEarnings: { min: 95, max: 130 },
          distance: "2.3 km",
          eta: "Arrived",
          duration: "25 min",
          customerPhone: "+592-123-4567",
          coordinates: { lat: 6.8013, lng: -58.1551 },
          status: "in_progress",
          startTime: "2:15 PM",
          estimatedCompletion: "2:45 PM"
        }
      ],
      history: [
        {
          id: "RSJ-78951",
          type: "Tire Change",
          time: "Completed 2h ago",
          location: "Highway 101, Mile 23",
          customer: "John Davis (Standard Member)",
          icon: "🛞",
          priority: "medium" as const,
          estimatedEarnings: { min: 85, max: 120 },
          distance: "2.3 km",
          eta: "Completed",
          duration: "45 min",
          customerPhone: "+592-123-4567",
          coordinates: { lat: 6.8013, lng: -58.1551 },
          status: "completed",
          completedAt: "12:30 PM",
          customerRating: 5,
          earnings: 120
        },
        {
          id: "RSJ-78950",
          type: "Lockout Service",
          time: "Completed 5h ago",
          location: "Office Building, Camp Street",
          customer: "Alex Thompson (Standard Member)",
          icon: "🔐",
          priority: "low" as const,
          estimatedEarnings: { min: 60, max: 90 },
          distance: "1.8 km",
          eta: "Completed",
          duration: "20 min",
          customerPhone: "+592-555-0123",
          coordinates: { lat: 6.8077, lng: -58.1578 },
          status: "completed",
          completedAt: "9:45 AM",
          customerRating: 4,
          earnings: 75
        }
      ]
    };

    const handleJobAction = async (job: PendingJob, action: 'accept' | 'decline' | 'navigate' | 'contact' | 'complete') => {
      try {
        setOperationLoading(true);

        switch (action) {
          case 'accept':
            await new Promise(resolve => setTimeout(resolve, 1500));
            setPendingJobs(prev => prev.filter(j => j.id !== job.id));
            Alert.alert("Job Accepted", `You have accepted the ${job.type} job. Navigate to customer location to begin service.`);
            break;

          case 'decline':
            Alert.alert(
              "Decline Job",
              `Are you sure you want to decline this ${job.type} job?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Decline",
                  style: "destructive",
                  onPress: async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setPendingJobs(prev => prev.filter(j => j.id !== job.id));
                    Alert.alert("Job Declined", "The job has been declined and returned to the available pool.");
                  }
                }
              ]
            );
            break;

          case 'navigate':
            const destination = job.location;
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
            break;

          case 'contact':
            const phoneNumber = job.customerPhone || "+592-123-4567";
            Alert.alert(
              "Contact Customer",
              `Call ${job.customer.split(' ')[0]} at ${phoneNumber}?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Call",
                  onPress: async () => {
                    const phoneUrl = `tel:${phoneNumber}`;
                    const canCall = await Linking.canOpenURL(phoneUrl);
                    if (canCall) {
                      await Linking.openURL(phoneUrl);
                    } else {
                      Alert.alert("Error", "Unable to make phone calls on this device");
                    }
                  }
                }
              ]
            );
            break;

          case 'complete':
            Alert.alert(
              "Complete Job",
              `Mark ${job.type} job as completed?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Complete",
                  onPress: async () => {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    Alert.alert("Job Completed", "Job has been marked as completed. Payment processing initiated.");
                  }
                }
              ]
            );
            break;
        }
      } catch (error) {
        console.error(`Job ${action} error:`, error);
        Alert.alert("Error", `Failed to ${action} job. Please try again.`);
      } finally {
        setOperationLoading(false);
      }
    };

    const renderJobCard = (job: any, showActions: boolean = true) => {
      const priorityColors = {
        emergency: 'border-red-500/50 bg-red-500/10',
        high: 'border-orange-500/50 bg-orange-500/10',
        medium: 'border-yellow-500/50 bg-yellow-500/10',
        low: 'border-blue-500/50 bg-blue-500/10'
      };

      const priorityTextColors = {
        emergency: 'text-red-400',
        high: 'text-orange-400',
        medium: 'text-yellow-400',
        low: 'text-blue-400'
      };

      return (
        <ResponsiveCard
          key={job.id}
          variant="default"
          className={`mb-4 border ${priorityColors[job.priority]}`}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <ResponsiveText variant="h4" className="mb-1">
                {job.type}
              </ResponsiveText>
              <ResponsiveText variant="caption" color="secondary">
                Job #{job.id}
              </ResponsiveText>
            </View>
            <View className="items-end">
              <View className={`px-3 py-1 rounded-lg border ${priorityColors[job.priority]}`}>
                <ResponsiveText
                  variant="caption"
                  className={`font-bold uppercase ${priorityTextColors[job.priority]}`}
                >
                  {job.priority}
                </ResponsiveText>
              </View>
              {job.status && (
                <ResponsiveText variant="caption" color="secondary" className="mt-1">
                  {job.status.replace('_', ' ').toUpperCase()}
                </ResponsiveText>
              )}
            </View>
          </View>

          {/* Customer Info */}
          <View className="bg-white/5 rounded-xl p-3 mb-4">
            <ResponsiveText variant="body" className="font-semibold mb-1">
              {job.customer}
            </ResponsiveText>
            <ResponsiveText variant="caption" color="secondary">
              📍 {job.location}
            </ResponsiveText>
            {job.distance && (
              <ResponsiveText variant="caption" color="secondary">
                📏 {job.distance} • ⏱️ {job.eta}
              </ResponsiveText>
            )}
          </View>

          {/* Earnings Info */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <ResponsiveText variant="caption" color="secondary">
                Estimated Earnings
              </ResponsiveText>
              <ResponsiveText variant="body" className="text-green-400 font-semibold">
                ${job.estimatedEarnings.min} - ${job.estimatedEarnings.max}
              </ResponsiveText>
            </View>
            {job.earnings && (
              <View>
                <ResponsiveText variant="caption" color="secondary">
                  Actual Earnings
                </ResponsiveText>
                <ResponsiveText variant="body" className="text-green-400 font-semibold">
                  ${job.earnings}
                </ResponsiveText>
              </View>
            )}
            {job.customerRating && (
              <View>
                <ResponsiveText variant="caption" color="secondary">
                  Customer Rating
                </ResponsiveText>
                <ResponsiveText variant="body" className="text-yellow-400 font-semibold">
                  {'⭐'.repeat(job.customerRating)} ({job.customerRating}/5)
                </ResponsiveText>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {showActions && (
            <View className="space-y-2">
              {activeTab === 'available' && (
                <View className="flex-row gap-2">
                  <ResponsiveButton
                    variant="success"
                    size="md"
                    onPress={() => handleJobAction(job, 'accept')}
                    className="flex-1"
                    disabled={operationLoading}
                    icon={<CheckCircle size={16} color="white" />}
                  >
                    Accept
                  </ResponsiveButton>
                  <ResponsiveButton
                    variant="danger"
                    size="md"
                    onPress={() => handleJobAction(job, 'decline')}
                    className="flex-1"
                    disabled={operationLoading}
                  >
                    Decline
                  </ResponsiveButton>
                </View>
              )}

              {activeTab === 'active' && (
                <View className="space-y-2">
                  <View className="flex-row gap-2">
                    <ResponsiveButton
                      variant="primary"
                      size="md"
                      onPress={() => handleJobAction(job, 'navigate')}
                      className="flex-1"
                      disabled={operationLoading}
                      icon={<Navigation size={16} color="white" />}
                    >
                      Navigate
                    </ResponsiveButton>
                    <ResponsiveButton
                      variant="ghost"
                      size="md"
                      onPress={() => handleJobAction(job, 'contact')}
                      className="flex-1 bg-white/10"
                      disabled={operationLoading}
                      icon={<Phone size={16} color="white" />}
                    >
                      Call
                    </ResponsiveButton>
                  </View>
                  <ResponsiveButton
                    variant="success"
                    size="md"
                    onPress={() => handleJobAction(job, 'complete')}
                    fullWidth
                    disabled={operationLoading}
                    icon={<CheckCircle size={16} color="white" />}
                  >
                    Mark Complete
                  </ResponsiveButton>
                </View>
              )}

              <ResponsiveButton
                variant="ghost"
                size="sm"
                onPress={() => {
                  setSelectedJob(job);
                  setShowJobDetails(true);
                }}
                fullWidth
                className="bg-white/5"
              >
                View Details
              </ResponsiveButton>
            </View>
          )}
        </ResponsiveCard>
      );
    };

    return (
      <ScrollView
        className="flex-1 bg-slate-900/30"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: designSystem.spacing.responsive.xxl + 80,
        }}
      >
        <ResponsiveContainer>
          {/* Header */}
          <View className="flex-row justify-between items-center py-6">
            <ResponsiveText variant="h2">
              Job Management
            </ResponsiveText>
            <View className="bg-red-500/20 px-3 py-1 rounded-lg">
              <ResponsiveText variant="caption" className="text-red-400 font-semibold">
                {jobsData.available.length} Available
              </ResponsiveText>
            </View>
          </View>

          {/* Tab Navigation */}
          <ResponsiveCard variant="default" className="mb-6">
            <View className="flex-row gap-1">
              {(['available', 'active', 'history'] as const).map((tab) => (
                <ResponsiveButton
                  key={tab}
                  variant={activeTab === tab ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => setActiveTab(tab)}
                  className={`flex-1 ${activeTab === tab ? 'bg-red-500' : 'bg-white/5'}`}
                >
                  <ResponsiveText
                    variant="caption"
                    className={`font-semibold capitalize ${activeTab === tab ? 'text-white' : 'text-slate-400'}`}
                  >
                    {tab} ({jobsData[tab].length})
                  </ResponsiveText>
                </ResponsiveButton>
              ))}
            </View>
          </ResponsiveCard>

          {/* Job Lists */}
          {jobsData[activeTab].length > 0 ? (
            jobsData[activeTab].map((job) => renderJobCard(job))
          ) : (
            <ResponsiveCard variant="default" className="items-center py-8">
              <ResponsiveText variant="h4" color="secondary" className="mb-2">
                No {activeTab} jobs
              </ResponsiveText>
              <ResponsiveText variant="body" color="secondary" className="text-center">
                {activeTab === 'available' ? 'Check back soon for new job opportunities' :
                 activeTab === 'active' ? 'No jobs currently in progress' :
                 'No completed jobs in your history yet'}
              </ResponsiveText>
            </ResponsiveCard>
          )}

          {/* Job Details Modal */}
          <Modal
            visible={showJobDetails}
            transparent
            animationType="slide"
            onRequestClose={() => setShowJobDetails(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <ResponsiveCard variant="elevated" className="m-4 mb-8 max-h-[80%]">
                <ScrollView showsVerticalScrollIndicator={false}>
                  {selectedJob && (
                    <>
                      <View className="flex-row justify-between items-center mb-6">
                        <ResponsiveText variant="h3">
                          Job Details
                        </ResponsiveText>
                        <TouchableOpacity
                          onPress={() => setShowJobDetails(false)}
                          className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
                          style={{ minHeight: designSystem.spacing.touchTarget.min }}
                          accessibilityRole="button"
                          accessibilityLabel="Close job details"
                        >
                          <ResponsiveText variant="body">×</ResponsiveText>
                        </TouchableOpacity>
                      </View>

                      <View className="space-y-4">
                        <View>
                          <ResponsiveText variant="caption" color="secondary" className="mb-1">
                            Service Type
                          </ResponsiveText>
                          <ResponsiveText variant="h4">{selectedJob.type}</ResponsiveText>
                        </View>

                        <View>
                          <ResponsiveText variant="caption" color="secondary" className="mb-1">
                            Job ID
                          </ResponsiveText>
                          <ResponsiveText variant="body">{selectedJob.id}</ResponsiveText>
                        </View>

                        <View>
                          <ResponsiveText variant="caption" color="secondary" className="mb-1">
                            Customer Information
                          </ResponsiveText>
                          <ResponsiveText variant="body" className="mb-1">{selectedJob.customer}</ResponsiveText>
                          <ResponsiveText variant="caption" color="secondary">
                            Phone: {selectedJob.customerPhone}
                          </ResponsiveText>
                        </View>

                        <View>
                          <ResponsiveText variant="caption" color="secondary" className="mb-1">
                            Location
                          </ResponsiveText>
                          <ResponsiveText variant="body" className="mb-1">{selectedJob.location}</ResponsiveText>
                          <ResponsiveText variant="caption" color="secondary">
                            Distance: {selectedJob.distance} • ETA: {selectedJob.eta}
                          </ResponsiveText>
                        </View>

                        <View>
                          <ResponsiveText variant="caption" color="secondary" className="mb-1">
                            Priority Level
                          </ResponsiveText>
                          <View className={`self-start px-3 py-1 rounded-lg ${
                            selectedJob.priority === 'emergency' ? 'bg-red-500/20 border border-red-500/30' :
                            selectedJob.priority === 'high' ? 'bg-orange-500/20 border border-orange-500/30' :
                            selectedJob.priority === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                            'bg-blue-500/20 border border-blue-500/30'
                          }`}>
                            <ResponsiveText variant="caption" className={`font-bold uppercase ${
                              selectedJob.priority === 'emergency' ? 'text-red-400' :
                              selectedJob.priority === 'high' ? 'text-orange-400' :
                              selectedJob.priority === 'medium' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`}>
                              {selectedJob.priority}
                            </ResponsiveText>
                          </View>
                        </View>

                        <View>
                          <ResponsiveText variant="caption" color="secondary" className="mb-1">
                            Estimated Earnings
                          </ResponsiveText>
                          <ResponsiveText variant="body" className="text-green-400 font-semibold">
                            ${selectedJob.estimatedEarnings.min} - ${selectedJob.estimatedEarnings.max}
                          </ResponsiveText>
                        </View>

                        <View>
                          <ResponsiveText variant="caption" color="secondary" className="mb-1">
                            Estimated Duration
                          </ResponsiveText>
                          <ResponsiveText variant="body">{selectedJob.duration}</ResponsiveText>
                        </View>

                        {selectedJob.status === 'completed' && (
                          <>
                            <View>
                              <ResponsiveText variant="caption" color="secondary" className="mb-1">
                                Completion Time
                              </ResponsiveText>
                              <ResponsiveText variant="body">{(selectedJob as any).completedAt}</ResponsiveText>
                            </View>

                            <View>
                              <ResponsiveText variant="caption" color="secondary" className="mb-1">
                                Customer Rating
                              </ResponsiveText>
                              <ResponsiveText variant="body" className="text-yellow-400">
                                {'⭐'.repeat((selectedJob as any).customerRating)} ({(selectedJob as any).customerRating}/5)
                              </ResponsiveText>
                            </View>

                            <View>
                              <ResponsiveText variant="caption" color="secondary" className="mb-1">
                                Final Earnings
                              </ResponsiveText>
                              <ResponsiveText variant="body" className="text-green-400 font-semibold">
                                ${(selectedJob as any).earnings}
                              </ResponsiveText>
                            </View>
                          </>
                        )}
                      </View>

                      <View className="mt-6 space-y-3">
                        {activeTab === 'available' && (
                          <View className="flex-row gap-2">
                            <ResponsiveButton
                              variant="success"
                              size="md"
                              onPress={() => {
                                setShowJobDetails(false);
                                handleJobAction(selectedJob, 'accept');
                              }}
                              className="flex-1"
                              disabled={operationLoading}
                              icon={<CheckCircle size={16} color="white" />}
                            >
                              Accept Job
                            </ResponsiveButton>
                            <ResponsiveButton
                              variant="danger"
                              size="md"
                              onPress={() => {
                                setShowJobDetails(false);
                                handleJobAction(selectedJob, 'decline');
                              }}
                              className="flex-1"
                              disabled={operationLoading}
                            >
                              Decline
                            </ResponsiveButton>
                          </View>
                        )}

                        {activeTab === 'active' && (
                          <>
                            <View className="flex-row gap-2">
                              <ResponsiveButton
                                variant="primary"
                                size="md"
                                onPress={() => {
                                  setShowJobDetails(false);
                                  handleJobAction(selectedJob, 'navigate');
                                }}
                                className="flex-1"
                                disabled={operationLoading}
                                icon={<Navigation size={16} color="white" />}
                              >
                                Navigate
                              </ResponsiveButton>
                              <ResponsiveButton
                                variant="ghost"
                                size="md"
                                onPress={() => {
                                  setShowJobDetails(false);
                                  handleJobAction(selectedJob, 'contact');
                                }}
                                className="flex-1 bg-white/10"
                                disabled={operationLoading}
                                icon={<Phone size={16} color="white" />}
                              >
                                Call Customer
                              </ResponsiveButton>
                            </View>
                            <ResponsiveButton
                              variant="success"
                              size="md"
                              onPress={() => {
                                setShowJobDetails(false);
                                handleJobAction(selectedJob, 'complete');
                              }}
                              fullWidth
                              disabled={operationLoading}
                              icon={<CheckCircle size={16} color="white" />}
                            >
                              Mark Complete
                            </ResponsiveButton>
                          </>
                        )}

                        <ResponsiveButton
                          variant="ghost"
                          size="md"
                          onPress={() => setShowJobDetails(false)}
                          fullWidth
                          className="mt-4"
                        >
                          Close
                        </ResponsiveButton>
                      </View>
                    </>
                  )}
                </ScrollView>
              </ResponsiveCard>
            </View>
          </Modal>
        </ResponsiveContainer>
      </ScrollView>
    );
  }, [pendingJobs, operationLoading]);

  // Earnings View
  const renderEarningsView = useCallback(() => {
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
    const [showExportModal, setShowExportModal] = useState(false);

    // Mock earnings data
    const earningsData = {
      daily: {
        total: 847,
        change: 127,
        transactions: [
          { id: 1, service: 'Tire Change', amount: 120, time: '2:30 PM', customer: 'John Davis', status: 'paid' },
          { id: 2, service: 'Jump Start', amount: 85, time: '11:15 AM', customer: 'Sarah Wilson', status: 'paid' },
          { id: 3, service: 'Lockout', amount: 75, time: '9:45 AM', customer: 'Mike Johnson', status: 'pending' },
        ]
      },
      weekly: {
        total: 3240,
        change: 580,
        breakdown: {
          'Tire Change': 1200,
          'Jump Start': 680,
          'Towing': 950,
          'Lockout': 410
        }
      },
      monthly: {
        total: 12850,
        change: 2100,
        taxes: 1928,
        net: 10922
      }
    };

    const serviceTypes = ['all', 'Tire Change', 'Jump Start', 'Towing', 'Lockout', 'Fuel Delivery'];

    const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
      setShowExportModal(false);
      Alert.alert(
        "Export Report",
        `${format.toUpperCase()} report for ${selectedPeriod} earnings has been generated and will be sent to your email.`,
        [{ text: "OK" }]
      );
    };

    const handleViewDetails = (transactionId: number) => {
      Alert.alert(
        "Transaction Details",
        `Detailed view for transaction #${transactionId} would be displayed here with payment method, customer info, and service notes.`,
        [{ text: "OK" }]
      );
    };

    return (
      <ScrollView
        className="flex-1 bg-slate-900/30"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: designSystem.spacing.responsive.xxl + 80,
        }}
      >
        <ResponsiveContainer>
          {/* Header */}
          <View className="flex-row justify-between items-center py-6">
            <ResponsiveText variant="h2">
              Earnings Dashboard
            </ResponsiveText>
            <ResponsiveButton
              variant="primary"
              size="sm"
              onPress={() => setShowExportModal(true)}
              icon={<DollarSign size={16} color="white" />}
            >
              Export
            </ResponsiveButton>
          </View>

          {/* Period Selector */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Time Period
            </ResponsiveText>
            <View className="flex-row gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <ResponsiveButton
                  key={period}
                  variant={selectedPeriod === period ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => setSelectedPeriod(period)}
                  className={`flex-1 ${selectedPeriod === period ? 'bg-red-500' : 'bg-white/10'}`}
                >
                  <ResponsiveText
                    variant="caption"
                    className={`font-semibold capitalize ${selectedPeriod === period ? 'text-white' : 'text-slate-400'}`}
                  >
                    {period}
                  </ResponsiveText>
                </ResponsiveButton>
              ))}
            </View>
          </ResponsiveCard>

          {/* Earnings Summary */}
          <ResponsiveCard variant="elevated" className="bg-gradient-to-r from-green-600 to-green-500 border-green-500/30 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ResponsiveText variant="body" className="text-white/90 font-semibold">
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Earnings
              </ResponsiveText>
              <ResponsiveText variant="caption" className="text-white/80">
                {selectedPeriod === 'daily' ? 'Today' :
                 selectedPeriod === 'weekly' ? 'This Week' : 'This Month'}
              </ResponsiveText>
            </View>
            <ResponsiveText variant="h1" className="mb-2">
              ${earningsData[selectedPeriod].total.toLocaleString()}
            </ResponsiveText>
            <ResponsiveText variant="body" className="text-white/90">
              +${earningsData[selectedPeriod].change} vs last {selectedPeriod.slice(0, -2)}
            </ResponsiveText>
          </ResponsiveCard>

          {/* Performance Metrics */}
          <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }} gap="md" className="mb-6">
            <ResponsiveMetricCard
              title="Jobs Completed"
              value="47"
              change="+12 this week"
              changeType="positive"
            />
            <ResponsiveMetricCard
              title="Avg per Job"
              value="$89"
              change="+$8 vs last week"
              changeType="positive"
            />
            <ResponsiveMetricCard
              title="Customer Rating"
              value="4.9"
              change="+0.1 this month"
              changeType="positive"
            />
            <ResponsiveMetricCard
              title="Bonus Earned"
              value="$340"
              change="Quality bonus"
              changeType="positive"
            />
          </ResponsiveGrid>

          {/* Service Type Filter */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Filter by Service Type
            </ResponsiveText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              <View className="flex-row gap-2 pr-4">
                {serviceTypes.map((type) => (
                  <ResponsiveButton
                    key={type}
                    variant={selectedServiceType === type ? "primary" : "ghost"}
                    size="sm"
                    onPress={() => setSelectedServiceType(type)}
                    className={`${selectedServiceType === type ? 'bg-blue-500' : 'bg-white/10'} min-w-[80px]`}
                  >
                    <ResponsiveText
                      variant="caption"
                      className={`font-semibold ${selectedServiceType === type ? 'text-white' : 'text-slate-400'}`}
                    >
                      {type === 'all' ? 'All' : type}
                    </ResponsiveText>
                  </ResponsiveButton>
                ))}
              </View>
            </ScrollView>
          </ResponsiveCard>

          {/* Earnings Breakdown */}
          {selectedPeriod === 'weekly' && (
            <ResponsiveCard variant="default" className="mb-6">
              <ResponsiveText variant="h4" className="mb-4">
                Service Type Breakdown
              </ResponsiveText>
              <View className="space-y-3">
                {Object.entries(earningsData.weekly.breakdown).map(([service, amount]) => (
                  <View key={service} className="flex-row justify-between items-center p-3 bg-white/5 rounded-xl">
                    <View className="flex-1">
                      <ResponsiveText variant="body" className="font-semibold">
                        {service}
                      </ResponsiveText>
                      <ResponsiveText variant="caption" color="secondary">
                        {Math.round((amount / earningsData.weekly.total) * 100)}% of total
                      </ResponsiveText>
                    </View>
                    <ResponsiveText variant="h4" className="text-green-400">
                      ${amount.toLocaleString()}
                    </ResponsiveText>
                  </View>
                ))}
              </View>
            </ResponsiveCard>
          )}

          {/* Recent Transactions */}
          {selectedPeriod === 'daily' && (
            <ResponsiveCard variant="default" className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <ResponsiveText variant="h4">
                  Today's Transactions
                </ResponsiveText>
                <ResponsiveText variant="caption" color="secondary">
                  {earningsData.daily.transactions.length} transactions
                </ResponsiveText>
              </View>

              <View className="space-y-3">
                {earningsData.daily.transactions.map((transaction) => (
                  <TouchableOpacity
                    key={transaction.id}
                    onPress={() => handleViewDetails(transaction.id)}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                    style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${transaction.service} transaction`}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <ResponsiveText variant="body" className="font-semibold mb-1">
                          {transaction.service}
                        </ResponsiveText>
                        <ResponsiveText variant="caption" color="secondary">
                          {transaction.customer} • {transaction.time}
                        </ResponsiveText>
                      </View>
                      <View className="items-end">
                        <ResponsiveText variant="h4" className="text-green-400">
                          ${transaction.amount}
                        </ResponsiveText>
                        <View className={`px-2 py-1 rounded-md ${transaction.status === 'paid' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                          <ResponsiveText
                            variant="caption"
                            className={`font-semibold ${transaction.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}
                          >
                            {transaction.status.toUpperCase()}
                          </ResponsiveText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ResponsiveCard>
          )}

          {/* Monthly Tax Summary */}
          {selectedPeriod === 'monthly' && (
            <ResponsiveCard variant="default" className="mb-6">
              <ResponsiveText variant="h4" className="mb-4">
                Tax Summary
              </ResponsiveText>

              <View className="space-y-4">
                <View className="flex-row justify-between items-center p-3 bg-white/5 rounded-xl">
                  <ResponsiveText variant="body">Gross Earnings</ResponsiveText>
                  <ResponsiveText variant="body" className="font-semibold">
                    ${earningsData.monthly.total.toLocaleString()}
                  </ResponsiveText>
                </View>

                <View className="flex-row justify-between items-center p-3 bg-red-500/10 rounded-xl">
                  <ResponsiveText variant="body">Estimated Taxes</ResponsiveText>
                  <ResponsiveText variant="body" className="font-semibold text-red-400">
                    -${earningsData.monthly.taxes.toLocaleString()}
                  </ResponsiveText>
                </View>

                <View className="flex-row justify-between items-center p-3 bg-green-500/10 rounded-xl">
                  <ResponsiveText variant="body" className="font-semibold">Net Earnings</ResponsiveText>
                  <ResponsiveText variant="h4" className="text-green-400">
                    ${earningsData.monthly.net.toLocaleString()}
                  </ResponsiveText>
                </View>
              </View>

              <ResponsiveButton
                variant="ghost"
                size="md"
                onPress={() => Alert.alert("Tax Documents", "Tax documentation and 1099 forms would be available for download here.")}
                fullWidth
                className="mt-4 bg-white/5 border border-white/10"
                icon={<DollarSign size={16} color="#94a3b8" />}
              >
                Download Tax Documents
              </ResponsiveButton>
            </ResponsiveCard>
          )}

          {/* Export Modal */}
          <Modal
            visible={showExportModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowExportModal(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <ResponsiveCard variant="elevated" className="m-4 mb-8">
                <ResponsiveText variant="h3" className="mb-4">
                  Export Earnings Report
                </ResponsiveText>

                <ResponsiveText variant="body" color="secondary" className="mb-6">
                  Choose format for your {selectedPeriod} earnings report
                </ResponsiveText>

                <View className="space-y-3">
                  <ResponsiveButton
                    variant="primary"
                    size="md"
                    onPress={() => handleExportReport('pdf')}
                    fullWidth
                    icon={<DollarSign size={16} color="white" />}
                  >
                    Export as PDF
                  </ResponsiveButton>

                  <ResponsiveButton
                    variant="ghost"
                    size="md"
                    onPress={() => handleExportReport('csv')}
                    fullWidth
                    className="bg-white/10"
                    icon={<DollarSign size={16} color="#94a3b8" />}
                  >
                    Export as CSV
                  </ResponsiveButton>

                  <ResponsiveButton
                    variant="ghost"
                    size="md"
                    onPress={() => handleExportReport('excel')}
                    fullWidth
                    className="bg-white/10"
                    icon={<DollarSign size={16} color="#94a3b8" />}
                  >
                    Export as Excel
                  </ResponsiveButton>

                  <ResponsiveButton
                    variant="ghost"
                    size="md"
                    onPress={() => setShowExportModal(false)}
                    fullWidth
                    className="mt-4"
                  >
                    Cancel
                  </ResponsiveButton>
                </View>
              </ResponsiveCard>
            </View>
          </Modal>
        </ResponsiveContainer>
      </ScrollView>
    );
  }, []);

  // Profile View
  const renderProfileView = useCallback(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
      name: user?.name || technicianName,
      phone: user?.phone || "+592-123-4567",
      email: user?.email || "technician@roadside.com",
      technicianId: user?.technicianId || technicianId,
      specialties: ["Tire Change", "Jump Start", "Lockout Service", "Towing"],
      certifications: ["ASE Certified", "Emergency Response", "First Aid"],
      yearsExperience: 5,
      emergencyContact: {
        name: "John Doe",
        phone: "+592-987-6543"
      },
      vehicleInfo: {
        make: "Ford",
        model: "Transit",
        year: "2022",
        licensePlate: "RSP-001"
      },
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        emergencyOnly: false
      }
    });

    const handleSaveProfile = async () => {
      try {
        setOperationLoading(true);

        // Simulate API call to update profile
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update user state
        setUser(prev => prev ? {
          ...prev,
          name: profileData.name,
          phone: profileData.phone,
          email: profileData.email
        } : null);

        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
      } catch (error) {
        console.error("Profile update error:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
      } finally {
        setOperationLoading(false);
      }
    };

    const handleUploadPhoto = () => {
      Alert.alert(
        "Upload Photo",
        "Choose photo source",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Camera", onPress: () => Alert.alert("Info", "Camera functionality would be implemented here") },
          { text: "Gallery", onPress: () => Alert.alert("Info", "Gallery functionality would be implemented here") }
        ]
      );
    };

    const toggleAvailability = async () => {
      try {
        setOperationLoading(true);
        const newStatus = !onlineStatus;
        setOnlineStatus(newStatus);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        Alert.alert(
          "Status Updated",
          `You are now ${newStatus ? "available" : "unavailable"} for new jobs`
        );
      } catch (error) {
        console.error("Availability toggle error:", error);
        Alert.alert("Error", "Failed to update availability status");
      } finally {
        setOperationLoading(false);
      }
    };

    return (
      <ScrollView
        className="flex-1 bg-slate-900/30"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: designSystem.spacing.responsive.xxl + 80,
        }}
      >
        <ResponsiveContainer>
          {/* Header */}
          <View className="flex-row justify-between items-center py-6">
            <ResponsiveText variant="h2">
              Technician Profile
            </ResponsiveText>
            <ResponsiveButton
              variant={isEditing ? "success" : "primary"}
              size="sm"
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              disabled={operationLoading}
              icon={isEditing ? <CheckCircle size={16} color="white" /> : <Settings size={16} color="white" />}
            >
              {operationLoading ? "Saving..." : isEditing ? "Save" : "Edit"}
            </ResponsiveButton>
          </View>

          {/* Profile Photo & Basic Info */}
          <ResponsiveCard variant="elevated" className="mb-6">
            <View className="items-center mb-6">
              <View className="relative">
                <View className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-500 rounded-full items-center justify-center mb-4">
                  <ResponsiveText variant="h2" className="font-bold">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </ResponsiveText>
                </View>
                <TouchableOpacity
                  onPress={handleUploadPhoto}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                  style={{ minHeight: designSystem.spacing.touchTarget.min }}
                  accessibilityRole="button"
                  accessibilityLabel="Upload profile photo"
                >
                  <User size={16} color="white" />
                </TouchableOpacity>
              </View>

              <ResponsiveText variant="h3" className="mb-2">
                {profileData.name}
              </ResponsiveText>
              <View className="bg-red-500/20 px-3 py-1 rounded-lg mb-2">
                <ResponsiveText variant="caption" className="text-red-400 font-semibold">
                  ID: {profileData.technicianId}
                </ResponsiveText>
              </View>
              <View className="flex-row items-center">
                <View className={`w-3 h-3 rounded-full mr-2 ${onlineStatus ? 'bg-green-500' : 'bg-gray-500'}`} />
                <ResponsiveText variant="body" color={onlineStatus ? "success" : "secondary"}>
                  {onlineStatus ? "Available" : "Unavailable"}
                </ResponsiveText>
              </View>
            </View>

            {/* Availability Toggle */}
            <ResponsiveButton
              variant={onlineStatus ? "danger" : "success"}
              size="md"
              onPress={toggleAvailability}
              fullWidth
              disabled={operationLoading}
              icon={onlineStatus ? <AlertTriangle size={16} color="white" /> : <CheckCircle size={16} color="white" />}
            >
              {onlineStatus ? "Go Unavailable" : "Go Available"}
            </ResponsiveButton>
          </ResponsiveCard>

          {/* Personal Information */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Personal Information
            </ResponsiveText>

            <View className="space-y-4">
              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Full Name
                </ResponsiveText>
                {isEditing ? (
                  <TextInput
                    value={profileData.name}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <ResponsiveText variant="body">{profileData.name}</ResponsiveText>
                )}
              </View>

              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Phone Number
                </ResponsiveText>
                {isEditing ? (
                  <TextInput
                    value={profileData.phone}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    keyboardType="phone-pad"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <ResponsiveText variant="body">{profileData.phone}</ResponsiveText>
                )}
              </View>

              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Email Address
                </ResponsiveText>
                {isEditing ? (
                  <TextInput
                    value={profileData.email}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                    style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <ResponsiveText variant="body">{profileData.email}</ResponsiveText>
                )}
              </View>

              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Years of Experience
                </ResponsiveText>
                <ResponsiveText variant="body">{profileData.yearsExperience} years</ResponsiveText>
              </View>
            </View>
          </ResponsiveCard>

          {/* Professional Credentials */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Professional Credentials
            </ResponsiveText>

            <View className="mb-4">
              <ResponsiveText variant="body" className="mb-3 font-semibold">
                Service Specializations
              </ResponsiveText>
              <View className="flex-row flex-wrap gap-2">
                {profileData.specialties.map((specialty, index) => (
                  <View key={index} className="bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-lg">
                    <ResponsiveText variant="caption" className="text-blue-400 font-semibold">
                      {specialty}
                    </ResponsiveText>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <ResponsiveText variant="body" className="mb-3 font-semibold">
                Certifications
              </ResponsiveText>
              <View className="flex-row flex-wrap gap-2">
                {profileData.certifications.map((cert, index) => (
                  <View key={index} className="bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-lg">
                    <ResponsiveText variant="caption" className="text-green-400 font-semibold">
                      {cert}
                    </ResponsiveText>
                  </View>
                ))}
              </View>
            </View>
          </ResponsiveCard>

          {/* Emergency Contact */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Emergency Contact
            </ResponsiveText>

            <View className="space-y-4">
              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Contact Name
                </ResponsiveText>
                <ResponsiveText variant="body">{profileData.emergencyContact.name}</ResponsiveText>
              </View>

              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Contact Phone
                </ResponsiveText>
                <ResponsiveText variant="body">{profileData.emergencyContact.phone}</ResponsiveText>
              </View>
            </View>
          </ResponsiveCard>

          {/* Vehicle Information */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Vehicle Information
            </ResponsiveText>

            <ResponsiveGrid columns={{ mobile: 2, tablet: 2, desktop: 2 }} gap="md">
              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Make & Model
                </ResponsiveText>
                <ResponsiveText variant="body">
                  {profileData.vehicleInfo.make} {profileData.vehicleInfo.model}
                </ResponsiveText>
              </View>

              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  Year
                </ResponsiveText>
                <ResponsiveText variant="body">{profileData.vehicleInfo.year}</ResponsiveText>
              </View>

              <View>
                <ResponsiveText variant="caption" color="secondary" className="mb-2">
                  License Plate
                </ResponsiveText>
                <ResponsiveText variant="body">{profileData.vehicleInfo.licensePlate}</ResponsiveText>
              </View>
            </ResponsiveGrid>
          </ResponsiveCard>

          {/* Notification Preferences */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Notification Preferences
            </ResponsiveText>

            <View className="space-y-4">
              {Object.entries(profileData.notificationPreferences).map(([key, value]) => (
                <View key={key} className="flex-row justify-between items-center">
                  <ResponsiveText variant="body" className="flex-1">
                    {key === 'email' ? 'Email Notifications' :
                     key === 'sms' ? 'SMS Notifications' :
                     key === 'push' ? 'Push Notifications' :
                     'Emergency Only Mode'}
                  </ResponsiveText>
                  <TouchableOpacity
                    onPress={() => setProfileData(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        [key]: !value
                      }
                    }))}
                    className={`w-12 h-6 rounded-full ${value ? 'bg-green-500' : 'bg-gray-600'} justify-center`}
                    style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: value }}
                  >
                    <View className={`w-5 h-5 bg-white rounded-full ${value ? 'self-end mr-0.5' : 'self-start ml-0.5'}`} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ResponsiveCard>

          {/* Account Actions */}
          <ResponsiveCard variant="default" className="mb-6">
            <ResponsiveText variant="h4" className="mb-4">
              Account Settings
            </ResponsiveText>

            <View className="space-y-3">
              <ResponsiveButton
                variant="ghost"
                size="md"
                onPress={() => Alert.alert("Info", "Change password functionality would be implemented here")}
                fullWidth
                className="bg-white/5 border border-white/10 justify-start"
                icon={<Lock size={16} color="#94a3b8" />}
              >
                <ResponsiveText variant="body" className="text-left">Change Password</ResponsiveText>
              </ResponsiveButton>

              <ResponsiveButton
                variant="ghost"
                size="md"
                onPress={() => Alert.alert("Info", "Privacy settings would be implemented here")}
                fullWidth
                className="bg-white/5 border border-white/10 justify-start"
                icon={<Shield size={16} color="#94a3b8" />}
              >
                <ResponsiveText variant="body" className="text-left">Privacy Settings</ResponsiveText>
              </ResponsiveButton>

              <ResponsiveButton
                variant="danger"
                size="md"
                onPress={handleSignOut}
                fullWidth
                icon={<ArrowLeft size={16} color="white" />}
              >
                Sign Out
              </ResponsiveButton>
            </View>
          </ResponsiveCard>
        </ResponsiveContainer>
      </ScrollView>
    );
  }, [user, technicianName, technicianId, onlineStatus, operationLoading, handleSignOut]);

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
  const checkAuthStatus = useCallback(async () => {
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
  }, []); // Remove dependencies to prevent re-creation

  useEffect(() => {
    checkAuthStatus();
  }, []); // Empty dependency array to run only once on mount

  // Real-time data subscriptions
  useEffect(() => {
    if (!user?.id) return;

    let technicianSubscription: any;
    let earningsSubscription: any;
    let jobsSubscription: any;

    const setupRealtimeSubscriptions = async () => {
      try {
        // Subscribe to technician profile changes
        technicianSubscription = supabase
          .channel('technician_profile')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'technicians',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Technician profile updated:', payload);
              if (payload.new) {
                setUser(prev => prev ? {
                  ...prev,
                  name: payload.new.name,
                  phone: payload.new.phone,
                  email: payload.new.email,
                  rating: payload.new.rating,
                  totalJobs: payload.new.total_jobs
                } : null);
              }
            }
          )
          .subscribe();

        // Subscribe to earnings changes
        earningsSubscription = supabase
          .channel('technician_earnings')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'technician_earnings',
              filter: `technician_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Earnings updated:', payload);
              // Update earnings stats in real-time
              if (payload.eventType === 'INSERT' && payload.new) {
                setStats(prev => prev.map(stat => {
                  if (stat.type === 'earnings') {
                    const currentEarnings = parseInt(stat.number.replace('$', '').replace(',', ''));
                    const newAmount = payload.new.net_amount;
                    return {
                      ...stat,
                      number: `$${(currentEarnings + newAmount).toLocaleString()}`,
                      change: `+$${newAmount} new payment`
                    };
                  }
                  return stat;
                }));
              }
            }
          )
          .subscribe();

        // Subscribe to service requests (jobs) changes
        jobsSubscription = supabase
          .channel('service_requests')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'service_requests'
            },
            (payload) => {
              console.log('Service request updated:', payload);

              if (payload.eventType === 'INSERT' && payload.new) {
                // New job available
                const newJob: PendingJob = {
                  id: payload.new.id,
                  type: payload.new.service_type,
                  time: 'Just now',
                  location: payload.new.location,
                  customer: `${payload.new.customer_name} (${payload.new.customer_email ? 'Premium' : 'Standard'} Member)`,
                  icon: getServiceIcon(payload.new.service_type),
                  priority: payload.new.priority as 'low' | 'medium' | 'high' | 'emergency',
                  estimatedEarnings: getEstimatedEarnings(payload.new.service_type),
                  distance: '0.0 km', // Would be calculated based on technician location
                  eta: 'Calculating...',
                  duration: getEstimatedDuration(payload.new.service_type),
                  customerPhone: payload.new.customer_phone,
                  coordinates: { lat: payload.new.latitude || 0, lng: payload.new.longitude || 0 }
                };

                setPendingJobs(prev => [newJob, ...prev]);

                // Show notification for emergency jobs
                if (payload.new.priority === 'emergency') {
                  Alert.alert(
                    "🚨 Emergency Job Available",
                    `${payload.new.service_type} needed at ${payload.new.location}`,
                    [
                      { text: "View Jobs", onPress: () => setActiveView("jobs") },
                      { text: "Dismiss", style: "cancel" }
                    ]
                  );
                }
              }

              if (payload.eventType === 'UPDATE' && payload.new) {
                // Job status updated
                setPendingJobs(prev => prev.map(job =>
                  job.id === payload.new.id
                    ? { ...job, status: payload.new.status }
                    : job
                ));
              }
            }
          )
          .subscribe();

        console.log('Real-time subscriptions established');
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error);
      }
    };

    setupRealtimeSubscriptions();

    // Cleanup subscriptions
    return () => {
      if (technicianSubscription) {
        supabase.removeChannel(technicianSubscription);
      }
      if (earningsSubscription) {
        supabase.removeChannel(earningsSubscription);
      }
      if (jobsSubscription) {
        supabase.removeChannel(jobsSubscription);
      }
    };
  }, [user?.id]);

  // Helper functions for real-time data processing
  const getServiceIcon = (serviceType: string): string => {
    const icons: { [key: string]: string } = {
      'tire_change': '🛞',
      'jump_start': '🔋',
      'towing': '🚛',
      'lockout': '🔐',
      'fuel_delivery': '⛽'
    };
    return icons[serviceType] || '🔧';
  };

  const getEstimatedEarnings = (serviceType: string): { min: number; max: number } => {
    const earnings: { [key: string]: { min: number; max: number } } = {
      'tire_change': { min: 85, max: 120 },
      'jump_start': { min: 60, max: 95 },
      'towing': { min: 150, max: 250 },
      'lockout': { min: 50, max: 80 },
      'fuel_delivery': { min: 40, max: 70 }
    };
    return earnings[serviceType] || { min: 50, max: 100 };
  };

  const getEstimatedDuration = (serviceType: string): string => {
    const durations: { [key: string]: string } = {
      'tire_change': '30-45 min',
      'jump_start': '15-25 min',
      'towing': '45-60 min',
      'lockout': '15-30 min',
      'fuel_delivery': '20-35 min'
    };
    return durations[serviceType] || '30 min';
  };

  // Enhanced data fetching with error handling
  const fetchTechnicianData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Fetch technician profile
      const { data: technicianData, error: technicianError } = await supabase
        .from('technicians')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (technicianError && technicianError.code !== 'PGRST116') {
        throw technicianError;
      }

      // Fetch recent earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('technician_earnings')
        .select('*')
        .eq('technician_id', technicianData?.id)
        .gte('earning_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('earning_date', { ascending: false });

      if (earningsError) {
        console.warn('Error fetching earnings:', earningsError);
      }

      // Fetch job history
      const { data: jobHistoryData, error: jobHistoryError } = await supabase
        .from('technician_job_history')
        .select(`
          *,
          service_requests (
            customer_name,
            service_type,
            location,
            customer_phone
          )
        `)
        .eq('technician_id', technicianData?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (jobHistoryError) {
        console.warn('Error fetching job history:', jobHistoryError);
      }

      // Update stats with real data
      if (earningsData) {
        const todayEarnings = earningsData
          .filter(e => e.earning_date === new Date().toISOString().split('T')[0])
          .reduce((sum, e) => sum + parseFloat(e.net_amount), 0);

        const weeklyEarnings = earningsData
          .reduce((sum, e) => sum + parseFloat(e.net_amount), 0);

        setStats(prev => prev.map(stat => {
          if (stat.type === 'earnings') {
            return {
              ...stat,
              number: `$${Math.round(todayEarnings)}`,
              change: `Weekly: $${Math.round(weeklyEarnings)}`
            };
          }
          if (stat.type === 'jobs' && technicianData) {
            return {
              ...stat,
              number: technicianData.total_jobs?.toString() || '0'
            };
          }
          if (stat.type === 'rating' && technicianData) {
            return {
              ...stat,
              number: technicianData.rating?.toFixed(1) || '5.0'
            };
          }
          return stat;
        }));
      }

      console.log('Technician data fetched successfully');
    } catch (error) {
      console.error('Error fetching technician data:', error);
      handleError(error, 'data_fetch');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, handleError]);

  // Fetch data on component mount and user change
  useEffect(() => {
    if (user?.id) {
      fetchTechnicianData();
    }
  }, [user?.id, fetchTechnicianData]);

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
    [hasError], // Simplified dependencies to prevent infinite loops
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
      console.error("Error syncing online status:", error);
      // Don't call handleError here to prevent dependency loops
    }
  }, [isOnline]); // Removed handleError from dependencies

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
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <Text className="text-white font-bold">Try Again</Text>
              </TouchableOpacity>

              {troubleshootingGuide && (
                <TouchableOpacity
                  onPress={() => setShowTroubleshootingModal(true)}
                  className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
                  accessibilityRole="button"
                  accessibilityLabel="Get help"
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
                    <Text className="text-green-400 mr-2">ΓÇó</Text>
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
                    accessibilityRole="button"
                    accessibilityLabel="Close troubleshooting guide"
                  >
                    <Text className="text-slate-400 text-lg">├ù</Text>
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
                            <Text className="text-red-400 mr-2">ΓÇó</Text>
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
                            <Text className="text-green-400 mr-2">ΓÇó</Text>
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
                accessibilityRole="button"
                accessibilityLabel="Go back to login"
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
                        accessibilityRole="button"
                        accessibilityLabel="Toggle password visibility"
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
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="ml-2"
                        accessibilityRole="button"
                        accessibilityLabel="Toggle confirm password visibility"
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
                  accessibilityRole="button"
                  accessibilityLabel="Submit form"
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
                      style={{ minHeight: 44 }}
                      accessibilityRole="button"
                      accessibilityLabel="Demo login"
                    >
                      <Text className="text-slate-300 font-semibold text-sm">
                        Demo Login
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity
                        onPress={() => switchAuthMode("register")}
                        disabled={authLoading}
                        accessibilityRole="button"
                        accessibilityLabel="Create account"
                      >
                        <Text className="text-green-400 text-sm font-medium">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => switchAuthMode("reset")}
                        disabled={authLoading}
                        accessibilityRole="button"
                        accessibilityLabel="Reset password"
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
                    accessibilityRole="button"
                    accessibilityLabel="Sign in instead"
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
                accessibilityRole="button"
                accessibilityLabel="Continue"
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
             style={{ minHeight: 44 }}>
              <Bell size={18} color="#94a3b8" />
              <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Emergency alert"
              accessibilityHint="Access emergency features"
             style={{ minHeight: 44 }}>
              <AlertTriangle size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
              accessibilityHint="Sign out of your account"
              onPress={handleSignOut}
             style={{ minHeight: 44 }}>
              <Settings size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={toggleOnlineStatus}
          className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 flex-row items-center justify-center"
          style={{ minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel="Toggle online status"
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
          style={{ minHeight: 44 }}
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
};

export default TechnicianDashboard;
