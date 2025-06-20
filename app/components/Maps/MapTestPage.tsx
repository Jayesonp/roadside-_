import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { ResponsiveContainer, ResponsiveText, ResponsiveButton, ResponsiveCard } from '../responsive/ResponsiveComponents';
import MapComponent from './MapComponent';
import { MapPin, Navigation, Target } from 'lucide-react-native';

export const MapTestPage: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState<{
    latitude: number;
    longitude: number;
    title: string;
    description: string;
  } | null>(null);

  // Sample locations in Georgetown, Guyana for testing
  const testLocations = [
    {
      id: 1,
      latitude: 6.8013,
      longitude: -58.1551,
      title: "Georgetown City Center",
      description: "Main Street, Georgetown",
      address: "Main Street, Georgetown, Guyana"
    },
    {
      id: 2,
      latitude: 6.8077,
      longitude: -58.1578,
      title: "Stabroek Market",
      description: "Historic market in Georgetown",
      address: "Water Street, Georgetown, Guyana"
    },
    {
      id: 3,
      latitude: 6.8045,
      longitude: -58.1432,
      title: "University of Guyana",
      description: "Turkeyen Campus",
      address: "Turkeyen, Greater Georgetown, Guyana"
    },
    {
      id: 4,
      latitude: 6.7834,
      longitude: -58.1234,
      title: "Cheddi Jagan International Airport",
      description: "Main airport serving Georgetown",
      address: "Timehri, East Bank Demerara, Guyana"
    }
  ];

  const handleLocationSelect = (location: typeof testLocations[0]) => {
    setSelectedDestination({
      latitude: location.latitude,
      longitude: location.longitude,
      title: location.title,
      description: location.description
    });
  };

  const handleNavigationComplete = () => {
    Alert.alert(
      "Navigation Started",
      "External navigation app has been opened with the destination.",
      [{ text: "OK" }]
    );
  };

  const clearDestination = () => {
    setSelectedDestination(null);
  };

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <ResponsiveContainer>
        {/* Header */}
        <View className="py-6">
          <ResponsiveText variant="h2" className="mb-2">
            Maps & Navigation Test
          </ResponsiveText>
          <ResponsiveText variant="body" color="secondary">
            Test Google Maps integration and navigation functionality
          </ResponsiveText>
        </View>

        {/* Map Component */}
        <ResponsiveCard variant="elevated" className="mb-6">
          <ResponsiveText variant="h4" className="mb-4">
            Interactive Map
          </ResponsiveText>
          
          <MapComponent
            destination={selectedDestination || undefined}
            showCurrentLocation={true}
            height={300}
            onNavigate={handleNavigationComplete}
          />
          
          {selectedDestination && (
            <View className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
              <ResponsiveText variant="body" className="font-semibold text-blue-400 mb-1">
                Selected Destination:
              </ResponsiveText>
              <ResponsiveText variant="body" className="mb-1">
                {selectedDestination.title}
              </ResponsiveText>
              <ResponsiveText variant="caption" color="secondary">
                {selectedDestination.description}
              </ResponsiveText>
              
              <ResponsiveButton
                variant="ghost"
                size="sm"
                onPress={clearDestination}
                className="mt-3 bg-white/10"
              >
                Clear Destination
              </ResponsiveButton>
            </View>
          )}
        </ResponsiveCard>

        {/* Test Locations */}
        <ResponsiveCard variant="default" className="mb-6">
          <ResponsiveText variant="h4" className="mb-4">
            Test Locations
          </ResponsiveText>
          <ResponsiveText variant="body" color="secondary" className="mb-4">
            Select a location to test navigation functionality
          </ResponsiveText>
          
          <View className="space-y-3">
            {testLocations.map((location) => (
              <View
                key={location.id}
                className={`p-4 rounded-xl border ${
                  selectedDestination?.latitude === location.latitude
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <ResponsiveText variant="body" className="font-semibold mb-1">
                      {location.title}
                    </ResponsiveText>
                    <ResponsiveText variant="caption" color="secondary" className="mb-2">
                      {location.description}
                    </ResponsiveText>
                    <ResponsiveText variant="caption" color="secondary">
                      📍 {location.address}
                    </ResponsiveText>
                  </View>
                  
                  <ResponsiveButton
                    variant={selectedDestination?.latitude === location.latitude ? "success" : "primary"}
                    size="sm"
                    onPress={() => handleLocationSelect(location)}
                    icon={
                      selectedDestination?.latitude === location.latitude 
                        ? <Target size={16} color="white" />
                        : <MapPin size={16} color="white" />
                    }
                  >
                    {selectedDestination?.latitude === location.latitude ? "Selected" : "Select"}
                  </ResponsiveButton>
                </View>
              </View>
            ))}
          </View>
        </ResponsiveCard>

        {/* Navigation Instructions */}
        <ResponsiveCard variant="default" className="mb-6">
          <ResponsiveText variant="h4" className="mb-4">
            How to Test Navigation
          </ResponsiveText>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <ResponsiveText variant="caption" className="text-white font-bold">1</ResponsiveText>
              </View>
              <View className="flex-1">
                <ResponsiveText variant="body" className="mb-1">Select a test location</ResponsiveText>
                <ResponsiveText variant="caption" color="secondary">
                  Choose from the predefined locations above
                </ResponsiveText>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <ResponsiveText variant="caption" className="text-white font-bold">2</ResponsiveText>
              </View>
              <View className="flex-1">
                <ResponsiveText variant="body" className="mb-1">View on map</ResponsiveText>
                <ResponsiveText variant="caption" color="secondary">
                  The location will appear as a red marker on the map
                </ResponsiveText>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <ResponsiveText variant="caption" className="text-white font-bold">3</ResponsiveText>
              </View>
              <View className="flex-1">
                <ResponsiveText variant="body" className="mb-1">Test navigation</ResponsiveText>
                <ResponsiveText variant="caption" color="secondary">
                  Tap the "Navigate" button to open in Google Maps or Apple Maps
                </ResponsiveText>
              </View>
            </View>
          </View>
        </ResponsiveCard>

        {/* API Key Setup Instructions */}
        <ResponsiveCard variant="default" className="mb-6 bg-yellow-500/10 border-yellow-500/30">
          <ResponsiveText variant="h4" className="mb-4 text-yellow-400">
            ⚠️ Setup Required
          </ResponsiveText>
          
          <ResponsiveText variant="body" className="mb-3">
            To fully test Google Maps functionality, you need to:
          </ResponsiveText>
          
          <View className="space-y-2 mb-4">
            <ResponsiveText variant="caption" color="secondary">
              • Get a Google Maps API key from Google Cloud Console
            </ResponsiveText>
            <ResponsiveText variant="caption" color="secondary">
              • Replace "YOUR_IOS_GOOGLE_MAPS_API_KEY" in app.json
            </ResponsiveText>
            <ResponsiveText variant="caption" color="secondary">
              • Replace "YOUR_ANDROID_GOOGLE_MAPS_API_KEY" in app.json
            </ResponsiveText>
            <ResponsiveText variant="caption" color="secondary">
              • Rebuild the app with expo build or expo run
            </ResponsiveText>
          </View>
          
          <ResponsiveText variant="caption" color="secondary">
            Without API keys, the map will show a basic view and navigation will use device default maps.
          </ResponsiveText>
        </ResponsiveCard>
      </ResponsiveContainer>
    </ScrollView>
  );
};

export default MapTestPage;
