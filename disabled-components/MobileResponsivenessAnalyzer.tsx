import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { Search, Smartphone, Monitor, Zap } from "lucide-react-native";

interface MobileResponsivenessAnalyzerProps {
  backgroundColor?: string;
}

export default function MobileResponsivenessAnalyzer({
  backgroundColor = "#0f172a",
}: MobileResponsivenessAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedComponent, setSelectedComponent] = useState<string>("");

  const analyzeComponent = async (
    componentName: string,
    componentCode: string,
  ) => {
    setIsAnalyzing(true);
    setSelectedComponent(componentName);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-mobile-responsiveness-analysis",
        {
          body: {
            componentCode,
            componentName,
          },
        },
      );

      if (error) {
        throw error;
      }

      if (data.success) {
        setAnalysisResults(data);
        Alert.alert(
          "Analysis Complete",
          `Mobile responsiveness analysis for ${componentName} is ready!`,
        );
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert(
        "Analysis Error",
        `Failed to analyze ${componentName}: ${error.message}`,
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTechnicianDashboard = () => {
    const technicianDashboardCode = `
    // TechnicianDashboard component code would be passed here
    // This is a placeholder for the actual component analysis
    `;
    analyzeComponent("TechnicianDashboard", technicianDashboardCode);
  };

  const analyzePartnerManagement = () => {
    const partnerManagementCode = `
    // PartnerManagement component code would be passed here
    // This is a placeholder for the actual component analysis
    `;
    analyzeComponent("PartnerManagement", partnerManagementCode);
  };

  const analyzeSecurityOperationsCenter = () => {
    const securityOperationsCenterCode = `
    // SecurityOperationsCenter component - large complex component with multiple panels
    // Contains security alerts, threat detection, access logs, vulnerability reports
    // Uses complex layouts with ScrollViews, TouchableOpacity, and multiple nested Views
    // Has notification system, emergency response features, and real-time monitoring
    // Currently optimized for web view but needs mobile responsiveness improvements
    `;
    analyzeComponent("SecurityOperationsCenter", securityOperationsCenterCode);
  };

  return (
    <View style={{ backgroundColor }} className="flex-1 p-6">
      {/* Header */}
      <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl items-center justify-center mr-4">
            <Smartphone size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-1">
              Mobile Responsiveness Analyzer
            </Text>
            <Text className="text-slate-400 text-sm">
              AI-powered analysis for mobile optimization
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <Zap size={16} color="#3b82f6" />
          <Text className="text-blue-400 text-sm ml-2">
            Powered by Perplexity AI & Supabase
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Component Analysis Options */}
        <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Select Component to Analyze
          </Text>

          <View className="gap-4">
            <TouchableOpacity
              onPress={analyzeTechnicianDashboard}
              disabled={isAnalyzing}
              className={`bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-4 flex-row items-center justify-between ${
                isAnalyzing && selectedComponent === "TechnicianDashboard"
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center mr-3">
                  <Monitor size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">
                    Technician Dashboard
                  </Text>
                  <Text className="text-white/80 text-xs">
                    Analyze mobile responsiveness issues
                  </Text>
                </View>
              </View>
              {isAnalyzing && selectedComponent === "TechnicianDashboard" && (
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={analyzePartnerManagement}
              disabled={isAnalyzing}
              className={`bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-4 flex-row items-center justify-between ${
                isAnalyzing && selectedComponent === "PartnerManagement"
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center mr-3">
                  <Search size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">
                    Partner Management
                  </Text>
                  <Text className="text-white/80 text-xs">
                    Analyze mobile responsiveness issues
                  </Text>
                </View>
              </View>
              {isAnalyzing && selectedComponent === "PartnerManagement" && (
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={analyzeSecurityOperationsCenter}
              disabled={isAnalyzing}
              className={`bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-4 flex-row items-center justify-between ${
                isAnalyzing && selectedComponent === "SecurityOperationsCenter"
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center mr-3">
                  <Monitor size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">
                    Security Operations Center
                  </Text>
                  <Text className="text-white/80 text-xs">
                    Analyze complex security dashboard for mobile
                  </Text>
                </View>
              </View>
              {isAnalyzing &&
                selectedComponent === "SecurityOperationsCenter" && (
                  <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Analysis Results */}
        {analysisResults && (
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Analysis Results: {analysisResults.componentName}
            </Text>

            <View className="bg-slate-700/50 rounded-xl p-4">
              <ScrollView className="max-h-96">
                <Text className="text-slate-200 text-sm leading-6">
                  {analysisResults.analysis}
                </Text>
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={() => setAnalysisResults(null)}
              className="bg-slate-600 rounded-lg p-3 mt-4 items-center"
            >
              <Text className="text-white font-semibold">Clear Results</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
