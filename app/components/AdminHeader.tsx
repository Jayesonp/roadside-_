import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Menu,
  X,
  Bell,
  Settings,
  Search,
  RefreshCw,
  AlertTriangle,
  User,
  Wrench,
  Building,
  LogOut,
} from "lucide-react-native";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: any[];
  showSearchModal: boolean;
  onSearchModalToggle: (show: boolean) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
  isMobile: boolean;
}

export default function AdminHeader({
  sidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  searchResults,
  showSearchModal,
  onSearchModalToggle,
  refreshing,
  onRefresh,
  onSignOut,
  isMobile,
}: AdminHeaderProps) {
  const getResultIcon = (type: string) => {
    switch (type) {
      case "customer":
        return <User size={20} color="#3b82f6" />;
      case "technician":
        return <Wrench size={20} color="#22c55e" />;
      case "partner":
        return <Building size={20} color="#f59e0b" />;
      case "emergency":
        return <AlertTriangle size={20} color="#ef4444" />;
      default:
        return <Search size={20} color="#94a3b8" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "customer":
        return "Customer";
      case "technician":
        return "Technician";
      case "partner":
        return "Partner";
      case "emergency":
        return "Emergency Request";
      default:
        return "Result";
    }
  };

  const handleSearch = (query: string) => {
    onSearchChange(query);
    if (query.trim()) {
      onSearchModalToggle(true);
    } else {
      onSearchModalToggle(false);
    }
  };

  return (
    <>
      {/* Top Header */}
      <View className="bg-slate-800/80 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          {(isMobile || !sidebarOpen) && (
            <TouchableOpacity
              onPress={onToggleSidebar}
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-4"
            >
              <Menu size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-white text-2xl font-bold">
              Admin Dashboard
            </Text>
            <Text className="text-slate-400 text-sm">
              RoadSide+ Control Center
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Global Search */}
          <View className="relative">
            <View className="flex-row items-center bg-white/10 border border-white/10 rounded-xl px-4 py-2 min-w-[300px]">
              <Search size={16} color="#94a3b8" />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search users, technicians, partners, requests..."
                placeholderTextColor="#64748b"
                className="flex-1 text-white text-sm ml-2"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    onSearchChange("");
                    onSearchModalToggle(false);
                  }}
                  className="ml-2"
                >
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Action Buttons */}
          <TouchableOpacity
            onPress={onRefresh}
            className={`w-10 h-10 bg-white/10 rounded-xl items-center justify-center ${refreshing ? "animate-spin" : ""}`}
          >
            <RefreshCw size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center relative">
            <Bell size={20} color="#94a3b8" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>

          <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
            <Settings size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSignOut}
            className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl items-center justify-center"
          >
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Global Search Results Modal */}
      <Modal
        visible={showSearchModal && searchResults.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => onSearchModalToggle(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          onPress={() => onSearchModalToggle(false)}
        >
          <View className="absolute top-20 left-6 right-6 bg-slate-800 border border-white/10 rounded-2xl max-h-96">
            <View className="p-4 border-b border-white/10">
              <Text className="text-white text-lg font-semibold">
                Search Results ({searchResults.length})
              </Text>
              <Text className="text-slate-400 text-sm">
                Found {searchResults.length} results for "{searchQuery}"
              </Text>
            </View>

            <ScrollView
              className="max-h-80"
              showsVerticalScrollIndicator={false}
            >
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={`${result.type}-${result.id}`}
                  className="flex-row items-center p-4 border-b border-white/5 hover:bg-white/5"
                  onPress={() => {
                    // Handle result selection
                    onSearchModalToggle(false);
                    console.log("Selected result:", result);
                  }}
                >
                  <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-3">
                    {getResultIcon(result.type)}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-white font-semibold mr-2">
                        {result.name || result.service || result.id}
                      </Text>
                      <View className="bg-blue-500/20 px-2 py-0.5 rounded">
                        <Text className="text-blue-400 text-xs font-semibold">
                          {getResultTypeLabel(result.type)}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-slate-400 text-sm">
                      {result.type === "customer" &&
                        `${result.email} • ${result.status}`}
                      {result.type === "technician" &&
                        `${result.techId} • ${result.status} • Rating: ${result.rating}`}
                      {result.type === "partner" &&
                        `${result.domain} • ${result.plan} plan • ${result.status}`}
                      {result.type === "emergency" &&
                        `${result.customer} • ${result.location} • ${result.status}`}
                    </Text>
                  </View>

                  <View className="w-6 h-6 bg-white/10 rounded-full items-center justify-center">
                    <Text className="text-slate-400 text-xs">→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {searchResults.length === 0 && searchQuery.trim() && (
              <View className="p-8 items-center">
                <Search size={32} color="#64748b" />
                <Text className="text-slate-400 text-center mt-2">
                  No results found for "{searchQuery}"
                </Text>
                <Text className="text-slate-500 text-center text-sm mt-1">
                  Try searching for users, technicians, partners, or emergency
                  requests
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
