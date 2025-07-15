import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import {
  AlertTriangle,
  RefreshCw,
  Terminal,
  HelpCircle,
  X,
} from "lucide-react-native";

interface ErrorRecoveryHelperProps {
  visible: boolean;
  onClose: () => void;
  errorType?: string;
  errorMessage?: string;
}

const ErrorRecoveryHelper: React.FC<ErrorRecoveryHelperProps> = ({
  visible,
  onClose,
  errorType = "Unknown",
  errorMessage = "Something went wrong",
}) => {
  const [activeTab, setActiveTab] = useState<"quick" | "detailed" | "commands">(
    "quick",
  );
  const [troubleshootingGuide, setTroubleshootingGuide] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      // Try to load stored troubleshooting guide
      try {
        const stored = localStorage.getItem("latest_troubleshooting_guide");
        if (stored) {
          setTroubleshootingGuide(JSON.parse(stored));
        }
      } catch (error) {
        console.warn("Failed to load troubleshooting guide:", error);
      }
    }
  }, [visible]);

  const quickFixes = [
    {
      title: "Clear Metro Cache",
      description: "Clear Metro bundler cache and restart",
      command: "npx expo start --clear",
      priority: "high",
    },
    {
      title: "Disable Extensions",
      description: "Test in incognito mode without extensions",
      action: "Open incognito/private browsing window",
      priority: "high",
    },
    {
      title: "Hard Refresh",
      description: "Clear browser cache and reload",
      command: "Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)",
      priority: "medium",
    },
    {
      title: "Check Console",
      description: "Look for specific error messages",
      action: "Press F12 and check Console tab",
      priority: "medium",
    },
  ];

  const detailedSteps = troubleshootingGuide?.specificSteps || [
    'Clear Metro bundler cache completely by running "npx expo start --clear"',
    "Disable all browser extensions and test in incognito mode",
    "Check browser console (F12) for ENOENT or CORS errors",
    "Verify Supabase environment variables are set correctly",
    "Test authentication status in browser console",
    "Clear all browser data and perform hard refresh",
  ];

  const commands = [
    {
      title: "Clear Metro Cache",
      command: "npx expo start --clear",
      description: "Clears Metro bundler cache and restarts dev server",
    },
    {
      title: "Reinstall Dependencies",
      command: "rm -rf node_modules && npm install",
      description: "Removes and reinstalls all dependencies",
    },
    {
      title: "Check Supabase Connection",
      command: "console.log(await supabase.auth.getSession())",
      description: "Test authentication in browser console",
    },
    {
      title: "Verify Environment Variables",
      command: "console.log(process.env.EXPO_PUBLIC_SUPABASE_URL)",
      description: "Check if environment variables are loaded",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500/50 bg-red-500/10";
      case "medium":
        return "border-yellow-500/50 bg-yellow-500/10";
      default:
        return "border-blue-500/50 bg-blue-500/10";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-slate-900 mt-20 rounded-t-3xl">
          {/* Header */}
          <View className="p-6 border-b border-white/10">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <AlertTriangle size={24} color="#ef4444" />
                <Text className="text-white text-xl font-bold ml-3">
                  Error Recovery Assistant
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
              >
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 bg-slate-800/50 rounded-xl p-4">
              <Text className="text-red-400 font-semibold mb-1">
                Error: {errorType}
              </Text>
              <Text className="text-slate-300 text-sm">{errorMessage}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-white/10">
            {[
              { id: "quick", label: "Quick Fixes", icon: RefreshCw },
              { id: "detailed", label: "Detailed Steps", icon: HelpCircle },
              { id: "commands", label: "Commands", icon: Terminal },
            ].map(({ id, label, icon: Icon }) => (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveTab(id as any)}
                className={`flex-1 p-4 flex-row items-center justify-center ${
                  activeTab === id ? "border-b-2 border-red-500" : ""
                }`}
              >
                <Icon
                  size={16}
                  color={activeTab === id ? "#ef4444" : "#94a3b8"}
                />
                <Text
                  className={`ml-2 font-medium ${
                    activeTab === id ? "text-red-400" : "text-slate-400"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-6">
            {activeTab === "quick" && (
              <View className="space-y-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  Try these quick fixes first:
                </Text>
                {quickFixes.map((fix, index) => (
                  <View
                    key={index}
                    className={`border rounded-xl p-4 ${getPriorityColor(fix.priority)}`}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-white font-semibold flex-1">
                        {fix.title}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded text-xs ${
                          fix.priority === "high"
                            ? "bg-red-500/20"
                            : "bg-yellow-500/20"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold uppercase ${
                            fix.priority === "high"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {fix.priority}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-slate-300 text-sm mb-3">
                      {fix.description}
                    </Text>
                    {fix.command && (
                      <View className="bg-slate-800/50 rounded-lg p-3">
                        <Text className="text-green-400 font-mono text-sm">
                          {fix.command}
                        </Text>
                      </View>
                    )}
                    {fix.action && (
                      <View className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <Text className="text-blue-400 text-sm">
                          Action: {fix.action}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {activeTab === "detailed" && (
              <View className="space-y-3">
                <Text className="text-white text-lg font-semibold mb-4">
                  Step-by-step troubleshooting:
                </Text>
                {detailedSteps.map((step: string, index: number) => (
                  <View key={index} className="bg-slate-800/50 rounded-xl p-4">
                    <View className="flex-row items-start">
                      <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mr-3 mt-0.5">
                        <Text className="text-white text-xs font-bold">
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="text-slate-300 text-sm flex-1 leading-relaxed">
                        {step}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === "commands" && (
              <View className="space-y-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  Useful commands and checks:
                </Text>
                {commands.map((cmd, index) => (
                  <View key={index} className="bg-slate-800/50 rounded-xl p-4">
                    <Text className="text-white font-semibold mb-2">
                      {cmd.title}
                    </Text>
                    <Text className="text-slate-400 text-sm mb-3">
                      {cmd.description}
                    </Text>
                    <View className="bg-slate-900/50 rounded-lg p-3">
                      <Text className="text-green-400 font-mono text-sm">
                        {cmd.command}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="p-6 border-t border-white/10">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-bold text-base">
                Close and Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorRecoveryHelper;
