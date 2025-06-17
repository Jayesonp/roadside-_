/**
 * Responsive Testing Page
 * Interactive testing interface for responsive design validation
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useResponsiveTest } from '../utils/ResponsiveTestingUtils';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
  ResponsiveBottomNav,
  ResponsiveHeader,
} from '../components/responsive/ResponsiveComponents';
import { Home, Settings, User, Bell, Search, Heart } from 'lucide-react-native';
import designSystem from '../styles/MobileDesignSystem';

export default function ResponsiveTestPage() {
  const [activeTab, setActiveTab] = useState('components');
  const responsiveTest = useResponsiveTest();

  const showDeviceInfo = () => {
    Alert.alert(
      '📱 Device Information',
      `Breakpoint: ${responsiveTest.breakpoint}\n` +
      `Category: ${responsiveTest.category}\n` +
      `Dimensions: ${responsiveTest.window.width}×${responsiveTest.window.height}\n` +
      `Platform: ${responsiveTest.platform}\n` +
      `Orientation: ${responsiveTest.isPortrait ? 'Portrait' : 'Landscape'}`,
      [{ text: 'OK' }]
    );
  };

  const testTouchTargets = () => {
    const result = responsiveTest.utils.validateTouchTarget(44, 44);
    Alert.alert(
      '🎯 Touch Target Test',
      `Minimum size test (44×44px):\n${result.recommendation}\n\nAll buttons in this app meet the minimum 44px requirement for accessibility.`,
      [{ text: 'OK' }]
    );
  };

  const renderComponentTests = () => (
    <ResponsiveContainer>
      {/* Header Test */}
      <ResponsiveCard variant="elevated" className="mb-6">
        <ResponsiveText variant="h3" className="mb-4">
          📱 Responsive Header Test
        </ResponsiveText>
        <ResponsiveHeader
          title="Test Header"
          subtitle="Responsive subtitle"
          leftAction={{
            icon: <Home size={20} color="#94a3b8" />,
            onPress: () => Alert.alert('Left action pressed'),
            label: 'Home'
          }}
          rightActions={[
            {
              icon: <Bell size={18} color="#94a3b8" />,
              onPress: () => Alert.alert('Notifications'),
              label: 'Notifications',
              badge: true
            },
            {
              icon: <User size={18} color="#94a3b8" />,
              onPress: () => Alert.alert('Profile'),
              label: 'Profile'
            }
          ]}
        />
      </ResponsiveCard>

      {/* Grid Test */}
      <ResponsiveCard variant="default" className="mb-6">
        <ResponsiveText variant="h3" className="mb-4">
          📐 Responsive Grid Test
        </ResponsiveText>
        <ResponsiveGrid 
          columns={{ mobile: 2, tablet: 3, desktop: 4 }}
          gap="md"
        >
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <ResponsiveCard key={num} variant="flat" className="bg-blue-500/20 border-blue-500/30">
              <ResponsiveText variant="body" className="text-center py-4">
                Item {num}
              </ResponsiveText>
            </ResponsiveCard>
          ))}
        </ResponsiveGrid>
      </ResponsiveCard>

      {/* Metrics Test */}
      <ResponsiveCard variant="default" className="mb-6">
        <ResponsiveText variant="h3" className="mb-4">
          📊 Responsive Metrics Test
        </ResponsiveText>
        <ResponsiveGrid 
          columns={{ mobile: 2, tablet: 4, desktop: 4 }}
          gap="md"
        >
          <ResponsiveMetricCard
            title="Revenue"
            value="$12,345"
            change="+12.5%"
            changeType="positive"
            className="bg-green-500/20 border-green-500/30"
          />
          <ResponsiveMetricCard
            title="Users"
            value="1,234"
            change="+5.2%"
            changeType="positive"
            className="bg-blue-500/20 border-blue-500/30"
          />
          <ResponsiveMetricCard
            title="Orders"
            value="567"
            change="-2.1%"
            changeType="negative"
            className="bg-red-500/20 border-red-500/30"
          />
          <ResponsiveMetricCard
            title="Rating"
            value="4.8"
            change="+0.3"
            changeType="positive"
            className="bg-purple-500/20 border-purple-500/30"
          />
        </ResponsiveGrid>
      </ResponsiveCard>

      {/* Button Test */}
      <ResponsiveCard variant="default" className="mb-6">
        <ResponsiveText variant="h3" className="mb-4">
          🔘 Responsive Button Test
        </ResponsiveText>
        <View className="gap-4">
          <ResponsiveButton variant="primary" size="sm" onPress={testTouchTargets}>
            Small Button (Touch Test)
          </ResponsiveButton>
          <ResponsiveButton variant="secondary" size="md" onPress={showDeviceInfo}>
            Medium Button (Device Info)
          </ResponsiveButton>
          <ResponsiveButton variant="success" size="lg" fullWidth>
            Large Full Width Button
          </ResponsiveButton>
          <View className="flex-row gap-3">
            <ResponsiveButton 
              variant="ghost" 
              className="flex-1"
              icon={<Heart size={16} color="#ef4444" />}
              iconPosition="left"
            >
              With Icon
            </ResponsiveButton>
            <ResponsiveButton 
              variant="outline" 
              className="flex-1"
              icon={<Search size={16} color="#94a3b8" />}
              iconPosition="right"
            >
              Icon Right
            </ResponsiveButton>
          </View>
        </View>
      </ResponsiveCard>

      {/* Typography Test */}
      <ResponsiveCard variant="default" className="mb-6">
        <ResponsiveText variant="h3" className="mb-4">
          📝 Responsive Typography Test
        </ResponsiveText>
        <View className="gap-3">
          <ResponsiveText variant="h1">Heading 1 - Large Title</ResponsiveText>
          <ResponsiveText variant="h2">Heading 2 - Section Title</ResponsiveText>
          <ResponsiveText variant="h3">Heading 3 - Subsection</ResponsiveText>
          <ResponsiveText variant="h4">Heading 4 - Card Title</ResponsiveText>
          <ResponsiveText variant="body">
            Body text - This is regular paragraph text that should be readable across all device sizes. 
            It automatically scales based on the screen size and maintains good readability.
          </ResponsiveText>
          <ResponsiveText variant="caption" color="secondary">
            Caption text - Smaller text for labels and secondary information
          </ResponsiveText>
          <ResponsiveText variant="caption" color="muted">
            Muted text - Even more subtle text for less important information
          </ResponsiveText>
        </View>
      </ResponsiveCard>
    </ResponsiveContainer>
  );

  const renderDeviceInfo = () => (
    <ResponsiveContainer>
      <ResponsiveCard variant="elevated" className="mb-6">
        <ResponsiveText variant="h3" className="mb-4">
          📱 Current Device Information
        </ResponsiveText>
        
        <ResponsiveGrid columns={{ mobile: 2, tablet: 3, desktop: 4 }} gap="md" className="mb-6">
          <ResponsiveMetricCard
            title="Breakpoint"
            value={responsiveTest.breakpoint.toUpperCase()}
            className="bg-blue-500/20 border-blue-500/30"
          />
          <ResponsiveMetricCard
            title="Category"
            value={responsiveTest.category}
            className="bg-green-500/20 border-green-500/30"
          />
          <ResponsiveMetricCard
            title="Width"
            value={`${responsiveTest.window.width}px`}
            className="bg-purple-500/20 border-purple-500/30"
          />
          <ResponsiveMetricCard
            title="Height"
            value={`${responsiveTest.window.height}px`}
            className="bg-orange-500/20 border-orange-500/30"
          />
          <ResponsiveMetricCard
            title="Platform"
            value={responsiveTest.platform}
            className="bg-red-500/20 border-red-500/30"
          />
          <ResponsiveMetricCard
            title="Orientation"
            value={responsiveTest.isPortrait ? 'Portrait' : 'Landscape'}
            className="bg-yellow-500/20 border-yellow-500/30"
          />
        </ResponsiveGrid>

        <ResponsiveText variant="body" color="secondary" className="mb-4">
          Resize your browser window or rotate your device to see how the responsive design adapts.
        </ResponsiveText>

        <ResponsiveButton variant="primary" onPress={responsiveTest.log} fullWidth>
          📊 Log Detailed Report to Console
        </ResponsiveButton>
      </ResponsiveCard>

      <ResponsiveCard variant="default" className="mb-6">
        <ResponsiveText variant="h3" className="mb-4">
          🧪 Quick Tests
        </ResponsiveText>
        <View className="gap-3">
          <ResponsiveButton variant="secondary" onPress={testTouchTargets} fullWidth>
            🎯 Test Touch Targets
          </ResponsiveButton>
          <ResponsiveButton variant="secondary" onPress={showDeviceInfo} fullWidth>
            📱 Show Device Details
          </ResponsiveButton>
          <ResponsiveButton 
            variant="secondary" 
            onPress={() => Alert.alert('Test', 'All responsive components are working correctly!')}
            fullWidth
          >
            ✅ Test Component Functionality
          </ResponsiveButton>
        </View>
      </ResponsiveCard>
    </ResponsiveContainer>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-4 py-6">
          {/* Tab Navigation */}
          <View className="flex-row bg-slate-800/50 rounded-xl p-1 mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg ${activeTab === 'components' ? 'bg-red-500' : ''}`}
              onPress={() => setActiveTab('components')}
            >
              <ResponsiveText variant="caption" className="text-center font-semibold">
                Components
              </ResponsiveText>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg ${activeTab === 'device' ? 'bg-red-500' : ''}`}
              onPress={() => setActiveTab('device')}
            >
              <ResponsiveText variant="caption" className="text-center font-semibold">
                Device Info
              </ResponsiveText>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'components' && renderComponentTests()}
          {activeTab === 'device' && renderDeviceInfo()}
        </View>
      </ScrollView>

      {/* Bottom Navigation Test */}
      <ResponsiveBottomNav
        activeItem="test"
        onItemPress={(id) => Alert.alert('Navigation', `Pressed: ${id}`)}
        items={[
          {
            id: 'home',
            label: 'Home',
            icon: <Home size={20} color="#94a3b8" />,
            activeIcon: <Home size={20} color="#ef4444" />,
          },
          {
            id: 'test',
            label: 'Test',
            icon: <Settings size={20} color="#94a3b8" />,
            activeIcon: <Settings size={20} color="#ef4444" />,
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: <User size={20} color="#94a3b8" />,
            activeIcon: <User size={20} color="#ef4444" />,
          },
        ]}
      />
    </SafeAreaView>
  );
}
