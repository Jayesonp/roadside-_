import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Image as ExpoImage } from "expo-image";
import {
  Menu,
  ChevronRight,
  Home,
  BarChart2,
  Map,
  Users,
  User,
  Award,
  AlertTriangle,
  AlertCircle,
  ClipboardList,
  Truck,
  MapPin,
  Star,
  DollarSign,
  CreditCard,
  PieChart,
  Target,
  Crown,
  Settings,
  Smartphone,
  Bell,
  Shield,
  LogOut,
} from "lucide-react-native";
import { useAuth } from "./Auth";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSectionChange?: (section: string) => void;
  activeSection?: string;
}

export default function AdminSidebar({
  isOpen = true,
  onClose = () => {},
  onSectionChange = () => {},
  activeSection = "dashboard",
}: AdminSidebarProps) {
  // Provide default values for user and signOut to prevent errors
  const auth = useAuth();
  const user = auth?.user || null;
  const signOut = auth?.signOut || (() => {});
  // Navigation sections with their items
  const navSections = [
    {
      title: "Dashboard",
      items: [
        { icon: <Home size={20} />, label: "Overview", key: "dashboard" },
        { icon: <BarChart2 size={20} />, label: "Analytics", key: "analytics" },
        { icon: <Map size={20} />, label: "Live Map", key: "map" },
      ],
    },
    {
      title: "User Management",
      items: [
        {
          icon: <Users size={20} />,
          label: "Customers",
          badge: "1.2K",
          key: "customers",
        },
        {
          icon: <User size={20} />,
          label: "Technicians",
          badge: "89",
          key: "technicians",
        },
        {
          icon: <Award size={20} />,
          label: "Partners",
          badge: "12",
          key: "partners",
        },
        {
          icon: <AlertTriangle size={20} />,
          label: "Admins",
          badge: "5",
          key: "admins",
        },
      ],
    },
    {
      title: "Service Operations",
      items: [
        {
          icon: <AlertCircle size={20} />,
          label: "Emergency Requests",
          badge: "7",
          key: "emergency",
        },
        {
          icon: <ClipboardList size={20} />,
          label: "All Requests",
          key: "requests",
        },
        {
          icon: <Truck size={20} />,
          label: "Service Providers",
          key: "providers",
        },
        {
          icon: <MapPin size={20} />,
          label: "Coverage Areas",
          key: "coverage",
        },
        { icon: <Star size={20} />, label: "Service Ratings", key: "ratings" },
      ],
    },
    {
      title: "Financial",
      items: [
        {
          icon: <DollarSign size={20} />,
          label: "Revenue Reports",
          key: "revenue",
        },
        {
          icon: <CreditCard size={20} />,
          label: "Payment Management",
          key: "payments",
        },
        {
          icon: <PieChart size={20} />,
          label: "Billing Analytics",
          key: "billing",
        },
        {
          icon: <Target size={20} />,
          label: "Pricing Management",
          key: "pricing",
        },
      ],
    },
    {
      title: "System & Settings",
      items: [
        { icon: <Crown size={20} />, label: "Admin Roles", key: "roles" },
        {
          icon: <Settings size={20} />,
          label: "System Settings",
          key: "settings",
        },
        {
          icon: <Smartphone size={20} />,
          label: "App Configuration",
          key: "config",
        },
        {
          icon: <Bell size={20} />,
          label: "Notifications",
          badge: "3",
          key: "notifications",
        },
        { icon: <Shield size={20} />, label: "Security Logs", key: "security" },
        {
          icon: <Settings size={20} />,
          label: "Dashboard Settings",
          key: "dashboard-settings",
        },
      ],
    },
  ];

  return (
    <View
      className={`bg-slate-900/95 border-r border-white/10 h-full w-80 ${isOpen ? "flex" : "hidden md:flex"} flex-col`}
    >
      {/* Logo and App Title */}
      <View className="p-6 border-b border-white/10 flex-row items-center">
        <ExpoImage
          source={require("../../assets/images/icon.png")}
          style={{ width: 44, height: 44, marginRight: 12 }}
          contentFit="contain"
        />
        <View>
          <Text className="text-white font-bold text-xl">RoadSide+</Text>
          <Text className="text-slate-400 text-xs">Admin Control Center</Text>
        </View>
      </View>

      {/* Navigation Menu */}
      <ScrollView className="flex-1 py-6">
        {navSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-8">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mx-6 mb-3">
              {section.title}
            </Text>

            {section.items.map((item, itemIndex) => {
              const isActive = activeSection === item.key;
              return (
                <TouchableOpacity
                  key={itemIndex}
                  className={`flex-row items-center py-3 px-6 mx-3 mb-1 rounded-xl ${isActive ? "bg-gradient-to-br from-red-600 to-red-500" : "hover:bg-white/5"}`}
                  onPress={() => {
                    onSectionChange(item.key || item.label.toLowerCase());
                    if (onClose) onClose();
                  }}
                >
                  <View className="w-6 mr-3 items-center justify-center">
                    {React.cloneElement(item.icon, {
                      color: isActive ? "#ffffff" : "#94a3b8",
                    })}
                  </View>
                  <Text
                    className={`flex-1 ${isActive ? "text-white" : "text-slate-400"} font-medium`}
                  >
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View className="bg-red-500 px-1.5 py-0.5 rounded-full min-w-[18px] items-center">
                      <Text className="text-white text-xs font-bold">
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Admin Profile */}
      <View className="p-6 border-t border-white/10">
        <View className="flex-row items-center mb-4">
          <View className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold text-base">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "AD"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-200 font-semibold text-sm">
              {user?.name || "Admin User"}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-md mt-0.5 ${
                user?.role === "super_admin"
                  ? "bg-red-500/10"
                  : user?.role === "admin"
                    ? "bg-blue-500/10"
                    : "bg-green-500/10"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  user?.role === "super_admin"
                    ? "text-red-400"
                    : user?.role === "admin"
                      ? "text-blue-400"
                      : "text-green-400"
                }`}
              >
                {user?.role?.replace("_", " ").toUpperCase() || "ADMIN"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={() => signOut && signOut()}
          className="flex-row items-center py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <LogOut size={16} color="#ef4444" />
          <Text className="text-red-400 font-medium text-sm ml-2">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
