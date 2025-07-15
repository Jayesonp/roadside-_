import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HamburgerMenu from './HamburgerMenu';
import { ResponsiveText } from './responsive/ResponsiveComponents';
import designSystem from '../styles/MobileDesignSystem';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
}

interface MobileHeaderProps {
  menuItems: MenuItem[];
  activeItem: string;
  onItemSelect: (itemId: string) => void;
  title?: string;
  subtitle?: string;
  brandName?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  menuItems,
  activeItem,
  onItemSelect,
  title,
  subtitle,
  brandName = "RoadSide+"
}) => {
  // Find the current active panel name
  const activePanel = menuItems.find(item => item.id === activeItem);
  const displayTitle = title || activePanel?.name || "Dashboard";

  return (
    <SafeAreaView edges={['top']} className="bg-slate-800 border-b border-white/10">
      <View className="flex-row items-center justify-between p-4">
        {/* Left side - Hamburger Menu */}
        <HamburgerMenu
          menuItems={menuItems}
          activeItem={activeItem}
          onItemSelect={onItemSelect}
          brandName={brandName}
        />

        {/* Center - Title and Subtitle */}
        <View className="flex-1 mx-4">
          <ResponsiveText className="text-white text-lg font-bold text-center">
            {displayTitle}
          </ResponsiveText>
          {subtitle && (
            <ResponsiveText className="text-slate-400 text-sm text-center mt-1">
              {subtitle}
            </ResponsiveText>
          )}
        </View>

        {/* Right side - Brand/Logo space */}
        <View className="w-12 h-12 rounded-lg bg-red-600 items-center justify-center">
          <Text className="text-white text-lg font-bold">R+</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MobileHeader;
