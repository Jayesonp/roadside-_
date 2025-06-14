import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Crown,
  Shield,
  Check,
  ChevronDown,
  Users,
  Wrench,
  Building,
  Lock,
  Settings,
  Save,
  Key,
  EyeOff,
  Download,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";

interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastActive: string;
}

interface Customer extends BaseUser {
  type: "customer";
  membershipType: "Premium" | "Standard";
  location: string;
  totalServices: number;
  totalSpent: string;
}

interface Technician extends BaseUser {
  type: "technician";
  techId: string;
  rating: string;
  specialties: string[];
  isOnline: boolean;
  completedJobs: number;
  earnings: string;
}

interface Partner extends BaseUser {
  type: "partner";
  companyName: string;
  domain: string;
  plan: "starter" | "pro" | "enterprise";
  activeUsers: number;
  monthlyRevenue: string;
}

interface Admin extends BaseUser {
  type: "admin";
  role: "super_admin" | "admin" | "moderator";
  permissions: string[];
  lastLogin: string;
}

type UserType = Customer | Technician | Partner | Admin;

interface UserManagementProps {
  backgroundColor?: string;
  userType: "customers" | "technicians" | "partners" | "admins";
  currentUserRole?: "super_admin" | "admin" | "moderator";
  currentUserPermissions?: string[];
  onExportData?: (format: "csv" | "pdf") => void;
}

export default function UserManagement({
  backgroundColor = "#0f172a",
  userType,
  currentUserRole = "admin",
  currentUserPermissions = ["read", "write"],
  onExportData = () => {},
}: UserManagementProps) {
  // Mock data for different user types
  const [users, setUsers] = useState<UserType[]>([
    // Customers
    {
      id: "cust-1",
      type: "customer",
      name: "Sarah Mitchell",
      email: "sarah@example.com",
      phone: "+1-555-0123",
      status: "active",
      membershipType: "Premium",
      location: "New York, NY",
      totalServices: 12,
      totalSpent: "$1,247",
      createdAt: "2024-01-15",
      lastActive: "2 hours ago",
    },
    {
      id: "cust-2",
      type: "customer",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1-555-0124",
      status: "active",
      membershipType: "Standard",
      location: "Los Angeles, CA",
      totalServices: 8,
      totalSpent: "$642",
      createdAt: "2024-01-10",
      lastActive: "1 day ago",
    },
    // Technicians
    {
      id: "tech-1",
      type: "technician",
      name: "Alex Rodriguez",
      email: "alex@roadside.com",
      phone: "+1-555-0125",
      status: "active",
      techId: "RSP-3421",
      rating: "4.8",
      specialties: ["Towing", "Battery Jump", "Tire Change"],
      isOnline: true,
      completedJobs: 156,
      earnings: "$12,450",
      createdAt: "2023-12-01",
      lastActive: "Online now",
    },
    {
      id: "tech-2",
      type: "technician",
      name: "Jessica Taylor",
      email: "jessica@roadside.com",
      phone: "+1-555-0126",
      status: "active",
      techId: "RSP-5632",
      rating: "4.7",
      specialties: ["Lockout", "Fuel Delivery"],
      isOnline: false,
      completedJobs: 89,
      earnings: "$8,230",
      createdAt: "2023-11-15",
      lastActive: "3 hours ago",
    },
    // Partners
    {
      id: "part-1",
      type: "partner",
      name: "John Davis",
      email: "john@quicktow.com",
      phone: "+1-555-0127",
      status: "active",
      companyName: "QuickTow Pro",
      domain: "quicktowpro.roadside.app",
      plan: "pro",
      activeUsers: 247,
      monthlyRevenue: "$12,800",
      createdAt: "2023-10-01",
      lastActive: "1 hour ago",
    },
    // Admins
    {
      id: "admin-1",
      type: "admin",
      name: "Emma Wilson",
      email: "emma@roadside.com",
      phone: "+1-555-0128",
      status: "active",
      role: "super_admin",
      permissions: ["all"],
      lastLogin: "30 minutes ago",
      createdAt: "2023-09-01",
      lastActive: "Online now",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "view" | "profile" | "password"
  >("create");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeSpecificFilter, setTypeSpecificFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: "",
    email: "",
    phone: "",
    status: "active",
  });

  // Permission system
  const permissions = {
    super_admin: {
      customers: ["create", "read", "update", "delete", "manage_premium"],
      technicians: [
        "create",
        "read",
        "update",
        "delete",
        "manage_ratings",
        "manage_availability",
      ],
      partners: [
        "create",
        "read",
        "update",
        "delete",
        "manage_contracts",
        "manage_billing",
      ],
      admins: ["create", "read", "update", "delete", "manage_permissions"],
    },
    admin: {
      customers: ["create", "read", "update", "delete"],
      technicians: ["create", "read", "update", "manage_availability"],
      partners: ["read", "update"],
      admins: ["read"],
    },
    moderator: {
      customers: ["read", "update"],
      technicians: ["read", "update"],
      partners: ["read"],
      admins: [],
    },
  };

  const hasPermission = (action: string): boolean => {
    const userPermissions = permissions[currentUserRole]?.[userType] || [];
    return (
      userPermissions.includes(action) ||
      currentUserPermissions?.includes("all") ||
      false
    );
  };

  const canCreateUser = hasPermission("create");
  const canEditUser = hasPermission("update");
  const canDeleteUser = hasPermission("delete");
  const canViewUser = hasPermission("read");

  // Filter users by type
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const typeMatch = (() => {
        switch (userType) {
          case "customers":
            return user.type === "customer";
          case "technicians":
            return user.type === "technician";
          case "partners":
            return user.type === "partner";
          case "admins":
            return user.type === "admin";
          default:
            return true;
        }
      })();

      const searchMatch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch =
        statusFilter === "all" || user.status === statusFilter;

      // Type-specific filtering
      const typeSpecificMatch = (() => {
        if (typeSpecificFilter === "all") return true;

        switch (userType) {
          case "customers":
            return (user as Customer).membershipType === typeSpecificFilter;
          case "technicians":
            if (typeSpecificFilter === "online")
              return (user as Technician).isOnline;
            if (typeSpecificFilter === "offline")
              return !(user as Technician).isOnline;
            return true;
          case "partners":
            return (user as Partner).plan === typeSpecificFilter;
          case "admins":
            return (user as Admin).role === typeSpecificFilter;
          default:
            return true;
        }
      })();

      return typeMatch && searchMatch && statusMatch && typeSpecificMatch;
    });
  }, [users, userType, searchQuery, statusFilter, typeSpecificFilter]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "lastActive":
          // Convert relative time to sortable value
          const getTimeValue = (timeStr: string) => {
            if (timeStr.includes("Online now") || timeStr.includes("Just now"))
              return Date.now();
            if (timeStr.includes("minutes ago"))
              return Date.now() - parseInt(timeStr) * 60 * 1000;
            if (timeStr.includes("hours ago"))
              return Date.now() - parseInt(timeStr) * 60 * 60 * 1000;
            if (timeStr.includes("day ago"))
              return Date.now() - parseInt(timeStr) * 24 * 60 * 60 * 1000;
            return 0;
          };
          aValue = getTimeValue(a.lastActive);
          bValue = getTimeValue(b.lastActive);
          break;
        // Type-specific sorting
        case "membershipType":
          if (userType === "customers") {
            aValue = (a as Customer).membershipType;
            bValue = (b as Customer).membershipType;
          } else {
            return 0;
          }
          break;
        case "rating":
          if (userType === "technicians") {
            aValue = parseFloat((a as Technician).rating);
            bValue = parseFloat((b as Technician).rating);
          } else {
            return 0;
          }
          break;
        case "completedJobs":
          if (userType === "technicians") {
            aValue = (a as Technician).completedJobs;
            bValue = (b as Technician).completedJobs;
          } else {
            return 0;
          }
          break;
        case "plan":
          if (userType === "partners") {
            const planOrder = { starter: 1, pro: 2, enterprise: 3 };
            aValue = planOrder[(a as Partner).plan] || 0;
            bValue = planOrder[(b as Partner).plan] || 0;
          } else {
            return 0;
          }
          break;
        case "activeUsers":
          if (userType === "partners") {
            aValue = (a as Partner).activeUsers;
            bValue = (b as Partner).activeUsers;
          } else {
            return 0;
          }
          break;
        case "role":
          if (userType === "admins") {
            const roleOrder = { moderator: 1, admin: 2, super_admin: 3 };
            aValue = roleOrder[(a as Admin).role] || 0;
            bValue = roleOrder[(b as Admin).role] || 0;
          } else {
            return 0;
          }
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortOrder, userType]);

  const handleCreateUser = useCallback(() => {
    if (!canCreateUser) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to create users.",
      );
      return;
    }
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      status: "active",
      type: userType.slice(0, -1) as any, // Remove 's' from userType
    });
    setShowModal(true);
  }, [userType, canCreateUser]);

  const handleEditUser = useCallback(
    (user: UserType) => {
      if (!canEditUser) {
        Alert.alert(
          "Access Denied",
          "You don't have permission to edit users.",
        );
        return;
      }
      setModalMode("edit");
      setSelectedUser(user);
      setFormData({ ...user });
      setShowModal(true);
    },
    [canEditUser],
  );

  const handleViewUser = useCallback(
    (user: UserType) => {
      if (!canViewUser) {
        Alert.alert(
          "Access Denied",
          "You don't have permission to view user details.",
        );
        return;
      }
      setModalMode("view");
      setSelectedUser(user);
      setFormData({ ...user });
      setShowModal(true);
    },
    [canViewUser],
  );

  const handleDeleteUser = useCallback(
    (user: UserType) => {
      if (!canDeleteUser) {
        Alert.alert(
          "Access Denied",
          "You don't have permission to delete users.",
        );
        return;
      }
      Alert.alert(
        "Delete User",
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
              Alert.alert("Success", "User deleted successfully");
            },
          },
        ],
      );
    },
    [canDeleteUser],
  );

  const handleSaveUser = useCallback(async () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (modalMode === "create") {
        const newUser: UserType = {
          ...formData,
          id: `${userType.slice(0, -1)}-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
          lastActive: "Just now",
        } as UserType;

        setUsers((prev) => [...prev, newUser]);
        Alert.alert("Success", "User created successfully");
      } else if (modalMode === "edit" && selectedUser) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id ? { ...user, ...formData } : user,
          ),
        );
        Alert.alert("Success", "User updated successfully");
      } else if (modalMode === "profile" && selectedUser) {
        // Update user profile in Supabase
        const { error } = await supabase
          .from("admin_users")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          })
          .eq("id", selectedUser.id);

        if (error) {
          console.error("Profile update error:", error);
          Alert.alert("Error", "Failed to update profile");
          return;
        }

        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id ? { ...user, ...formData } : user,
          ),
        );
        Alert.alert("Success", "Profile updated successfully");
      }

      setShowModal(false);
      setFormData({});
      setSelectedUser(null);
    } catch (error) {
      console.error("Save user error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [formData, modalMode, selectedUser, userType]);

  const handleChangePassword = useCallback(async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        Alert.alert("Password Change Error", error.message);
        return;
      }

      Alert.alert("Success", "Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Password change error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while changing password",
      );
    } finally {
      setIsLoading(false);
    }
  }, [passwordData]);

  const handleOpenProfile = useCallback(
    (user: UserType) => {
      if (!canViewUser) {
        Alert.alert(
          "Access Denied",
          "You don't have permission to view user profiles.",
        );
        return;
      }
      setModalMode("profile");
      setSelectedUser(user);
      setFormData({ ...user });
      setShowModal(true);
    },
    [canViewUser],
  );

  const handleOpenPasswordChange = useCallback(
    (user: UserType) => {
      if (!canEditUser) {
        Alert.alert(
          "Access Denied",
          "You don't have permission to change user passwords.",
        );
        return;
      }
      setModalMode("password");
      setSelectedUser(user);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowModal(true);
    },
    [canEditUser],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "inactive":
        return "bg-gray-500/20 text-gray-400";
      case "suspended":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "customer":
        return <User size={16} color="#3b82f6" />;
      case "technician":
        return <Wrench size={16} color="#22c55e" />;
      case "partner":
        return <Building size={16} color="#f59e0b" />;
      case "admin":
        return <Shield size={16} color="#8b5cf6" />;
      default:
        return <User size={16} color="#94a3b8" />;
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case "customers":
        return "Customer";
      case "technicians":
        return "Technician";
      case "partners":
        return "Partner";
      case "admins":
        return "Admin";
      default:
        return "User";
    }
  };

  const getTypeSpecificFilterOptions = () => {
    switch (userType) {
      case "customers":
        return [
          { label: "All Memberships", value: "all" },
          { label: "Premium", value: "Premium" },
          { label: "Standard", value: "Standard" },
        ];
      case "technicians":
        return [
          { label: "All Status", value: "all" },
          { label: "Online", value: "online" },
          { label: "Offline", value: "offline" },
        ];
      case "partners":
        return [
          { label: "All Plans", value: "all" },
          { label: "Starter", value: "starter" },
          { label: "Pro", value: "pro" },
          { label: "Enterprise", value: "enterprise" },
        ];
      case "admins":
        return [
          { label: "All Roles", value: "all" },
          { label: "Moderator", value: "moderator" },
          { label: "Admin", value: "admin" },
          { label: "Super Admin", value: "super_admin" },
        ];
      default:
        return [];
    }
  };

  const getSortOptions = () => {
    const baseOptions = [
      { label: "Name", value: "name" },
      { label: "Email", value: "email" },
      { label: "Status", value: "status" },
      { label: "Created Date", value: "createdAt" },
      { label: "Last Active", value: "lastActive" },
    ];

    switch (userType) {
      case "customers":
        return [
          ...baseOptions,
          { label: "Membership Type", value: "membershipType" },
        ];
      case "technicians":
        return [
          ...baseOptions,
          { label: "Rating", value: "rating" },
          { label: "Completed Jobs", value: "completedJobs" },
        ];
      case "partners":
        return [
          ...baseOptions,
          { label: "Plan", value: "plan" },
          { label: "Active Users", value: "activeUsers" },
        ];
      case "admins":
        return [...baseOptions, { label: "Role", value: "role" }];
      default:
        return baseOptions;
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderUserSpecificFields = (user: UserType) => {
    switch (user.type) {
      case "customer":
        return (
          <>
            <View className="flex-row items-center mb-2">
              <Crown size={14} color="#f59e0b" />
              <Text className="text-slate-400 text-sm ml-2">
                {user.membershipType} Member
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <MapPin size={14} color="#94a3b8" />
              <Text className="text-slate-400 text-sm ml-2">
                {user.location}
              </Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {user.totalServices} services • {user.totalSpent} spent
            </Text>
          </>
        );
      case "technician":
        return (
          <>
            <View className="flex-row items-center mb-2">
              <Text className="text-slate-400 text-sm">
                ID: {user.techId} • Rating: {user.rating}⭐
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${
                  user.isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <Text className="text-slate-400 text-sm">
                {user.isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {user.completedJobs} jobs • {user.earnings} earned
            </Text>
          </>
        );
      case "partner":
        return (
          <>
            <Text className="text-slate-400 text-sm mb-2">
              {user.companyName}
            </Text>
            <View
              className={`px-2 py-1 rounded self-start mb-2 ${
                user.plan === "enterprise"
                  ? "bg-purple-500/20 text-purple-400"
                  : user.plan === "pro"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
              }`}
            >
              <Text className="text-xs font-bold uppercase">{user.plan}</Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {user.activeUsers} users • {user.monthlyRevenue}/month
            </Text>
          </>
        );
      case "admin":
        return (
          <>
            <View
              className={`px-2 py-1 rounded self-start mb-2 ${
                user.role === "super_admin"
                  ? "bg-red-500/20 text-red-400"
                  : user.role === "admin"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-green-500/20 text-green-400"
              }`}
            >
              <Text className="text-xs font-bold uppercase">
                {user.role.replace("_", " ")}
              </Text>
            </View>
            <Text className="text-slate-500 text-xs">
              Last login: {user.lastLogin}
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ backgroundColor }} className="flex-1 p-6">
      {/* Header */}
      <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-white text-3xl font-bold mb-2">
              {getUserTypeLabel()} Management
            </Text>
            <Text className="text-slate-400 text-base">
              Manage {userType} accounts, permissions, and settings
            </Text>
            <View className="flex-row items-center mt-3">
              <View
                className={`px-3 py-1 rounded-lg ${
                  currentUserRole === "super_admin"
                    ? "bg-red-500/20 border border-red-500/30"
                    : currentUserRole === "admin"
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-green-500/20 border border-green-500/30"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase ${
                    currentUserRole === "super_admin"
                      ? "text-red-400"
                      : currentUserRole === "admin"
                        ? "text-blue-400"
                        : "text-green-400"
                  }`}
                >
                  {currentUserRole.replace("_", " ")}
                </Text>
              </View>
              <Text className="text-slate-500 text-sm ml-3">
                Access Level:{" "}
                {canCreateUser && canEditUser && canDeleteUser
                  ? "Full"
                  : canEditUser
                    ? "Limited"
                    : "Read Only"}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            {/* Export Buttons */}
            <TouchableOpacity
              onPress={() => onExportData("csv")}
              className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3 flex-row items-center"
            >
              <Download size={16} color="#22c55e" />
              <Text className="text-green-400 font-semibold ml-2">CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onExportData("pdf")}
              className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-4 py-3 flex-row items-center"
            >
              <Download size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold ml-2">PDF</Text>
            </TouchableOpacity>

            {canCreateUser && (
              <TouchableOpacity
                onPress={handleCreateUser}
                className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl px-6 py-3 flex-row items-center"
              >
                <Plus size={16} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Add {getUserTypeLabel()}
                </Text>
              </TouchableOpacity>
            )}
            {!canCreateUser && (
              <View className="bg-slate-600/50 rounded-xl px-6 py-3 flex-row items-center opacity-50">
                <Plus size={16} color="#64748b" />
                <Text className="text-slate-400 font-semibold ml-2">
                  Add {getUserTypeLabel()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="bg-slate-800/80 border border-white/10 rounded-2xl p-4 mb-6">
        <View className="flex-row gap-4 mb-4">
          {/* Search */}
          <View className="flex-1 flex-row items-center bg-white/10 border border-white/10 rounded-lg px-4 py-2">
            <Search size={16} color="#94a3b8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, email, or phone..."
              placeholderTextColor="#64748b"
              className="flex-1 text-white text-sm ml-2"
            />
          </View>

          {/* Toggle Filters */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`bg-white/10 border border-white/10 rounded-lg px-4 py-2 flex-row items-center ${
              showFilters ? "bg-red-500/20 border-red-500/30" : ""
            }`}
          >
            <Filter size={16} color={showFilters ? "#ef4444" : "#94a3b8"} />
            <Text
              className={`text-sm ml-2 ${
                showFilters ? "text-red-400" : "text-slate-300"
              }`}
            >
              Filters
            </Text>
            <ChevronDown
              size={16}
              color={showFilters ? "#ef4444" : "#94a3b8"}
              style={{
                transform: [{ rotate: showFilters ? "180deg" : "0deg" }],
              }}
              className="ml-2"
            />
          </TouchableOpacity>
        </View>

        {/* Expanded Filters */}
        {showFilters && (
          <View className="border-t border-white/10 pt-4">
            <View className="flex-row gap-4 mb-4">
              {/* Status Filter */}
              <View className="flex-1">
                <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                  Status
                </Text>
                <View className="flex-row gap-2">
                  {["all", "active", "inactive", "suspended"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setStatusFilter(status)}
                      className={`px-3 py-2 rounded-lg border ${
                        statusFilter === status
                          ? "bg-red-500/20 border-red-500/30 text-red-400"
                          : "bg-white/5 border-white/10 text-slate-300"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          statusFilter === status
                            ? "text-red-400"
                            : "text-slate-300"
                        }`}
                      >
                        {status === "all"
                          ? "All"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Type-specific Filter */}
              {getTypeSpecificFilterOptions().length > 0 && (
                <View className="flex-1">
                  <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                    {userType === "customers"
                      ? "Membership"
                      : userType === "technicians"
                        ? "Availability"
                        : userType === "partners"
                          ? "Plan"
                          : "Role"}
                  </Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {getTypeSpecificFilterOptions().map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setTypeSpecificFilter(option.value)}
                        className={`px-3 py-2 rounded-lg border ${
                          typeSpecificFilter === option.value
                            ? "bg-blue-500/20 border-blue-500/30"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            typeSpecificFilter === option.value
                              ? "text-blue-400"
                              : "text-slate-300"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Sort Options */}
            <View>
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Sort By
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                {getSortOptions().map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSort(option.value)}
                    className={`px-3 py-2 rounded-lg border flex-row items-center ${
                      sortBy === option.value
                        ? "bg-green-500/20 border-green-500/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold mr-1 ${
                        sortBy === option.value
                          ? "text-green-400"
                          : "text-slate-300"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {sortBy === option.value && (
                      <Text
                        className={`text-xs ${
                          sortOrder === "asc"
                            ? "text-green-400"
                            : "text-green-400"
                        }`}
                      >
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Results Summary */}
            <View className="mt-4 pt-4 border-t border-white/10">
              <Text className="text-slate-400 text-sm">
                Showing {sortedUsers.length} of{" "}
                {
                  users.filter((u) => {
                    switch (userType) {
                      case "customers":
                        return u.type === "customer";
                      case "technicians":
                        return u.type === "technician";
                      case "partners":
                        return u.type === "partner";
                      case "admins":
                        return u.type === "admin";
                      default:
                        return true;
                    }
                  }).length
                }{" "}
                {getUserTypeLabel().toLowerCase()}s
                {searchQuery && ` matching "${searchQuery}"`}
                {statusFilter !== "all" && ` with ${statusFilter} status`}
                {typeSpecificFilter !== "all" &&
                  ` filtered by ${typeSpecificFilter}`}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Users List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {sortedUsers.map((user) => (
            <View
              key={user.id}
              className="bg-slate-800/80 border border-white/10 rounded-2xl p-6"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    {getUserTypeIcon(user.type)}
                    <Text className="text-white text-lg font-bold ml-2">
                      {user.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-md ml-3 ${getStatusColor(
                        user.status,
                      )}`}
                    >
                      <Text className="text-xs font-bold uppercase">
                        {user.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Mail size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm ml-2">
                      {user.email}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <Phone size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm ml-2">
                      {user.phone}
                    </Text>
                  </View>

                  {renderUserSpecificFields(user)}
                </View>

                <View className="flex-row gap-2">
                  {canViewUser && (
                    <TouchableOpacity
                      onPress={() => handleViewUser(user)}
                      className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg items-center justify-center"
                    >
                      <Eye size={16} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                  {canViewUser && (
                    <TouchableOpacity
                      onPress={() => handleOpenProfile(user)}
                      className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg items-center justify-center"
                    >
                      <Settings size={16} color="#8b5cf6" />
                    </TouchableOpacity>
                  )}
                  {canEditUser && (
                    <TouchableOpacity
                      onPress={() => handleEditUser(user)}
                      className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg items-center justify-center"
                    >
                      <Edit size={16} color="#22c55e" />
                    </TouchableOpacity>
                  )}
                  {canEditUser && (
                    <TouchableOpacity
                      onPress={() => handleOpenPasswordChange(user)}
                      className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/30 rounded-lg items-center justify-center"
                    >
                      <Key size={16} color="#eab308" />
                    </TouchableOpacity>
                  )}
                  {canDeleteUser && (
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(user)}
                      className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-lg items-center justify-center"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                  {!canDeleteUser && canEditUser && (
                    <View className="w-10 h-10 bg-slate-500/10 border border-slate-500/20 rounded-lg items-center justify-center opacity-50">
                      <Trash2 size={16} color="#64748b" />
                    </View>
                  )}
                </View>
              </View>

              <View className="border-t border-white/10 pt-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-500 text-xs">
                    Created: {user.createdAt}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    Last active: {user.lastActive}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <View className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">
                {modalMode === "create"
                  ? `Add New ${getUserTypeLabel()}`
                  : modalMode === "edit"
                    ? `Edit ${getUserTypeLabel()}`
                    : modalMode === "profile"
                      ? `Profile Settings`
                      : modalMode === "password"
                        ? `Change Password`
                        : `View ${getUserTypeLabel()}`}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="w-8 h-8 bg-white/10 rounded-lg items-center justify-center"
              >
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-4">
                {/* Password Change Form */}
                {modalMode === "password" && (
                  <>
                    <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                      <Text className="text-yellow-400 text-sm font-semibold mb-1">
                        Password Security
                      </Text>
                      <Text className="text-yellow-300 text-xs">
                        Choose a strong password with at least 6 characters.
                      </Text>
                    </View>

                    <View>
                      <Text className="text-slate-200 font-semibold mb-2">
                        Current Password
                      </Text>
                      <View className="flex-row items-center bg-white/10 border border-white/10 rounded-lg px-4 py-3">
                        <Lock size={20} color="#94a3b8" />
                        <TextInput
                          value={passwordData.currentPassword}
                          onChangeText={(text) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: text,
                            }))
                          }
                          placeholder="Enter current password"
                          placeholderTextColor="#64748b"
                          className="flex-1 text-white text-base ml-3"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className="ml-2"
                        >
                          {showPassword ? (
                            <EyeOff size={20} color="#94a3b8" />
                          ) : (
                            <Eye size={20} color="#94a3b8" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View>
                      <Text className="text-slate-200 font-semibold mb-2">
                        New Password
                      </Text>
                      <View className="flex-row items-center bg-white/10 border border-white/10 rounded-lg px-4 py-3">
                        <Lock size={20} color="#94a3b8" />
                        <TextInput
                          value={passwordData.newPassword}
                          onChangeText={(text) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: text,
                            }))
                          }
                          placeholder="Enter new password"
                          placeholderTextColor="#64748b"
                          className="flex-1 text-white text-base ml-3"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-slate-200 font-semibold mb-2">
                        Confirm New Password
                      </Text>
                      <View className="flex-row items-center bg-white/10 border border-white/10 rounded-lg px-4 py-3">
                        <Lock size={20} color="#94a3b8" />
                        <TextInput
                          value={passwordData.confirmPassword}
                          onChangeText={(text) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: text,
                            }))
                          }
                          placeholder="Confirm new password"
                          placeholderTextColor="#64748b"
                          className="flex-1 text-white text-base ml-3"
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="ml-2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} color="#94a3b8" />
                          ) : (
                            <Eye size={20} color="#94a3b8" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                {/* Profile and Basic Fields */}
                {modalMode !== "password" && (
                  <>
                    {/* Profile Header for Profile Mode */}
                    {modalMode === "profile" && (
                      <View className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                        <View className="flex-row items-center mb-2">
                          <Settings size={20} color="#8b5cf6" />
                          <Text className="text-purple-400 text-lg font-semibold ml-2">
                            Profile Management
                          </Text>
                        </View>
                        <Text className="text-purple-300 text-sm">
                          Update your personal information and contact details.
                        </Text>
                      </View>
                    )}

                    <View>
                      <Text className="text-slate-200 font-semibold mb-2">
                        Name
                      </Text>
                      <TextInput
                        value={formData.name || ""}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, name: text }))
                        }
                        placeholder="Enter full name"
                        placeholderTextColor="#64748b"
                        className="bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white"
                        editable={modalMode !== "view"}
                      />
                    </View>

                    <View>
                      <Text className="text-slate-200 font-semibold mb-2">
                        Email
                      </Text>
                      <TextInput
                        value={formData.email || ""}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, email: text }))
                        }
                        placeholder="Enter email address"
                        placeholderTextColor="#64748b"
                        className="bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white"
                        keyboardType="email-address"
                        editable={modalMode !== "view"}
                      />
                    </View>

                    <View>
                      <Text className="text-slate-200 font-semibold mb-2">
                        Phone
                      </Text>
                      <TextInput
                        value={formData.phone || ""}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, phone: text }))
                        }
                        placeholder="Enter phone number"
                        placeholderTextColor="#64748b"
                        className="bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white"
                        keyboardType="phone-pad"
                        editable={modalMode !== "view"}
                      />
                    </View>

                    {/* Status - Only for non-profile modes */}
                    {modalMode !== "profile" && (
                      <View>
                        <Text className="text-slate-200 font-semibold mb-2">
                          Status
                        </Text>
                        <View className="gap-2">
                          {["active", "inactive", "suspended"].map((status) => (
                            <TouchableOpacity
                              key={status}
                              onPress={() =>
                                modalMode !== "view" &&
                                setFormData((prev) => ({
                                  ...prev,
                                  status: status as any,
                                }))
                              }
                              className={`border rounded-lg p-3 flex-row items-center ${
                                formData.status === status
                                  ? "border-red-500 bg-red-500/10"
                                  : "border-white/10 bg-white/5"
                              }`}
                              disabled={modalMode === "view"}
                            >
                              <View
                                className={`w-4 h-4 border-2 rounded-full mr-3 ${
                                  formData.status === status
                                    ? "border-red-500 bg-red-500"
                                    : "border-slate-500"
                                }`}
                              />
                              <Text className="text-slate-200 text-sm capitalize">
                                {status}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}

                {/* Type-specific fields for admins */}
                {userType === "admins" &&
                  hasPermission("manage_permissions") && (
                    <>
                      <View>
                        <Text className="text-slate-200 font-semibold mb-2">
                          Role
                        </Text>
                        <View className="gap-2">
                          {["super_admin", "admin", "moderator"].map((role) => {
                            const canAssignRole =
                              currentUserRole === "super_admin" ||
                              (currentUserRole === "admin" &&
                                role !== "super_admin");

                            return (
                              <TouchableOpacity
                                key={role}
                                onPress={() =>
                                  modalMode !== "view" &&
                                  canAssignRole &&
                                  setFormData((prev) => ({
                                    ...prev,
                                    role: role as any,
                                  }))
                                }
                                className={`border rounded-lg p-3 flex-row items-center ${
                                  (formData as Admin).role === role
                                    ? "border-red-500 bg-red-500/10"
                                    : canAssignRole
                                      ? "border-white/10 bg-white/5"
                                      : "border-slate-600/50 bg-slate-600/20"
                                } ${!canAssignRole ? "opacity-50" : ""}`}
                                disabled={
                                  modalMode === "view" || !canAssignRole
                                }
                              >
                                <View
                                  className={`w-4 h-4 border-2 rounded-full mr-3 ${
                                    (formData as Admin).role === role
                                      ? "border-red-500 bg-red-500"
                                      : "border-slate-500"
                                  }`}
                                />
                                <Text
                                  className={`text-sm capitalize ${
                                    canAssignRole
                                      ? "text-slate-200"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {role.replace("_", " ")}
                                </Text>
                                {!canAssignRole && (
                                  <Text className="text-slate-500 text-xs ml-auto">
                                    Restricted
                                  </Text>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      <View>
                        <Text className="text-slate-200 font-semibold mb-2">
                          Permissions Preview
                        </Text>
                        <View className="bg-slate-700/50 rounded-lg p-3">
                          <Text className="text-slate-300 text-sm mb-2">
                            This role will have access to:
                          </Text>
                          <View className="flex-row flex-wrap gap-1">
                            {permissions[
                              (formData as Admin).role || "moderator"
                            ]?.[userType]?.map((permission) => (
                              <View
                                key={permission}
                                className="bg-blue-500/20 px-2 py-1 rounded"
                              >
                                <Text className="text-blue-400 text-xs">
                                  {permission.replace("_", " ")}
                                </Text>
                              </View>
                            )) || (
                              <Text className="text-slate-500 text-xs italic">
                                No specific permissions for this section
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </>
                  )}

                {userType === "admins" &&
                  !hasPermission("manage_permissions") && (
                    <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <Text className="text-yellow-400 text-sm font-semibold mb-1">
                        Limited Access
                      </Text>
                      <Text className="text-yellow-300 text-xs">
                        You can only view admin user details. Role and
                        permission management requires higher privileges.
                      </Text>
                    </View>
                  )}
              </View>
            </ScrollView>

            {modalMode !== "view" && (
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg py-3 items-center"
                  disabled={isLoading}
                >
                  <Text className="text-slate-200 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={
                    modalMode === "password"
                      ? handleChangePassword
                      : handleSaveUser
                  }
                  className={`flex-1 rounded-lg py-3 items-center ${
                    modalMode === "password"
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                      : modalMode === "profile"
                        ? "bg-gradient-to-r from-purple-600 to-purple-500"
                        : "bg-gradient-to-r from-red-600 to-red-500"
                  } ${isLoading ? "opacity-50" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <View className="flex-row items-center">
                      {modalMode === "password" && (
                        <Key size={16} color="white" />
                      )}
                      {modalMode === "profile" && (
                        <Save size={16} color="white" />
                      )}
                      {modalMode !== "password" && modalMode !== "profile" && (
                        <Check size={16} color="white" />
                      )}
                      <Text className="text-white font-semibold ml-2">
                        {modalMode === "create"
                          ? "Create"
                          : modalMode === "password"
                            ? "Change Password"
                            : modalMode === "profile"
                              ? "Save Profile"
                              : "Save Changes"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
