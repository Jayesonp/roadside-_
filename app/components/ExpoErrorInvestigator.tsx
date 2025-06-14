import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  FileText,
  Bug,
  Settings,
  Copy,
  ExternalLink,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";

interface InvestigationResult {
  success: boolean;
  investigation?: string;
  citations?: string[];
  relatedQuestions?: string[];
  fixes?: string[];
  error?: string;
  timestamp?: string;
}

export default function ExpoErrorInvestigator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState(
    "Error: ENOENT: no such file or directory, open '/app-annotated/<anonymous>'",
  );
  const [includeConfig, setIncludeConfig] = useState(true);

  // Mock configuration files content (in real app, these would be read from the file system)
  const getProjectConfig = () => {
    return {
      packageJson: {
        name: "test-tempo",
        main: "expo-router/entry",
        dependencies: {
          "@expo/vector-icons": "^14.1.0",
          "@supabase/supabase-js": "^2.49.9",
          expo: "^53.0.0",
          "expo-router": "~5.0.5",
          nativewind: "^4.1.23",
          react: "19.0.0",
          "react-native": "0.79.2",
          "lucide-react-native": "^0.479.0",
          "react-native-chart-kit": "^6.12.0",
          "react-native-svg": "15.11.2",
        },
        scripts: {
          start: "expo start",
          android: "expo start --android",
          ios: "expo start --ios",
          web: "expo start --web",
        },
      },
      babelConfig: {
        presets: [
          ["babel-preset-expo", { jsxImportSource: "nativewind" }],
          "nativewind/babel",
        ],
      },
      metroConfig: {
        resolver: {
          alias: { "@": "./" },
          sourceExts: ["jsx", "js", "ts", "tsx", "json"],
        },
        transformer: {
          unstable_allowRequireContext: true,
          enableBabelRCLookup: false,
          enableBabelRuntime: false,
        },
      },
      tsConfig: {
        extends: "expo/tsconfig.base",
        compilerOptions: {
          strict: true,
          skipLibCheck: true,
          paths: { "@/*": ["./*"] },
        },
      },
    };
  };

  const investigateErrors = async () => {
    if (!errorMessage.trim()) {
      Alert.alert("Error", "Please enter an error message to investigate");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const projectConfig = includeConfig ? getProjectConfig() : null;

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-investigate-expo-errors",
        {
          body: {
            errorMessage: errorMessage.trim(),
            projectConfig,
            includeDetailedAnalysis: true,
          },
        },
      );

      if (error) {
        throw error;
      }

      setResult(data);
    } catch (error: any) {
      console.error("Error calling investigation function:", error);
      setResult({
        success: false,
        error: error.message || "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Alert.alert("Copied", "Text copied to clipboard");
  };

  const openUrl = (url: string) => {
    Alert.alert("Open Link", `Would you like to open: ${url}?`);
  };

  return (
    <View className="flex-1 bg-slate-900 p-6">
      {/* Header */}
      <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl items-center justify-center mr-4">
            <Bug size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-1">
              Expo Error Investigator
            </Text>
            <Text className="text-slate-400">
              AI-powered analysis of project loading and bundling errors
            </Text>
          </View>
          <View className="bg-red-500/20 px-3 py-1 rounded-lg">
            <Text className="text-red-400 text-xs font-bold">DIAGNOSTIC</Text>
          </View>
        </View>

        {/* Error Input */}
        <View className="mb-4">
          <Text className="text-white text-sm font-semibold mb-2">
            Error Message
          </Text>
          <View className="bg-white/10 border border-white/10 rounded-xl p-4">
            <TextInput
              value={errorMessage}
              onChangeText={setErrorMessage}
              placeholder="Paste your error message here..."
              placeholderTextColor="#64748b"
              className="text-white text-sm"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Configuration Toggle */}
        <TouchableOpacity
          onPress={() => setIncludeConfig(!includeConfig)}
          className="flex-row items-center mb-4"
        >
          <View
            className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
              includeConfig ? "bg-blue-600 border-blue-600" : "border-slate-400"
            }`}
          >
            {includeConfig && <CheckCircle size={12} color="white" />}
          </View>
          <Text className="text-slate-300 text-sm">
            Include project configuration analysis
          </Text>
        </TouchableOpacity>

        {/* Investigate Button */}
        <TouchableOpacity
          onPress={investigateErrors}
          disabled={loading || !errorMessage.trim()}
          className={`rounded-xl p-4 flex-row items-center justify-center ${
            loading || !errorMessage.trim()
              ? "bg-slate-600"
              : "bg-gradient-to-br from-red-600 to-red-500"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Search size={20} color="white" />
          )}
          <Text className="text-white font-semibold ml-2">
            {loading ? "Analyzing with Perplexity AI..." : "Investigate Error"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Loading State */}
        {loading && (
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="large" color="#ef4444" />
              <Text className="text-white ml-3 text-lg">
                Analyzing project errors with Perplexity AI...
              </Text>
            </View>
            <Text className="text-slate-400 text-center mt-2">
              This may take a few moments
            </Text>
          </View>
        )}

        {/* Results */}
        {result && (
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
            {result.success ? (
              <View>
                {/* Success Header */}
                <View className="flex-row items-center mb-6">
                  <CheckCircle size={24} color="#22c55e" />
                  <Text className="text-green-400 text-xl font-bold ml-3">
                    Analysis Complete
                  </Text>
                  {result.timestamp && (
                    <Text className="text-slate-500 text-sm ml-auto">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </Text>
                  )}
                </View>

                {/* Investigation Results */}
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-lg font-semibold">
                      Diagnostic Analysis
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(result.investigation || "")
                      }
                      className="bg-white/10 border border-white/10 rounded-lg p-2"
                    >
                      <Copy size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                  <View className="bg-white/5 rounded-xl p-4">
                    <Text className="text-slate-200 leading-6">
                      {result.investigation}
                    </Text>
                  </View>
                </View>

                {/* Suggested Fixes */}
                {result.fixes && result.fixes.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-4">
                      Suggested Fixes
                    </Text>
                    <View className="gap-3">
                      {result.fixes.map((fix, index) => (
                        <View
                          key={index}
                          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                        >
                          <Text className="text-green-300 text-sm leading-6">
                            {fix}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Citations */}
                {result.citations && result.citations.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-4">
                      Sources & References
                    </Text>
                    <View className="gap-3">
                      {result.citations.map((citation, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => openUrl(citation)}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 flex-row items-center"
                        >
                          <View className="flex-1">
                            <Text className="text-slate-300 text-sm">
                              {citation}
                            </Text>
                          </View>
                          <ExternalLink size={16} color="#ef4444" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Related Questions */}
                {result.relatedQuestions &&
                  result.relatedQuestions.length > 0 && (
                    <View className="mb-6">
                      <Text className="text-white text-lg font-semibold mb-4">
                        Related Questions
                      </Text>
                      <View className="gap-2">
                        {result.relatedQuestions.map((question, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => setErrorMessage(question)}
                            className="bg-white/5 border border-white/10 rounded-lg p-3 flex-row items-center"
                          >
                            <Text className="text-slate-300 flex-1">
                              {question}
                            </Text>
                            <Search size={16} color="#ef4444" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
              </View>
            ) : (
              <View>
                <View className="flex-row items-center mb-4">
                  <AlertTriangle size={24} color="#ef4444" />
                  <Text className="text-red-400 text-xl font-bold ml-3">
                    Analysis Failed
                  </Text>
                </View>
                <View className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <Text className="text-red-300">{result.error}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Help Section */}
        <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
          <View className="flex-row items-center mb-4">
            <FileText size={20} color="#64748b" />
            <Text className="text-white text-lg font-semibold ml-2">
              Common Error Types
            </Text>
          </View>
          <View className="gap-3">
            {[
              "Metro bundler errors (ENOENT, module resolution)",
              "Babel transformation issues",
              "Expo Router configuration problems",
              "TypeScript compilation errors",
              "Package dependency conflicts",
              "NativeWind integration issues",
              "Development server connection problems",
            ].map((errorType, index) => (
              <Text key={index} className="text-slate-400 text-sm">
                • {errorType}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
