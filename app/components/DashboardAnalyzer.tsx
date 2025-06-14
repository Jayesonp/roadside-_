import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  FileText,
  Smartphone,
  AlertCircle,
  Loader,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";

interface AnalysisResult {
  analysis: string;
  citations: any[];
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

interface DashboardAnalyzerProps {
  componentCode?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default function DashboardAnalyzer({
  componentCode = "",
  onAnalysisComplete,
}: DashboardAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [selectedAnalysisType, setSelectedAnalysisType] =
    useState<string>("design-review");

  const analysisTypes = [
    {
      id: "design-review",
      title: "Design Review",
      description: "Comprehensive design and organization analysis",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      id: "mobile-responsive",
      title: "Mobile Responsive",
      description: "Mobile responsiveness and touch optimization",
      icon: Smartphone,
      color: "bg-green-500",
    },
    {
      id: "error-analysis",
      title: "Error Analysis",
      description: "Identify potential errors and performance issues",
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

  const analyzeComponent = async (analysisType: string) => {
    if (!componentCode.trim()) {
      Alert.alert("Error", "No component code provided for analysis");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-perplexity-dashboard-analysis",
        {
          body: {
            componentCode,
            analysisType,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to analyze component");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result = {
        analysis: data.analysis || "No analysis available",
        citations: data.citations || [],
        usage: data.usage || {},
      };

      setAnalysisResult(result);
      onAnalysisComplete?.(result);

      Alert.alert(
        "Analysis Complete",
        "Dashboard analysis has been completed successfully!",
      );
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert(
        "Analysis Failed",
        error instanceof Error ? error.message : "Failed to analyze component",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysisText = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("##")) {
        return (
          <Text key={index} className="text-white text-lg font-bold mt-4 mb-2">
            {line.replace("##", "").trim()}
          </Text>
        );
      }
      if (line.startsWith("#")) {
        return (
          <Text key={index} className="text-white text-xl font-bold mt-6 mb-3">
            {line.replace("#", "").trim()}
          </Text>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <Text key={index} className="text-yellow-400 font-semibold mt-2 mb-1">
            {line.replace(/\*\*/g, "")}
          </Text>
        );
      }
      if (line.startsWith("- ") || line.match(/^\d+\./)) {
        return (
          <Text key={index} className="text-slate-300 ml-4 mb-1">
            {line}
          </Text>
        );
      }
      if (line.trim()) {
        return (
          <Text key={index} className="text-slate-400 mb-2 leading-6">
            {line}
          </Text>
        );
      }
      return <View key={index} className="h-2" />;
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 py-4 bg-slate-800/60 backdrop-blur-lg border-b border-white/10">
        <Text className="text-white text-2xl font-bold mb-2">
          Dashboard Analyzer
        </Text>
        <Text className="text-slate-400 text-sm">
          AI-powered analysis of TechnicianDashboard component
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Select Analysis Type
          </Text>
          <View className="space-y-3">
            {analysisTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedAnalysisType === type.id;

              return (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedAnalysisType(type.id)}
                  className={`bg-slate-800/80 border rounded-xl p-4 flex-row items-center ${
                    isSelected ? "border-blue-500" : "border-white/10"
                  }`}
                >
                  <View
                    className={`w-12 h-12 ${type.color} rounded-xl items-center justify-center mr-4`}
                  >
                    <IconComponent size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold mb-1">
                      {type.title}
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      {type.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => analyzeComponent(selectedAnalysisType)}
          disabled={isAnalyzing || !componentCode.trim()}
          className={`bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 flex-row items-center justify-center mb-6 ${
            isAnalyzing || !componentCode.trim() ? "opacity-50" : ""
          }`}
        >
          {isAnalyzing ? (
            <Loader size={20} color="white" className="animate-spin mr-2" />
          ) : (
            <Search size={20} color="white" className="mr-2" />
          )}
          <Text className="text-white font-semibold text-lg">
            {isAnalyzing ? "Analyzing..." : "Analyze Dashboard"}
          </Text>
        </TouchableOpacity>

        {componentCode && (
          <View className="bg-slate-800/80 border border-white/10 rounded-xl p-4 mb-6">
            <Text className="text-white font-semibold mb-2">
              Component Information
            </Text>
            <Text className="text-slate-400 text-sm mb-1">
              Lines of code: {componentCode.split("\n").length}
            </Text>
            <Text className="text-slate-400 text-sm">
              Characters: {componentCode.length.toLocaleString()}
            </Text>
          </View>
        )}

        {analysisResult && (
          <View className="bg-slate-800/80 border border-white/10 rounded-xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-semibold">
                Analysis Results
              </Text>
              {analysisResult.usage.total_tokens && (
                <Text className="text-slate-500 text-xs">
                  {analysisResult.usage.total_tokens} tokens
                </Text>
              )}
            </View>

            <ScrollView className="max-h-96">
              {formatAnalysisText(analysisResult.analysis)}
            </ScrollView>

            {analysisResult.citations &&
              analysisResult.citations.length > 0 && (
                <View className="mt-4 pt-4 border-t border-white/10">
                  <Text className="text-white font-semibold mb-2">Sources</Text>
                  {analysisResult.citations.map((citation, index) => (
                    <Text key={index} className="text-blue-400 text-sm mb-1">
                      • {citation}
                    </Text>
                  ))}
                </View>
              )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
