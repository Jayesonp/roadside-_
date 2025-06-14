import React from "react";
import { View, Text } from "react-native";
import {
  Users,
  AlertTriangle,
  DollarSign,
  Wrench,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";

interface MetricData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ReactNode;
  bgColor: string;
}

interface DashboardMetricsProps {
  metrics?: MetricData[];
  backgroundColor?: string;
}

export default function DashboardMetrics({
  metrics = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: <Users size={20} color="#3b82f6" />,
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Active Requests",
      value: "247",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: <AlertTriangle size={20} color="#ef4444" />,
      bgColor: "bg-red-500/20",
    },
    {
      title: "Monthly Revenue",
      value: "$84,250",
      change: "+15.3%",
      changeType: "positive" as const,
      icon: <DollarSign size={20} color="#22c55e" />,
      bgColor: "bg-green-500/20",
    },
    {
      title: "Service Providers",
      value: "156",
      change: "-2.1%",
      changeType: "negative" as const,
      icon: <Wrench size={20} color="#f59e0b" />,
      bgColor: "bg-yellow-500/20",
    },
  ],
  backgroundColor = "#0f172a",
}: DashboardMetricsProps = {}) {
  return (
    <View style={{ backgroundColor }} className="p-6">
      <Text className="text-white text-2xl font-bold mb-6">
        Dashboard Metrics
      </Text>

      <View className="flex-row flex-wrap gap-4">
        {metrics.map((metric, index) => (
          <View
            key={index}
            className="flex-1 min-w-[280px] bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            {/* Header with Icon and Change Indicator */}
            <View className="flex-row justify-between items-start mb-4">
              <View
                className={`w-12 h-12 ${metric.bgColor} rounded-xl items-center justify-center`}
              >
                {metric.icon}
              </View>

              <View
                className={`px-3 py-1 rounded-lg flex-row items-center ${
                  metric.changeType === "positive"
                    ? "bg-green-500/20 border border-green-500/30"
                    : "bg-red-500/20 border border-red-500/30"
                }`}
              >
                {metric.changeType === "positive" ? (
                  <TrendingUp size={12} color="#22c55e" />
                ) : (
                  <TrendingDown size={12} color="#ef4444" />
                )}
                <Text
                  className={`text-xs font-semibold ml-1 ${
                    metric.changeType === "positive"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {metric.change}
                </Text>
              </View>
            </View>

            {/* Metric Value */}
            <Text className="text-white text-3xl font-bold mb-2">
              {metric.value}
            </Text>

            {/* Metric Label */}
            <Text className="text-slate-400 text-sm font-medium">
              {metric.title}
            </Text>

            {/* Progress Bar (Visual Enhancement) */}
            <View className="mt-4">
              <View className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${
                    metric.changeType === "positive"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.abs(parseFloat(metric.change.replace("%", ""))),
                      100,
                    )}%`,
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
