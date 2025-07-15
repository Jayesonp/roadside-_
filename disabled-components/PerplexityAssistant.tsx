import React, { useState, useEffect, useMemo, useCallback } from "react";
import designSystem from "../styles/MobileDesignSystem";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
} from "./responsive/ResponsiveComponents";
import {
  Search,
  Send,
  Brain,
  ExternalLink,
  Copy,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import { createClient } from "@supabase/supabase-js";

interface PerplexityResponse {
  answer: string;
  citations: Array<{
    url: string;
    title: string;
  }>;
  relatedQuestions: string[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface PerplexityAssistantProps {
  backgroundColor?: string;
  onQueryResult?: (result: PerplexityResponse) => void;
  codeToReview?: string;
  componentName?: string;
}

const PerplexityAssistant = React.memo(function PerplexityAssistant({
  backgroundColor = "#0f172a",
  onQueryResult = () => {},
  codeToReview,
  componentName,
}: PerplexityAssistantProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PerplexityResponse | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const suggestedQueries = [
    "How to fix React Native TypeScript compilation errors",
    "Common React hooks errors and how to resolve them",
    "Debugging async/await and Promise handling issues",
    "Fixing import/export errors in React Native projects",
    "Resolving state management errors in React components",
    "How to fix undefined variable errors in TypeScript",
    "Common Expo development server connection errors",
  ];

  const handleQuery = async (queryText?: string) => {
    const searchQuery = queryText || query;
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a query");
      return;
    }

    setIsLoading(true);

    try {
      // Create timeout for request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 25000);
      });

      const requestPromise = supabase.functions.invoke(
        "supabase-functions-perplexity-query",
        {
          body: {
            query: searchQuery,
            model: "sonar",
          },
        },
      );

      const { data, error } = (await Promise.race([
        requestPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        throw error;
      }

      setResponse(data);
      onQueryResult(data);

      // Add to history if not already there
      if (!queryHistory.includes(searchQuery)) {
        setQueryHistory((prev) => [searchQuery, ...prev.slice(0, 4)]);
      }

      if (!queryText) {
        setQuery("");
      }
    } catch (error) {
      console.error("Error querying Perplexity:", error);

      let errorMessage = "Failed to get response from Perplexity";
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try a shorter query.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("Premature close") ||
          error.message.includes("ECONNRESET")
        ) {
          errorMessage =
            "Connection error. Please check your network and try again.";
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeExpoError = async (errorMessage: string) => {
    setIsLoading(true);

    try {
      // Create timeout for request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 25000);
      });

      const requestPromise = supabase.functions.invoke(
        "supabase-functions-expo-error-analysis",
        {
          body: {
            errorMessage: errorMessage,
          },
        },
      );

      const { data, error } = (await Promise.race([
        requestPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        throw error;
      }

      const analysisResponse = {
        answer: data.analysis,
        citations: data.citations || [],
        relatedQuestions: data.relatedQuestions || [],
        usage: data.usage,
      };

      setResponse(analysisResponse);
      onQueryResult(analysisResponse);

      // Add to history
      const analysisQuery = "Expo Error Analysis";
      if (!queryHistory.includes(analysisQuery)) {
        setQueryHistory((prev) => [analysisQuery, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Error analyzing Expo error:", error);

      let errorMessage = "Failed to analyze Expo error";
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Analysis timed out. Please try again.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("Premature close") ||
          error.message.includes("ECONNRESET")
        ) {
          errorMessage =
            "Connection error during analysis. Please check your network.";
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeReview = async (code: string, componentName: string) => {
    setIsLoading(true);

    try {
      // Create timeout for request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 35000);
      });

      const requestPromise = supabase.functions.invoke(
        "supabase-functions-perplexity-code-review",
        {
          body: {
            code: code,
            componentName: componentName,
          },
        },
      );

      const { data, error } = (await Promise.race([
        requestPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        throw error;
      }

      const reviewResponse = {
        answer: data.review,
        citations: data.citations || [],
        relatedQuestions: data.relatedQuestions || [],
        usage: data.usage,
      };

      setResponse(reviewResponse);
      onQueryResult(reviewResponse);

      // Add to history
      const reviewQuery = `Code review for ${componentName}`;
      if (!queryHistory.includes(reviewQuery)) {
        setQueryHistory((prev) => [reviewQuery, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Error during code review:", error);

      let errorMessage = "Failed to get code review from Perplexity";
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage =
            "Code review timed out. Please try with smaller code sections.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("Premature close") ||
          error.message.includes("ECONNRESET")
        ) {
          errorMessage =
            "Connection error during review. Please check your network.";
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Alert.alert("Copied", "Text copied to clipboard");
  };

  const openUrl = (url: string) => {
    Alert.alert("Open Link", `Would you like to open: ${url}?`);
  };

  useEffect(() => {
    // Auto-trigger code review if code is provided
    if (codeToReview && componentName) {
      handleCodeReview(codeToReview, componentName);
    }
  }, [codeToReview, componentName]);

  useEffect(() => {
    let isMounted = true;

    // Auto-analyze the Expo error from the image
    const expoErrorMessage = `Could not connect to development server.

Ensure the following:
- Node server is running and available on the same network - run 'npm start' from react-native root
- Node server URL is correctly set in AppDelegate
- WiFi is enabled and connected to the same network as the Node Server

URL: http://kojqvma-anonymous-3000.exp.direct/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable`;

    const analyzeError = async () => {
      if (isMounted) {
        try {
          await analyzeExpoError(expoErrorMessage);
        } catch (error) {
          console.error("Failed to auto-analyze error:", error);
        }
      }
    };

    analyzeError();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={{ backgroundColor }} className="flex-1 p-6">
      {/* Header */}
      <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl items-center justify-center mr-4">
            <Brain size={24} color="white" />
          </View>
          <View className="flex-1">
            <ResponsiveText className="text-white text-2xl font-bold mb-1">
              Perplexity AI Assistant
            </ResponsiveText>
            <ResponsiveText className="text-slate-400">
              Get real-time, cited answers for your project
            </ResponsiveText>
          </View>
          <View className="bg-green-500/20 px-3 py-1 rounded-lg">
            <ResponsiveText className="text-green-400 text-xs font-bold">LIVE</Text>
          </View>
        </View>

        {/* Search Input */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white/10 border border-white/10 rounded-xl flex-row items-center px-4">
            <Search size={20} color="#94a3b8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Describe your error or paste error message here..."
              placeholderTextColor="#64748b"
              className="flex-1 text-white py-3 px-3"
              multiline
              onSubmitEditing={() => handleQuery()}
            />
          </View>
          <TouchableOpacity
            onPress={() => handleQuery()}
            disabled={isLoading || !query.trim()}
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              isLoading || !query.trim()
                ? "bg-slate-600"
                : "bg-gradient-to-br from-purple-600 to-purple-500"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Interactive button">
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Suggested Queries */}
        {!response && (
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <Sparkles size={20} color="#a855f7" />
              <ResponsiveText className="text-white text-lg font-semibold ml-2">
                Common Error Fixes
              </Text>
            </View>
            <View className="gap-3">
              {suggestedQueries.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuery(suggestion)}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 flex-row items-center"
                  accessibilityRole="button"
                  accessibilityLabel="Interactive button">
                  <ResponsiveText className="text-slate-300 flex-1">{suggestion}</Text>
                  <Send size={16} color="#a855f7" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Query History */}
        {queryHistory.length > 0 && (
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <RefreshCw size={20} color="#64748b" />
              <ResponsiveText className="text-white text-lg font-semibold ml-2">
                Recent Queries
              </Text>
            </View>
            <View className="gap-2">
              {queryHistory.map((historyQuery, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuery(historyQuery)}
                  className="bg-white/5 rounded-lg p-3"
                  accessibilityRole="button"
                  accessibilityLabel="Interactive button">
                  <ResponsiveText className="text-slate-400 text-sm">{historyQuery}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Response */}
        {response && (
          <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
            {/* Answer */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <ResponsiveText className="text-white text-lg font-semibold">
                  AI Answer
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(response.answer)}
                  className="bg-white/10 border border-white/10 rounded-lg p-2"
                  accessibilityRole="button"
                  accessibilityLabel="Interactive button">
                  <Copy size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <View className="bg-white/5 rounded-xl p-4">
                <ResponsiveText className="text-slate-200 leading-6">
                  {response.answer}
                </Text>
              </View>
            </View>

            {/* Citations */}
            {response.citations && response.citations.length > 0 && (
              <View className="mb-6">
                <ResponsiveText className="text-white text-lg font-semibold mb-4">
                  Sources & Citations
                </Text>
                <View className="gap-3">
                  {response.citations.map((citation, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openUrl(citation.url)}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 flex-row items-center"
                      accessibilityRole="button"
                      accessibilityLabel="Interactive button">
                      <View className="flex-1">
                        <ResponsiveText className="text-slate-200 font-medium mb-1">
                          {citation.title}
                        </Text>
                        <ResponsiveText className="text-slate-400 text-sm">
                          {citation.url}
                        </Text>
                      </View>
                      <ExternalLink size={16} color="#a855f7" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Related Questions */}
            {response.relatedQuestions &&
              response.relatedQuestions.length > 0 && (
                <View className="mb-6">
                  <ResponsiveText className="text-white text-lg font-semibold mb-4">
                    Related Questions
                  </Text>
                  <View className="gap-2">
                    {response.relatedQuestions.map((question, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleQuery(question)}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 flex-row items-center"
                        accessibilityRole="button"
                        accessibilityLabel="Interactive button">
                        <ResponsiveText className="text-slate-300 flex-1">
                          {question}
                        </Text>
                        <Search size={16} color="#a855f7" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

            {/* Usage Stats */}
            {response.usage && (
              <View className="bg-white/5 rounded-xl p-4">
                <ResponsiveText className="text-slate-400 text-sm mb-2">Usage Stats</Text>
                <View className="flex-row justify-between">
                  <ResponsiveText className="text-slate-500 text-xs">
                    Tokens: {response.usage.total_tokens}
                  </Text>
                  <ResponsiveText className="text-slate-500 text-xs">
                    Prompt: {response.usage.prompt_tokens}
                  </Text>
                  <ResponsiveText className="text-slate-500 text-xs">
                    Response: {response.usage.completion_tokens}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
});

export default PerplexityAssistant;
