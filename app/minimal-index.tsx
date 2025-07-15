import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebErrorBoundary from "./components/WebErrorBoundary";
import WebHead from "./components/WebHead";
import WebPerformanceMonitor from "./components/WebPerformanceMonitor";

type PanelType = "customer" | "admin" | "technician" | "partner" | "security";

const panels = [
  { id: "customer", name: "Customer Dashboard", icon: "🚗" },
  { id: "admin", name: "Admin Dashboard", icon: "⚙️" },
  { id: "technician", name: "Technician Dashboard", icon: "🔧" },
  { id: "partner", name: "Partner Management", icon: "🤝" },
  { id: "security", name: "Security Operations", icon: "🛡️" },
];

export default function MinimalApp() {
  const [activePanel, setActivePanel] = useState<PanelType>("customer");

  const renderPanel = () => {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center p-4">
        <Text className="text-white text-3xl font-bold mb-4">
          🚗 RoadSide+ Dashboard
        </Text>
        <Text className="text-slate-300 text-center mb-6">
          Welcome to your roadside assistance dashboard
        </Text>
        
        {/* Panel Selection */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 w-full max-w-md mb-6">
          <Text className="text-white text-xl font-bold mb-4">Select Dashboard</Text>
          {panels.map((panel) => (
            <TouchableOpacity
              key={panel.id}
              onPress={() => setActivePanel(panel.id as PanelType)}
              className={`rounded-xl py-3 px-4 mb-2 ${
                activePanel === panel.id ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              <Text className="text-white font-medium text-center">
                {panel.icon} {panel.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 w-full max-w-md">
          <Text className="text-white text-xl font-bold mb-4">Quick Actions</Text>
          <TouchableOpacity className="bg-blue-600 rounded-xl py-3 px-4 mb-3">
            <Text className="text-white font-medium text-center">Request Service</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-600 rounded-xl py-3 px-4 mb-3">
            <Text className="text-white font-medium text-center">Track Service</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-purple-600 rounded-xl py-3 px-4">
            <Text className="text-white font-medium text-center">View History</Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-slate-500 text-sm mt-6 text-center">
          Active Panel: {activePanel}
        </Text>
      </View>
    );
  };

  return (
    <WebErrorBoundary>
      <WebHead
        title={`RoadSide+ | ${panels.find(p => p.id === activePanel)?.name || 'Dashboard'}`}
        description="Manage your roadside assistance services with our comprehensive dashboard"
      />
      <WebPerformanceMonitor />
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 bg-slate-900">
          {/* Simple header */}
          <View className="bg-slate-800/90 backdrop-blur-lg border-b border-white/10 px-4 py-3">
            <Text className="text-white text-xl font-bold">🚗 RoadSide+</Text>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {renderPanel()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </WebErrorBoundary>
  );
}
