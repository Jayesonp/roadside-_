import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Vibration,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import {
  Shield,
  MapPin,
  AlertTriangle,
  Phone,
  Eye,
  Settings,
  RefreshCw,
  Search,
  Zap,
  Users,
  Wrench,
  Crown,
  Building,
  Activity,
  Lock,
  PhoneCall,
  Truck,
  Heart,
  Radio,
  Navigation,
  Volume2,
  FileText,
  Database,
  Wifi,
  Server,
  Bug,
  Key,
  UserX,
  Clock,
  Globe,
  Monitor,
  Bell,
  BellRing,
  VolumeX,
  X,
  Mail,
  EyeOff,
  ArrowLeft,
  User,
  CheckCircle,
} from "lucide-react-native";

interface SecurityAlert {
  id: string;
  type: "panic" | "sos" | "security" | "system";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  source: string;
  location: string;
  timestamp: string;
  gpsActive: boolean;
  user?: string;
  gpsCoordinates?: { lat: number; lng: number };
  accuracy?: string;
  platform?: string;
}

interface PlatformStatus {
  name: string;
  icon: React.ReactNode;
  users: number;
  gpsEnabled: number;
  status: "online" | "offline";
  alerts: number;
  gradient: string;
  platform: string;
}

interface ThreatDetection {
  id: string;
  type: "malware" | "intrusion" | "ddos" | "phishing" | "vulnerability";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved";
  affectedSystems: string[];
}

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userType: "admin" | "customer" | "technician" | "partner";
  action: string;
  resource: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  status: "success" | "failed" | "suspicious";
  userAgent: string;
}

interface VulnerabilityReport {
  id: string;
  cveId?: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedComponents: string[];
  discoveredDate: string;
  status: "open" | "patching" | "patched" | "mitigated";
  riskScore: number;
  remediation: string;
}

interface SecurityConfig {
  platforms: {
    customer: { users: number; gpsEnabled: number; alerts: number };
    technician: { users: number; gpsEnabled: number; alerts: number };
    admin: { users: number; gpsEnabled: number; alerts: number };
    partner: { users: number; gpsEnabled: number; alerts: number };
  };
  activeAlerts: SecurityAlert[];
  threatDetections: ThreatDetection[];
  accessLogs: AccessLog[];
  vulnerabilityReports: VulnerabilityReport[];
  monitoring: boolean;
  securityScore: number;
}

interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  visualAlertsEnabled: boolean;
  criticalOnly: boolean;
  autoAcknowledge: boolean;
  acknowledgmentTimeout: number;
}

interface EmergencyNotification {
  id: string;
  alertId: string;
  type: "panic" | "sos" | "security" | "system";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  autoAcknowledged: boolean;
  soundPlayed: boolean;
  requiresResponse: boolean;
  timeoutId?: NodeJS.Timeout;
}

interface SecurityOperationsCenterProps {
  backgroundColor?: string;
}

interface SecurityUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const SecurityOperationsCenter = React.memo(function SecurityOperationsCenter({
  backgroundColor = "#0f172a",
}: SecurityOperationsCenterProps = {}) {
  const [user, setUser] = useState<SecurityUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);

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
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const [audioAlert, setAudioAlert] = useState(false);
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(true);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(new Date());

  // Notification System State
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(
    [],
  );
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      soundEnabled: true,
      vibrationEnabled: true,
      visualAlertsEnabled: true,
      criticalOnly: false,
      autoAcknowledge: false,
      acknowledgmentTimeout: 30000, // 30 seconds
    });
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const notificationPanelAnim = useRef(new Animated.Value(0)).current;

  // Security Configuration State
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    platforms: {
      customer: { users: 156, gpsEnabled: 156, alerts: 1 },
      technician: { users: 89, gpsEnabled: 89, alerts: 1 },
      admin: { users: 23, gpsEnabled: 23, alerts: 0 },
      partner: { users: 79, gpsEnabled: 79, alerts: 1 },
    },
    activeAlerts: [],
    threatDetections: [],
    accessLogs: [],
    vulnerabilityReports: [],
    monitoring: true,
    securityScore: 87,
  });

  const [activeTab, setActiveTab] = useState<
    "threats" | "access" | "vulnerabilities" | "overview"
  >("overview");

  // Initialize with default security data
  useEffect(() => {
    const initialAlerts: SecurityAlert[] = [
      {
        id: "ALT-001",
        type: "panic",
        priority: "critical",
        title: "PANIC BUTTON ACTIVATED",
        source: "Customer App - Sarah Mitchell (Premium)",
        location: "123 Main Street, Georgetown",
        timestamp: "2 min ago",
        gpsActive: true,
        user: "Sarah Mitchell",
        gpsCoordinates: { lat: 6.8013, lng: -58.1551 },
        accuracy: "High",
        platform: "customer",
      },
      {
        id: "ALT-002",
        type: "sos",
        priority: "high",
        title: "TECHNICIAN SOS",
        source: "Technician App - Mike Chen (ID: RSP-4857)",
        location: "Highway 101, Mile 23",
        timestamp: "8 min ago",
        gpsActive: true,
        user: "Mike Chen",
        gpsCoordinates: { lat: 6.7943, lng: -58.1593 },
        accuracy: "High",
        platform: "technician",
      },
      {
        id: "ALT-003",
        type: "security",
        priority: "medium",
        title: "SECURITY ALERT",
        source: "Partner App - QuickTow Pro Admin",
        location: "Office Location - Multiple failed login attempts",
        timestamp: "15 min ago",
        gpsActive: false,
        platform: "partner",
      },
      {
        id: "ALT-004",
        type: "system",
        priority: "low",
        title: "SYSTEM MONITORING",
        source: "Admin Panel - System Health Check",
        location: "Performance degradation detected",
        timestamp: "32 min ago",
        gpsActive: false,
        platform: "admin",
      },
    ];

    const initialThreats: ThreatDetection[] = [
      {
        id: "THR-001",
        type: "intrusion",
        severity: "critical",
        title: "Unauthorized Access Attempt",
        description:
          "Multiple failed login attempts detected from suspicious IP addresses",
        source: "Admin Panel - Authentication System",
        timestamp: "5 min ago",
        status: "investigating",
        affectedSystems: ["Admin Dashboard", "User Authentication"],
      },
      {
        id: "THR-002",
        type: "ddos",
        severity: "high",
        title: "DDoS Attack Detected",
        description:
          "Unusual traffic patterns detected from multiple IP addresses",
        source: "Network Monitoring - Load Balancer",
        timestamp: "12 min ago",
        status: "active",
        affectedSystems: ["API Gateway", "Customer App"],
      },
      {
        id: "THR-003",
        type: "vulnerability",
        severity: "medium",
        title: "Outdated Dependencies",
        description: "Several npm packages have known security vulnerabilities",
        source: "Security Scanner - Dependency Check",
        timestamp: "1 hour ago",
        status: "resolved",
        affectedSystems: ["Web Application"],
      },
    ];

    const initialAccessLogs: AccessLog[] = [
      {
        id: "LOG-001",
        userId: "admin-001",
        userName: "Sarah Mitchell",
        userType: "admin",
        action: "LOGIN_SUCCESS",
        resource: "/admin/dashboard",
        ipAddress: "192.168.1.100",
        location: "Georgetown, Guyana",
        timestamp: "2 min ago",
        status: "success",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "LOG-002",
        userId: "unknown",
        userName: "Unknown User",
        userType: "admin",
        action: "LOGIN_FAILED",
        resource: "/admin/login",
        ipAddress: "45.123.45.67",
        location: "Unknown Location",
        timestamp: "5 min ago",
        status: "suspicious",
        userAgent: "curl/7.68.0",
      },
      {
        id: "LOG-003",
        userId: "tech-001",
        userName: "Mike Chen",
        userType: "technician",
        action: "UPDATE_PROFILE",
        resource: "/technician/profile",
        ipAddress: "192.168.1.105",
        location: "Georgetown, Guyana",
        timestamp: "15 min ago",
        status: "success",
        userAgent: "RoadSide+ Mobile App v2.1.0",
      },
    ];

    const initialVulnerabilities: VulnerabilityReport[] = [
      {
        id: "VUL-001",
        cveId: "CVE-2024-1234",
        title: "SQL Injection Vulnerability",
        description: "Potential SQL injection in user input validation",
        severity: "high",
        affectedComponents: ["User Management API", "Customer Database"],
        discoveredDate: "2024-01-10",
        status: "patching",
        riskScore: 8.5,
        remediation: "Update input validation and use parameterized queries",
      },
      {
        id: "VUL-002",
        cveId: "CVE-2024-5678",
        title: "Cross-Site Scripting (XSS)",
        description: "Reflected XSS vulnerability in search functionality",
        severity: "medium",
        affectedComponents: ["Web Dashboard", "Search Module"],
        discoveredDate: "2024-01-12",
        status: "patched",
        riskScore: 6.2,
        remediation: "Implement proper input sanitization and CSP headers",
      },
      {
        id: "VUL-003",
        title: "Weak Password Policy",
        description: "Current password policy allows weak passwords",
        severity: "low",
        affectedComponents: ["Authentication System"],
        discoveredDate: "2024-01-08",
        status: "open",
        riskScore: 3.1,
        remediation: "Implement stronger password requirements and 2FA",
      },
    ];

    setSecurityConfig((prev) => ({
      ...prev,
      activeAlerts: initialAlerts,
      threatDetections: initialThreats,
      accessLogs: initialAccessLogs,
      vulnerabilityReports: initialVulnerabilities,
    }));
  }, []);

  const platformStatuses: PlatformStatus[] = [
    {
      name: "Customer App",
      icon: <Users size={20} color="white" />,
      users: securityConfig.platforms.customer.users,
      gpsEnabled: securityConfig.platforms.customer.gpsEnabled,
      status: "online",
      alerts: securityConfig.platforms.customer.alerts,
      gradient: "from-blue-600 to-blue-500",
      platform: "customer",
    },
    {
      name: "Technician App",
      icon: <Wrench size={20} color="white" />,
      users: securityConfig.platforms.technician.users,
      gpsEnabled: securityConfig.platforms.technician.gpsEnabled,
      status: "online",
      alerts: securityConfig.platforms.technician.alerts,
      gradient: "from-green-600 to-green-500",
      platform: "technician",
    },
    {
      name: "Admin Panel",
      icon: <Crown size={20} color="white" />,
      users: securityConfig.platforms.admin.users,
      gpsEnabled: securityConfig.platforms.admin.gpsEnabled,
      status: "online",
      alerts: securityConfig.platforms.admin.alerts,
      gradient: "from-red-600 to-red-500",
      platform: "admin",
    },
    {
      name: "Partner Apps",
      icon: <Building size={20} color="white" />,
      users: securityConfig.platforms.partner.users,
      gpsEnabled: securityConfig.platforms.partner.gpsEnabled,
      status: "online",
      alerts: securityConfig.platforms.partner.alerts,
      gradient: "from-yellow-600 to-yellow-500",
      platform: "partner",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-red-600 bg-red-600/10";
      case "high":
        return "border-l-red-500 bg-red-500/10";
      case "medium":
        return "border-l-yellow-500 bg-yellow-500/10";
      case "low":
        return "border-l-blue-500 bg-blue-500/10";
      default:
        return "border-l-gray-500 bg-gray-500/10";
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  // Cross-Platform GPS Tracking System
  const enableCrossPlatformGPSTracking = () => {
    console.log("📍 Enabling GPS tracking across all platforms");

    Object.keys(securityConfig.platforms).forEach((platform) => {
      trackPlatformGPS(platform as keyof typeof securityConfig.platforms);
    });

    setGpsTrackingEnabled(true);
  };

  const trackPlatformGPS = (
    platform: keyof typeof securityConfig.platforms,
  ) => {
    console.log(`📡 GPS tracking enabled for ${platform} platform`);

    // Update location data every 5 seconds
    const updateLocations = () => {
      const locationData = {
        platform: platform,
        activeUsers: securityConfig.platforms[platform].users,
        gpsSignals: securityConfig.platforms[platform].gpsEnabled,
        lastUpdate: new Date().toISOString(),
        emergencyAlerts: securityConfig.platforms[platform].alerts,
      };

      updateSecurityDashboard(locationData);
    };

    return updateLocations;
  };

  const updateSecurityDashboard = (data: any) => {
    console.log("📊 Security dashboard updated:", data);
    setLastLocationUpdate(new Date());
  };

  // Emergency Response System
  const initializeEmergencyResponse = () => {
    console.log("🚨 Emergency response system initialized");
    setupPanicButtonMonitoring();
    connectEmergencyServices();
  };

  const setupPanicButtonMonitoring = () => {
    console.log("🔴 Panic button monitoring active for all platforms");

    let panicTimeout: NodeJS.Timeout | null = null;
    let sosTimeout: NodeJS.Timeout | null = null;
    let isActive = true;

    const safeSetTimeout = (
      callback: () => void,
      delay: number,
    ): NodeJS.Timeout | null => {
      if (!isActive) return null;
      try {
        return setTimeout(() => {
          if (isActive) {
            try {
              callback();
            } catch (error) {
              console.error("Error in timeout callback:", error);
            }
          }
        }, delay);
      } catch (error) {
        console.error("Error setting timeout:", error);
        return null;
      }
    };

    try {
      // Simulate panic button after 10 seconds
      panicTimeout = safeSetTimeout(
        () => simulatePanicButton("customer", "Sarah Mitchell"),
        10000,
      );
      // Simulate technician SOS after 20 seconds
      sosTimeout = safeSetTimeout(
        () => simulateTechnicianSOS("technician", "Mike Chen"),
        20000,
      );
    } catch (error) {
      console.error("Error setting up panic button monitoring:", error);
    }

    // Cleanup timeouts
    return () => {
      isActive = false;
      try {
        if (panicTimeout) {
          clearTimeout(panicTimeout);
          panicTimeout = null;
        }
        if (sosTimeout) {
          clearTimeout(sosTimeout);
          sosTimeout = null;
        }
      } catch (error) {
        console.error("Error cleaning up panic button timeouts:", error);
      }
    };
  };

  const simulatePanicButton = (platform: string, userName: string) => {
    const emergency: SecurityAlert = {
      id: "ALT-" + Date.now(),
      type: "panic",
      priority: "critical",
      title: "PANIC BUTTON ACTIVATED",
      source: `${platform} App - ${userName}`,
      location: "123 Main Street, Georgetown",
      timestamp: "Just now",
      gpsActive: true,
      user: userName,
      gpsCoordinates: { lat: 6.8013, lng: -58.1551 },
      accuracy: "High",
      platform: platform,
    };

    console.log("🚨 PANIC BUTTON ACTIVATED:", emergency);
    handleEmergencyAlert(emergency);
    notifyEmergencyResponse(emergency);
  };

  const simulateTechnicianSOS = (platform: string, technicianName: string) => {
    const emergency: SecurityAlert = {
      id: "ALT-" + Date.now(),
      type: "sos",
      priority: "high",
      title: "TECHNICIAN SOS",
      source: `${platform} App - ${technicianName}`,
      location: "Highway 101, Mile 23",
      timestamp: "Just now",
      gpsActive: true,
      user: technicianName,
      gpsCoordinates: { lat: 6.7943, lng: -58.1593 },
      accuracy: "High",
      platform: platform,
    };

    console.log("🆘 TECHNICIAN SOS ACTIVATED:", emergency);
    handleEmergencyAlert(emergency);
  };

  const handleEmergencyAlert = (emergency: SecurityAlert) => {
    // Add to active alerts
    setSecurityConfig((prev) => ({
      ...prev,
      activeAlerts: [...prev.activeAlerts, emergency],
    }));

    // Create notification
    addNotification(emergency);

    // Trigger audio alert for critical emergencies
    if (emergency.priority === "critical") {
      triggerAudioAlert();
    }

    // Auto-track location
    trackEmergencyLocation(emergency);

    // Notify admin panel
    notifyAdminPanelEmergency(emergency);
  };

  const triggerAudioAlert = () => {
    setAudioAlert(true);
    console.log("🔊 AUDIO ALERT: Emergency notification active");

    let alertTimeout: NodeJS.Timeout | null = null;
    let isAlertActive = true;

    try {
      // Auto-dismiss after 10 seconds
      alertTimeout = setTimeout(() => {
        if (isAlertActive) {
          try {
            setAudioAlert(false);
          } catch (error) {
            console.error("Error dismissing audio alert:", error);
          }
        }
      }, 10000);
    } catch (error) {
      console.error("Error setting audio alert timeout:", error);
    }

    return () => {
      isAlertActive = false;
      try {
        if (alertTimeout) {
          clearTimeout(alertTimeout);
          alertTimeout = null;
        }
      } catch (error) {
        console.error("Error clearing audio alert timeout:", error);
      }
    };
  };

  const trackEmergencyLocation = (emergency: SecurityAlert) => {
    console.log("📍 Emergency location tracking:", emergency.location);
  };

  const notifyEmergencyResponse = (emergency: SecurityAlert) => {
    console.log("📡 Emergency response notifications sent:", emergency);
  };

  const notifyAdminPanelEmergency = (emergency: SecurityAlert) => {
    const adminAlert = {
      from: "security_center",
      type: "emergency_alert",
      data: emergency,
      priority: emergency.priority,
      timestamp: new Date().toISOString(),
    };

    console.log("📡 Sent to Admin Panel:", adminAlert);
  };

  const handleEmergencyResponse = (alertId: string) => {
    console.log(`🚨 Responding to alert: ${alertId}`);

    Alert.alert(
      "Emergency Response",
      `Initiating emergency response for alert ${alertId}. Contact emergency services?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Contact Emergency Services",
          style: "destructive",
          onPress: () => {
            emergencyResponse(alertId);
          },
        },
      ],
    );
  };

  const emergencyResponse = (alertId: string) => {
    console.log(`🚨 EMERGENCY RESPONSE INITIATED for alert: ${alertId}`);

    // Contact emergency services
    contactEmergencyServices();

    // Track location continuously
    trackLocation(alertId);

    // Establish communication
    contactUser(alertId);

    Alert.alert(
      "Emergency Services Contacted",
      "Emergency services have been notified and are responding.",
    );
  };

  const connectEmergencyServices = () => {
    console.log("📞 Emergency services connection established");
  };

  const handleTrackLocation = (alertId: string) => {
    trackLocation(alertId);
  };

  const trackLocation = (alertId: string) => {
    console.log(`📍 GPS tracking initiated for alert: ${alertId}`);
    Alert.alert(
      "GPS Tracking",
      `Live GPS tracking activated for alert ${alertId}. Monitoring location in real-time.`,
    );
  };

  const handleContactUser = (alertId: string) => {
    contactUser(alertId);
  };

  const contactUser = (alertId: string) => {
    console.log(`📞 Contacting user for alert: ${alertId}`);
    Alert.alert(
      "Contact User",
      `Attempting to contact user for alert ${alertId}. Establishing communication...`,
    );
  };

  const handleEmergencyOverride = () => {
    setEmergencyOverride(true);
    setAudioAlert(true);
    console.log("🚨 EMERGENCY OVERRIDE: Multiple alerts detected");
    setTimeout(() => {
      setAudioAlert(false);
    }, 5000);
  };

  const handleMassEmergencyResponse = () => {
    Alert.alert(
      "Mass Emergency Response",
      "Initiating coordinated emergency response for multiple alerts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Initiate Response",
          style: "destructive",
          onPress: () => {
            massEmergencyResponse();
          },
        },
      ],
    );
  };

  const massEmergencyResponse = () => {
    console.log("🚨 MASS EMERGENCY RESPONSE INITIATED");

    // Contact all emergency services
    contactEmergencyServices();
    handleContactEmergencyServices("Police Department");
    handleContactEmergencyServices("Medical Services");

    // Notify admin panel
    contactAdmin();

    // Track all emergency locations
    securityConfig.activeAlerts.forEach((alert) => {
      trackLocation(alert.id);
    });

    setEmergencyOverride(false);
    Alert.alert(
      "Response Initiated",
      "Mass emergency response has been activated. All services notified.",
    );
  };

  const contactEmergencyServices = () => {
    console.log("🚨 Contacting Emergency Services (911)");

    const emergencyCall = {
      service: "911",
      type: "roadside_emergency",
      location: "Georgetown, Guyana",
      details: "Multiple emergency alerts - immediate response required",
      timestamp: new Date().toISOString(),
    };

    console.log("📞 Emergency call initiated:", emergencyCall);
  };

  const contactAdmin = () => {
    console.log("📞 Contacting RoadSide+ Admin Panel");

    const adminContact = {
      type: "security_to_admin",
      message: "Security center requesting immediate admin support",
      timestamp: new Date().toISOString(),
    };

    console.log("📡 Admin contact request:", adminContact);
  };

  const handleContactEmergencyServices = (service: string) => {
    Alert.alert(
      `Contact ${service}`,
      `Connecting to ${service}. This will initiate a real emergency call.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Now",
          style: "destructive",
          onPress: () => {
            Alert.alert("Calling", `Connecting to ${service}...`);
          },
        },
      ],
    );
  };

  // Real-time Monitoring System
  const startRealTimeMonitoring = () => {
    console.log("📡 Starting real-time monitoring across all platforms");

    let platformMonitoring: NodeJS.Timeout | null = null;
    let emergencyCheck: NodeJS.Timeout | null = null;
    let isMonitoringActive = true;

    const safeSetInterval = (
      callback: () => void,
      interval: number,
    ): NodeJS.Timeout | null => {
      if (!isMonitoringActive) return null;
      try {
        return setInterval(() => {
          if (isMonitoringActive) {
            try {
              callback();
            } catch (error) {
              console.error("Error in interval callback:", error);
              // Stop the interval if there are repeated errors
              isMonitoringActive = false;
            }
          }
        }, interval);
      } catch (error) {
        console.error("Error setting interval:", error);
        return null;
      }
    };

    try {
      // Monitor all platforms every 5 seconds
      platformMonitoring = safeSetInterval(() => {
        monitorAllPlatforms();
      }, 5000);

      // Check for emergencies every 2 seconds
      emergencyCheck = safeSetInterval(() => {
        checkForEmergencies();
      }, 2000);
    } catch (error) {
      console.error("Error starting real-time monitoring:", error);
    }

    return () => {
      isMonitoringActive = false;
      try {
        if (platformMonitoring) {
          clearInterval(platformMonitoring);
          platformMonitoring = null;
        }
        if (emergencyCheck) {
          clearInterval(emergencyCheck);
          emergencyCheck = null;
        }
      } catch (error) {
        console.error("Error cleaning up monitoring intervals:", error);
      }
    };
  };

  const monitorAllPlatforms = () => {
    Object.keys(securityConfig.platforms).forEach((platform) => {
      const status = checkPlatformStatus(platform);
      updatePlatformMonitoring(platform, status);
    });
  };

  const checkPlatformStatus = (platform: string) => {
    return {
      platform: platform,
      status: "online",
      users:
        securityConfig.platforms[
          platform as keyof typeof securityConfig.platforms
        ].users,
      gpsSignals:
        securityConfig.platforms[
          platform as keyof typeof securityConfig.platforms
        ].gpsEnabled,
      alerts:
        securityConfig.platforms[
          platform as keyof typeof securityConfig.platforms
        ].alerts,
      lastCheck: new Date().toISOString(),
    };
  };

  const updatePlatformMonitoring = (platform: string, status: any) => {
    console.log(`📊 Platform ${platform} status:`, status);
  };

  const checkForEmergencies = () => {
    // Check if we have 3 or more active alerts for emergency override
    if (securityConfig.activeAlerts.length >= 3 && !emergencyOverride) {
      handleEmergencyOverride();
    }
  };

  // Notification System Functions
  const createNotification = (alert: SecurityAlert): EmergencyNotification => {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertId: alert.id,
      type: alert.type,
      priority: alert.priority,
      title: alert.title,
      message: `${alert.source} - ${alert.location}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      autoAcknowledged: false,
      soundPlayed: false,
      requiresResponse: alert.priority === "critical" || alert.type === "panic",
    };
  };

  const playNotificationSound = (priority: string) => {
    if (!notificationSettings.soundEnabled) return;

    let soundTimeout: NodeJS.Timeout | null = null;
    let isSoundActive = true;

    try {
      setIsPlayingSound(true);

      // Simulate different sound patterns based on priority
      const soundPattern = {
        critical: [200, 100, 200, 100, 200, 100, 200],
        high: [300, 150, 300],
        medium: [400, 200],
        low: [500],
      };

      if (notificationSettings.vibrationEnabled) {
        Vibration.vibrate(
          soundPattern[priority as keyof typeof soundPattern] || [500],
        );
      }

      // Auto-stop sound after 10 seconds
      soundTimeout = setTimeout(() => {
        if (isSoundActive) {
          try {
            setIsPlayingSound(false);
          } catch (error) {
            console.error("Error stopping sound:", error);
          }
        }
      }, 10000);

      return () => {
        isSoundActive = false;
        try {
          if (soundTimeout) {
            clearTimeout(soundTimeout);
            soundTimeout = null;
          }
        } catch (error) {
          console.error("Error clearing sound timeout:", error);
        }
      };
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const triggerVisualAlert = (priority: string) => {
    if (!notificationSettings.visualAlertsEnabled) return;

    // Pulse animation for critical alerts
    if (priority === "critical") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 6 },
      ).start();

      // Screen flash effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]),
        { iterations: 5 },
      ).start();
    }

    // Shake animation for high priority
    if (priority === "high") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 },
      ).start();
    }
  };

  const addNotification = (alert: SecurityAlert) => {
    const notification = createNotification(alert);

    // Check if we should show this notification based on settings
    if (notificationSettings.criticalOnly && alert.priority !== "critical") {
      return;
    }

    setNotifications((prev) => [notification, ...prev]);
    setUnacknowledgedCount((prev) => prev + 1);

    // Trigger sound alert
    playNotificationSound(alert.priority);

    // Trigger visual alert
    triggerVisualAlert(alert.priority);

    // Auto-acknowledge if enabled
    if (notificationSettings.autoAcknowledge) {
      try {
        const ackTimeout = setTimeout(() => {
          try {
            acknowledgeNotification(notification.id, true);
          } catch (error) {
            console.error("Error auto-acknowledging notification:", error);
          }
        }, notificationSettings.acknowledgmentTimeout);

        // Store timeout for cleanup if needed
        notification.timeoutId = ackTimeout;
      } catch (error) {
        console.error("Error setting auto-acknowledge timeout:", error);
      }
    }

    console.log(`🔔 Notification created for alert: ${alert.id}`);
  };

  const acknowledgeNotification = (notificationId: string, isAuto = false) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, acknowledged: true, autoAcknowledged: isAuto }
          : notif,
      ),
    );

    setUnacknowledgedCount((prev) => Math.max(0, prev - 1));

    console.log(
      `✅ Notification acknowledged: ${notificationId} (auto: ${isAuto})`,
    );
  };

  const acknowledgeAllNotifications = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        acknowledged: true,
        autoAcknowledged: false,
      })),
    );
    setUnacknowledgedCount(0);
    console.log("✅ All notifications acknowledged");
  };

  const clearNotification = (notificationId: string) => {
    try {
      // Find notification before removing to check timeout cleanup
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification?.timeoutId) {
        clearTimeout(notification.timeoutId);
      }

      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId),
      );
      setUnacknowledgedCount((prev) => {
        return notification && !notification.acknowledged
          ? Math.max(0, prev - 1)
          : prev;
      });
    } catch (error) {
      console.error("Error clearing notification:", error);
    }
  };

  const clearAllNotifications = () => {
    try {
      // Clear all timeouts before clearing notifications
      notifications.forEach((notification) => {
        if (notification.timeoutId) {
          clearTimeout(notification.timeoutId);
        }
      });

      setNotifications([]);
      setUnacknowledgedCount(0);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const toggleNotificationPanel = () => {
    const toValue = showNotificationPanel ? 0 : 1;
    setShowNotificationPanel(!showNotificationPanel);

    Animated.spring(notificationPanelAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const stopAllSounds = () => {
    setIsPlayingSound(false);
    setAudioAlert(false);
    Vibration.cancel();
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
        // Load security profile
        const { data, error } = await supabase
          .from("security_users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role || "security",
          });
        } else {
          // Fallback user data
          setUser({
            id: session.user.id,
            email: session.user.email || "security@roadside.com",
            name: session.user.user_metadata?.name || "Security User",
            role: "security",
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
          name: data.user.user_metadata?.name || "Security User",
          role: "security",
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
            user_type: "security",
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
        "security@roadside.com",
        "demo123",
      );
      if (!success) {
        setEmail("security@roadside.com");
        setPassword("demo123");
        Alert.alert(
          "Demo Login",
          "Demo credentials have been filled in. Please try signing in manually.",
        );
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setEmail("security@roadside.com");
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
          name: data.user.user_metadata?.name || "Security User",
          role: "security",
        });
        return true;
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
    return false;
  };

  // Initialize systems on component mount
  useEffect(() => {
    if (!user) return;

    console.log("🛡️ Security Operations Center initializing...");

    let cleanupFunctions: (() => void)[] = [];
    let isMounted = true;

    const safeCleanup = (cleanup: (() => void) | undefined) => {
      if (cleanup && typeof cleanup === "function" && isMounted) {
        try {
          cleanup();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };

    try {
      // Enable GPS tracking
      enableCrossPlatformGPSTracking();

      // Initialize emergency response
      const emergencyCleanup = initializeEmergencyResponse();
      if (emergencyCleanup && typeof emergencyCleanup === "function") {
        cleanupFunctions.push(emergencyCleanup);
      }

      // Start real-time monitoring
      const monitoringCleanup = startRealTimeMonitoring();
      if (monitoringCleanup && typeof monitoringCleanup === "function") {
        cleanupFunctions.push(monitoringCleanup);
      }

      if (isMounted) {
        console.log("🛡️ Security Operations Center fully operational");
        console.log("📡 Monitoring all RoadSide+ platforms for emergencies");
        console.log("🔔 Notification system initialized");
      }
    } catch (error) {
      console.error("Error initializing Security Operations Center:", error);
    }

    return () => {
      isMounted = false;
      try {
        cleanupFunctions.forEach(safeCleanup);
        cleanupFunctions.length = 0;
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
  }, [user]);

  // Monitor alert count changes
  useEffect(() => {
    const alertCount = securityConfig.activeAlerts.length;
    console.log(`📊 Active alerts updated: ${alertCount}`);

    // Trigger emergency override for multiple critical alerts
    if (alertCount >= 3 && !emergencyOverride) {
      const criticalAlerts = securityConfig.activeAlerts.filter(
        (alert) => alert.priority === "critical",
      );
      if (criticalAlerts.length >= 2) {
        handleEmergencyOverride();
      }
    }
  }, [securityConfig.activeAlerts, emergencyOverride]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View
        style={{ backgroundColor }}
        className="flex-1 justify-center items-center"
      >
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl items-center justify-center mb-4">
            <Shield size={32} color="white" />
          </View>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-white text-lg font-semibold mt-4">
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return (
      <View style={{ backgroundColor }} className="flex-1">
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
                RoadSide+ Security
              </Text>
              <Text className="text-slate-400 text-center text-base">
                {authMode === "login" &&
                  "Access the security operations center"}
                {authMode === "register" && "Create your security account"}
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
                  className={`bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl py-4 items-center mb-4 ${authLoading ? "opacity-50" : ""}`}
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
                        <Text className="text-orange-400 text-sm font-medium">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => switchAuthMode("reset")}
                        disabled={authLoading}
                      >
                        <Text className="text-orange-400 text-sm font-medium">
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
                    <Text className="text-orange-400 text-sm font-medium">
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
                  Your security credentials are encrypted and protected. Access
                  the security operations center securely.
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
      </View>
    );
  }

  return (
    <View style={{ backgroundColor }} className="flex-1">
      {/* Security Header */}
      <Animated.View
        className="bg-gradient-to-r from-orange-700 to-orange-600 p-6 border-b border-white/10"
        style={{
          transform: [{ translateX: shakeAnim }],
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Animated.View
              className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4"
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <Shield size={24} color="white" />
            </Animated.View>
            <View>
              <Text className="text-white text-xl font-bold">
                RoadSide+ Security Operations Center
              </Text>
              <Text className="text-white/90 text-sm">
                Emergency Response & Monitoring
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-4">
            {/* Notification Bell */}
            <TouchableOpacity
              className={`relative bg-white/20 rounded-lg px-4 py-2 flex-row items-center ${
                unacknowledgedCount > 0 ? "bg-red-500/30" : ""
              }`}
              onPress={toggleNotificationPanel}
            >
              <Animated.View
                style={{
                  transform: [
                    { scale: unacknowledgedCount > 0 ? pulseAnim : 1 },
                  ],
                }}
              >
                {unacknowledgedCount > 0 ? (
                  <BellRing size={20} color="white" />
                ) : (
                  <Bell size={20} color="white" />
                )}
              </Animated.View>
              {unacknowledgedCount > 0 && (
                <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {unacknowledgedCount > 99 ? "99+" : unacknowledgedCount}
                  </Text>
                </View>
              )}
              <Text className="text-white text-sm font-semibold ml-2">
                Notifications
              </Text>
            </TouchableOpacity>

            {/* Sound Control */}
            <TouchableOpacity
              className={`bg-white/20 rounded-lg px-3 py-2 ${
                isPlayingSound ? "bg-red-500/30" : ""
              }`}
              onPress={stopAllSounds}
            >
              {isPlayingSound ? (
                <VolumeX size={20} color="white" />
              ) : (
                <Volume2 size={20} color="white" />
              )}
            </TouchableOpacity>

            <View className="bg-white/20 rounded-lg px-4 py-2 flex-row items-center">
              <View
                className={`w-3 h-3 rounded-full mr-2 ${
                  isMonitoring ? "bg-green-400" : "bg-gray-400"
                }`}
              />
              <Text className="text-white text-sm font-semibold">
                {isMonitoring ? "All Systems Monitoring" : "Monitoring Paused"}
              </Text>
              <TouchableOpacity onPress={handleSignOut} className="ml-4">
                <User size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View className="bg-gradient-to-r from-red-700 to-red-600 rounded-lg px-4 py-2">
              <Text className="text-white font-bold text-sm">
                🚨 {securityConfig.activeAlerts.length} Active Alerts
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 p-3 sm:p-6">
        <View className="flex-col lg:flex-row gap-3 sm:gap-6">
          {/* Security Overview Panel */}
          <View className="flex-1 bg-slate-800/80 border border-white/10 rounded-2xl p-3 sm:p-6">
            <View className="flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <Text className="text-white text-lg sm:text-xl font-bold">
                Security Overview
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-3 py-2 rounded-lg min-w-[80px] items-center ${activeTab === "overview" ? "bg-orange-600" : "bg-white/10"}`}
                    onPress={() => setActiveTab("overview")}
                  >
                    <Text className="text-white text-xs font-semibold">
                      Overview
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-2 rounded-lg min-w-[80px] items-center ${activeTab === "threats" ? "bg-orange-600" : "bg-white/10"}`}
                    onPress={() => setActiveTab("threats")}
                  >
                    <Text className="text-white text-xs font-semibold">
                      Threats
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-2 rounded-lg min-w-[80px] items-center ${activeTab === "access" ? "bg-orange-600" : "bg-white/10"}`}
                    onPress={() => setActiveTab("access")}
                  >
                    <Text className="text-white text-xs font-semibold">
                      Access
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-2 rounded-lg min-w-[100px] items-center ${activeTab === "vulnerabilities" ? "bg-orange-600" : "bg-white/10"}`}
                    onPress={() => setActiveTab("vulnerabilities")}
                  >
                    <Text className="text-white text-xs font-semibold">
                      Vulnerabilities
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <View className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl min-h-[320px] p-3 sm:p-6">
                <View className="flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                  <View className="flex-1">
                    <Text className="text-white text-xl sm:text-2xl font-bold mb-2">
                      Security Score: {securityConfig.securityScore}/100
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      Overall system security health
                    </Text>
                  </View>
                  <View
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full items-center justify-center ${
                      securityConfig.securityScore >= 80
                        ? "bg-green-500/20"
                        : securityConfig.securityScore >= 60
                          ? "bg-yellow-500/20"
                          : "bg-red-500/20"
                    }`}
                  >
                    <Shield
                      size={24}
                      color={
                        securityConfig.securityScore >= 80
                          ? "#22c55e"
                          : securityConfig.securityScore >= 60
                            ? "#eab308"
                            : "#ef4444"
                      }
                    />
                  </View>
                </View>

                <View className="flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                  <View className="flex-1 bg-white/5 rounded-lg p-3 min-h-[60px] justify-center">
                    <Text className="text-red-400 text-lg font-bold text-center">
                      {
                        securityConfig.threatDetections.filter(
                          (t) => t.status === "active",
                        ).length
                      }
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      Active Threats
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/5 rounded-lg p-3 min-h-[60px] justify-center">
                    <Text className="text-yellow-400 text-lg font-bold text-center">
                      {
                        securityConfig.vulnerabilityReports.filter(
                          (v) => v.status === "open",
                        ).length
                      }
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      Open Vulnerabilities
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/5 rounded-lg p-3 min-h-[60px] justify-center">
                    <Text className="text-blue-400 text-lg font-bold text-center">
                      {
                        securityConfig.accessLogs.filter(
                          (l) => l.status === "suspicious",
                        ).length
                      }
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      Suspicious Access
                    </Text>
                  </View>
                </View>

                <View className="bg-white/5 rounded-lg p-4">
                  <Text className="text-white font-semibold mb-3">
                    Recent Security Events
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                      <Text className="text-slate-300 text-sm flex-1">
                        DDoS attack detected and mitigated
                      </Text>
                      <Text className="text-slate-500 text-xs">12 min ago</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                      <Text className="text-slate-300 text-sm flex-1">
                        Multiple failed login attempts
                      </Text>
                      <Text className="text-slate-500 text-xs">5 min ago</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      <Text className="text-slate-300 text-sm flex-1">
                        Security patch applied successfully
                      </Text>
                      <Text className="text-slate-500 text-xs">1 hour ago</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === "threats" && (
              <ScrollView className="h-80" showsVerticalScrollIndicator={false}>
                {securityConfig.threatDetections.map((threat) => (
                  <View
                    key={threat.id}
                    className={`border-l-4 rounded-xl p-4 mb-3 ${
                      threat.severity === "critical"
                        ? "border-l-red-600 bg-red-600/10"
                        : threat.severity === "high"
                          ? "border-l-red-500 bg-red-500/10"
                          : threat.severity === "medium"
                            ? "border-l-yellow-500 bg-yellow-500/10"
                            : "border-l-blue-500 bg-blue-500/10"
                    }`}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-white font-bold text-sm flex-1">
                        {threat.title}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-md ${
                          threat.status === "active"
                            ? "bg-red-500/20"
                            : threat.status === "investigating"
                              ? "bg-yellow-500/20"
                              : "bg-green-500/20"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            threat.status === "active"
                              ? "text-red-400"
                              : threat.status === "investigating"
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        >
                          {threat.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-slate-400 text-xs mb-2">
                      {threat.description}
                    </Text>
                    <Text className="text-slate-500 text-xs mb-2">
                      Source: {threat.source}
                    </Text>
                    <Text className="text-slate-500 text-xs mb-2">
                      Affected: {threat.affectedSystems.join(", ")}
                    </Text>
                    <Text className="text-slate-500 text-xs">
                      {threat.timestamp}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {activeTab === "access" && (
              <ScrollView className="h-80" showsVerticalScrollIndicator={false}>
                {securityConfig.accessLogs.map((log) => (
                  <View
                    key={log.id}
                    className={`border-l-4 rounded-xl p-4 mb-3 ${
                      log.status === "suspicious"
                        ? "border-l-red-600 bg-red-600/10"
                        : log.status === "failed"
                          ? "border-l-yellow-500 bg-yellow-500/10"
                          : "border-l-green-500 bg-green-500/10"
                    }`}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-white font-bold text-sm">
                        {log.action}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {log.timestamp}
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-xs mb-1">
                      User: {log.userName} ({log.userType})
                    </Text>
                    <Text className="text-slate-400 text-xs mb-1">
                      Resource: {log.resource}
                    </Text>
                    <Text className="text-slate-400 text-xs mb-1">
                      IP: {log.ipAddress} - {log.location}
                    </Text>
                    <Text className="text-slate-500 text-xs">
                      Agent: {log.userAgent}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {activeTab === "vulnerabilities" && (
              <ScrollView className="h-80" showsVerticalScrollIndicator={false}>
                {securityConfig.vulnerabilityReports.map((vuln) => (
                  <View
                    key={vuln.id}
                    className={`border-l-4 rounded-xl p-4 mb-3 ${
                      vuln.severity === "critical"
                        ? "border-l-red-600 bg-red-600/10"
                        : vuln.severity === "high"
                          ? "border-l-red-500 bg-red-500/10"
                          : vuln.severity === "medium"
                            ? "border-l-yellow-500 bg-yellow-500/10"
                            : "border-l-blue-500 bg-blue-500/10"
                    }`}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-white font-bold text-sm flex-1">
                        {vuln.title}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text
                          className={`text-xs font-bold ${
                            vuln.severity === "critical"
                              ? "text-red-400"
                              : vuln.severity === "high"
                                ? "text-red-400"
                                : vuln.severity === "medium"
                                  ? "text-yellow-400"
                                  : "text-blue-400"
                          }`}
                        >
                          Risk: {vuln.riskScore}/10
                        </Text>
                        <View
                          className={`px-2 py-1 rounded-md ${
                            vuln.status === "open"
                              ? "bg-red-500/20"
                              : vuln.status === "patching"
                                ? "bg-yellow-500/20"
                                : "bg-green-500/20"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              vuln.status === "open"
                                ? "text-red-400"
                                : vuln.status === "patching"
                                  ? "text-yellow-400"
                                  : "text-green-400"
                            }`}
                          >
                            {vuln.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text className="text-slate-400 text-xs mb-2">
                      {vuln.description}
                    </Text>
                    {vuln.cveId && (
                      <Text className="text-slate-500 text-xs mb-1">
                        CVE: {vuln.cveId}
                      </Text>
                    )}
                    <Text className="text-slate-500 text-xs mb-2">
                      Components: {vuln.affectedComponents.join(", ")}
                    </Text>
                    <Text className="text-slate-500 text-xs mb-2">
                      Discovered: {vuln.discoveredDate}
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      Remediation: {vuln.remediation}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Emergency Alerts Panel */}
          <View className="w-full lg:w-96 bg-slate-800/80 border border-white/10 rounded-2xl p-3 sm:p-6 mt-4 lg:mt-0">
            <View className="flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <Text className="text-white text-lg sm:text-xl font-bold">
                Emergency Alerts
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center">
                  <Search size={16} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center">
                  <Settings size={16} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 bg-orange-600 rounded-lg items-center justify-center">
                  <RefreshCw size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              className="flex-1 max-h-[400px] sm:max-h-none"
              showsVerticalScrollIndicator={false}
            >
              {securityConfig.activeAlerts.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  className={`border-l-4 rounded-xl p-4 mb-3 ${getPriorityColor(
                    alert.priority,
                  )}`}
                  onPress={() => setSelectedAlert(alert.id)}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-white font-bold text-sm flex-1">
                      {alert.title}
                    </Text>
                    <Text className="text-slate-500 text-xs">
                      {alert.timestamp}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-xs mb-1">
                    {alert.source}
                  </Text>
                  <Text className="text-slate-500 text-xs mb-2">
                    📍 {alert.location}
                    {alert.gpsActive && " - GPS: Active"}
                  </Text>
                  {alert.user && (
                    <Text className="text-slate-500 text-xs mb-2">
                      👤 User: {alert.user}
                    </Text>
                  )}
                  {alert.gpsCoordinates && (
                    <Text className="text-slate-500 text-xs mb-3">
                      🌐 Coordinates: {alert.gpsCoordinates.lat.toFixed(4)},{" "}
                      {alert.gpsCoordinates.lng.toFixed(4)} ({alert.accuracy})
                    </Text>
                  )}
                  <View className="flex-row flex-wrap gap-2">
                    <TouchableOpacity
                      className="bg-gradient-to-r from-red-700 to-red-600 rounded-md px-3 py-2 min-h-[44px] items-center justify-center"
                      onPress={() => handleEmergencyResponse(alert.id)}
                    >
                      <Text className="text-white text-xs font-bold">
                        🚨 RESPOND
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-blue-500/20 rounded-md px-3 py-2 min-h-[44px] items-center justify-center"
                      onPress={() => handleTrackLocation(alert.id)}
                    >
                      <Text className="text-blue-400 text-xs font-bold">
                        📍 TRACK
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-white/10 rounded-md px-3 py-2 min-h-[44px] items-center justify-center"
                      onPress={() => handleContactUser(alert.id)}
                    >
                      <Text className="text-white text-xs font-bold">
                        📞 CALL
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {securityConfig.activeAlerts.length === 0 && (
                <View className="items-center justify-center py-8">
                  <Text className="text-slate-400 text-sm">
                    No active alerts
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    All systems monitoring normally
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Security Monitoring Dashboard */}
        <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-3 sm:p-6 mt-6">
          <View className="flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <Text className="text-white text-lg sm:text-xl font-bold">
              Security Monitoring Dashboard
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="w-10 h-10 bg-orange-600 rounded-lg items-center justify-center">
                <Shield size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center">
                <Monitor size={16} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center">
                <Database size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Stats */}
          <View className="flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
            <View className="flex-1 bg-white/5 rounded-xl p-4 items-center min-h-[80px] justify-center">
              <Text className="text-red-400 text-xl sm:text-2xl font-bold mb-1">
                {
                  securityConfig.threatDetections.filter(
                    (t) => t.status === "active",
                  ).length
                }
              </Text>
              <Text className="text-slate-400 text-xs font-semibold uppercase text-center">
                Active Threats
              </Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-xl p-4 items-center min-h-[80px] justify-center">
              <Text className="text-yellow-400 text-xl sm:text-2xl font-bold mb-1">
                {
                  securityConfig.vulnerabilityReports.filter(
                    (v) => v.status === "open",
                  ).length
                }
              </Text>
              <Text className="text-slate-400 text-xs font-semibold uppercase text-center">
                Open Vulnerabilities
              </Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-xl p-4 items-center min-h-[80px] justify-center">
              <Text className="text-blue-400 text-xl sm:text-2xl font-bold mb-1">
                {
                  securityConfig.accessLogs.filter(
                    (l) => l.status === "suspicious",
                  ).length
                }
              </Text>
              <Text className="text-slate-400 text-xs font-semibold uppercase text-center">
                Suspicious Access
              </Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-xl p-4 items-center min-h-[80px] justify-center">
              <Text className="text-green-400 text-xl sm:text-2xl font-bold mb-1">
                {securityConfig.securityScore}
              </Text>
              <Text className="text-slate-400 text-xs font-semibold uppercase text-center">
                Security Score
              </Text>
            </View>
          </View>

          {/* Platform List */}
          <View className="flex-col sm:flex-row gap-2 sm:gap-4">
            {platformStatuses.map((platform, index) => (
              <View
                key={index}
                className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className={`w-8 h-8 bg-gradient-to-br ${platform.gradient} rounded-lg items-center justify-center mr-3`}
                  >
                    {platform.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">
                      {platform.name}
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      {platform.users} active users
                    </Text>
                  </View>
                  <View
                    className={`w-2 h-2 rounded-full ${
                      platform.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  />
                </View>
                <Text className="text-slate-500 text-xs">
                  GPS enabled: {platform.gpsEnabled}
                </Text>
                {platform.alerts > 0 && (
                  <View className="bg-red-500/20 rounded-md px-2 py-1 mt-2">
                    <Text className="text-red-400 text-xs font-bold">
                      {platform.alerts} Alert{platform.alerts > 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Security Tools Status */}
          <View className="bg-white/5 rounded-xl p-4 mt-6">
            <Text className="text-white font-semibold mb-4">
              Security Tools Status
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <Text className="text-slate-300 text-sm">
                  Firewall - Active
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <Text className="text-slate-300 text-sm">
                  Intrusion Detection - Monitoring
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                <Text className="text-slate-300 text-sm">
                  Vulnerability Scanner - Scanning
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <Text className="text-slate-300 text-sm">
                  Access Control - Enforced
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <Text className="text-slate-300 text-sm">
                  Audit Logging - Recording
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Response Center */}
        <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-3 sm:p-6 mt-6">
          <Text className="text-white text-lg sm:text-xl font-bold mb-4 sm:mb-6">
            Security Response Center
          </Text>
          <View className="flex-col sm:flex-row gap-3 sm:gap-4">
            <TouchableOpacity
              className="flex-1 bg-gradient-to-br from-red-700 to-red-600 rounded-xl p-4 items-center min-h-[100px] justify-center"
              onPress={() =>
                Alert.alert(
                  "Incident Response",
                  "Initiating security incident response protocol",
                )
              }
            >
              <AlertTriangle size={24} color="white" />
              <Text className="text-white font-semibold text-sm mt-2 text-center">
                Incident Response
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl p-4 items-center min-h-[100px] justify-center"
              onPress={() =>
                Alert.alert(
                  "System Lockdown",
                  "Initiating emergency system lockdown",
                )
              }
            >
              <Lock size={24} color="white" />
              <Text className="text-white font-semibold text-sm mt-2 text-center">
                System Lockdown
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gradient-to-br from-purple-700 to-purple-600 rounded-xl p-4 items-center min-h-[100px] justify-center"
              onPress={() =>
                Alert.alert(
                  "Forensic Analysis",
                  "Starting forensic data collection",
                )
              }
            >
              <Search size={24} color="white" />
              <Text className="text-white font-semibold text-sm mt-2 text-center">
                Forensic Analysis
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gradient-to-br from-green-700 to-green-600 rounded-xl p-4 items-center min-h-[100px] justify-center"
              onPress={() =>
                Alert.alert(
                  "Security Team",
                  "Contacting security response team",
                )
              }
            >
              <Users size={24} color="white" />
              <Text className="text-white font-semibold text-sm mt-2 text-center">
                Security Team
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Emergency Override Modal */}
      {emergencyOverride && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center z-50 p-4">
          <View className="bg-gradient-to-br from-red-700 to-red-600 rounded-2xl p-6 sm:p-8 w-full max-w-md items-center">
            <Text className="text-4xl sm:text-6xl mb-4">🚨</Text>
            <Text className="text-white text-xl sm:text-2xl font-bold mb-2 text-center">
              CRITICAL EMERGENCY
            </Text>
            <Text className="text-white/90 text-center mb-6 text-sm sm:text-base">
              Multiple panic buttons activated in your area
            </Text>
            <View className="flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <TouchableOpacity
                className="bg-white rounded-lg px-6 py-3 flex-1 min-h-[48px] items-center justify-center"
                onPress={handleMassEmergencyResponse}
              >
                <Text className="text-red-600 font-bold text-center">
                  INITIATE RESPONSE
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white/20 rounded-lg px-6 py-3 flex-1 min-h-[48px] items-center justify-center"
                onPress={() => setEmergencyOverride(false)}
              >
                <Text className="text-white font-bold text-center">
                  ACKNOWLEDGE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Audio Alert Indicator */}
      {audioAlert && (
        <View className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-gradient-to-r from-red-700 to-red-600 rounded-xl p-3 sm:p-4 flex-row items-center animate-pulse max-w-[280px]">
          <Volume2 size={20} color="white" />
          <View className="ml-2 sm:ml-3 flex-1">
            <Text className="text-white font-bold text-sm">
              🔊 AUDIO ALERT ACTIVE
            </Text>
            <Text className="text-white/90 text-xs">
              Emergency notification in progress
            </Text>
          </View>
        </View>
      )}

      {/* GPS Tracking Status */}
      {gpsTrackingEnabled && (
        <View className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-3 flex-row items-center max-w-[240px]">
          <Navigation size={18} color="white" />
          <View className="ml-2 flex-1">
            <Text className="text-white font-bold text-sm">GPS ACTIVE</Text>
            <Text className="text-white/90 text-xs">
              Cross-platform tracking enabled
            </Text>
          </View>
        </View>
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <Animated.View
          className="absolute top-20 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-96 max-w-md max-h-96 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50"
          style={{
            transform: [
              {
                translateY: notificationPanelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
              {
                scale: notificationPanelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
            opacity: notificationPanelAnim,
          }}
        >
          {/* Notification Header */}
          <View className="p-3 sm:p-4 border-b border-white/10">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-white text-base sm:text-lg font-bold">
                  Emergency Notifications
                </Text>
                <Text className="text-slate-400 text-sm">
                  {unacknowledgedCount} unacknowledged alerts
                </Text>
              </View>
              <TouchableOpacity
                className="bg-white/10 rounded-lg p-2 ml-2"
                onPress={toggleNotificationPanel}
              >
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-2">
              {notifications.length > 0 && (
                <TouchableOpacity
                  className="bg-blue-500/20 rounded-lg px-3 py-2 min-h-[36px] items-center justify-center"
                  onPress={acknowledgeAllNotifications}
                >
                  <Text className="text-blue-400 text-xs font-bold">
                    ACK ALL
                  </Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity
                  className="bg-red-500/20 rounded-lg px-3 py-2 min-h-[36px] items-center justify-center"
                  onPress={clearAllNotifications}
                >
                  <Text className="text-red-400 text-xs font-bold">CLEAR</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Notification Settings */}
          <View className="p-3 border-b border-white/5 bg-white/5">
            <Text className="text-white text-sm font-semibold mb-2">
              Quick Settings
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`px-2 py-1 rounded-md ${
                  notificationSettings.soundEnabled
                    ? "bg-green-500/20"
                    : "bg-white/10"
                }`}
                onPress={() =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    soundEnabled: !prev.soundEnabled,
                  }))
                }
              >
                <Text
                  className={`text-xs font-bold ${
                    notificationSettings.soundEnabled
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}
                >
                  🔊 Sound
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-2 py-1 rounded-md ${
                  notificationSettings.vibrationEnabled
                    ? "bg-green-500/20"
                    : "bg-white/10"
                }`}
                onPress={() =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    vibrationEnabled: !prev.vibrationEnabled,
                  }))
                }
              >
                <Text
                  className={`text-xs font-bold ${
                    notificationSettings.vibrationEnabled
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}
                >
                  📳 Vibrate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-2 py-1 rounded-md ${
                  notificationSettings.criticalOnly
                    ? "bg-red-500/20"
                    : "bg-white/10"
                }`}
                onPress={() =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    criticalOnly: !prev.criticalOnly,
                  }))
                }
              >
                <Text
                  className={`text-xs font-bold ${
                    notificationSettings.criticalOnly
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                >
                  🚨 Critical Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View className="p-6 items-center">
                <Bell size={32} color="#64748b" />
                <Text className="text-slate-400 text-center mt-2">
                  No notifications
                </Text>
                <Text className="text-slate-500 text-center text-xs mt-1">
                  Emergency alerts will appear here
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <View
                  key={notification.id}
                  className={`p-3 border-b border-white/5 ${
                    !notification.acknowledged ? "bg-red-500/10" : "bg-white/5"
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <View
                          className={`w-2 h-2 rounded-full mr-2 ${
                            notification.priority === "critical"
                              ? "bg-red-500"
                              : notification.priority === "high"
                                ? "bg-orange-500"
                                : notification.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                          }`}
                        />
                        <Text className="text-white font-bold text-sm flex-1">
                          {notification.title}
                        </Text>
                        {!notification.acknowledged && (
                          <View className="bg-red-500 rounded-full w-2 h-2" />
                        )}
                      </View>
                      <Text className="text-slate-400 text-xs mb-1">
                        {notification.message}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                        {notification.autoAcknowledged &&
                          " • Auto-acknowledged"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 mt-2">
                    {!notification.acknowledged && (
                      <TouchableOpacity
                        className="bg-green-500/20 rounded-md px-3 py-1"
                        onPress={() => acknowledgeNotification(notification.id)}
                      >
                        <Text className="text-green-400 text-xs font-bold">
                          ✓ ACKNOWLEDGE
                        </Text>
                      </TouchableOpacity>
                    )}
                    {notification.requiresResponse && (
                      <TouchableOpacity
                        className="bg-red-500/20 rounded-md px-3 py-1"
                        onPress={() =>
                          handleEmergencyResponse(notification.alertId)
                        }
                      >
                        <Text className="text-red-400 text-xs font-bold">
                          🚨 RESPOND
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      className="bg-white/10 rounded-md px-3 py-1"
                      onPress={() => clearNotification(notification.id)}
                    >
                      <Text className="text-slate-400 text-xs font-bold">
                        ✕ CLEAR
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Screen Flash Overlay for Critical Alerts */}
      <Animated.View
        className="absolute inset-0 bg-red-500 pointer-events-none"
        style={{
          opacity: flashAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
        }}
      />
    </View>
  );
});

export default SecurityOperationsCenter;
