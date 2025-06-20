import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  Alert,
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
  UserPlus,
  CreditCard,
  CheckCircle,
  Truck,
  MapPin,
  Bell,
  Settings,
  Shield,
  Clock,
  Filter,
  ChevronDown,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";
import { Database } from "../../src/types/supabase";

type ActivityItem = Database["public"]["Tables"]["activities"]["Row"] & {
  timestamp: string;
  user?: string;
};

interface ActivityFeedProps {
  activities?: ActivityItem[];
  maxItems?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

const ActivityFeed = React.memo(
  ({
    activities: propActivities,
    maxItems = 10,
    showFilters = true,
    onActivityClick = () => {},
  }: ActivityFeedProps) => {
    const [activities, setActivities] = useState<ActivityItem[]>(
      propActivities || [],
    );
    const [filter, setFilter] = useState("All Activities");
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
    const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

    const getActivityIcon = (type: string) => {
      switch (type) {
        case "emergency":
          return <AlertTriangle size={20} color="#ef4444" />;
        case "registration":
          return <UserPlus size={20} color="#22c55e" />;
        case "payment":
          return <CreditCard size={20} color="#3b82f6" />;
        case "completion":
          return <CheckCircle size={20} color="#22c55e" />;
        case "assignment":
          return <Truck size={20} color="#f59e0b" />;
        case "location":
          return <MapPin size={20} color="#8b5cf6" />;
        case "notification":
          return <Bell size={20} color="#06b6d4" />;
        case "system":
          return <Settings size={20} color="#6b7280" />;
        case "security":
          return <Shield size={20} color="#dc2626" />;
        default:
          return <Clock size={20} color="#94a3b8" />;
      }
    };

    const getActivityIconBg = (type: string) => {
      switch (type) {
        case "emergency":
          return "bg-red-500/20";
        case "registration":
          return "bg-green-500/20";
        case "payment":
          return "bg-blue-500/20";
        case "completion":
          return "bg-green-500/20";
        case "assignment":
          return "bg-yellow-500/20";
        case "location":
          return "bg-purple-500/20";
        case "notification":
          return "bg-cyan-500/20";
        case "system":
          return "bg-gray-500/20";
        case "security":
          return "bg-red-600/20";
        default:
          return "bg-slate-500/20";
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "high":
          return "bg-red-500/20 text-red-400 border-red-500/30";
        case "medium":
          return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        case "low":
          return "bg-green-500/20 text-green-400 border-green-500/30";
        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      }
    };

    // Convert database row to ActivityItem format
    const formatActivity = (
      dbActivity: Database["public"]["Tables"]["activities"]["Row"],
    ): ActivityItem => {
      const now = new Date();
      const createdAt = new Date(dbActivity.created_at || new Date().toISOString());
      const diffInMinutes = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60),
      );

      let timestamp: string;
      if (diffInMinutes < 1) {
        timestamp = "Just now";
      } else if (diffInMinutes < 60) {
        timestamp = `${diffInMinutes} min ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        timestamp = minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        timestamp = `${days}d ago`;
      }

      return {
        ...dbActivity,
        timestamp,
        user: dbActivity.user_name || undefined,
      };
    };

    // Fetch activities from Supabase database
    const fetchActivities = useCallback(
      async (showLoadingState = true) => {
        if (showLoadingState) {
          setIsLoading(true);
        }
        setError(null);

        try {
          // Check network connectivity first
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const { data, error: dbError } = await supabase
            .from("activities")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(maxItems)
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (dbError) {
            throw new Error(dbError.message || "Failed to fetch activities");
          }

          if (data) {
            const formattedActivities = data.map(formatActivity);
            setActivities(formattedActivities);
            setLastFetchTime(new Date());
            setIsOnline(true);
            setError(null); // Clear any previous errors
            console.log(
              `Γ£à Fetched ${formattedActivities.length} activities from database`,
            );
          }
        } catch (err) {
          let errorMessage = "Network error occurred";

          if (err instanceof Error) {
            if (err.name === "AbortError") {
              errorMessage = "Request timeout - please check your connection";
            } else if (err.message.includes("fetch")) {
              errorMessage = "Unable to connect to server";
            } else {
              errorMessage = err.message;
            }
          }

          setError(errorMessage);
          setIsOnline(false);
          console.error("Γ¥î Failed to fetch activities:", errorMessage);

          // Fallback to cached data or show offline message
          if (activities.length === 0) {
            setActivities([
              {
                id: "fallback-1",
                type: "system",
                title: "Connection Error",
                description:
                  "Unable to load activities. Please check your internet connection.",
                timestamp: "Just now",
                priority: "medium",
                user_name: null,
                location: null,
                amount: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);
          }
        } finally {
          if (showLoadingState) {
            setIsLoading(false);
          }
        }
      },
      [maxItems, activities.length],
    );

    // Manual refresh function
    const handleManualRefresh = useCallback(async () => {
      await fetchActivities(true);
    }, [fetchActivities]);

    // Retry function for error state
    const handleRetry = useCallback(async () => {
      await fetchActivities(true);
    }, [fetchActivities]);

    // Filter toggle handler
    const handleFilterToggle = useCallback(() => {
      const filterOptions = ["All Activities", "unread", "critical", "active", "system", "user", "payment"];
      const currentIndex = filterOptions.indexOf(filter);
      const nextIndex = (currentIndex + 1) % filterOptions.length;
      setFilter(filterOptions[nextIndex]);
    }, [filter]);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
      setFilter("All Activities");
    }, []);

    // Export activities handler
    const handleExportActivities = useCallback(() => {
      try {
        const exportData = {
          activities: filteredActivities,
          exportTime: new Date().toISOString(),
          filter: filter,
          totalCount: activities.length
        };

        // In a real app, this would trigger a download or share
        console.log("Exporting activities:", exportData);
        Alert.alert(
          "Export Complete",
          `Exported ${filteredActivities.length} activities with filter: ${filter}`,
          [{ text: "OK" }]
        );
      } catch (error) {
        console.error("Export failed:", error);
        Alert.alert("Export Failed", "Unable to export activities. Please try again.");
      }
    }, [activities, filter]);

    const filteredActivities = useMemo(() => {
      if (filter === "All Activities") return activities;

      return activities.filter(activity => {
        switch (filter) {
          case "unread":
            // Use a simple heuristic for unread - activities from last hour
            if (!activity.created_at) return false;
            const activityTime = new Date(activity.created_at);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return activityTime > oneHourAgo;
          case "critical":
            return activity.priority === "high" || activity.priority === "critical";
          case "active":
            return activity.type !== "system";
          case "system":
            return activity.type === "system";
          case "user":
            return activity.type === "user";
          case "payment":
            return activity.type === "payment";
          default:
            return true;
        }
      });
    }, [activities, filter]);

    const displayedActivities = filteredActivities.slice(0, maxItems);

    // Activity action handlers
    const handleActivityAction = useCallback((activityId: string, action: string) => {
      console.log(`Activity action: ${action} on ${activityId}`);

      switch (action) {
        case "view":
          onActivityClick(activities.find(a => a.id === activityId) || activities[0]);
          break;
        case "dismiss":
          setActivities(prev => prev.filter(a => a.id !== activityId));
          break;
        case "share":
          Alert.alert("Share", "Activity shared successfully");
          break;
        case "bookmark":
          Alert.alert("Bookmark", "Activity bookmarked");
          break;
        default:
          console.log("Unknown action:", action);
      }
    }, [activities, onActivityClick]);

    // Setup real-time subscription with enhanced error handling
    const setupRealtimeSubscription = useCallback(() => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }

      const channel = supabase
        .channel("activities-changes", {
          config: {
            presence: {
              key: `activity-feed-${Date.now()}`,
            },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "activities",
          },
          (payload) => {
            console.log("≡ƒöö New activity received:", payload.new);
            try {
              const newActivity = formatActivity(
                payload.new as Database["public"]["Tables"]["activities"]["Row"],
              );
              setActivities((current) => {
                // Prevent duplicates
                const exists = current.some(
                  (activity) => activity.id === newActivity.id,
                );
                if (exists) return current;

                return [newActivity, ...current.slice(0, maxItems - 1)];
              });
              setIsOnline(true);
              setError(null);
            } catch (err) {
              console.error("Error processing new activity:", err);
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "activities",
          },
          (payload) => {
            console.log("≡ƒöä Activity updated:", payload.new);
            try {
              const updatedActivity = formatActivity(
                payload.new as Database["public"]["Tables"]["activities"]["Row"],
              );
              setActivities((current) =>
                current.map((activity) =>
                  activity.id === updatedActivity.id
                    ? updatedActivity
                    : activity,
                ),
              );
            } catch (err) {
              console.error("Error processing updated activity:", err);
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "activities",
          },
          (payload) => {
            console.log("≡ƒùæ∩╕Å Activity deleted:", payload.old);
            setActivities((current) =>
              current.filter((activity) => activity.id !== payload.old.id),
            );
          },
        )
        .subscribe((status, err) => {
          console.log("≡ƒôí Realtime subscription status:", status, err);

          switch (status) {
            case "SUBSCRIBED":
              setIsOnline(true);
              setError(null);
              console.log("Γ£à Real-time connection established");
              break;
            case "CHANNEL_ERROR":
              setIsOnline(false);
              setError("Real-time connection error");
              console.error("Γ¥î Real-time channel error:", err);
              break;
            case "TIMED_OUT":
              setIsOnline(false);
              setError("Real-time connection timed out");
              console.error("ΓÅ░ Real-time connection timed out");
              break;
            case "CLOSED":
              setIsOnline(false);
              console.log("≡ƒöî Real-time connection closed");
              break;
          }
        });

      setRealtimeChannel(channel);
      return channel;
    }, [realtimeChannel, maxItems]);

    // Initial fetch and setup with retry logic
    useEffect(() => {
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds

      const initializeWithRetry = async () => {
        try {
          // Initial fetch
          await fetchActivities(true);

          // Setup real-time subscription only after successful fetch
          const channel = setupRealtimeSubscription();
          setRealtimeChannel(channel);
        } catch (err) {
          retryCount++;
          console.error(`Initialization attempt ${retryCount} failed:`, err);

          if (retryCount < maxRetries) {
            console.log(`Retrying in ${retryDelay}ms...`);
            setTimeout(initializeWithRetry, retryDelay * retryCount);
          } else {
            console.error("Max retries reached. Using offline mode.");
            setError(
              "Unable to connect. Please check your internet connection.",
            );
            setIsOnline(false);
          }
        }
      };

      initializeWithRetry();

      // Cleanup on unmount
      return () => {
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          setRealtimeChannel(null);
        }
      };
    }, []);

    // Auto-refresh with intelligent timing
    useEffect(() => {
      if (isAutoRefresh && isOnline) {
        const interval = setInterval(() => {
          console.log("≡ƒöä Auto-refreshing activity feed...");
          fetchActivities(false); // Don't show loading state for auto-refresh
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
      }
    }, [isAutoRefresh, isOnline, fetchActivities]);

    // Network status monitoring
    useEffect(() => {
      const handleOnline = () => {
        console.log("≡ƒîÉ Network connection restored");
        setIsOnline(true);
        setError(null);
        fetchActivities(false);

        // Re-establish real-time connection
        if (!realtimeChannel) {
          const channel = setupRealtimeSubscription();
          setRealtimeChannel(channel);
        }
      };

      const handleOffline = () => {
        console.log("≡ƒô╡ Network connection lost");
        setIsOnline(false);
        setError("No internet connection");
      };

      // Add event listeners for network status (web only)
      if (typeof window !== "undefined") {
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
        };
      }
    }, [realtimeChannel, setupRealtimeSubscription, fetchActivities]);

    return (
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-3xl p-6 w-full">
        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-5 flex-wrap">
          <View className="flex flex-row items-center">
            <ResponsiveText className="text-white text-xl font-semibold mr-3">
              Activity Feed
            </ResponsiveText>
            <View className="flex flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${
                  isOnline
                    ? isAutoRefresh
                      ? "bg-green-500"
                      : "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              {isOnline ? (
                <Wifi size={12} color={isAutoRefresh ? "#22c55e" : "#eab308"} />
              ) : (
                <WifiOff size={12} color="#ef4444" />
              )}
            </View>
            <ResponsiveText className="text-slate-400 text-xs ml-2">
              {isOnline ? (isAutoRefresh ? "Live" : "Paused") : "Offline"}
            </ResponsiveText>
            {lastFetchTime && (
              <ResponsiveText className="text-slate-500 text-xs ml-3">
                Updated: {lastFetchTime.toLocaleTimeString()}
              </ResponsiveText>
            )}
          </View>

          {showFilters && (
            <View className="flex flex-row gap-3 flex-wrap">
              {/* Manual Refresh Button */}
              <ResponsiveButton
                variant="secondary"
                size="sm"
                onPress={handleManualRefresh}
                disabled={isLoading}
                icon={<RefreshCw size={12} color="#3b82f6" />}
                iconPosition="left"
              >
                <ResponsiveText className="text-blue-400 text-xs font-semibold ml-1">
                  {isLoading ? "Refreshing..." : "Refresh"}
                </ResponsiveText>
              </ResponsiveButton>

              {/* Auto Refresh Toggle */}
              <ResponsiveButton
                variant={isAutoRefresh ? "success" : "ghost"}
                size="sm"
                onPress={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                <ResponsiveText
                  className={`text-xs font-semibold ${isAutoRefresh ? "text-green-400" : "text-gray-300"}`}
                >
                  Auto Refresh
                </ResponsiveText>
              </ResponsiveButton>

              {/* Filter Dropdown */}
              <ResponsiveButton
                variant="ghost"
                size="sm"
                onPress={handleFilterToggle}
                icon={<ChevronDown size={16} color="#94a3b8" />}
                iconPosition="right"
              >
                <ResponsiveText className="text-gray-300 text-sm mr-2">{filter}</ResponsiveText>
              </ResponsiveButton>

              {/* Clear Filters Button */}
              {filter !== "All Activities" && (
                <ResponsiveButton
                  variant="danger"
                  size="sm"
                  onPress={handleClearFilters}
                >
                  <ResponsiveText className="text-red-400 text-xs font-semibold">
                    Clear
                  </ResponsiveText>
                </ResponsiveButton>
              )}

              {/* Export Button */}
              <ResponsiveButton
                variant="ghost"
                size="sm"
                onPress={handleExportActivities}
                icon={<Settings size={12} color="#94a3b8" />}
                iconPosition="left"
              >
                <ResponsiveText className="text-gray-300 text-xs font-semibold ml-1">
                  Export
                </ResponsiveText>
              </ResponsiveButton>
            </View>
          )}
        </View>

        {/* Error State */}
        {error && (
          <View className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
            <View className="flex flex-row items-center justify-between">
              <View className="flex-1">
                <ResponsiveText className="text-red-400 font-semibold text-sm mb-1">
                  Connection Error
                </ResponsiveText>
                <ResponsiveText className="text-red-300 text-xs">{error}</ResponsiveText>
              </View>
              <ResponsiveButton
                className="bg-red-500/30 rounded-lg px-3 py-2"
                onPress={handleRetry}>
                <ResponsiveText className="text-red-400 text-xs font-bold">Retry</ResponsiveText>
              </ResponsiveButton>
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading && activities.length === 0 && (
          <View className="items-center justify-center py-8">
            <RefreshCw
              size={24}
              color="#94a3b8"
              className="animate-spin mb-2"
            />
            <ResponsiveText className="text-slate-400 text-sm">
              Loading activities...
            </ResponsiveText>
            <ResponsiveText className="text-slate-500 text-xs mt-1">
              Connecting to real-time feed
            </ResponsiveText>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && activities.length === 0 && !error && (
          <View className="items-center justify-center py-8">
            <Bell size={32} color="#64748b" className="mb-3" />
            <ResponsiveText className="text-slate-400 text-lg font-semibold mb-2">
              No Activities Yet
            </ResponsiveText>
            <ResponsiveText className="text-slate-500 text-sm text-center">
              Activity feed is ready. New activities will appear here
              automatically.
            </ResponsiveText>
          </View>
        )}

        {/* Activity List */}
        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
          {displayedActivities.map((activity, index) => (
            <ResponsiveCard
              key={activity.id}
              variant="glass"
              className={`p-4 ${index < displayedActivities.length - 1 ? "mb-3" : ""}`}
            >
              <View className="flex flex-row items-start">
                {/* Activity Icon */}
                <View
                  className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${getActivityIconBg(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                </View>

              {/* Activity Content */}
              <View className="flex-1">
                <View className="flex flex-row justify-between items-start mb-2">
                  <ResponsiveText className="text-white font-semibold text-sm flex-1">
                    {activity.title}
                  </ResponsiveText>
                  <View className="flex flex-row items-center gap-2">
                    {/* Priority Badge */}
                    <View
                      className={`px-2 py-1 rounded-md border ${getPriorityColor(activity.priority)}`}
                    >
                      <ResponsiveText className="text-xs font-semibold uppercase">
                        {activity.priority}
                      </ResponsiveText>
                    </View>
                    {/* Timestamp */}
                    <ResponsiveText className="text-slate-500 text-xs">
                      {activity.timestamp}
                    </ResponsiveText>
                  </View>
                </View>

                {/* Description */}
                <ResponsiveText className="text-slate-400 text-sm mb-2">
                  {activity.description}
                </ResponsiveText>

                {/* Additional Info */}
                <View className="flex flex-row flex-wrap gap-3 mb-3">
                  {activity.user_name && (
                    <ResponsiveText className="text-slate-500 text-xs">
                      ≡ƒæñ {activity.user_name}
                    </ResponsiveText>
                  )}
                  {activity.location && (
                    <ResponsiveText className="text-slate-500 text-xs">
                      ≡ƒôì {activity.location}
                    </ResponsiveText>
                  )}
                  {activity.amount && (
                    <ResponsiveText className="text-green-400 text-xs font-semibold">
                      ≡ƒÆ░ {activity.amount}
                    </ResponsiveText>
                  )}
                </View>

                {/* Action Buttons */}
                <View className="flex flex-row gap-2 mt-2">
                  <ResponsiveButton
                    variant="ghost"
                    size="sm"
                    onPress={() => handleActivityAction(activity.id, "view")}
                    className="flex-1"
                  >
                    <ResponsiveText className="text-blue-400 text-xs font-semibold">
                      View Details
                    </ResponsiveText>
                  </ResponsiveButton>

                  <ResponsiveButton
                    variant="ghost"
                    size="sm"
                    onPress={() => handleActivityAction(activity.id, "share")}
                    icon={<Settings size={10} color="#94a3b8" />}
                  >
                    <ResponsiveText className="text-slate-400 text-xs">
                      Share
                    </ResponsiveText>
                  </ResponsiveButton>

                  <ResponsiveButton
                    variant="ghost"
                    size="sm"
                    onPress={() => handleActivityAction(activity.id, "dismiss")}
                    icon={<AlertTriangle size={10} color="#ef4444" />}
                  >
                    <ResponsiveText className="text-red-400 text-xs">
                      Dismiss
                    </ResponsiveText>
                  </ResponsiveButton>
                </View>
              </View>
              </View>
            </ResponsiveCard>
          ))}
        </ScrollView>

        {/* Footer */}
        <View className="flex flex-row justify-between items-center mt-5 pt-4 border-t border-white/5">
          <View>
            <ResponsiveText className="text-slate-500 text-xs">
              Showing {displayedActivities.length} of {filteredActivities.length}{" "}
              {filter !== "All Activities" ? `filtered (${activities.length} total)` : ""} activities
            </ResponsiveText>
            {!isOnline && (
              <ResponsiveText className="text-red-400 text-xs mt-1">
                ΓÜá∩╕Å Offline - showing cached data
              </ResponsiveText>
            )}
            {filter !== "All Activities" && (
              <ResponsiveText className="text-blue-400 text-xs mt-1">
                ≡ƒöÿ Filter: {filter}
              </ResponsiveText>
            )}
          </View>
          <ResponsiveButton
            variant="ghost"
            size="sm"
            onPress={() => {
              // In a real app, this would navigate to a full activities page
              Alert.alert("View All", `Would show all ${filteredActivities.length} activities`);
            }}
          >
            <ResponsiveText className="text-white text-sm font-medium">View All</ResponsiveText>
          </ResponsiveButton>
        </View>
      </View>
    );
  },
);

export default ActivityFeed;
