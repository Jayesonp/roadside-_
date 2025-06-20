import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  Eye,
  Edit,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react-native";

interface EmergencyRequest {
  id: string;
  user: {
    name: string;
    avatar: string;
    membershipType: string;
  };
  serviceType: string;
  location: string;
  status: "In Progress" | "Assigned" | "Completed" | "Cancelled" | "Pending";
  time: string;
  timestamp: number; // For sorting
}

interface EmergencyRequestsTableProps {
  requests?: EmergencyRequest[];
  selectedMarkerId?: string | null;
  onViewRequest?: (id: string) => void;
  onEditRequest?: (id: string) => void;
  onExportData?: (format: "csv" | "pdf") => void;
}

type SortField = "user" | "serviceType" | "location" | "status" | "time";
type SortDirection = "asc" | "desc";

const EmergencyRequestsTable = ({
  requests = [
    {
      id: "1",
      user: {
        name: "Sarah Mitchell",
        avatar: "SM",
        membershipType: "Premium Member",
      },
      serviceType: "Battery Jump Start",
      location: "Downtown Area",
      status: "In Progress",
      time: "15 min ago",
      timestamp: Date.now() - 15 * 60 * 1000,
    },
    {
      id: "2",
      user: {
        name: "Mike Johnson",
        avatar: "MJ",
        membershipType: "Standard Member",
      },
      serviceType: "Towing Service",
      location: "Highway 101",
      status: "Assigned",
      time: "32 min ago",
      timestamp: Date.now() - 32 * 60 * 1000,
    },
    {
      id: "3",
      user: {
        name: "Emily Wilson",
        avatar: "EW",
        membershipType: "Premium Member",
      },
      serviceType: "Lockout Service",
      location: "Mall Parking",
      status: "Completed",
      time: "1 hour ago",
      timestamp: Date.now() - 60 * 60 * 1000,
    },
    {
      id: "4",
      user: {
        name: "David Brown",
        avatar: "DB",
        membershipType: "Standard Member",
      },
      serviceType: "Flat Tire Repair",
      location: "Main Street",
      status: "Pending",
      time: "5 min ago",
      timestamp: Date.now() - 5 * 60 * 1000,
    },
    {
      id: "5",
      user: {
        name: "Lisa Garcia",
        avatar: "LG",
        membershipType: "Premium Member",
      },
      serviceType: "Fuel Delivery",
      location: "Oak Avenue",
      status: "In Progress",
      time: "45 min ago",
      timestamp: Date.now() - 45 * 60 * 1000,
    },
    {
      id: "6",
      user: {
        name: "Robert Taylor",
        avatar: "RT",
        membershipType: "Standard Member",
      },
      serviceType: "Battery Jump Start",
      location: "Shopping Center",
      status: "Cancelled",
      time: "2 hours ago",
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
    },
  ],
  selectedMarkerId,
  onViewRequest = () => {},
  onEditRequest = () => {},
  onExportData = () => {},
}: EmergencyRequestsTableProps) => {
  const [timeFilter, setTimeFilter] = useState("Last 24 Hours");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-900/20 text-blue-400";
      case "Assigned":
        return "bg-green-900/20 text-green-400";
      case "Completed":
        return "bg-green-900/20 text-green-400";
      case "Cancelled":
        return "bg-red-900/20 text-red-400";
      case "Pending":
        return "bg-yellow-900/20 text-yellow-400";
      default:
        return "bg-gray-900/20 text-gray-400";
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} color="#94a3b8" />
    ) : (
      <ChevronDown size={14} color="#94a3b8" />
    );
  };

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests;

    // Apply marker-based filter
    if (selectedMarkerId) {
      // Filter requests based on selected marker ID
      // For demo purposes, we'll filter by the first character of the request ID matching the marker ID
      filtered = filtered.filter(
        (request) =>
          request.id === selectedMarkerId ||
          request.user.name
            .toLowerCase()
            .includes(selectedMarkerId.toLowerCase()) ||
          request.serviceType
            .toLowerCase()
            .includes(selectedMarkerId.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "All Status") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "user":
          aValue = a.user.name.toLowerCase();
          bValue = b.user.name.toLowerCase();
          break;
        case "serviceType":
          aValue = a.serviceType.toLowerCase();
          bValue = b.serviceType.toLowerCase();
          break;
        case "location":
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "time":
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [requests, selectedMarkerId, statusFilter, sortField, sortDirection]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedRequests.slice(startIndex, endIndex);
  }, [filteredAndSortedRequests, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <View className="bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-3xl p-6 w-full">
      {/* Table Header */}
      <View className="flex flex-row justify-between items-center mb-5 flex-wrap">
        <View>
          <Text className="text-white text-xl font-semibold">
            Emergency Requests
          </Text>
          {selectedMarkerId && (
            <Text className="text-blue-400 text-sm mt-1">
              Filtered by marker: {selectedMarkerId}
            </Text>
          )}
        </View>

        <View className="flex flex-row gap-3 flex-wrap">
          {/* Time Filter */}
          <View className="relative">
            <TouchableOpacity
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 flex flex-row items-center"
              onPress={() => {}}
            >
              <Text className="text-gray-300 text-sm mr-2">{timeFilter}</Text>
              <ChevronDown size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Status Filter */}
          <View className="relative">
            <TouchableOpacity
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 flex flex-row items-center"
              onPress={() => {}}
            >
              <Text className="text-gray-300 text-sm mr-2">{statusFilter}</Text>
              <ChevronDown size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Export Buttons */}
          <TouchableOpacity
            className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 flex flex-row items-center"
            onPress={() => onExportData("csv")}
          >
            <Download size={16} color="#22c55e" />
            <Text className="text-green-400 text-sm ml-2">CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 flex flex-row items-center"
            onPress={() => onExportData("pdf")}
          >
            <Download size={16} color="#ef4444" />
            <Text className="text-red-400 text-sm ml-2">PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Content */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: 800 }}>
          {/* Table Headers */}
          <View className="flex flex-row border-b border-white/5 pb-3">
            <TouchableOpacity
              className="flex-1 min-w-[200px] flex-row items-center"
              onPress={() => handleSort("user")}
            >
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                User
              </Text>
              {getSortIcon("user")}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 min-w-[120px] flex-row items-center"
              onPress={() => handleSort("serviceType")}
            >
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Service Type
              </Text>
              {getSortIcon("serviceType")}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 min-w-[120px] flex-row items-center"
              onPress={() => handleSort("location")}
            >
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Location
              </Text>
              {getSortIcon("location")}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 min-w-[100px] flex-row items-center"
              onPress={() => handleSort("status")}
            >
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Status
              </Text>
              {getSortIcon("status")}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 min-w-[100px] flex-row items-center"
              onPress={() => handleSort("time")}
            >
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Time
              </Text>
              {getSortIcon("time")}
            </TouchableOpacity>
            <View className="w-[100px]">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Actions
              </Text>
            </View>
          </View>

          {/* Table Rows */}
          {paginatedRequests.map((request) => (
            <View
              key={request.id}
              className="flex flex-row border-b border-white/5 py-4 hover:bg-white/5"
            >
              {/* User */}
              <View className="flex-1 min-w-[200px] flex flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <Text className="text-white text-xs font-semibold">
                    {request.user.avatar}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-100 font-medium">
                    {request.user.name}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {request.user.membershipType}
                  </Text>
                </View>
              </View>

              {/* Service Type */}
              <View className="flex-1 min-w-[120px] justify-center">
                <Text className="text-gray-100">{request.serviceType}</Text>
              </View>

              {/* Location */}
              <View className="flex-1 min-w-[120px] justify-center">
                <Text className="text-gray-400">{request.location}</Text>
              </View>

              {/* Status */}
              <View className="flex-1 min-w-[100px] justify-center">
                <View
                  className={`px-2 py-1 rounded-md self-start ${getStatusColor(request.status)}`}
                >
                  <Text className="text-xs font-semibold uppercase">
                    {request.status}
                  </Text>
                </View>
              </View>

              {/* Time */}
              <View className="flex-1 min-w-[100px] justify-center">
                <Text className="text-gray-400">{request.time}</Text>
              </View>

              {/* Actions */}
              <View className="w-[100px] flex flex-row items-center gap-2">
                <TouchableOpacity
                  className="w-8 h-8 rounded-md bg-green-900/10 flex items-center justify-center"
                  onPress={() => onViewRequest(request.id)}
                >
                  <Eye size={16} color="#22c55e" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-8 h-8 rounded-md bg-blue-900/10 flex items-center justify-center"
                  onPress={() => onEditRequest(request.id)}
                >
                  <Edit size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Pagination */}
      {totalPages > 1 && (
        <View className="flex-row justify-between items-center mt-6 pt-4 border-t border-white/5">
          <View className="flex-row items-center">
            <Text className="text-gray-400 text-sm mr-4">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedRequests.length,
              )}{" "}
              of {filteredAndSortedRequests.length} requests
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className={`w-8 h-8 rounded-md flex items-center justify-center ${
                currentPage === 1
                  ? "bg-gray-800/50"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft
                size={16}
                color={currentPage === 1 ? "#6b7280" : "#94a3b8"}
              />
            </TouchableOpacity>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <TouchableOpacity
                key={page}
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentPage === page
                    ? "bg-blue-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                onPress={() => handlePageChange(page)}
              >
                <Text
                  className={`text-sm font-medium ${
                    currentPage === page ? "text-white" : "text-gray-300"
                  }`}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className={`w-8 h-8 rounded-md flex items-center justify-center ${
                currentPage === totalPages
                  ? "bg-gray-800/50"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight
                size={16}
                color={currentPage === totalPages ? "#6b7280" : "#94a3b8"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default EmergencyRequestsTable;
