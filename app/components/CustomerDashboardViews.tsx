import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
} from "react-native";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  Clock,
  CheckCircle,
  Star,
  MessageCircle,
  Camera,
  FileText,
  Share2,
  User,
  Mail,
  CreditCard,
  Calendar,
  Settings,
  Bell,
  Shield,
  DollarSign,
} from "lucide-react-native";

// Service Tracking View
export function renderServiceTracking(
  activeRequest: any,
  setCurrentView: (view: string) => void,
  handleCancelRequest: (id: string) => void,
  handleCallTechnician: (phone?: string) => void,
  handleNavigateToTechnician: () => void
) {
  if (!activeRequest) {
    return (
      <ScrollView className="flex-1 bg-slate-900/30 px-4 pb-24">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">No active service request</Text>
          <TouchableOpacity
            onPress={() => setCurrentView("main")}
            className="mt-4 bg-red-500 rounded-xl px-6 py-3"
          >
            <Text className="text-white font-semibold">Go Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "assigned": return "bg-blue-500/20 text-blue-400";
      case "enroute": return "bg-purple-500/20 text-purple-400";
      case "arrived": return "bg-green-500/20 text-green-400";
      case "inprogress": return "bg-orange-500/20 text-orange-400";
      case "completed": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Finding technician...";
      case "assigned": return "Technician assigned";
      case "enroute": return "Technician en route";
      case "arrived": return "Technician has arrived";
      case "inprogress": return "Service in progress";
      case "completed": return "Service completed";
      default: return status;
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900/30 px-4 pb-24">
      {/* Header */}
      <View className="flex-row items-center justify-between py-6">
        <TouchableOpacity
          onPress={() => setCurrentView("main")}
          className="w-10 h-10 bg-slate-800/80 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Service Tracking</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Status Card */}
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">
            {activeRequest.type.charAt(0).toUpperCase() + activeRequest.type.slice(1)} Service
          </Text>
          <View className={`px-3 py-1 rounded-lg ${getStatusColor(activeRequest.status)}`}>
            <Text className="text-xs font-semibold uppercase">
              {getStatusText(activeRequest.status)}
            </Text>
          </View>
        </View>

        <View className="bg-white/5 rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <MapPin size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-sm ml-2">Location</Text>
          </View>
          <Text className="text-white font-semibold">
            {activeRequest.location.address}
          </Text>
        </View>

        <View className="bg-white/5 rounded-xl p-4">
          <View className="flex-row items-center mb-2">
            <Clock size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-sm ml-2">Requested</Text>
          </View>
          <Text className="text-white font-semibold">
            {new Date(activeRequest.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Technician Info */}
      {activeRequest.technicianName && (
        <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Your Technician</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl items-center justify-center mr-4">
              <User size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">
                {activeRequest.technicianName}
              </Text>
              <Text className="text-slate-400 text-sm">
                Certified Roadside Technician
              </Text>
            </View>
            <View className="flex-row items-center">
              <Star size={16} color="#fbbf24" />
              <Text className="text-yellow-400 font-semibold ml-1">4.9</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleCallTechnician(activeRequest.technicianPhone)}
              className="flex-1 bg-green-500/20 border border-green-500/30 rounded-xl py-3 flex-row items-center justify-center"
            >
              <Phone size={18} color="#22c55e" />
              <Text className="text-green-400 font-semibold ml-2">Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleNavigateToTechnician}
              className="flex-1 bg-blue-500/20 border border-blue-500/30 rounded-xl py-3 flex-row items-center justify-center"
            >
              <Navigation size={18} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold ml-2">Navigate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-1 bg-purple-500/20 border border-purple-500/30 rounded-xl py-3 flex-row items-center justify-center">
              <MessageCircle size={18} color="#a855f7" />
              <Text className="text-purple-400 font-semibold ml-2">Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Live Updates */}
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
        <Text className="text-white text-lg font-bold mb-4">Live Updates</Text>
        
        <View className="gap-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="text-white font-semibold">Service request received</Text>
              <Text className="text-slate-400 text-sm">
                {new Date(activeRequest.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          </View>
          
          {activeRequest.status !== "pending" && (
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
              <View className="flex-1">
                <Text className="text-white font-semibold">Technician assigned</Text>
                <Text className="text-slate-400 text-sm">
                  {activeRequest.technicianName} is on the way
                </Text>
              </View>
            </View>
          )}
          
          {["enroute", "arrived", "inprogress", "completed"].includes(activeRequest.status) && (
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-purple-500 rounded-full mr-3" />
              <View className="flex-1">
                <Text className="text-white font-semibold">En route to location</Text>
                <Text className="text-slate-400 text-sm">
                  ETA: {activeRequest.estimatedTime} minutes
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-4">
        {activeRequest.status === "completed" ? (
          <TouchableOpacity
            onPress={() => setCurrentView("main")}
            className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold">Service Complete</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity className="bg-slate-700/50 border border-white/10 rounded-xl py-4 items-center">
              <Text className="text-white font-semibold">Share Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleCancelRequest(activeRequest.id)}
              className="bg-red-500/20 border border-red-500/30 rounded-xl py-4 items-center"
            >
              <Text className="text-red-400 font-semibold">Cancel Service</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// Service History View
export function renderServiceHistory(
  serviceRequests: any[],
  setCurrentView: (view: string) => void,
  getStatusColor: (status: string) => string
) {
  return (
    <ScrollView className="flex-1 bg-slate-900/30 px-4 pb-24">
      {/* Header */}
      <View className="flex-row items-center justify-between py-6">
        <TouchableOpacity
          onPress={() => setCurrentView("main")}
          className="w-10 h-10 bg-slate-800/80 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Service History</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row bg-slate-800/50 rounded-xl p-1 mb-6">
        <TouchableOpacity className="flex-1 bg-red-500 rounded-lg py-3 items-center">
          <Text className="text-white font-semibold">All</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-slate-400 font-semibold">Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-slate-400 font-semibold">Cancelled</Text>
        </TouchableOpacity>
      </View>

      {/* Service History List */}
      <View className="gap-4">
        {serviceRequests.map((request) => (
          <View
            key={request.id}
            className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">
                  {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Service
                </Text>
                <Text className="text-slate-400 text-sm">
                  {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-lg ${getStatusColor(request.status)}`}>
                <Text className="text-xs font-semibold uppercase">
                  {request.status}
                </Text>
              </View>
            </View>

            <View className="bg-white/5 rounded-xl p-4 mb-4">
              <Text className="text-slate-400 text-sm mb-1">Location</Text>
              <Text className="text-white font-semibold">
                {request.location.address}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-slate-400 text-sm">Total Cost</Text>
                <Text className="text-white font-bold">${request.estimatedCost}</Text>
              </View>
              {request.status === "completed" && (
                <TouchableOpacity className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
                  <Text className="text-blue-400 font-semibold">Rate Service</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {serviceRequests.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-400 text-lg mb-4">No service history</Text>
          <TouchableOpacity
            onPress={() => setCurrentView("booking")}
            className="bg-red-500 rounded-xl px-6 py-3"
          >
            <Text className="text-white font-semibold">Book Your First Service</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// Profile View
export function renderProfile(
  user: any,
  setCurrentView: (view: string) => void,
  handleSignOut: () => void
) {
  return (
    <ScrollView className="flex-1 bg-slate-900/30 px-4 pb-24">
      {/* Header */}
      <View className="flex-row items-center justify-between py-6">
        <TouchableOpacity
          onPress={() => setCurrentView("main")}
          className="w-10 h-10 bg-slate-800/80 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Profile</Text>
        <TouchableOpacity className="w-10 h-10 bg-slate-800/80 rounded-xl items-center justify-center">
          <Settings size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Profile Header */}
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-full items-center justify-center mb-4">
            <User size={32} color="white" />
          </View>
          <Text className="text-white text-xl font-bold mb-1">{user.name}</Text>
          <Text className="text-slate-400">{user.email}</Text>
          <View className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-lg mt-2">
            <Text className="text-green-400 text-sm font-semibold">
              {user.membershipType} Member
            </Text>
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 bg-white/5 rounded-xl p-4 items-center">
            <Text className="text-white text-2xl font-bold mb-1">12</Text>
            <Text className="text-slate-400 text-xs">Services</Text>
          </View>
          <View className="flex-1 bg-white/5 rounded-xl p-4 items-center">
            <Text className="text-white text-2xl font-bold mb-1">4.9</Text>
            <Text className="text-slate-400 text-xs">Rating</Text>
          </View>
          <View className="flex-1 bg-white/5 rounded-xl p-4 items-center">
            <Text className="text-white text-2xl font-bold mb-1">$486</Text>
            <Text className="text-slate-400 text-xs">Saved</Text>
          </View>
        </View>
      </View>

      {/* Profile Options */}
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
        <Text className="text-white text-lg font-bold mb-4">Account Settings</Text>

        <View className="gap-4">
          <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
            <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-4">
              <User size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Personal Information</Text>
              <Text className="text-slate-400 text-sm">Update your profile details</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentView("payment")}
            className="flex-row items-center p-4 bg-white/5 rounded-xl"
          >
            <View className="w-10 h-10 bg-green-500/20 rounded-lg items-center justify-center mr-4">
              <CreditCard size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Payment Methods</Text>
              <Text className="text-slate-400 text-sm">Manage your payment options</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
            <View className="w-10 h-10 bg-purple-500/20 rounded-lg items-center justify-center mr-4">
              <Bell size={20} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Notifications</Text>
              <Text className="text-slate-400 text-sm">Configure alert preferences</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
            <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center mr-4">
              <Shield size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Privacy & Security</Text>
              <Text className="text-slate-400 text-sm">Manage your privacy settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Support Section */}
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
        <Text className="text-white text-lg font-bold mb-4">Support</Text>

        <View className="gap-4">
          <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
            <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-4">
              <MessageCircle size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Help Center</Text>
              <Text className="text-slate-400 text-sm">Get answers to common questions</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-white/5 rounded-xl">
            <View className="w-10 h-10 bg-green-500/20 rounded-lg items-center justify-center mr-4">
              <Phone size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Contact Support</Text>
              <Text className="text-slate-400 text-sm">Speak with our support team</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500/20 border border-red-500/30 rounded-xl py-4 items-center"
      >
        <Text className="text-red-400 font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Payment Methods View
export function renderPaymentMethods(
  setCurrentView: (view: string) => void
) {
  const paymentMethods = [
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      isDefault: true,
    },
    {
      id: "2",
      type: "card",
      last4: "8888",
      brand: "Mastercard",
      isDefault: false,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-900/30 px-4 pb-24">
      {/* Header */}
      <View className="flex-row items-center justify-between py-6">
        <TouchableOpacity
          onPress={() => setCurrentView("profile")}
          className="w-10 h-10 bg-slate-800/80 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Payment Methods</Text>
        <TouchableOpacity className="w-10 h-10 bg-slate-800/80 rounded-xl items-center justify-center">
          <Text className="text-red-400 font-bold">+</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Methods List */}
      <View className="gap-4 mb-6">
        {paymentMethods.map((method) => (
          <View
            key={method.id}
            className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl items-center justify-center mr-4">
                  <CreditCard size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">
                    {method.brand} ΓÇóΓÇóΓÇóΓÇó {method.last4}
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    Expires 12/25
                  </Text>
                </View>
              </View>
              {method.isDefault && (
                <View className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-lg">
                  <Text className="text-green-400 text-xs font-semibold">Default</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Add Payment Method */}
      <TouchableOpacity className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center justify-center">
          <Text className="text-red-400 font-bold text-2xl mr-3">+</Text>
          <Text className="text-white font-semibold">Add Payment Method</Text>
        </View>
      </TouchableOpacity>

      {/* Payment Options */}
      <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <Text className="text-white text-lg font-bold mb-4">Payment Options</Text>

        <View className="gap-4">
          <View className="flex-row items-center p-4 bg-white/5 rounded-xl">
            <View className="w-10 h-10 bg-green-500/20 rounded-lg items-center justify-center mr-4">
              <DollarSign size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Pay on Arrival</Text>
              <Text className="text-slate-400 text-sm">Cash or card payment to technician</Text>
            </View>
          </View>

          <View className="flex-row items-center p-4 bg-white/5 rounded-xl">
            <View className="w-10 h-10 bg-blue-500/20 rounded-lg items-center justify-center mr-4">
              <CreditCard size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Auto-Pay</Text>
              <Text className="text-slate-400 text-sm">Automatically charge default payment method</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
