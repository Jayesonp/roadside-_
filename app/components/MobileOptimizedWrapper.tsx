import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import designSystem from '../styles/MobileDesignSystem';

interface MobileOptimizedWrapperProps {
  children: React.ReactNode;
  enableScroll?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  testID?: string;
}

const MobileOptimizedWrapper: React.FC<MobileOptimizedWrapperProps> = ({
  children,
  enableScroll = true,
  padding = 'md',
  backgroundColor = 'bg-slate-900',
  testID
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  // Get padding values based on screen size and prop
  const getPaddingClass = () => {
    if (padding === 'none') return '';
    
    const paddingMap = {
      sm: isMobile ? 'px-3 py-2' : 'px-4 py-3',
      md: isMobile ? 'px-4 py-3' : 'px-6 py-4',
      lg: isMobile ? 'px-6 py-4' : 'px-8 py-6'
    };
    
    return paddingMap[padding];
  };

  // Ensure minimum touch targets and proper spacing
  const mobileOptimizedStyles = {
    minHeight: isMobile ? designSystem.spacing.touchTarget.min : 'auto',
    gap: isMobile ? designSystem.spacing.responsive.sm : designSystem.spacing.responsive.md,
  };

  const content = (
    <View 
      className={`flex-1 ${backgroundColor} ${getPaddingClass()}`}
      style={mobileOptimizedStyles}
      testID={testID}
    >
      {children}
    </View>
  );

  if (enableScroll) {
    return (
      <SafeAreaView className={`flex-1 ${backgroundColor}`} edges={['bottom']}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isMobile ? designSystem.spacing.responsive.xl : designSystem.spacing.responsive.lg
          }}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${backgroundColor}`} edges={['bottom']}>
      {content}
    </SafeAreaView>
  );
};

export default MobileOptimizedWrapper;
