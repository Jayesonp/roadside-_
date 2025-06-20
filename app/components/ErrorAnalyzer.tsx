import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Bug,
} from "lucide-react-native";

interface ErrorAnalysis {
  primaryIssues: Array<{
    type: string;
    description: string;
    severity: string;
    affectedFiles: string[];
    currentPath?: string;
    correctPath?: string;
    reason?: string;
  }>;
  stepByStepFix: Array<{
    step: number;
    title: string;
    description: string;
    files?: string[];
    action: string;
  }>;
  pathAnalysis: {
    currentStructure: Record<string, string>;
    explanation: string;
  };
  recommendedActions: string[];
}

interface ErrorAnalyzerProps {
  backgroundColor?: string;
}

export default function ErrorAnalyzer({
  backgroundColor = "#0f172a",
}: ErrorAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixesApplied, setFixesApplied] = useState<number[]>([]);

  const analyzeErrors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-perplexity-code-analysis",
        {
          body: {
            errors: [
              "Metro error: Unable to resolve module ../../../assets/images/Main-Brand-Logo.png from /app-annotated/app/components/AdminSidebar.tsx",
              "Web Bundling failed 7505ms node_modules/expo-router/entry.js (1 module)",
              "Module resolution error in multiple components",
              "Build process failing on web platform",
              "Image import path errors in Auth.tsx, CustomerDashboard.tsx, TechnicianDashboard.tsx, PartnerManagement.tsx, SecurityOperationsCenter.tsx",
            ],
            codebase: "expo-react-native",
            projectStructure: {
              "app/components/":
                "React Native components with incorrect image imports",
              "assets/images/":
                "Static image assets including Main-Brand-Logo.png",
              "supabase/functions/": "Edge functions for backend logic",
              "metro.config.js": "Metro bundler configuration",
              "babel.config.js": "Babel transformation configuration",
            },
          },
        },
      );

      if (error) {
        Alert.alert("Analysis Error", error.message);
        return;
      }

      // Handle both old and new response formats
      const analysisData = data.analysis || data;
      setAnalysis(analysisData);
    } catch (error) {
      console.error("Error analyzing:", error);
      Alert.alert("Error", "Failed to analyze errors");
    } finally {
      setLoading(false);
    }
  };

  const markFixApplied = (stepNumber: number) => {
    setFixesApplied((prev) => [...prev, stepNumber]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-red-600 bg-red-600/10";
      case "high":
        return "border-l-orange-500 bg-orange-500/10";
      case "medium":
        return "border-l-yellow-500 bg-yellow-500/10";
      default:
        return "border-l-blue-500 bg-blue-500/10";
    }
  };

  useEffect(() => {
    analyzeErrors();
  }, []);

  return (
    <View style={{ backgroundColor }} className="flex-1 p-6">
      {/* Header */}
      <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl items-center justify-center mr-4">
            <Bug size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-1">
              AI-Powered Error Analysis
            </Text>
            <Text className="text-slate-400">
              Real-time Perplexity AI insights for Expo React Native errors
            </Text>
          </View>
          <TouchableOpacity
            onPress={analyzeErrors}
            disabled={loading}
            className={`bg-purple-600 rounded-xl px-4 py-2 flex-row items-center ${loading ? "opacity-50" : ""}`}
          >
            <RefreshCw
              size={16}
              color="white"
              className={loading ? "animate-spin" : ""}
            />
            <Text className="text-white font-semibold ml-2">
              {loading ? "AI Analyzing..." : "Analyze with AI"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {analysis && (
          <>
            {/* Primary Issues */}
            <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">
                  ≡ƒöì AI-Detected Issues
                </Text>
                <View className="bg-green-500/20 px-3 py-1 rounded-lg">
                  <Text className="text-green-400 text-xs font-bold">
                    Γ£¿ PERPLEXITY AI
                  </Text>
                </View>
              </View>
              {analysis.primaryIssues.map((issue, index) => (
                <View
                  key={index}
                  className={`border-l-4 rounded-xl p-4 mb-4 ${getSeverityColor(issue.severity)}`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-white font-bold text-lg flex-1">
                      {issue.type}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      {issue.confidence && (
                        <View className="bg-blue-500/20 px-2 py-1 rounded-md">
                          <Text className="text-blue-400 text-xs font-bold">
                            {issue.confidence}% confident
                          </Text>
                        </View>
                      )}
                      <View
                        className={`px-3 py-1 rounded-lg ${
                          issue.severity === "critical"
                            ? "bg-red-500/20"
                            : issue.severity === "high"
                              ? "bg-orange-500/20"
                              : issue.severity === "medium"
                                ? "bg-yellow-500/20"
                                : "bg-blue-500/20"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold uppercase ${
                            issue.severity === "critical"
                              ? "text-red-400"
                              : issue.severity === "high"
                                ? "text-orange-400"
                                : issue.severity === "medium"
                                  ? "text-yellow-400"
                                  : "text-blue-400"
                          }`}
                        >
                          {issue.severity}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-slate-300 mb-3">
                    {issue.description}
                  </Text>

                  {issue.impact && (
                    <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                      <Text className="text-red-400 text-sm font-semibold mb-1">
                        ≡ƒÆÑ Impact:
                      </Text>
                      <Text className="text-red-300 text-sm">
                        {issue.impact}
                      </Text>
                    </View>
                  )}

                  {issue.currentPath && issue.correctPath && (
                    <View className="bg-white/5 rounded-lg p-3 mb-3">
                      <Text className="text-red-400 text-sm mb-1">
                        Γ¥î Current: {issue.currentPath}
                      </Text>
                      <Text className="text-green-400 text-sm mb-1">
                        Γ£à Correct: {issue.correctPath}
                      </Text>
                      <Text className="text-slate-400 text-xs">
                        {issue.reason}
                      </Text>
                    </View>
                  )}

                  <Text className="text-slate-400 text-sm mb-2">
                    Affected Files: {issue.affectedFiles?.length || 0}
                  </Text>
                  {issue.affectedFiles && (
                    <View className="flex-row flex-wrap gap-1">
                      {issue.affectedFiles.map((file, fileIndex) => (
                        <View
                          key={fileIndex}
                          className="bg-white/10 rounded-md px-2 py-1"
                        >
                          <Text className="text-slate-300 text-xs">{file}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Step by Step Fix */}
            <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">
                  ≡ƒ¢á∩╕Å AI-Generated Fixes
                </Text>
                <View className="bg-blue-500/20 px-3 py-1 rounded-lg">
                  <Text className="text-blue-400 text-xs font-bold">
                    ≡ƒñû AUTOMATED
                  </Text>
                </View>
              </View>
              {analysis.stepByStepFix.map((step, index) => (
                <View
                  key={index}
                  className="border border-white/10 rounded-xl p-4 mb-4"
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        fixesApplied.includes(step.step)
                          ? "bg-green-500"
                          : step.priority === "critical"
                            ? "bg-red-500"
                            : step.priority === "high"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                      }`}
                    >
                      {fixesApplied.includes(step.step) ? (
                        <CheckCircle size={16} color="white" />
                      ) : (
                        <Text className="text-white font-bold text-sm">
                          {step.step}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">
                        {step.title}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        {step.priority && (
                          <View
                            className={`px-2 py-1 rounded-md ${
                              step.priority === "critical"
                                ? "bg-red-500/20"
                                : step.priority === "high"
                                  ? "bg-orange-500/20"
                                  : step.priority === "medium"
                                    ? "bg-yellow-500/20"
                                    : "bg-blue-500/20"
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                step.priority === "critical"
                                  ? "text-red-400"
                                  : step.priority === "high"
                                    ? "text-orange-400"
                                    : step.priority === "medium"
                                      ? "text-yellow-400"
                                      : "text-blue-400"
                              }`}
                            >
                              {step.priority.toUpperCase()}
                            </Text>
                          </View>
                        )}
                        {step.estimatedTime && (
                          <View className="bg-slate-600/50 px-2 py-1 rounded-md">
                            <Text className="text-slate-300 text-xs">
                              ΓÅ▒∩╕Å {step.estimatedTime}
                            </Text>
                          </View>
                        )}
                        {step.automated && (
                          <View className="bg-green-500/20 px-2 py-1 rounded-md">
                            <Text className="text-green-400 text-xs font-bold">
                              ≡ƒñû AUTO
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {!fixesApplied.includes(step.step) && (
                      <TouchableOpacity
                        onPress={() => markFixApplied(step.step)}
                        className="bg-green-600 rounded-lg px-3 py-1"
                      >
                        <Text className="text-white text-xs font-bold">
                          MARK DONE
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-slate-300 mb-3">
                    {step.description}
                  </Text>
                  <View className="bg-slate-700/50 rounded-lg p-3 mb-3">
                    <Text className="text-blue-400 text-sm font-semibold mb-1">
                      Action:
                    </Text>
                    <Text className="text-slate-300 text-sm">
                      {step.action}
                    </Text>
                  </View>
                  {step.files && (
                    <View className="flex-row flex-wrap gap-1">
                      {step.files.map((file, fileIndex) => (
                        <View
                          key={fileIndex}
                          className="bg-white/10 rounded-md px-2 py-1"
                        >
                          <Text className="text-slate-300 text-xs">{file}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Path Analysis */}
            <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-white text-xl font-bold mb-4">
                ≡ƒôü Path Structure Analysis
              </Text>
              <View className="bg-slate-700/50 rounded-lg p-4 mb-4">
                {Object.entries(analysis.pathAnalysis.currentStructure).map(
                  ([path, description]) => (
                    <View
                      key={path}
                      className="flex-row justify-between items-center mb-2"
                    >
                      <Text className="text-blue-400 font-mono text-sm">
                        {path}
                      </Text>
                      <Text className="text-slate-300 text-sm">
                        {description}
                      </Text>
                    </View>
                  ),
                )}
              </View>
              <Text className="text-slate-300">
                {analysis.pathAnalysis.explanation}
              </Text>
            </View>

            {/* Performance & Risk Assessment */}
            {analysis.performanceImpact && (
              <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
                <Text className="text-white text-xl font-bold mb-4">
                  ≡ƒôè Performance & Risk Assessment
                </Text>
                <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <View className="bg-white/5 rounded-lg p-4">
                    <Text className="text-orange-400 font-semibold mb-2">
                      Performance Impact
                    </Text>
                    <Text className="text-slate-300 text-sm mb-1">
                      Build Time: {analysis.performanceImpact.buildTime}
                    </Text>
                    <Text className="text-slate-300 text-sm mb-1">
                      Runtime: {analysis.performanceImpact.runtime}
                    </Text>
                    <Text className="text-slate-300 text-sm">
                      User Experience:{" "}
                      {analysis.performanceImpact.userExperience}
                    </Text>
                  </View>
                  {analysis.riskAssessment && (
                    <View className="bg-white/5 rounded-lg p-4">
                      <Text className="text-red-400 font-semibold mb-2">
                        Risk Assessment
                      </Text>
                      <Text className="text-slate-300 text-sm mb-1">
                        Severity: {analysis.riskAssessment.severity}
                      </Text>
                      <Text className="text-slate-300 text-sm mb-1">
                        Likelihood: {analysis.riskAssessment.likelihood}
                      </Text>
                      <Text className="text-slate-300 text-sm">
                        Impact: {analysis.riskAssessment.impact}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Recommended Actions */}
            <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-4">
                ≡ƒÆí Recommended Actions
              </Text>
              {analysis.recommendedActions.map((action, index) => (
                <View key={index} className="flex-row items-start mb-3">
                  <View className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3" />
                  <Text className="text-slate-300 flex-1">{action}</Text>
                </View>
              ))}

              {analysis.pathAnalysis?.bestPractices && (
                <View className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                  <Text className="text-blue-400 font-semibold mb-2">
                    ≡ƒôÜ Best Practices
                  </Text>
                  {analysis.pathAnalysis.bestPractices.map(
                    (practice, index) => (
                      <View key={index} className="flex-row items-start mb-2">
                        <Text className="text-blue-400 mr-2">ΓÇó</Text>
                        <Text className="text-slate-300 text-sm flex-1">
                          {practice}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
