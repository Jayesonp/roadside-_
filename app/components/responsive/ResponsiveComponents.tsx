// Responsive Components for Mobile-First Design
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import designSystem from '../../styles/MobileDesignSystem';

// Responsive Container
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  style,
  maxWidth = 'full',
}) => {
  const containerPadding = designSystem.utils.getResponsiveClass(
    'px-4', // mobile
    'px-6', // tablet
    'px-8'  // desktop
  );

  const maxWidthClass = maxWidth !== 'full' ? `max-w-${maxWidth} mx-auto` : '';

  return (
    <View 
      className={`${containerPadding} ${maxWidthClass} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
};

// Responsive Grid
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
}) => {
  const gapClass = designSystem.utils.getResponsiveClass(
    gap === 'sm' ? 'gap-3' : gap === 'lg' ? 'gap-6' : 'gap-4', // mobile
    gap === 'sm' ? 'gap-4' : gap === 'lg' ? 'gap-8' : 'gap-6', // tablet
    gap === 'sm' ? 'gap-6' : gap === 'lg' ? 'gap-10' : 'gap-8' // desktop
  );

  return (
    <View className={`flex-row flex-wrap ${gapClass} ${className}`}>
      {children}
    </View>
  );
};

// Responsive Card
interface ResponsiveCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat' | 'glass';
  className?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onPress,
  style,
}) => {
  const cardStyle = designSystem.components.card[variant] || designSystem.components.card.base;
  const padding = designSystem.components.card.padding;
  
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      className={`${cardStyle} ${padding} ${className}`}
      onPress={onPress}
      style={style}
      {...(onPress && {
        accessibilityRole: 'button',
        activeOpacity: 0.8,
      })}
    >
      {children}
    </Component>
  );
};

// Responsive Button
interface ResponsiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  className = '',
  fullWidth = false,
  icon,
  iconPosition = 'left',
}) => {
  const baseStyle = designSystem.components.button.base;
  const sizeStyle = designSystem.components.button.sizes[size];
  const variantStyle = designSystem.components.button[variant];
  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled ? 'opacity-50' : '';
  const touchStyle = designSystem.interactions.touchable;

  return (
    <TouchableOpacity
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${widthStyle} ${disabledStyle} ${touchStyle} ${className}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={{ minHeight: designSystem.spacing.touchTarget.min }}
    >
      {icon && iconPosition === 'left' && (
        <View className="mr-2">{icon}</View>
      )}
      {typeof children === 'string' ? (
        <Text className="text-white font-semibold text-center">
          {children}
        </Text>
      ) : (
        children
      )}
      {icon && iconPosition === 'right' && (
        <View className="ml-2">{icon}</View>
      )}
    </TouchableOpacity>
  );
};

// Responsive Typography
interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: TextStyle;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  color = 'white',
  align = 'left',
  className = '',
  style,
}) => {
  const getVariantStyle = () => {
    const fontSize = designSystem.typography.fontSize;
    switch (variant) {
      case 'h1':
        return `text-white font-bold text-[${fontSize['4xl']}px] leading-tight`;
      case 'h2':
        return `text-white font-bold text-[${fontSize['3xl']}px] leading-tight`;
      case 'h3':
        return `text-white font-semibold text-[${fontSize['2xl']}px] leading-normal`;
      case 'h4':
        return `text-white font-semibold text-[${fontSize.xl}px] leading-normal`;
      case 'caption':
        return `text-slate-400 text-[${fontSize.sm}px] leading-normal`;
      case 'overline':
        return `text-slate-500 text-[${fontSize.xs}px] uppercase tracking-wide font-medium`;
      default:
        return `text-white text-[${fontSize.base}px] leading-normal`;
    }
  };

  const getColorStyle = () => {
    switch (color) {
      case 'primary':
        return 'text-red-500';
      case 'secondary':
        return 'text-slate-400';
      case 'muted':
        return 'text-slate-500';
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-white';
    }
  };

  const alignStyle = `text-${align}`;

  return (
    <Text
      className={`${getVariantStyle()} ${getColorStyle()} ${alignStyle} ${className}`}
      style={style}
    >
      {children}
    </Text>
  );
};

// Responsive Metric Card
interface ResponsiveMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export const ResponsiveMetricCard: React.FC<ResponsiveMetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  onPress,
  className = '',
}) => {
  const changeColor = {
    positive: 'text-green-400 bg-green-500/20',
    negative: 'text-red-400 bg-red-500/20',
    neutral: 'text-slate-400 bg-slate-500/20',
  }[changeType];

  return (
    <ResponsiveCard
      variant="default"
      onPress={onPress}
      className={`flex-1 min-w-[150px] ${designSystem.deviceType.isPhone ? 'max-w-[48%]' : 'max-w-[32%]'} ${className}`}
    >
      <View className="flex-row justify-between items-start mb-3">
        {icon && (
          <View className="w-10 h-10 bg-red-500/20 rounded-xl items-center justify-center">
            {icon}
          </View>
        )}
        {change && (
          <View className={`px-2 py-1 rounded-md ${changeColor}`}>
            <Text className={`text-xs font-semibold ${changeColor.split(' ')[0]}`}>
              {change}
            </Text>
          </View>
        )}
      </View>
      
      <ResponsiveText variant="h3" className="mb-1">
        {value}
      </ResponsiveText>
      
      <ResponsiveText variant="caption" color="secondary">
        {title}
      </ResponsiveText>
    </ResponsiveCard>
  );
};

// Responsive Bottom Navigation
interface ResponsiveBottomNavProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    badge?: number;
  }>;
  activeItem: string;
  onItemPress: (id: string) => void;
  className?: string;
}

export const ResponsiveBottomNav: React.FC<ResponsiveBottomNavProps> = ({
  items,
  activeItem,
  onItemPress,
  className = '',
}) => {
  return (
    <View className={`${designSystem.components.navigation.bottom} ${className}`}>
      <SafeAreaView edges={['bottom']}>
        <View className="flex-row justify-around items-center px-2">
          {items.map((item) => {
            const isActive = item.id === activeItem;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onItemPress(item.id)}
                className={`items-center ${designSystem.components.navigation.tab} ${
                  isActive ? designSystem.components.navigation.tabActive : ''
                } flex-1 max-w-[80px]`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={{ minHeight: designSystem.spacing.touchTarget.min }}
              >
                <View className="relative">
                  {isActive ? (item.activeIcon || item.icon) : item.icon}
                  {item.badge && item.badge > 0 && (
                    <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className={`text-xs font-medium mt-1 ${
                    isActive ? 'text-red-400' : 'text-slate-400'
                  }`}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

// Responsive Header
interface ResponsiveHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
  };
  rightActions?: Array<{
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
    badge?: boolean;
  }>;
  className?: string;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  className = '',
}) => {
  return (
    <View className={`bg-slate-800/80 backdrop-blur-lg border-b border-white/10 ${className}`}>
      <SafeAreaView edges={['top']}>
        <ResponsiveContainer>
          <View className="flex-row justify-between items-center py-4">
            <View className="flex-row items-center flex-1">
              {leftAction && (
                <TouchableOpacity
                  onPress={leftAction.onPress}
                  className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-4"
                  accessibilityRole="button"
                  accessibilityLabel={leftAction.label}
                  style={{ minHeight: designSystem.spacing.touchTarget.min }}
                >
                  {leftAction.icon}
                </TouchableOpacity>
              )}
              
              <View className="flex-1">
                <ResponsiveText variant="h3" className="mb-0">
                  {title}
                </ResponsiveText>
                {subtitle && (
                  <ResponsiveText variant="caption" color="secondary">
                    {subtitle}
                  </ResponsiveText>
                )}
              </View>
            </View>
            
            {rightActions.length > 0 && (
              <View className="flex-row gap-2">
                {rightActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={action.onPress}
                    className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center relative"
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    style={{ minHeight: designSystem.spacing.touchTarget.min }}
                  >
                    {action.icon}
                    {action.badge && (
                      <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ResponsiveContainer>
      </SafeAreaView>
    </View>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
  ResponsiveBottomNav,
  ResponsiveHeader,
};
