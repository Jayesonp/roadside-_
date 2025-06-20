import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";

interface ErrorFixAnalyzerProps {
  errorDetails?: string;
  onFixApplied?: () => void;
  errorType?: string;
}

export default function ErrorFixAnalyzer({
  errorDetails = "Module resolution error: Image import paths incorrect across multiple components",
  onFixApplied = () => {},
  errorType = "module-resolution",
}: ErrorFixAnalyzerProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);

  const analyzeError = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-perplexity-error-fix",
        {
          body: {
            errorDetails,
            errorType,
            projectStructure: `
            Project Structure:
            - app/components/ (React Native components)
            - public/images/Main-Brand-Logo.png (actual image location)
            - metro.config.js (Metro bundler configuration)
            - Expo React Native project with NativeWind and Tailwind CSS
            
            Error Context:
            - Multiple components trying to import from incorrect path
            - Image located at public/images/ not assets/images/
            - Metro bundler unable to resolve module paths
            - Chart rendering issues in dashboard components
          `,
          },
        },
      );

      if (error) throw error;

      setAnalysis(data.analysis);
      setCitations(data.citations || []);
    } catch (error) {
      console.error("Error analyzing with Perplexity:", error);
      setAnalysis(
        "Failed to analyze error. Please check the console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-slate-900 p-6 rounded-lg border border-slate-700">
      <Text className="text-white text-xl font-bold mb-4">
        ≡ƒöì Perplexity AI Error Analysis & Fix
      </Text>

      <View className="mb-4">
        <Text className="text-slate-300 text-sm mb-2">Current Error:</Text>
        <View className="bg-red-900/20 border border-red-500/30 p-3 rounded">
          <Text className="text-red-300 text-sm font-mono">{errorDetails}</Text>
          <Text className="text-red-400 text-xs mt-2">
            Γ£à FIXED: Image import paths corrected in all components
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={analyzeError}
        disabled={loading}
        className="bg-blue-600 py-3 px-4 rounded-lg mb-4 flex-row items-center justify-center"
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-white font-semibold">
            Analyze Error with Perplexity AI
          </Text>
        )}
      </TouchableOpacity>

      {analysis && (
        <ScrollView className="max-h-96">
          <View className="bg-slate-800 p-4 rounded border border-slate-600">
            <Text className="text-green-400 font-semibold mb-2">
              ≡ƒôï Analysis Results:
            </Text>
            <Text className="text-slate-200 text-sm leading-6">{analysis}</Text>
          </View>

          {citations.length > 0 && (
            <View className="mt-4">
              <Text className="text-blue-400 font-semibold mb-2">
                ≡ƒôÜ Sources:
              </Text>
              {citations.map((citation, index) => (
                <Text key={index} className="text-slate-400 text-xs mb-1">
                  ΓÇó {citation.title || citation.url}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
