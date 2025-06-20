import React, { useState, useEffect, useCallback, useMemo } from "react";
import designSystem from "../styles/MobileDesignSystem";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
} from "./responsive/ResponsiveComponents";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Eye,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Clock,
  Shield,
  Server,
  Database,
  Wifi,
  Bug,
  Key,
  UserX,
  Activity,
  Zap,
  Download,
} from "lucide-react-native";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
  timestamp: string;
  category:
    | "System"
    | "Performance"
    | "Security"
    | "Network"
    | "Database"
    | "API"
    | "Maintenance"
    | "User";
  isRead: boolean;
  actionRequired: boolean;
  source?: string;
  affectedSystems?: string[];
  priority: "high" | "medium" | "low";
  status: "active" | "investigating" | "resolved" | "acknowledged";
  autoResolved?: boolean;
  escalated?: boolean;
  assignedTo?: string;
}

interface SystemAlertsViewProps {
  backgroundColor?: string;
  onAlertAction?: (alertId: string, action: string) => void;
  onRefresh?: () => Promise<void>;
  maxAlerts?: number;
  showFilters?: boolean;
  realTimeUpdates?: boolean;
  onExportData?: (format: "csv" | "pdf") => void;
}

const SystemAlertsView = React.memo(
  ({
    backgroundColor = "#0f172a",
    onAlertAction = () => {},
    onRefresh,
    maxAlerts = 50,
    showFilters = true,
    realTimeUpdates = true,
    onExportData = () => {},
  }: SystemAlertsViewProps = {}) => {
    // Error boundary state
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    // Error handler
    const handleError = React.useCallback((error: Error, errorInfo?: any) => {
      console.error("SystemAlertsView Error:", error, errorInfo);
      setHasError(true);
      setErrorMessage(error.message || "An unexpected error occurred");
    }, []);

    // Reset error state
    const resetError = React.useCallback(() => {
      setHasError(false);
      setErrorMessage("");
    }, []);

    // Wrap component in try-catch
    React.useEffect(() => {
      const originalError = console.error;
      console.error = (...args) => {
        if (args[0]?.toString().includes("SystemAlertsView")) {
          handleError(new Error(args.join(" ")));
        }
        originalError(...args);
      };

      return () => {
        console.error = originalError;
      };
    }, [handleError]);
    const [alerts, setAlerts] = useState<Alert[]>([
      {
        id: "SYS-001",
        title: "Database Connection Lost",
        message:
          "Primary database connection has been interrupted. Failover to backup initiated automatically.",
        severity: "critical",
        timestamp: "2024-01-15 14:30:25",
        category: "Database",
        isRead: false,
        actionRequired: true,
        source: "Supabase Database Monitor",
        affectedSystems: [
          "User Authentication",
          "Data Storage",
          "Real-time Updates",
        ],
        priority: "high",
        status: "investigating",
        escalated: true,
        assignedTo: "Database Team",
      },
      {
        id: "SYS-002",
        title: "High Memory Usage Alert",
        message:
          "Server memory usage has exceeded 85% threshold. Auto-scaling initiated but manual review recommended.",
        severity: "warning",
        timestamp: "2024-01-15 14:25:10",
        category: "Performance",
        isRead: false,
        actionRequired: true,
        source: "System Monitor",
        affectedSystems: ["API Server", "Background Jobs"],
        priority: "medium",
        status: "active",
      },
      {
        id: "SYS-003",
        title: "Security Intrusion Attempt",
        message:
          "Multiple failed login attempts detected from suspicious IP addresses. Security protocols activated.",
        severity: "critical",
        timestamp: "2024-01-15 14:20:15",
        category: "Security",
        isRead: false,
        actionRequired: true,
        source: "Security Monitor",
        affectedSystems: ["Admin Panel", "User Authentication"],
        priority: "high",
        status: "investigating",
        escalated: true,
        assignedTo: "Security Team",
      },
      {
        id: "SYS-004",
        title: "API Rate Limit Exceeded",
        message:
          "Third-party API rate limit reached. Some services may be temporarily affected. Implementing backoff strategy.",
        severity: "warning",
        timestamp: "2024-01-15 14:15:45",
        category: "API",
        isRead: false,
        actionRequired: true,
        source: "API Gateway",
        affectedSystems: ["External Integrations", "Data Sync"],
        priority: "medium",
        status: "active",
      },
      {
        id: "SYS-005",
        title: "Scheduled Maintenance Window",
        message:
          "System maintenance window scheduled for tonight at 2:00 AM EST. Expected downtime: 30 minutes.",
        severity: "info",
        timestamp: "2024-01-15 13:45:00",
        category: "Maintenance",
        isRead: true,
        actionRequired: false,
        source: "Operations Team",
        affectedSystems: ["All Services"],
        priority: "low",
        status: "acknowledged",
      },
      {
        id: "SYS-006",
        title: "Security Patch Applied Successfully",
        message:
          "Critical security update has been successfully applied to all servers. System security enhanced.",
        severity: "success",
        timestamp: "2024-01-15 12:15:30",
        category: "Security",
        isRead: true,
        actionRequired: false,
        source: "Security Team",
        affectedSystems: ["All Servers"],
        priority: "low",
        status: "resolved",
        autoResolved: true,
      },
      {
        id: "SYS-007",
        title: "Network Latency Spike",
        message:
          "Unusual network latency detected between data centers. Investigating potential routing issues.",
        severity: "warning",
        timestamp: "2024-01-15 11:50:20",
        category: "Network",
        isRead: false,
        actionRequired: true,
        source: "Network Monitor",
        affectedSystems: ["Data Replication", "Real-time Features"],
        priority: "medium",
        status: "investigating",
      },
      {
        id: "SYS-008",
        title: "User Session Anomaly",
        message:
          "Unusual user session patterns detected. Possible bot activity or security concern.",
        severity: "warning",
        timestamp: "2024-01-15 11:30:45",
        category: "User",
        isRead: false,
        actionRequired: true,
        source: "User Analytics",
        affectedSystems: ["User Management", "Session Handling"],
        priority: "medium",
        status: "active",
      },
    ]);

    const [filter, setFilter] = useState<
      "all" | "unread" | "critical" | "active"
    >("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const getSeverityIcon = (severity: string) => {
      switch (severity) {
        case "critical":
          return <AlertTriangle size={20} color="#ef4444" />;
        case "warning":
          return <AlertCircle size={20} color="#f59e0b" />;
        case "info":
          return <Info size={20} color="#3b82f6" />;
        case "success":
          return <CheckCircle size={20} color="#10b981" />;
        default:
          return <Info size={20} color="#6b7280" />;
      }
    };

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case "System":
          return <Server size={16} color="#94a3b8" />;
        case "Performance":
          return <Activity size={16} color="#94a3b8" />;
        case "Security":
          return <Shield size={16} color="#94a3b8" />;
        case "Network":
          return <Wifi size={16} color="#94a3b8" />;
        case "Database":
          return <Database size={16} color="#94a3b8" />;
        case "API":
          return <Zap size={16} color="#94a3b8" />;
        case "Maintenance":
          return <Settings size={16} color="#94a3b8" />;
        case "User":
          return <UserX size={16} color="#94a3b8" />;
        default:
          return <Bug size={16} color="#94a3b8" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "#ef4444";
        case "investigating":
          return "#f59e0b";
        case "resolved":
          return "#10b981";
        case "acknowledged":
          return "#3b82f6";
        default:
          return "#6b7280";
      }
    };

    const getPriorityBorderColor = (priority: string) => {
      switch (priority) {
        case "high":
          return "#ef4444";
        case "medium":
          return "#f59e0b";
        case "low":
          return "#3b82f6";
        default:
          return "#6b7280";
      }
    };

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "critical":
          return "#fef2f2";
        case "warning":
          return "#fffbeb";
        case "info":
          return "#eff6ff";
        case "success":
          return "#f0fdf4";
        default:
          return "#f9fafb";
      }
    };

    const getSeverityBorderColor = (severity: string) => {
      switch (severity) {
        case "critical":
          return "#fecaca";
        case "warning":
          return "#fed7aa";
        case "info":
          return "#bfdbfe";
        case "success":
          return "#bbf7d0";
        default:
          return "#e5e7eb";
      }
    };

    const markAsRead = (alertId: string) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert,
        ),
      );
      onAlertAction(alertId, "mark_read");
    };

    const dismissAlert = (alertId: string) => {
      Alert.alert(
        "Dismiss Alert",
        "Are you sure you want to dismiss this alert?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Dismiss",
            style: "destructive",
            onPress: () => {
              setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
              onAlertAction(alertId, "dismiss");
            },
          },
        ],
      );
    };

    const acknowledgeAlert = (alertId: string) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: "acknowledged", isRead: true }
            : alert,
        ),
      );
      onAlertAction(alertId, "acknowledge");
    };

    const escalateAlert = (alertId: string) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, escalated: true, priority: "high" }
            : alert,
        ),
      );
      onAlertAction(alertId, "escalate");
    };

    const resolveAlert = (alertId: string) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: "resolved", isRead: true }
            : alert,
        ),
      );
      onAlertAction(alertId, "resolve");
    };

    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
      try {
        if (onRefresh) {
          await onRefresh();
        }
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to refresh alerts:", error);
      } finally {
        setIsRefreshing(false);
      }
    }, [onRefresh]);

    const markAllAsRead = () => {
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
      onAlertAction("all", "mark_all_read");
    };

    const clearAllAlerts = () => {
      setAlerts([]);
      onAlertAction("all", "clear_all");
    };

    const filteredAlerts = React.useMemo(() => {
      try {
        return alerts
          .filter((alert) => {
            // Apply main filter
            let matchesMainFilter = true;
            switch (filter) {
              case "unread":
                matchesMainFilter = !alert.isRead;
                break;
              case "critical":
                matchesMainFilter = alert.severity === "critical";
                break;
              case "active":
                matchesMainFilter =
                  alert.status === "active" || alert.status === "investigating";
                break;
              default:
                matchesMainFilter = true;
            }

            // Apply category filter
            const matchesCategoryFilter =
              categoryFilter === "all" || alert.category === categoryFilter;

            return matchesMainFilter && matchesCategoryFilter;
          })
          .slice(0, maxAlerts);
      } catch (error) {
        console.error("Error filtering alerts:", error);
        return [];
      }
    }, [alerts, filter, categoryFilter, maxAlerts]);

    const unreadCount = alerts.filter((alert) => !alert.isRead).length;
    const criticalCount = alerts.filter(
      (alert) => alert.severity === "critical",
    ).length;
    const activeCount = alerts.filter(
      (alert) => alert.status === "active" || alert.status === "investigating",
    ).length;
    const escalatedCount = alerts.filter((alert) => alert.escalated).length;

    const categories = [
      "all",
      ...Array.from(new Set(alerts.map((alert) => alert.category))),
    ];

    // Real-time updates simulation
    useEffect(() => {
      if (!realTimeUpdates) return;

      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate occasional new alerts or status updates
        if (Math.random() < 0.1) {
          // 10% chance every 30 seconds
          console.log("≡ƒöä Real-time alert update simulated");
        }
      }, 30000);

      return () => clearInterval(interval);
    }, [realTimeUpdates]);

    // Error boundary UI
    if (hasError) {
      return (
        <View style={[styles.container, { backgroundColor }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {errorMessage || "Please refresh the page or try again later."}
            </Text>
            <ResponsiveButton variant="danger" onPress={resetError}>
              <ResponsiveText className="text-white font-semibold">Try Again</ResponsiveText>
            </ResponsiveButton>
          </View>
        </View>
      );
    }

    try {
      return (
        <View style={[styles.container, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>System Alerts</Text>
              <Text style={styles.subtitle}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{unreadCount}</Text>
                <Text style={styles.statLabel}>Unread</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#ef4444" }]}>
                  {criticalCount}
                </Text>
                <Text style={styles.statLabel}>Critical</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#f59e0b" }]}>
                  {activeCount}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#8b5cf6" }]}>
                  {escalatedCount}
                </Text>
                <Text style={styles.statLabel}>Escalated</Text>
              </View>
            </View>
          </View>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <View style={styles.actionButtons}>
              <ResponsiveButton
                variant="secondary"
                size="sm"
                onPress={handleRefresh}
                disabled={isRefreshing}
                icon={<RefreshCw size={16} color="#3b82f6" />}
                iconPosition="left"
              >
                <ResponsiveText className="text-blue-400 text-sm font-semibold ml-2">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </ResponsiveText>
              </ResponsiveButton>

              {unreadCount > 0 && (
                <ResponsiveButton
                  variant="success"
                  size="sm"
                  onPress={markAllAsRead}
                  icon={<Eye size={16} color="#10b981" />}
                  iconPosition="left"
                >
                  <ResponsiveText className="text-green-400 text-sm font-semibold ml-2">
                    Mark All Read ({unreadCount})
                  </ResponsiveText>
                </ResponsiveButton>
              )}

              {/* Export Button */}
              <ResponsiveButton
                variant="ghost"
                size="sm"
                onPress={() => {
                  Alert.alert(
                    "Export Options",
                    "Choose export format",
                    [
                      { text: "CSV", onPress: () => onExportData("csv") },
                      { text: "PDF", onPress: () => onExportData("pdf") },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                }}
                icon={<Settings size={16} color="#94a3b8" />}
                iconPosition="left"
              >
                <ResponsiveText className="text-slate-400 text-sm font-semibold ml-2">
                  Export
                </ResponsiveText>
              </ResponsiveButton>

              {/* Clear All Button */}
              {alerts.length > 0 && (
                <ResponsiveButton
                  variant="danger"
                  size="sm"
                  onPress={() => {
                    Alert.alert(
                      "Clear All Alerts",
                      "Are you sure you want to dismiss all alerts?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Clear All", style: "destructive", onPress: clearAllAlerts }
                      ]
                    );
                  }}
                  icon={<X size={16} color="#ef4444" />}
                  iconPosition="left"
                >
                  <ResponsiveText className="text-red-400 text-sm font-semibold ml-2">
                    Clear All
                  </ResponsiveText>
                </ResponsiveButton>
              )}
            </View>
          </View>

          {/* Filter Buttons */}
          {showFilters && (
            <ResponsiveContainer className="mb-4">
              <View className="flex-row gap-2 mb-3">
                <ResponsiveButton
                  variant={filter === "all" ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => setFilter("all")}
                >
                  <ResponsiveText className={`text-xs font-semibold ${filter === "all" ? "text-white" : "text-slate-300"}`}>
                    All ({alerts.length})
                  </ResponsiveText>
                </ResponsiveButton>

                <ResponsiveButton
                  variant={filter === "unread" ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => setFilter("unread")}
                >
                  <ResponsiveText className={`text-xs font-semibold ${filter === "unread" ? "text-white" : "text-slate-300"}`}>
                    Unread ({unreadCount})
                  </ResponsiveText>
                </ResponsiveButton>

                <ResponsiveButton
                  variant={filter === "critical" ? "danger" : "ghost"}
                  size="sm"
                  onPress={() => setFilter("critical")}
                >
                  <ResponsiveText className={`text-xs font-semibold ${filter === "critical" ? "text-white" : "text-slate-300"}`}>
                    Critical ({criticalCount})
                  </ResponsiveText>
                </ResponsiveButton>

                <ResponsiveButton
                  variant={filter === "active" ? "secondary" : "ghost"}
                  size="sm"
                  onPress={() => setFilter("active")}
                >
                  <ResponsiveText className={`text-xs font-semibold ${filter === "active" ? "text-white" : "text-slate-300"}`}>
                    Active ({activeCount})
                  </ResponsiveText>
                </ResponsiveButton>
              </View>

              {/* Category Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2"
              >
                {categories.map((category) => (
                  <ResponsiveButton
                    key={category}
                    variant={categoryFilter === category ? "primary" : "ghost"}
                    size="sm"
                    onPress={() => setCategoryFilter(category)}
                    icon={category !== "all" ? getCategoryIcon(category) : undefined}
                    iconPosition="left"
                    className="mr-2"
                  >
                    <ResponsiveText className={`text-xs font-semibold ${categoryFilter === category ? "text-white" : "text-slate-300"}`}>
                      {category === "all" ? "All Categories" : category}
                    </ResponsiveText>
                  </ResponsiveButton>
                ))}
              </ScrollView>
            </ResponsiveContainer>
          )}

          {/* Alerts List */}
          <ScrollView
            style={styles.alertsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#3b82f6"
              />
            }
          >
            {filteredAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={48} color="#64748b" />
                <Text style={styles.emptyStateTitle}>No alerts found</Text>
                <Text style={styles.emptyStateText}>
                  {filter === "all"
                    ? "All systems are running normally"
                    : `No ${filter} alerts at this time`}
                </Text>
              </View>
            ) : (
              filteredAlerts.map((alert) => (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    {
                      backgroundColor: getSeverityColor(alert.severity),
                      borderLeftColor: getSeverityBorderColor(alert.severity),
                      borderLeftWidth: 4,
                    },
                    !alert.isRead && styles.unreadAlert,
                    {
                      borderLeftColor: getPriorityBorderColor(alert.priority),
                    },
                  ]}
                >
                  <View style={styles.alertHeader}>
                    <View style={styles.alertTitleRow}>
                      <View style={{ marginRight: 8 }}>
                        {getSeverityIcon(alert.severity)}
                      </View>
                      <Text
                        style={[
                          styles.alertTitle,
                          !alert.isRead && styles.unreadText,
                        ]}
                      >
                        {alert.title}
                      </Text>
                      {!alert.isRead && (
                        <View style={[styles.unreadDot, { marginLeft: 8 }]} />
                      )}
                      {alert.escalated && (
                        <View
                          style={[styles.escalatedBadge, { marginLeft: 8 }]}
                        >
                          <Text style={styles.escalatedText}>ESCALATED</Text>
                        </View>
                      )}
                    </View>
                    <ResponsiveButton
                      variant="ghost"
                      size="sm"
                      onPress={() => dismissAlert(alert.id)}
                      className="w-8 h-8 rounded-full"
                    >
                      <X size={16} color="#6b7280" />
                    </ResponsiveButton>
                  </View>

                  <Text style={styles.alertMessage}>{alert.message}</Text>

                  {/* Alert Details */}
                  <View style={styles.alertDetails}>
                    {alert.source && (
                      <Text style={styles.alertSource}>
                        Source: {alert.source}
                      </Text>
                    )}
                    {alert.affectedSystems &&
                      alert.affectedSystems.length > 0 && (
                        <Text style={styles.alertAffected}>
                          Affected: {alert.affectedSystems.join(", ")}
                        </Text>
                      )}
                    {alert.assignedTo && (
                      <Text style={styles.alertAssigned}>
                        Assigned to: {alert.assignedTo}
                      </Text>
                    )}
                  </View>

                  <View style={styles.alertMeta}>
                    <View style={styles.alertMetaLeft}>
                      <View style={styles.alertCategoryContainer}>
                        <View style={{ marginRight: 4 }}>
                          {getCategoryIcon(alert.category)}
                        </View>
                        <Text style={styles.alertCategory}>
                          {alert.category}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.alertStatusContainer,
                          { marginLeft: 12 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.alertStatus,
                            { color: getStatusColor(alert.status) },
                          ]}
                        >
                          {alert.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2 mt-3 flex-wrap">
                    {!alert.isRead && (
                      <ResponsiveButton
                        variant="success"
                        size="sm"
                        onPress={() => markAsRead(alert.id)}
                        icon={<Eye size={14} color="#10b981" />}
                        iconPosition="left"
                      >
                        <ResponsiveText className="text-green-400 text-xs font-semibold ml-1">
                          Mark Read
                        </ResponsiveText>
                      </ResponsiveButton>
                    )}

                    {alert.status !== "acknowledged" && (
                      <ResponsiveButton
                        variant="secondary"
                        size="sm"
                        onPress={() => acknowledgeAlert(alert.id)}
                        icon={<CheckCircle size={14} color="#3b82f6" />}
                        iconPosition="left"
                      >
                        <ResponsiveText className="text-blue-400 text-xs font-semibold ml-1">
                          Acknowledge
                        </ResponsiveText>
                      </ResponsiveButton>
                    )}

                    {alert.status !== "resolved" && alert.actionRequired && (
                      <ResponsiveButton
                        variant="success"
                        size="sm"
                        onPress={() => resolveAlert(alert.id)}
                        icon={<CheckCircle size={14} color="#22c55e" />}
                        iconPosition="left"
                      >
                        <ResponsiveText className="text-green-400 text-xs font-semibold ml-1">
                          Resolve
                        </ResponsiveText>
                      </ResponsiveButton>
                    )}

                    {!alert.escalated && alert.severity === "critical" && (
                      <ResponsiveButton
                        variant="danger"
                        size="sm"
                        onPress={() => escalateAlert(alert.id)}
                        icon={<AlertTriangle size={14} color="#ef4444" />}
                        iconPosition="left"
                      >
                        <ResponsiveText className="text-red-400 text-xs font-semibold ml-1">
                          Escalate
                        </ResponsiveText>
                      </ResponsiveButton>
                    )}

                    <ResponsiveButton
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        Alert.alert(
                          "Alert Details",
                          `ID: ${alert.id}\nSeverity: ${alert.severity}\nStatus: ${alert.status}\nCreated: ${alert.timestamp}`,
                          [{ text: "OK" }]
                        );
                      }}
                      icon={<Settings size={14} color="#6b7280" />}
                      iconPosition="left"
                    >
                      <ResponsiveText className="text-slate-400 text-xs font-semibold ml-1">
                        Details
                      </ResponsiveText>
                    </ResponsiveButton>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      );
    } catch (error) {
      handleError(error as Error);
      return (
        <View style={[styles.container, { backgroundColor }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              Please refresh the page or try again later.
            </Text>
            <TouchableOpacity style={styles.errorButton} onPress={resetError} accessibilityRole="button" accessibilityLabel="Interactive button">
              <Text style={styles.errorButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
  },
  statItem: {
    alignItems: "center",
    marginLeft: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3b82f6",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  categoryFilterContainer: {
    marginBottom: 20,
  },
  categoryFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  categoryFilterButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  categoryFilterText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  categoryFilterTextActive: {
    color: "#ffffff",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  filterText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  alertsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f1f5f9",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadAlert: {
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  unreadText: {
    fontWeight: "bold",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
  dismissButton: {
    padding: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertDetails: {
    marginBottom: 12,
  },
  alertSource: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  alertAffected: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  alertAssigned: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  escalatedBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  escalatedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  alertMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alertMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertCategory: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  alertStatusContainer: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  alertStatus: {
    fontSize: 10,
    fontWeight: "bold",
  },
  alertTimestamp: {
    fontSize: 12,
    color: "#9ca3af",
  },
  readButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  acknowledgeButton: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  resolveButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  escalateButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f1f5f9",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  errorButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SystemAlertsView;
