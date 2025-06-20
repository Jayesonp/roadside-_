import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveText } from './responsive/ResponsiveComponents';
import designSystem from '../styles/MobileDesignSystem';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
}

interface HamburgerMenuProps {
  menuItems: MenuItem[];
  activeItem: string;
  onItemSelect: (itemId: string) => void;
  brandName?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  menuItems,
  activeItem,
  onItemSelect,
  brandName = "RoadSide+"
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));
  const [overlayOpacity] = useState(new Animated.Value(0));

  const screenWidth = Dimensions.get('window').width;
  const menuWidth = Math.min(screenWidth * 0.85, 320); // Max 320px or 85% of screen

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, overlayOpacity]);

  const closeMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -menuWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuOpen(false);
    });
  }, [slideAnim, overlayOpacity, menuWidth]);

  const handleItemSelect = useCallback((itemId: string) => {
    onItemSelect(itemId);
    closeMenu();
  }, [onItemSelect, closeMenu]);

  const HamburgerIcon = () => (
    <View className="w-6 h-6 justify-center items-center">
      <View className="w-5 h-0.5 bg-white mb-1" />
      <View className="w-5 h-0.5 bg-white mb-1" />
      <View className="w-5 h-0.5 bg-white" />
    </View>
  );

  return (
    <>
      {/* Hamburger Button */}
      <TouchableOpacity
        onPress={openMenu}
        className="p-3 rounded-lg bg-slate-800 border border-white/10"
        style={{ minHeight: designSystem.spacing.touchTarget.min }}
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
        accessibilityHint="Opens the main navigation menu"
      >
        <HamburgerIcon />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <View className="flex-1">
          {/* Overlay */}
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          >
            <TouchableOpacity
              className="flex-1"
              onPress={closeMenu}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Menu Panel */}
          <Animated.View
            className="absolute top-0 bottom-0 left-0 bg-slate-800 border-r border-white/10"
            style={{
              width: menuWidth,
              transform: [{ translateX: slideAnim }],
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
            }}
          >
            <SafeAreaView className="flex-1">
              {/* Menu Header */}
              <View className="p-6 border-b border-white/10">
                <View className="flex-row justify-between items-center mb-4">
                  <ResponsiveText className="text-white text-xl font-bold">
                    {brandName}
                  </ResponsiveText>
                  <TouchableOpacity
                    onPress={closeMenu}
                    className="p-2 rounded-lg bg-slate-700"
                    style={{ minHeight: designSystem.spacing.touchTarget.min }}
                    accessibilityRole="button"
                    accessibilityLabel="Close navigation menu"
                  >
                    <Text className="text-white text-lg">×</Text>
                  </TouchableOpacity>
                </View>
                <ResponsiveText className="text-slate-400 text-sm">
                  Navigate to different sections
                </ResponsiveText>
              </View>

              {/* Menu Items */}
              <View className="flex-1 p-4">
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleItemSelect(item.id)}
                    className={`flex-row items-center p-4 rounded-xl mb-2 ${
                      activeItem === item.id 
                        ? 'bg-red-600 border border-red-500' 
                        : 'bg-slate-700/50 border border-white/5'
                    }`}
                    style={{ 
                      minHeight: designSystem.spacing.touchTarget.min,
                      marginBottom: index === menuItems.length - 1 ? 0 : 8
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Navigate to ${item.name}`}
                    accessibilityState={{ selected: activeItem === item.id }}
                  >
                    <Text className="text-2xl mr-4">{item.icon}</Text>
                    <ResponsiveText 
                      className={`text-base font-medium flex-1 ${
                        activeItem === item.id ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {item.name}
                    </ResponsiveText>
                    {activeItem === item.id && (
                      <View className="w-2 h-2 rounded-full bg-white ml-2" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Menu Footer */}
              <View className="p-4 border-t border-white/10">
                <ResponsiveText className="text-slate-500 text-xs text-center">
                  Swipe left or tap outside to close
                </ResponsiveText>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

export default HamburgerMenu;
