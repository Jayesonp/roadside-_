import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Platform, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { ResponsiveButton } from '../responsive/ResponsiveComponents';
import { Navigation, MapPin } from 'lucide-react-native';

interface MapComponentProps {
  destination?: {
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
  };
  showCurrentLocation?: boolean;
  height?: number;
  onNavigate?: () => void;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  destination,
  showCurrentLocation = true,
  height = 300,
  onNavigate
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationPermission(true);
        await getCurrentLocation();
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use navigation features.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      // Fallback to Georgetown, Guyana coordinates
      setCurrentLocation({
        latitude: 6.8013,
        longitude: -58.1551,
      });
    }
  };

  const handleNavigateToDestination = async () => {
    if (!destination) return;

    const destinationString = `${destination.latitude},${destination.longitude}`;
    
    try {
      // Try to open in Google Maps first
      const googleMapsUrl = Platform.select({
        ios: `comgooglemaps://?daddr=${destinationString}&directionsmode=driving`,
        android: `google.navigation:q=${destinationString}&mode=d`,
      });

      // Fallback URLs
      const fallbackUrl = Platform.select({
        ios: `maps:0,0?q=${destinationString}`,
        android: `geo:0,0?q=${destinationString}`,
        default: `https://maps.google.com/?q=${destinationString}`,
      });

      // Try Google Maps first, then fallback
      if (googleMapsUrl) {
        const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
        if (canOpenGoogleMaps) {
          await Linking.openURL(googleMapsUrl);
          onNavigate?.();
          return;
        }
      }

      // Use fallback
      if (fallbackUrl) {
        const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
        if (canOpenFallback) {
          await Linking.openURL(fallbackUrl);
          onNavigate?.();
        } else {
          throw new Error('No navigation app available');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to open navigation app. Please ensure you have Google Maps or Apple Maps installed.',
        [{ text: 'OK' }]
      );
    }
  };

  const getMapRegion = () => {
    if (destination && currentLocation) {
      // Calculate region to show both current location and destination
      const latDelta = Math.abs(destination.latitude - currentLocation.latitude) * 1.5;
      const lngDelta = Math.abs(destination.longitude - currentLocation.longitude) * 1.5;
      
      return {
        latitude: (destination.latitude + currentLocation.latitude) / 2,
        longitude: (destination.longitude + currentLocation.longitude) / 2,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01),
      };
    } else if (destination) {
      return {
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else {
      // Default to Georgetown, Guyana
      return {
        latitude: 6.8013,
        longitude: -58.1551,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
  };

  if (isLoading) {
    return (
      <View 
        className="bg-slate-800 rounded-xl items-center justify-center"
        style={{ height }}
      >
        <Text className="text-white text-lg">Loading map...</Text>
      </View>
    );
  }

  if (!locationPermission) {
    return (
      <View 
        className="bg-slate-800 rounded-xl p-4 items-center justify-center"
        style={{ height }}
      >
        <MapPin size={48} color="#94a3b8" />
        <Text className="text-white text-lg font-semibold mb-2">Location Access Required</Text>
        <Text className="text-slate-400 text-center mb-4">
          Enable location services to view maps and navigation
        </Text>
        <ResponsiveButton
          variant="primary"
          size="sm"
          onPress={requestLocationPermission}
        >
          Enable Location
        </ResponsiveButton>
      </View>
    );
  }

  return (
    <View className="rounded-xl overflow-hidden" style={{ height }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        region={getMapRegion()}
        showsUserLocation={showCurrentLocation && locationPermission}
        showsMyLocationButton={true}
        showsTraffic={true}
        showsBuildings={true}
        mapType="standard"
      >
        {/* Current Location Marker */}
        {currentLocation && showCurrentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="Current position"
            pinColor="blue"
          />
        )}
        
        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title={destination.title}
            description={destination.description}
            pinColor="red"
          />
        )}
      </MapView>
      
      {/* Navigation Button */}
      {destination && (
        <View className="absolute bottom-4 right-4">
          <ResponsiveButton
            variant="primary"
            size="sm"
            onPress={handleNavigateToDestination}
            icon={<Navigation size={16} color="white" />}
            className="bg-blue-600 shadow-lg"
          >
            Navigate
          </ResponsiveButton>
        </View>
      )}
    </View>
  );
};

export default MapComponent;
