import React, { useState, useEffect, useMemo, useCallback } from "react";
import designSystem from "../styles/MobileDesignSystem";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
} from "./responsive/ResponsiveComponents";
import { MapPin, Users, Truck, AlertCircle, Zap } from "lucide-react-native";

interface MapMarker {
  id: string;
  type: "technician" | "customer" | "coverage";
  latitude: number;
  longitude: number;
  status: "active" | "busy" | "offline" | "emergency";
  name: string;
  details?: string;
}

interface LiveServiceMapProps {
  height?: number;
  showControls?: boolean;
  onMarkerSelect?: (markerId: string | null) => void;
}

const LiveServiceMap: React.FC<LiveServiceMapProps> = React.memo(
  ({ height = 600, showControls = true, onMarkerSelect }) => {
    const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(
      null,
    );
    const [mapView, setMapView] = useState<"satellite" | "street">("street");
    const [filterType, setFilterType] = useState<
      "all" | "technician" | "customer"
    >("all");

    // Mock data for demonstration
    const [markers, setMarkers] = useState<MapMarker[]>([
      {
        id: "1",
        type: "technician",
        latitude: 40.7128,
        longitude: -74.006,
        status: "active",
        name: "Mike Johnson",
        details: "Available - Battery Jump",
      },
      {
        id: "2",
        type: "technician",
        latitude: 40.7589,
        longitude: -73.9851,
        status: "busy",
        name: "Sarah Chen",
        details: "En Route - Tire Change",
      },
      {
        id: "3",
        type: "customer",
        latitude: 40.7505,
        longitude: -73.9934,
        status: "emergency",
        name: "Emergency Request",
        details: "Vehicle Breakdown - Highway",
      },
      {
        id: "4",
        type: "customer",
        latitude: 40.7282,
        longitude: -73.7949,
        status: "active",
        name: "John Smith",
        details: "Lockout Service",
      },
      {
        id: "5",
        type: "technician",
        latitude: 40.6892,
        longitude: -74.0445,
        status: "offline",
        name: "David Wilson",
        details: "Off Duty",
      },
    ]);

    const getMarkerColor = (marker: MapMarker) => {
      if (marker.type === "technician") {
        switch (marker.status) {
          case "active":
            return "#10B981";
          case "busy":
            return "#F59E0B";
          case "offline":
            return "#6B7280";
          default:
            return "#3B82F6";
        }
      } else {
        switch (marker.status) {
          case "emergency":
            return "#EF4444";
          case "active":
            return "#8B5CF6";
          default:
            return "#3B82F6";
        }
      }
    };

    const getMarkerIcon = (marker: MapMarker) => {
      if (marker.type === "technician") {
        return <Truck size={16} color="white" />;
      } else if (marker.status === "emergency") {
        return <AlertCircle size={16} color="white" />;
      } else {
        return <MapPin size={16} color="white" />;
      }
    };

    const filteredMarkers = markers.filter((marker) => {
      if (filterType === "all") return true;
      return marker.type === filterType;
    });

    const stats = {
      activeTechnicians: markers.filter(
        (m) => m.type === "technician" && m.status === "active",
      ).length,
      busyTechnicians: markers.filter(
        (m) => m.type === "technician" && m.status === "busy",
      ).length,
      activeRequests: markers.filter(
        (m) => m.type === "customer" && m.status === "active",
      ).length,
      emergencyRequests: markers.filter(
        (m) => m.type === "customer" && m.status === "emergency",
      ).length,
    };

    return (
      <View style={[styles.container, { height }]}>
        {/* Map Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Live Service Map</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.statText}>
                {stats.activeTechnicians} Available
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.statText}>{stats.busyTechnicians} Busy</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#8B5CF6" }]} />
              <Text style={styles.statText}>
                {stats.activeRequests} Requests
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.statText}>
                {stats.emergencyRequests} Emergency
              </Text>
            </View>
          </View>
        </View>

        {/* Map Controls */}
        {showControls && (
          <View style={styles.controls}>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === "all" && styles.activeFilter,
                ]}
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setFilterType("all")}
               accessibilityRole="button" accessibilityLabel="Interactive button">
                <Text
                  style={[
                    styles.filterText,
                    filterType === "all" && styles.activeFilterText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === "technician" && styles.activeFilter,
                ]}
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setFilterType("technician")}
               accessibilityRole="button" accessibilityLabel="Interactive button">
                <Truck
                  size={16}
                  color={filterType === "technician" ? "#fff" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.filterText,
                    filterType === "technician" && styles.activeFilterText,
                  ]}
                >
                  Technicians
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === "customer" && styles.activeFilter,
                ]}
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setFilterType("customer")}
               accessibilityRole="button" accessibilityLabel="Interactive button">
                <Users
                  size={16}
                  color={filterType === "customer" ? "#fff" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.filterText,
                    filterType === "customer" && styles.activeFilterText,
                  ]}
                >
                  Customers
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button">
                setMapView(mapView === "street" ? "satellite" : "street")
              }
             accessibilityRole="button" accessibilityLabel="Interactive button">
              <Text style={styles.viewToggleText}>
                {mapView === "street" ? "Satellite" : "Street"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {/* Simulated Map Background */}
          <View
            style={[
              styles.mapBackground,
              {
                backgroundColor:
                  mapView === "satellite" ? "#2D3748" : "#F7FAFC",
              },
            ]}
          >
            {/* Grid Lines for Street View */}
            {mapView === "street" && (
              <View style={styles.gridContainer}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={`h-${i}`}
                    style={[
                      styles.gridLine,
                      { top: `${i * 10}%`, width: "100%", height: 1 },
                    ]}
                  />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={`v-${i}`}
                    style={[
                      styles.gridLine,
                      { left: `${i * 10}%`, height: "100%", width: 1 },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Map Markers */}
            {filteredMarkers.map((marker, index) => (
              <TouchableOpacity
                key={marker.id}
                style={[
                  styles.marker,
                  {
                    backgroundColor: getMarkerColor(marker),
                    left: `${20 + ((index * 15) % 60)}%`,
                    top: `${20 + ((index * 12) % 60)}%`,
                    transform:
                      selectedMarker?.id === marker.id
                        ? [{ scale: 1.2 }]
                        : [{ scale: 1 }],
                  },
                ]}
                onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> {
                  const newSelectedMarker =
                    selectedMarker?.id === marker.id ? null : marker;
                  setSelectedMarker(newSelectedMarker);
                  onMarkerSelect?.(newSelectedMarker?.id || null);
                }}
               accessibilityRole="button" accessibilityLabel="Interactive button">
                {getMarkerIcon(marker)}
                {marker.status === "emergency" && (
                  <View style={styles.pulseRing}>
                    <View style={styles.pulseRingInner} />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Coverage Areas */}
            <View style={styles.coverageArea1} />
            <View style={styles.coverageArea2} />
          </View>

          {/* Marker Details Panel */}
          {selectedMarker && (
            <View style={styles.detailsPanel}>
              <View style={styles.detailsHeader}>
                <View style={styles.detailsIcon}>
                  {getMarkerIcon(selectedMarker)}
                </View>
                <View style={styles.detailsInfo}>
                  <Text style={styles.detailsName}>{selectedMarker.name}</Text>
                  <Text style={styles.detailsType}>
                    {selectedMarker.type === "technician"
                      ? "Technician"
                      : "Customer Request"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() = accessibilityRole="button" accessibilityLabel="Interactive button"> setSelectedMarker(null)}
                 accessibilityRole="button" accessibilityLabel="Interactive button">
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.detailsDescription}>
                {selectedMarker.details}
              </Text>
              <View style={styles.detailsActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryAction]}
                >
                  <Text
                    style={[styles.actionButtonText, styles.primaryActionText]}
                  >
                    Track
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Real-time Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Updates</Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  activeFilter: {
    backgroundColor: "#3B82F6",
  },
  filterText: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  viewToggleText: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapBackground: {
    flex: 1,
    position: "relative",
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "#E5E7EB",
    opacity: 0.3,
  },
  marker: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pulseRing: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EF4444",
    opacity: 0.3,
    top: -8,
    left: -8,
  },
  pulseRingInner: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EF4444",
    opacity: 0.1,
    top: -8,
    left: -8,
  },
  coverageArea1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#10B981",
    opacity: 0.1,
    top: "30%",
    left: "20%",
  },
  coverageArea2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3B82F6",
    opacity: 0.1,
    top: "60%",
    right: "25%",
  },
  detailsPanel: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailsInfo: {
    flex: 1,
  },
  detailsName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  detailsType: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  detailsDescription: {
    fontSize: 12,
    color: "#D1D5DB",
    marginBottom: 12,
  },
  detailsActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#4B5563",
    alignItems: "center",
  },
  primaryAction: {
    backgroundColor: "#3B82F6",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  primaryActionText: {
    color: "#FFFFFF",
  },
  liveIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#065F46",
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  liveText: {
    fontSize: 10,
    color: "#D1FAE5",
    fontWeight: "500",
  },
});

export default LiveServiceMap;
