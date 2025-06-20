import React, { useState, useMemo, useCallback } from "react";
import designSystem from "../styles/MobileDesignSystem";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Menu,
  X,
  Bell,
  Settings,
  Search,
  RefreshCw,
  AlertTriangle,
  Users,
  Activity,
  MapPin,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  User,
  Wrench,
  Building,
  LogOut,
  BarChart3,
  Calendar,
  ChevronDown,
} from "lucide-react-native";
// Chart imports - will be conditionally loaded
let LineChart: any, BarChart: any, PieChart: any, ProgressChart: any;
let chartKitAvailable = false;

try {
  const chartKit = require("react-native-chart-kit");
  LineChart = chartKit.LineChart;
  BarChart = chartKit.BarChart;
  PieChart = chartKit.PieChart;
  ProgressChart = chartKit.ProgressChart;
  chartKitAvailable = true;
} catch (error) {
  console.warn("Chart kit not available:", error);
  chartKitAvailable = false;
}

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import EmergencyRequestsTable from "./EmergencyRequestsTable";
import ActivityFeed from "./ActivityFeed";
import UserManagement from "./UserManagement";
import SystemAlertsView from "./SystemAlertsView";
import { useAuth, AuthGuard } from "./Auth";
import { supabase } from "../lib/supabase";

interface AdminDashboardProps {
  backgroundColor?: string;
}

function AdminDashboardContent({
  backgroundColor = "#0f172a",
}: AdminDashboardProps = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("7d");
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [corsError, setCorsError] = useState<boolean>(false);
  const [showCorsModal, setShowCorsModal] = useState(false);
  const [dashboardSettings, setDashboardSettings] = useState({
    theme: "dark" as "light" | "dark",
    componentVisibility: {
      emergencyRequests: true,
      activityFeed: true,
      systemAlerts: true,
      analytics: true,
      quickActions: true,
      systemStatus: true,
    },
    notifications: {
      sound: true,
      email: true,
      push: true,
      emergencyAlerts: true,
      systemAlerts: true,
      userActivity: false,
    },
    layout: {
      compactMode: false,
      autoRefresh: true,
      refreshInterval: 30,
    },
  });
  const screenWidth = Dimensions.get("window").width;
  const isMobile = screenWidth < 768;
  const { user, signOut } = useAuth();

  // Current admin user context from authentication
  const currentAdmin = {
    role: user?.role || ("admin" as const),
    permissions: user?.permissions || ["read"],
    name: user?.name || "Admin User",
    email: user?.email || "admin@roadside.com",
  };

  // Mock data for global search
  const mockUsers = [
    {
      id: "1",
      name: "Sarah Mitchell",
      type: "customer",
      email: "sarah@example.com",
      status: "Premium Member",
    },
    {
      id: "2",
      name: "Mike Johnson",
      type: "customer",
      email: "mike@example.com",
      status: "Standard Member",
    },
    {
      id: "3",
      name: "Emily Wilson",
      type: "customer",
      email: "emily@example.com",
      status: "Premium Member",
    },
    {
      id: "4",
      name: "David Brown",
      type: "customer",
      email: "david@example.com",
      status: "Standard Member",
    },
  ];

  const mockTechnicians = [
    {
      id: "1",
      name: "Mike Chen",
      type: "technician",
      techId: "RSP-4857",
      status: "Online",
      rating: "4.9",
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      type: "technician",
      techId: "RSP-3421",
      status: "Offline",
      rating: "4.8",
    },
    {
      id: "3",
      name: "Jessica Taylor",
      type: "technician",
      techId: "RSP-5632",
      status: "Online",
      rating: "4.7",
    },
    {
      id: "4",
      name: "Robert Kim",
      type: "technician",
      techId: "RSP-2198",
      status: "Busy",
      rating: "4.9",
    },
  ];

  const mockPartners = [
    {
      id: "1",
      name: "QuickTow Pro",
      type: "partner",
      domain: "quicktowpro.roadside.app",
      plan: "starter",
      status: "active",
    },
    {
      id: "2",
      name: "RoadHelp Services",
      type: "partner",
      domain: "roadhelp.roadside.app",
      plan: "pro",
      status: "active",
    },
    {
      id: "3",
      name: "City Emergency Auto",
      type: "partner",
      domain: "cityemergency.roadside.app",
      plan: "enterprise",
      status: "pending",
    },
  ];

  const mockEmergencyRequests = [
    {
      id: "RSJ-78952",
      type: "emergency",
      service: "Battery Jump Start",
      customer: "Sarah Mitchell",
      location: "Downtown Area",
      status: "In Progress",
    },
    {
      id: "RSJ-78953",
      type: "emergency",
      service: "Tire Change",
      customer: "Mike Johnson",
      location: "Highway 101",
      status: "Assigned",
    },
    {
      id: "RSJ-78954",
      type: "emergency",
      service: "Towing Service",
      customer: "Emily Wilson",
      location: "Mall Parking",
      status: "Completed",
    },
    {
      id: "RSJ-78955",
      type: "emergency",
      service: "Lockout Service",
      customer: "David Brown",
      location: "Main Street",
      status: "Pending",
    },
  ];

  // Global search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search users
    mockUsers.forEach((user) => {
      if (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.status.toLowerCase().includes(query)
      ) {
        results.push(user);
      }
    });

    // Search technicians
    mockTechnicians.forEach((tech) => {
      if (
        tech.name.toLowerCase().includes(query) ||
        tech.techId.toLowerCase().includes(query) ||
        tech.status.toLowerCase().includes(query)
      ) {
        results.push(tech);
      }
    });

    // Search partners
    mockPartners.forEach((partner) => {
      if (
        partner.name.toLowerCase().includes(query) ||
        partner.domain.toLowerCase().includes(query) ||
        partner.plan.toLowerCase().includes(query)
      ) {
        results.push(partner);
      }
    });

    // Search emergency requests
    mockEmergencyRequests.forEach((request) => {
      if (
        request.id.toLowerCase().includes(query) ||
        request.service.toLowerCase().includes(query) ||
        request.customer.toLowerCase().includes(query) ||
        request.location.toLowerCase().includes(query)
      ) {
        results.push(request);
      }
    });

    return results;
  }, [searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setShowSearchModal(true);
    } else {
      setShowSearchModal(false);
    }
  }, []);

  // Dashboard stats
  const dashboardStats = [
    {
      title: "Active Users",
      value: "1,247",
      change: "+12%",
      changeType: "positive" as const,
      icon: <Users size={20} color="#3b82f6" />,
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Emergency Requests",
      value: "7",
      change: "+3",
      changeType: "negative" as const,
      icon: <AlertTriangle size={20} color="#ef4444" />,
      bgColor: "bg-red-500/20",
    },
    {
      title: "Active Technicians",
      value: "89",
      change: "+5%",
      changeType: "positive" as const,
      icon: <Activity size={20} color="#22c55e" />,
      bgColor: "bg-green-500/20",
    },
    {
      title: "Revenue Today",
      value: "$12,847",
      change: "+18%",
      changeType: "positive" as const,
      icon: <DollarSign size={20} color="#f59e0b" />,
      bgColor: "bg-yellow-500/20",
    },
  ];

  // Analytics data generation based on time range
  const generateAnalyticsData = useCallback(() => {
    const days =
      analyticsTimeRange === "24h"
        ? 1
        : analyticsTimeRange === "7d"
          ? 7
          : analyticsTimeRange === "30d"
            ? 30
            : 90;

    const labels = [];
    const requestVolumeData = [];
    const responseTimeData = [];
    const userGrowthData = [];
    const revenueData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      if (days === 1) {
        labels.push(date.getHours() + ":00");
        requestVolumeData.push(Math.floor(Math.random() * 50) + 10);
        responseTimeData.push(Math.random() * 3 + 0.5);
        userGrowthData.push(Math.floor(Math.random() * 20) + 5);
        revenueData.push(Math.floor(Math.random() * 2000) + 500);
      } else if (days <= 7) {
        labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
        requestVolumeData.push(Math.floor(Math.random() * 200) + 50);
        responseTimeData.push(Math.random() * 2 + 1);
        userGrowthData.push(Math.floor(Math.random() * 50) + 10);
        revenueData.push(Math.floor(Math.random() * 5000) + 2000);
      } else {
        labels.push(date.getDate().toString());
        requestVolumeData.push(Math.floor(Math.random() * 300) + 100);
        responseTimeData.push(Math.random() * 1.5 + 1.2);
        userGrowthData.push(Math.floor(Math.random() * 100) + 20);
        revenueData.push(Math.floor(Math.random() * 8000) + 3000);
      }
    }

    return {
      labels,
      requestVolumeData,
      responseTimeData,
      userGrowthData,
      revenueData,
    };
  }, [analyticsTimeRange]);

  const analyticsData = useMemo(
    () => generateAnalyticsData(),
    [generateAnalyticsData],
  );

  const chartConfig = {
    backgroundColor: "#1f2937",
    backgroundGradientFrom: "#1f2937",
    backgroundGradientTo: "#374151",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#3b82f6",
    },
  };

  const pieChartConfig = {
    backgroundColor: "#1f2937",
    backgroundGradientFrom: "#1f2937",
    backgroundGradientTo: "#374151",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  const serviceTypeData = [
    {
      name: "Battery Jump",
      population: 35,
      color: "#3b82f6",
      legendFontColor: "#9ca3af",
      legendFontSize: 12,
    },
    {
      name: "Tire Change",
      population: 28,
      color: "#10b981",
      legendFontColor: "#9ca3af",
      legendFontSize: 12,
    },
    {
      name: "Towing",
      population: 22,
      color: "#f59e0b",
      legendFontColor: "#9ca3af",
      legendFontSize: 12,
    },
    {
      name: "Lockout",
      population: 15,
      color: "#ef4444",
      legendFontColor: "#9ca3af",
      legendFontSize: 12,
    },
  ];

  const timeRangeOptions = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Check for CORS issues by testing a simple request
      const testResponse = await fetch(window.location.origin + "/api/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!testResponse.ok && testResponse.status === 0) {
        // Network error, likely CORS
        setCorsError(true);
        setShowCorsModal(true);
      }
    } catch (error: any) {
      console.error("Refresh error:", error);
      if (
        error.message?.includes("CORS") ||
        error.message?.includes("Unauthorized request")
      ) {
        setCorsError(true);
        setShowCorsModal(true);
      }
    } finally {
      // Simulate refresh delay
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    }
  };

  const handleMarkerSelect = useCallback((markerId: string | null) => {
    setSelectedMarkerId(markerId);
  }, []);

  const handleExportData = async (dataType: string, format: "csv" | "pdf") => {
    try {
      let data: any[] = [];

      // Get the appropriate data based on the current section
      switch (dataType) {
        case "emergency_requests":
          // Use mock data for now - in production, this would come from Supabase
          data = mockEmergencyRequests;
          break;
        case "customers":
        case "technicians":
        case "partners":
        case "admins":
          // Use mock data for now - in production, this would come from Supabase
          data = mockUsers;
          break;
        case "system_alerts":
          // Use mock data for now - in production, this would come from Supabase
          data = [];
          break;
        default:
          data = [];
      }

      const { data: exportResult, error } = await supabase.functions.invoke(
        "supabase-functions-export-data",
        {
          body: {
            dataType,
            format,
            data,
            filters: {
              // Add any current filters here
            },
          },
        },
      );

      if (error) {
        console.error("Export error:", error);
        return;
      }

      // Handle the export result
      if (format === "csv") {
        // For CSV, create a downloadable blob
        const blob = new Blob([exportResult], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dataType}_export_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        // For PDF, handle base64 data
        const pdfData = atob(exportResult);
        const blob = new Blob([pdfData], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dataType}_export_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <StatusBar style="light" />

      <View className="flex-1 flex-row">
        {/* Sidebar */}
        {(sidebarOpen || !isMobile) && (
          <View className={`${isMobile ? "absolute z-50 h-full" : "relative"}`}>
            <AdminSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onSectionChange={setActiveSection}
              activeSection={activeSection}
            />
          </View>
        )}

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <ResponsiveButton
            className="absolute inset-0 bg-black/50 z-40"
            onPress={() => setSidebarOpen(false)}
            accessibilityRole="button"
            style={{ minHeight: designSystem.spacing.touchTarget.min }}
          />
        )}

        {/* Main Content */}
        <ResponsiveContainer className="flex-1 bg-slate-900">
          {/* Unified Header */}
          <AdminHeader
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            showSearchModal={showSearchModal}
            onSearchModalToggle={setShowSearchModal}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onSignOut={signOut}
            isMobile={isMobile}
          />

          {/* Dashboard Content */}
          {activeSection === "dashboard" ? (
            <ScrollView className="flex-1 p-6">
              {/* Stats Cards */}
              <View className={`${isMobile ? 'gap-4 mb-6' : 'flex-row flex-wrap gap-4 mb-6'}`}>
                {dashboardStats.map((stat, index) => (
                  <View
                    key={index}
                    className={`${isMobile ? 'w-full' : 'flex-1 min-w-[250px]'} bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6`}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View
                        className={`w-12 h-12 ${stat.bgColor} rounded-xl items-center justify-center`}
                      >
                        {stat.icon}
                      </View>
                      <View
                        className={`px-2 py-1 rounded-lg ${
                          stat.changeType === "positive"
                            ? "bg-green-500/20 border border-green-500/30"
                            : "bg-red-500/20 border border-red-500/30"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            stat.changeType === "positive"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {stat.change}
                        </ResponsiveText>
                      </View>
                    </View>
                    <ResponsiveText className="text-white text-2xl font-bold mb-1">
                      {stat.value}
                    </ResponsiveText>
                    <ResponsiveText className="text-slate-400 text-sm">{stat.title}</ResponsiveText>
                  </View>
                ))}
              </View>

              {/* Analytics Section */}
              <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
                <View className="flex-row justify-between items-center mb-6">
                  <View className="flex-row items-center">
                    <BarChart3 size={24} color="#3b82f6" />
                    <ResponsiveText className="text-white text-xl font-bold ml-3">
                      Analytics Dashboard
                    </ResponsiveText>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowTimeRangeModal(true)}
                    className="flex-row items-center bg-white/10 border border-white/10 rounded-xl px-4 py-2"
                    accessibilityRole="button"
                    accessibilityLabel="Interactive button">
                    <Calendar size={16} color="#94a3b8" />
                    <ResponsiveText className="text-slate-300 text-sm ml-2">
                      {
                        timeRangeOptions.find(
                          (opt) => opt.value === analyticsTimeRange,
                        )?.label
                      }
                    </ResponsiveText>
                    <ChevronDown size={16} color="#94a3b8" className="ml-1" />
                  </TouchableOpacity>
                </View>

                {/* Charts Grid */}
                <View className="gap-6">
                  {/* Top Row - Line Charts */}
                  <View className={`${isMobile ? 'gap-6' : 'flex-row gap-6'}`}>
                    {/* Request Volume Chart */}
                    <View className={`${isMobile ? 'w-full' : 'flex-1'} bg-slate-900/50 rounded-xl p-4`}>
                      <ResponsiveText className="text-white text-lg font-semibold mb-4">
                        Request Volume
                      </ResponsiveText>
                      {chartKitAvailable && LineChart ? (
                        <LineChart
                          data={{
                            labels: analyticsData.labels,
                            datasets: [
                              {
                                data: analyticsData.requestVolumeData,
                                color: (opacity = 1) =>
                                  `rgba(59, 130, 246, ${opacity})`,
                                strokeWidth: 2,
                              },
                            ],
                          }}
                          width={
                            screenWidth > 768
                              ? (screenWidth - 200) / 2 - 60
                              : screenWidth - 80
                          }
                          height={220}
                          chartConfig={chartConfig}
                          bezier
                          style={{
                            marginVertical: 8,
                            borderRadius: 16,
                          }}
                        />
                      ) : (
                        <View className="h-56 bg-slate-700/50 rounded-xl items-center justify-center">
                          <ResponsiveText className="text-slate-400">
                            {chartKitAvailable
                              ? "Chart loading..."
                              : "Charts not available"}
                          </ResponsiveText>
                        </View>
                      )}
                    </View>

                    {/* Response Time Chart */}
                    <View className={`${isMobile ? 'w-full' : 'flex-1'} bg-slate-900/50 rounded-xl p-4`}>
                      <ResponsiveText className="text-white text-lg font-semibold mb-4">
                        Avg Response Time (min)
                      </ResponsiveText>
                      {chartKitAvailable && LineChart ? (
                        <LineChart
                          data={{
                            labels: analyticsData.labels,
                            datasets: [
                              {
                                data: analyticsData.responseTimeData,
                                color: (opacity = 1) =>
                                  `rgba(16, 185, 129, ${opacity})`,
                                strokeWidth: 2,
                              },
                            ],
                          }}
                          width={
                            screenWidth > 768
                              ? (screenWidth - 200) / 2 - 60
                              : screenWidth - 80
                          }
                          height={220}
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) =>
                              `rgba(16, 185, 129, ${opacity})`,
                            propsForDots: {
                              r: "4",
                              strokeWidth: "2",
                              stroke: "#10b981",
                            },
                          }}
                          bezier
                          style={{
                            marginVertical: 8,
                            borderRadius: 16,
                          }}
                        />
                      ) : (
                        <View className="h-56 bg-slate-700/50 rounded-xl items-center justify-center">
                          <ResponsiveText className="text-slate-400">
                            {chartKitAvailable
                              ? "Chart loading..."
                              : "Charts not available"}
                          </ResponsiveText>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Bottom Row - Bar Chart and Pie Chart */}
                  <View className={`${isMobile ? 'gap-6' : 'flex-row gap-6'}`}>
                    {/* User Growth Bar Chart */}
                    <View className={`${isMobile ? 'w-full' : 'flex-1'} bg-slate-900/50 rounded-xl p-4`}>
                      <ResponsiveText className="text-white text-lg font-semibold mb-4">
                        New User Registrations
                      </ResponsiveText>
                      {chartKitAvailable && BarChart ? (
                        <BarChart
                          data={{
                            labels: analyticsData.labels,
                            datasets: [
                              {
                                data: analyticsData.userGrowthData,
                              },
                            ],
                          }}
                          width={
                            screenWidth > 768
                              ? (screenWidth - 200) / 2 - 60
                              : screenWidth - 80
                          }
                          height={220}
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) =>
                              `rgba(245, 158, 11, ${opacity})`,
                          }}
                          style={{
                            marginVertical: 8,
                            borderRadius: 16,
                          }}
                        />
                      ) : (
                        <View className="h-56 bg-slate-700/50 rounded-xl items-center justify-center">
                          <ResponsiveText className="text-slate-400">
                            {chartKitAvailable
                              ? "Chart loading..."
                              : "Charts not available"}
                          </ResponsiveText>
                        </View>
                      )}
                    </View>

                    {/* Service Type Distribution */}
                    <View className={`${isMobile ? 'w-full' : 'flex-1'} bg-slate-900/50 rounded-xl p-4`}>
                      <ResponsiveText className="text-white text-lg font-semibold mb-4">
                        Service Type Distribution
                      </ResponsiveText>
                      {chartKitAvailable && PieChart ? (
                        <PieChart
                          data={serviceTypeData}
                          width={
                            screenWidth > 768
                              ? (screenWidth - 200) / 2 - 60
                              : screenWidth - 80
                          }
                          height={220}
                          chartConfig={pieChartConfig}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="15"
                          center={[10, 10]}
                          absolute
                          style={{
                            marginVertical: 8,
                            borderRadius: 16,
                          }}
                        />
                      ) : (
                        <View className="h-56 bg-slate-700/50 rounded-xl items-center justify-center">
                          <ResponsiveText className="text-slate-400">
                            {chartKitAvailable
                              ? "Chart loading..."
                              : "Charts not available"}
                          </ResponsiveText>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Revenue Trend */}
                  <View className="bg-slate-900/50 rounded-xl p-4">
                    <ResponsiveText className="text-white text-lg font-semibold mb-4">
                      Revenue Trend ($)
                    </ResponsiveText>
                    {chartKitAvailable && LineChart ? (
                      <LineChart
                        data={{
                          labels: analyticsData.labels,
                          datasets: [
                            {
                              data: analyticsData.revenueData,
                              color: (opacity = 1) =>
                                `rgba(139, 92, 246, ${opacity})`,
                              strokeWidth: 3,
                            },
                          ],
                        }}
                        width={
                          screenWidth > 768
                            ? screenWidth - 260
                            : screenWidth - 80
                        }
                        height={220}
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) =>
                            `rgba(139, 92, 246, ${opacity})`,
                          propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: "#8b5cf6",
                          },
                        }}
                        bezier
                        style={{
                          marginVertical: 8,
                          borderRadius: 16,
                        }}
                      />
                    ) : (
                      <View className="h-56 bg-slate-700/50 rounded-xl items-center justify-center">
                        <ResponsiveText className="text-slate-400">
                          {chartKitAvailable
                            ? "Chart loading..."
                            : "Charts not available"}
                        </ResponsiveText>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Main Dashboard Grid */}
              {dashboardSettings.componentVisibility.emergencyRequests && (
                <View className={`${isMobile ? 'gap-6' : 'flex-row gap-6'}`}>
                  {/* Left Column - Emergency Requests */}
                  <View className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                    <EmergencyRequestsTable
                      selectedMarkerId={selectedMarkerId}
                      onExportData={(format) =>
                        handleExportData("emergency_requests", format)
                      }
                    />
                  </View>

                  {/* Right Column - Activity Feed */}
                  {dashboardSettings.componentVisibility.activityFeed && (
                    <View className={`${isMobile ? 'w-full mt-6' : 'w-96'}`}>
                      <ActivityFeed maxItems={8} showFilters={true} />
                    </View>
                  )}
                </View>
              )}

              {/* System Alerts Section */}
              {dashboardSettings.componentVisibility.systemAlerts && (
                <View className="mt-6">
                  <SystemAlertsView
                    maxAlerts={10}
                    showFilters={true}
                    onExportData={(format) =>
                      handleExportData("system_alerts", format)
                    }
                  />
                </View>
              )}

              {/* System Status Section */}
              {dashboardSettings.componentVisibility.systemStatus && (
                <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mt-6">
                  <ResponsiveText className="text-white text-xl font-bold mb-6">
                    System Status
                  </ResponsiveText>

                  <View className={`${isMobile ? 'gap-6' : 'flex-row gap-6'}`}>
                    {/* Platform Status */}
                    <View className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                      <ResponsiveText className="text-slate-400 text-sm font-semibold mb-4">
                        Platform Health
                      </ResponsiveText>
                      <View className="space-y-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            <ResponsiveText className="text-slate-300 text-sm">
                              Customer App
                            </ResponsiveText>
                          </View>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            Online
                          </ResponsiveText>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            <ResponsiveText className="text-slate-300 text-sm">
                              Technician App
                            </ResponsiveText>
                          </View>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            Online
                          </ResponsiveText>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            <ResponsiveText className="text-slate-300 text-sm">
                              Partner Apps
                            </ResponsiveText>
                          </View>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            Online
                          </ResponsiveText>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                            <ResponsiveText className="text-slate-300 text-sm">
                              Payment Gateway
                            </ResponsiveText>
                          </View>
                          <ResponsiveText className="text-yellow-400 text-sm font-semibold">
                            Degraded
                          </ResponsiveText>
                        </View>
                      </View>
                    </View>

                    {/* Security Status */}
                    <View className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                      <ResponsiveText className="text-slate-400 text-sm font-semibold mb-4">
                        Security Monitoring
                      </ResponsiveText>
                      <View className="space-y-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Shield size={16} color="#22c55e" />
                            <ResponsiveText className="text-slate-300 text-sm ml-2">
                              Firewall
                            </ResponsiveText>
                          </View>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            Active
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <MapPin size={16} color="#22c55e" />
                            <ResponsiveText className="text-slate-300 text-sm ml-2">
                              GPS Tracking
                            </Text>
                          </View>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            347 Active
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <AlertTriangle size={16} color="#ef4444" />
                            <ResponsiveText className="text-slate-300 text-sm ml-2">
                              Security Alerts
                            </Text>
                          </View>
                          <ResponsiveText className="text-red-400 text-sm font-semibold">
                            2 Active
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Clock size={16} color="#94a3b8" />
                            <ResponsiveText className="text-slate-300 text-sm ml-2">
                              Last Scan
                            </Text>
                          </View>
                          <ResponsiveText className="text-slate-400 text-sm">
                            2 min ago
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Performance Metrics */}
                    <View className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                      <ResponsiveText className="text-slate-400 text-sm font-semibold mb-4">
                        Performance
                      </Text>
                      <View className="space-y-3">
                        <View className="flex-row items-center justify-between">
                          <ResponsiveText className="text-slate-300 text-sm">
                            Response Time
                          </Text>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            1.2s
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <ResponsiveText className="text-slate-300 text-sm">Uptime</Text>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            99.9%
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <ResponsiveText className="text-slate-300 text-sm">
                            CPU Usage
                          </Text>
                          <ResponsiveText className="text-yellow-400 text-sm font-semibold">
                            67%
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <ResponsiveText className="text-slate-300 text-sm">Memory</Text>
                          <ResponsiveText className="text-green-400 text-sm font-semibold">
                            45%
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Quick Actions */}
              {dashboardSettings.componentVisibility.quickActions && (
                <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mt-6">
                  <ResponsiveText className="text-white text-xl font-bold mb-6">
                    Quick Actions
                  </Text>

                  <View className="flex-row gap-4">
                    <ResponsiveButton
                      className="flex-1 bg-gradient-to-br from-red-600 to-red-500 rounded-xl p-4 items-center"
                      accessibilityRole="button"
                      style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    >
                      <AlertTriangle size={24} color="white" />
                      <ResponsiveText className="text-white font-semibold text-sm mt-2">
                        Emergency Response
                      </ResponsiveText>
                    </ResponsiveButton>

                    <ResponsiveButton
                      className="flex-1 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl p-4 items-center"
                      accessibilityRole="button"
                      style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    >
                      <Users size={24} color="white" />
                      <ResponsiveText className="text-white font-semibold text-sm mt-2">
                        User Management
                      </ResponsiveText>
                    </ResponsiveButton>

                    <ResponsiveButton
                      className="flex-1 bg-gradient-to-br from-green-600 to-green-500 rounded-xl p-4 items-center"
                      accessibilityRole="button"
                      style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    >
                      <TrendingUp size={24} color="white" />
                      <ResponsiveText className="text-white font-semibold text-sm mt-2">
                        Analytics
                      </ResponsiveText>
                    </ResponsiveButton>

                    <ResponsiveButton
                      className="flex-1 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl p-4 items-center"
                      accessibilityRole="button"
                      style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    >
                      <Settings size={24} color="white" />
                      <ResponsiveText className="text-white font-semibold text-sm mt-2">
                        System Settings
                      </ResponsiveText>
                    </ResponsiveButton>
                  </View>
                </View>
              )}
            </ScrollView>
          ) : activeSection === "customers" ? (
            <UserManagement
              userType="customers"
              backgroundColor={backgroundColor}
              currentUserRole={currentAdmin.role}
              currentUserPermissions={currentAdmin.permissions}
              onExportData={(format) => handleExportData("customers", format)}
            />
          ) : activeSection === "technicians" ? (
            <UserManagement
              userType="technicians"
              backgroundColor={backgroundColor}
              currentUserRole={currentAdmin.role}
              currentUserPermissions={currentAdmin.permissions}
              onExportData={(format) => handleExportData("technicians", format)}
            />
          ) : activeSection === "partners" ? (
            <UserManagement
              userType="partners"
              backgroundColor={backgroundColor}
              currentUserRole={currentAdmin.role}
              currentUserPermissions={currentAdmin.permissions}
              onExportData={(format) => handleExportData("partners", format)}
            />
          ) : activeSection === "admins" ? (
            <UserManagement
              userType="admins"
              backgroundColor={backgroundColor}
              currentUserRole={currentAdmin.role}
              currentUserPermissions={currentAdmin.permissions}
              onExportData={(format) => handleExportData("admins", format)}
            />
          ) : activeSection === "dashboard-settings" ? (
            <ScrollView className="flex-1 p-6">
              <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <ResponsiveText className="text-white text-2xl font-bold mb-6">
                  Dashboard Settings
                </Text>

                {/* Theme Settings */}
                <View className="mb-8">
                  <ResponsiveText className="text-white text-lg font-semibold mb-4">
                    Theme Preferences
                  </Text>
                  <View className="flex-row gap-4">
                    <TouchableOpacity
                      className={`flex-1 p-4 rounded-xl border ${
                        dashboardSettings.theme === "dark"
                          ? "bg-blue-500/20 border-blue-500/50"
                          : "bg-white/5 border-white/10"
                      }`}
                      onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button">
                        setDashboardSettings((prev) => ({
                          ...prev,
                          theme: "dark",
                        }))
                      }
                     accessibilityRole="button" accessibilityLabel="Interactive button">
                      <Text
                        className={`text-center font-medium ${
                          dashboardSettings.theme === "dark"
                            ? "text-blue-400"
                            : "text-slate-300"
                        }`}
                      >
                        Dark Theme
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 p-4 rounded-xl border ${
                        dashboardSettings.theme === "light"
                          ? "bg-blue-500/20 border-blue-500/50"
                          : "bg-white/5 border-white/10"
                      }`}
                      onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button">
                        setDashboardSettings((prev) => ({
                          ...prev,
                          theme: "light",
                        }))
                      }
                     accessibilityRole="button" accessibilityLabel="Interactive button">
                      <Text
                        className={`text-center font-medium ${
                          dashboardSettings.theme === "light"
                            ? "text-blue-400"
                            : "text-slate-300"
                        }`}
                      >
                        Light Theme
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Component Visibility */}
                <View className="mb-8">
                  <ResponsiveText className="text-white text-lg font-semibold mb-4">
                    Component Visibility
                  </Text>
                  <View className="space-y-3">
                    {Object.entries(dashboardSettings.componentVisibility).map(
                      ([key, value]) => (
                        <View
                          key={key}
                          className="flex-row items-center justify-between p-3 bg-white/5 rounded-xl"
                        >
                          <ResponsiveText className="text-slate-300 font-medium">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Text>
                          <TouchableOpacity
                            className={`w-12 h-6 rounded-full p-1 ${
                              value ? "bg-green-500" : "bg-slate-600"
                            }`}
                            onPress={() =>
                              setDashboardSettings((prev) => ({
                                ...prev,
                                componentVisibility: {
                                  ...prev.componentVisibility,
                                  [key]: !value,
                                },
                              }))
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Interactive button">
                            <View
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                value ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </TouchableOpacity>
                        </View>
                      ),
                    )}
                  </View>
                </View>

                {/* Notification Settings */}
                <View className="mb-8">
                  <ResponsiveText className="text-white text-lg font-semibold mb-4">
                    Notification Settings
                  </Text>
                  <View className="space-y-3">
                    {Object.entries(dashboardSettings.notifications).map(
                      ([key, value]) => (
                        <View
                          key={key}
                          className="flex-row items-center justify-between p-3 bg-white/5 rounded-xl"
                        >
                          <ResponsiveText className="text-slate-300 font-medium">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Text>
                          <TouchableOpacity
                            className={`w-12 h-6 rounded-full p-1 ${
                              value ? "bg-green-500" : "bg-slate-600"
                            }`}
                            onPress={() =>
                              setDashboardSettings((prev) => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  [key]: !value,
                                },
                              }))
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Interactive button">
                            <View
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                value ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </TouchableOpacity>
                        </View>
                      ),
                    )}
                  </View>
                </View>

                {/* Layout Settings */}
                <View className="mb-8">
                  <ResponsiveText className="text-white text-lg font-semibold mb-4">
                    Layout Settings
                  </Text>
                  <View className="space-y-4">
                    <View className="flex-row items-center justify-between p-3 bg-white/5 rounded-xl">
                      <ResponsiveText className="text-slate-300 font-medium">
                        Compact Mode
                      </Text>
                      <TouchableOpacity
                        className={`w-12 h-6 rounded-full p-1 ${
                          dashboardSettings.layout.compactMode
                            ? "bg-green-500"
                            : "bg-slate-600"
                        }`}
                        onPress={() =>
                          setDashboardSettings((prev) => ({
                            ...prev,
                            layout: {
                              ...prev.layout,
                              compactMode: !prev.layout.compactMode,
                            },
                          }))
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Interactive button">
                        <View
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            dashboardSettings.layout.compactMode
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-between p-3 bg-white/5 rounded-xl">
                      <ResponsiveText className="text-slate-300 font-medium">
                        Auto Refresh
                      </Text>
                      <TouchableOpacity
                        className={`w-12 h-6 rounded-full p-1 ${
                          dashboardSettings.layout.autoRefresh
                            ? "bg-green-500"
                            : "bg-slate-600"
                        }`}
                        onPress={() =>
                          setDashboardSettings((prev) => ({
                            ...prev,
                            layout: {
                              ...prev.layout,
                              autoRefresh: !prev.layout.autoRefresh,
                            },
                          }))
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Interactive button">
                        <View
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            dashboardSettings.layout.autoRefresh
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="p-3 bg-white/5 rounded-xl">
                      <ResponsiveText className="text-slate-300 font-medium mb-3">
                        Refresh Interval (seconds)
                      </Text>
                      <View className="flex-row gap-2">
                        {[15, 30, 60, 120].map((interval) => (
                          <TouchableOpacity
                            key={interval}
                            className={`flex-1 p-2 rounded-lg border ${
                              dashboardSettings.layout.refreshInterval ===
                              interval
                                ? "bg-blue-500/20 border-blue-500/50"
                                : "bg-white/5 border-white/10"
                            }`}
                            onPress={() =>
                              setDashboardSettings((prev) => ({
                                ...prev,
                                layout: {
                                  ...prev.layout,
                                  refreshInterval: interval,
                                },
                              }))
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Interactive button">
                            <Text
                              className={`text-center text-sm ${
                                dashboardSettings.layout.refreshInterval ===
                                interval
                                  ? "text-blue-400"
                                  : "text-slate-300"
                              }`}
                            >
                              {interval}s
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Save Button */}
                <ResponsiveButton
                  className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 items-center"
                  accessibilityRole="button"
                  style={{ minHeight: designSystem.spacing.touchTarget.min }}
                >
                  <ResponsiveText className="text-white font-semibold text-lg">
                    Save Settings
                  </ResponsiveText>
                </ResponsiveButton>
              </View>
            </ScrollView>
          ) : (
            <ScrollView className="flex-1 p-6">
              <ResponsiveText className="text-white text-2xl font-bold">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </Text>
              <ResponsiveText className="text-slate-400 mt-2">
                This section is under development.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Time Range Selection Modal */}
      <Modal
        visible={showTimeRangeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeRangeModal(false)}
      >
        <ResponsiveButton
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowTimeRangeModal(false)}
          accessibilityRole="button"
          style={{ minHeight: designSystem.spacing.touchTarget.min }}
        >
          <View className="bg-slate-800 border border-white/10 rounded-2xl p-6 mx-6 min-w-[300px]">
            <ResponsiveText className="text-white text-lg font-semibold mb-4">
              Select Time Range
            </Text>

            {timeRangeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${
                  analyticsTimeRange === option.value
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "bg-white/5"
                }`}
                onPress={() => {
                  setAnalyticsTimeRange(option.value);
                  setShowTimeRangeModal(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Interactive button">
                <Text
                  className={`text-sm font-medium ${
                    analyticsTimeRange === option.value
                      ? "text-blue-400"
                      : "text-slate-300"
                  }`}
                >
                  {option.label}
                </Text>
                {analyticsTimeRange === option.value && (
                  <View className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </TouchableOpacity>
            ))}

            <ResponsiveButton
              className="bg-slate-700 rounded-xl p-3 mt-4 items-center"
              onPress={() => setShowTimeRangeModal(false)}
              accessibilityRole="button"
              style={{ minHeight: designSystem.spacing.touchTarget.min }}
            >
              <ResponsiveText className="text-slate-300 font-medium">Cancel</ResponsiveText>
            </ResponsiveButton>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CORS Error Modal */}
      <Modal
        visible={showCorsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCorsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-slate-800 border border-red-500/50 rounded-2xl p-6 max-w-md w-full">
            <View className="flex-row items-center mb-4">
              <AlertTriangle size={24} color="#ef4444" />
              <ResponsiveText className="text-white text-xl font-bold ml-3">
                Connection Issue
              </Text>
            </View>

            <ResponsiveText className="text-slate-300 mb-4 leading-relaxed">
              We detected a CORS (Cross-Origin Resource Sharing) error. This is
              likely caused by a browser extension interfering with requests.
            </Text>

            <View className="bg-slate-900/50 rounded-xl p-4 mb-6">
              <ResponsiveText className="text-red-400 font-semibold mb-2">
                Quick Fixes:
              </Text>
              <ResponsiveText className="text-slate-300 text-sm mb-2">
                ΓÇó Disable browser extensions temporarily
              </Text>
              <ResponsiveText className="text-slate-300 text-sm mb-2">
                ΓÇó Try using incognito/private browsing mode
              </Text>
              <ResponsiveText className="text-slate-300 text-sm mb-2">
                ΓÇó Clear browser cache and cookies
              </Text>
              <ResponsiveText className="text-slate-300 text-sm">
                ΓÇó Hard refresh the page (Ctrl+F5)
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowCorsModal(false);
                  setCorsError(false);
                }}
                className="flex-1 bg-slate-700 rounded-xl py-3 items-center"
                accessibilityRole="button"
                accessibilityLabel="Interactive button"
              >
                <ResponsiveText className="text-slate-300 font-medium">Dismiss</ResponsiveText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  window.location.reload();
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl py-3 items-center"
                accessibilityRole="button"
                accessibilityLabel="Interactive button"
              >
                <ResponsiveText className="text-white font-bold">Reload Page</ResponsiveText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                const incognitoUrl = window.location.href;
                navigator.clipboard.writeText(incognitoUrl).then(() => {
                  alert(
                    "URL copied! Open in incognito mode and paste this URL.",
                  );
                });
              }}
              className="mt-3 bg-white/10 border border-white/10 rounded-xl py-2 items-center"
              accessibilityRole="button"
              accessibilityLabel="Interactive button"
            >
              <ResponsiveText className="text-slate-300 text-sm">
                Copy URL for Incognito Mode
              </ResponsiveText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function AdminDashboard(props: AdminDashboardProps) {
  return (
    <AuthGuard>
      <AdminDashboardContent {...props} />
    </AuthGuard>
  );
}
