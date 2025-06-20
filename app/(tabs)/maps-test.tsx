import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapTestPage from '../components/Maps/MapTestPage';

export default function MapsTestScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      <View className="flex-1">
        <MapTestPage />
      </View>
    </SafeAreaView>
  );
}
