import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  AlertTriangle,
  CheckCircle,
  Terminal,
  RefreshCw,
  Settings,
  Zap,
} from "lucide-react-native";
import { createClient } from "@supabase/supabase-js";

interface TroubleshootingResponse {
  success: boolean;
  investigation: string;
  citations: any[];
  usage: any;
  timestamp: string;
  error?: string;
}

interface MetroBundlerTroubleshooterProps {
  backgroundColor?: string;
}

export default function MetroBundlerTroubleshooter({
  backgroundColor = "#0f172a",
}: MetroBundlerTroubleshooterProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TroubleshootingResponse | null>(
    null,
  );
  const [error, setError] = useState<string>("");

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const analyzeMetroIssues = async () => {
    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const errorDetails = `CRITICAL METRO BUNDLER ERROR:

Error: Serializer did not return expected format. The project copy of \`expo/metro-config\` may be out of date. Error: Unexpected token 'v', "var __BUND"... is not valid JSON

This error occurs when:
1. Metro bundler fails to serialize JavaScript modules correctly
2. Custom serializer configuration conflicts with Expo's default setup
3. Outdated or incompatible dependencies between expo, metro, and @expo/metro-config
4. Corrupted Metro cache causing invalid JSON output
5. Resource constraints in Docker/container environments

Previous attempts included:
- Modifying metro.config.js to fix OCI runtime errors
- Adding custom serializer configurations
- Dependency updates with npx expo install --fix
- Cache clearing attempts

The project uses:
- Expo SDK 53
- React Native 0.79.3
- NativeWind 4.1.23
- Metro 0.82.4
- TypeScript 5.8.3`;

      const projectConfig = {
        expo: "^53.0.0",
        reactNative: "0.79.3",
        metro: "^0.82.4",
        nativewind: "^4.1.23",
        typescript: "~5.8.3",
        metroConfig: "Custom configuration with NativeWind integration",
        babelConfig: "Expo preset with NativeWind JSX import source",
        environment: "Docker container with resource constraints",
      };

      const { data, error: functionError } = await supabase.functions.invoke(
        "supabase-functions-metro-bundler-troubleshoot",
        {
          body: {
            errorDetails,
            projectConfig,
          },
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      setAnalysis(data);
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to analyze Metro bundler issues";
      setError(errorMessage);
      Alert.alert("Analysis Error", errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-start analysis on component mount
  useEffect(() => {
    analyzeMetroIssues();
  }, []);

  const copyToClipboard = (text: string) => {
    Alert.alert("Copied", "Analysis copied to clipboard");
  };

  return (
    <View style={{ backgroundColor }} className="flex-1 p-6">
      {/* Header */}
      <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl items-center justify-center mr-4">
            <Terminal size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-1">
              Metro Bundler Troubleshooter
            </Text>
            <Text className="text-slate-400">
              Comprehensive analysis of serialization errors
            </Text>
          </View>
          <View className="bg-red-500/20 px-3 py-1 rounded-lg">
            <Text className="text-red-400 text-xs font-bold">CRITICAL</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={analyzeMetroIssues}
          disabled={isAnalyzing}
          className={`flex-row items-center justify-center p-4 rounded-xl ${
            isAnalyzing
              ? "bg-slate-600"
              : "bg-gradient-to-br from-red-600 to-red-500"
          }`}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Zap size={20} color="white" />
          )}
          <Text className="text-white font-semibold ml-2">
            {isAnalyzing
              ? "Analyzing Metro Issues..."
              : "Re-analyze Metro Bundler Issues"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Error Display */}
        {error && (
          <View className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <AlertTriangle size={24} color="#ef4444" />
              <Text className="text-red-400 text-xl font-bold ml-3">
                Analysis Error
              </Text>
            </View>
            <Text className="text-red-300 leading-6">{error}</Text>
          </View>
        )}

        {/* Analysis Results */}
        {analysis && analysis.success && (
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <CheckCircle size={24} color="#22c55e" />
                <Text className="text-green-400 text-xl font-bold ml-3">
                  Perplexity Investigation Complete
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard(analysis.investigation)}
                className="bg-white/10 border border-white/10 rounded-lg p-2"
              >
                <Settings size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Investigation Results */}
            <View className="bg-white/5 rounded-xl p-6 mb-6">
              <Text className="text-white text-lg font-semibold mb-4">
                Step-by-Step Investigation & Fixes
              </Text>
              <ScrollView
                className="max-h-96"
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-slate-200 leading-7 text-base">
                  {analysis.investigation}
                </Text>
              </ScrollView>
            </View>

            {/* Citations */}
            {analysis.citations && analysis.citations.length > 0 && (
              <View className="bg-white/5 rounded-xl p-4 mb-4">
                <Text className="text-white text-lg font-semibold mb-3">
                  Sources & References
                </Text>
                <View className="gap-2">
                  {analysis.citations.map((citation, index) => (
                    <Text key={index} className="text-blue-400 text-sm">
                      ΓÇó {citation}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Usage Stats */}
            {analysis.usage && (
              <View className="bg-white/5 rounded-xl p-4">
                <Text className="text-slate-400 text-sm mb-2">
                  Analysis Completed:{" "}
                  {new Date(analysis.timestamp).toLocaleString()}
                </Text>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-xs">
                    Total Tokens: {analysis.usage.total_tokens}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    Prompt: {analysis.usage.prompt_tokens}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    Response: {analysis.usage.completion_tokens}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Current Error Context */}
        <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <AlertTriangle size={20} color="#f59e0b" />
            <Text className="text-amber-400 text-lg font-semibold ml-2">
              Current Metro Error Context
            </Text>
          </View>
          <View className="bg-slate-700/50 rounded-xl p-4 mb-4">
            <Text className="text-red-400 font-mono text-sm mb-2">
              Error: Serializer did not return expected format
            </Text>
            <Text className="text-slate-300 text-sm leading-6">
              The project copy of `expo/metro-config` may be out of date.{"\n"}
              Error: Unexpected token 'v', "var __BUND"... is not valid JSON
            </Text>
          </View>
          <Text className="text-slate-400 text-sm leading-6">
            This error typically indicates:
            {"\n"}ΓÇó Metro bundler serialization conflicts
            {"\n"}ΓÇó Outdated or incompatible dependencies
            {"\n"}ΓÇó Corrupted build cache
            {"\n"}ΓÇó Custom configuration issues
            {"\n"}ΓÇó Resource constraints in container environments
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <Text className="text-blue-400 text-lg font-semibold mb-4">
            Quick Diagnostic Commands
          </Text>
          <View className="gap-3">
            <View className="bg-slate-800/50 rounded-lg p-3">
              <Text className="text-slate-300 font-mono text-sm">
                npx expo install --fix
              </Text>
            </View>
            <View className="bg-slate-800/50 rounded-lg p-3">
              <Text className="text-slate-300 font-mono text-sm">
                rm -rf node_modules/.cache && rm -rf .expo
              </Text>
            </View>
            <View className="bg-slate-800/50 rounded-lg p-3">
              <Text className="text-slate-300 font-mono text-sm">
                npx expo start --clear
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
