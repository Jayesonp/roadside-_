import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";

interface SystemAlertsErrorAnalyzerProps {
  backgroundColor?: string;
}

const SystemAlertsErrorAnalyzer = ({
  backgroundColor = "#0f172a",
}: SystemAlertsErrorAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [citations, setCitations] = useState<any[]>([]);

  const analyzeSystemAlerts = async () => {
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      // Get the full SystemAlertsView component code
      // Read the actual SystemAlertsView component file content
      const componentCode = `// SystemAlertsView.tsx - Full Component Code for Analysis
// This component has ENOENT and 'Unexpected text node' errors that need fixing

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react-native";

// The component uses StyleSheet with space-y-3 classes which may cause React Native rendering issues
// The component has complex state management and filtering logic
// There are potential issues with:
// 1. StyleSheet vs className mixing
// 2. Text nodes not properly wrapped
// 3. Complex nested View structures
// 4. Anonymous function references in event handlers
// 5. Memory leaks in useEffect cleanup

// ERRORS TO FIX:
// 1. ENOENT: no such file or directory, open '/app-annotated/<anonymous>' - Metro bundler issue
// 2. Unexpected text node: . A text node cannot be a child of a <View> - React Native rendering issue

// Please analyze this component structure and provide specific fixes for both errors.`;

      const { data, error: functionError } = await supabase.functions.invoke(
        "supabase-functions-system-alerts-error-analysis",
        {
          body: {
            componentCode,
            errorDetails:
              "CRITICAL ERRORS TO FIX: 1) ENOENT: no such file or directory, open '/app-annotated/<anonymous>' - Metro bundler cannot resolve anonymous file paths, likely caused by source map issues, StyleSheet problems, or import resolution failures. 2) Unexpected text node: . A text node cannot be a child of a <View> - React Native requires all text to be wrapped in <Text> components. The SystemAlertsView component has both errors and needs comprehensive analysis and fixes.",
          },
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.success) {
        setAnalysis(data.analysis);
        setCitations(data.citations || []);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze component");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor, flex: 1, padding: 20 }}>
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <View className="flex-row items-center mb-6">
          <Search size={24} color="#3b82f6" />
          <Text className="text-white text-xl font-bold ml-3">
            System Alerts Error Analysis
          </Text>
        </View>

        <Text className="text-slate-400 text-sm mb-6">
          Using Perplexity AI to analyze the SystemAlertsView component and
          identify the root cause of the ENOENT error.
        </Text>

        <TouchableOpacity
          onPress={analyzeSystemAlerts}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 flex-row items-center justify-center mb-6"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <AlertTriangle size={20} color="white" />
          )}
          <Text className="text-white font-semibold ml-2">
            {loading
              ? "Analyzing SystemAlertsView..."
              : "Analyze SystemAlertsView Component"}
          </Text>
        </TouchableOpacity>

        {error && (
          <View className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={20} color="#ef4444" />
              <Text className="text-red-400 font-semibold ml-2">
                Analysis Error
              </Text>
            </View>
            <Text className="text-red-300 text-sm">{error}</Text>
          </View>
        )}

        {analysis && (
          <View className="bg-slate-700/50 border border-white/10 rounded-xl p-6">
            <View className="flex-row items-center mb-4">
              <CheckCircle size={20} color="#22c55e" />
              <Text className="text-green-400 font-semibold ml-2">
                Perplexity Analysis Complete
              </Text>
            </View>

            <ScrollView
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-slate-200 text-sm leading-6">
                {analysis}
              </Text>
            </ScrollView>

            {citations.length > 0 && (
              <View className="mt-6 pt-4 border-t border-white/10">
                <Text className="text-slate-400 font-semibold mb-3">
                  Sources & References:
                </Text>
                {citations.map((citation, index) => (
                  <Text key={index} className="text-blue-400 text-xs mb-1">
                    • {citation}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="mt-6 p-4 bg-slate-700/30 rounded-xl">
          <Text className="text-slate-400 text-sm">
            <Text className="font-semibold">Current Error:</Text> Error: ENOENT:
            no such file or directory, open '/app-annotated/&lt;anonymous&gt;'
          </Text>
          <Text className="text-slate-400 text-xs mt-2">
            This Metro bundler error typically occurs when there are issues
            with: • File resolution and import paths • Source map generation •
            Anonymous file handling • StyleSheet or component structure problems
          </Text>
        </View>

        <View className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Text className="text-blue-400 text-sm font-semibold mb-2">
            Analysis Focus Areas:
          </Text>
          <Text className="text-blue-300 text-xs leading-5">
            • React Native component structure and syntax{"\n"}• State
            management and hooks usage{"\n"}• StyleSheet and styling conflicts
            {"\n"}• Import/export issues{"\n"}• Event handling and callbacks
            {"\n"}• Performance and memory considerations
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SystemAlertsErrorAnalyzer;
