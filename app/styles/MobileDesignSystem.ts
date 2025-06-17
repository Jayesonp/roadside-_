// Mobile-First Design System for RoadSide+ Dashboards
// Comprehensive responsive design patterns and utilities

import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive Breakpoints (Mobile-First)
export const breakpoints = {
  xs: 0,     // Extra small devices (phones, 0px and up)
  sm: 576,   // Small devices (landscape phones, 576px and up)
  md: 768,   // Medium devices (tablets, 768px and up)
  lg: 992,   // Large devices (desktops, 992px and up)
  xl: 1200,  // Extra large devices (large desktops, 1200px and up)
  xxl: 1400, // Extra extra large devices (1400px and up)
} as const;

// Current screen size detection
export const getCurrentBreakpoint = () => {
  if (screenWidth >= breakpoints.xxl) return 'xxl';
  if (screenWidth >= breakpoints.xl) return 'xl';
  if (screenWidth >= breakpoints.lg) return 'lg';
  if (screenWidth >= breakpoints.md) return 'md';
  if (screenWidth >= breakpoints.sm) return 'sm';
  return 'xs';
};

// Device type detection
export const deviceType = {
  isPhone: screenWidth < breakpoints.md,
  isTablet: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
  isDesktop: screenWidth >= breakpoints.lg,
  isSmallPhone: screenWidth < 375,
  isLargePhone: screenWidth >= 375 && screenWidth < breakpoints.md,
};

// Mobile-First Spacing System
export const spacing = {
  // Base spacing (mobile)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Responsive spacing
  responsive: {
    xs: deviceType.isPhone ? 8 : 12,
    sm: deviceType.isPhone ? 12 : 16,
    md: deviceType.isPhone ? 16 : 20,
    lg: deviceType.isPhone ? 20 : 24,
    xl: deviceType.isPhone ? 24 : 32,
    xxl: deviceType.isPhone ? 32 : 40,
  },
  
  // Touch targets (minimum 44px for accessibility)
  touchTarget: {
    min: 44,
    comfortable: 48,
    large: 56,
  },
  
  // Container padding
  container: {
    mobile: 16,
    tablet: 24,
    desktop: 32,
  },
};

// Typography Scale (Mobile-First)
export const typography = {
  // Font sizes
  fontSize: {
    xs: deviceType.isPhone ? 10 : 12,
    sm: deviceType.isPhone ? 12 : 14,
    base: deviceType.isPhone ? 14 : 16,
    lg: deviceType.isPhone ? 16 : 18,
    xl: deviceType.isPhone ? 18 : 20,
    '2xl': deviceType.isPhone ? 20 : 24,
    '3xl': deviceType.isPhone ? 24 : 30,
    '4xl': deviceType.isPhone ? 28 : 36,
    '5xl': deviceType.isPhone ? 32 : 48,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Color System (Dark Theme Optimized)
export const colors = {
  // Primary brand colors
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral colors (slate)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Background colors
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    overlay: 'rgba(15, 23, 42, 0.8)',
    glass: 'rgba(30, 41, 59, 0.8)',
  },
};

// Component Styles (Mobile-First)
export const components = {
  // Card/Panel styles
  card: {
    base: 'bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl',
    mobile: 'bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-xl p-4',
    tablet: 'bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6',
    desktop: 'bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8',
    
    // Responsive padding
    padding: deviceType.isPhone ? 'p-4' : deviceType.isTablet ? 'p-6' : 'p-8',
    
    // Variants
    elevated: 'bg-slate-800/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl',
    flat: 'bg-slate-800/60 backdrop-blur-lg border border-white/5 rounded-xl',
    glass: 'bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl',
  },
  
  // Button styles
  button: {
    // Base styles
    base: 'rounded-xl items-center justify-center flex-row',
    
    // Sizes (mobile-optimized)
    sizes: {
      sm: `h-10 px-4 ${deviceType.isPhone ? 'min-h-[44px]' : ''}`,
      md: `h-12 px-6 ${deviceType.isPhone ? 'min-h-[48px]' : ''}`,
      lg: `h-14 px-8 ${deviceType.isPhone ? 'min-h-[56px]' : ''}`,
    },
    
    // Variants
    primary: 'bg-gradient-to-r from-red-600 to-red-500',
    secondary: 'bg-slate-700 border border-white/10',
    ghost: 'bg-white/10 border border-white/10',
    danger: 'bg-gradient-to-r from-red-600 to-red-500',
    success: 'bg-gradient-to-r from-green-600 to-green-500',
  },
  
  // Input styles
  input: {
    base: 'bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white',
    mobile: 'bg-white/10 border border-white/10 rounded-xl px-4 py-4 text-white min-h-[48px]',
    focus: 'border-red-500/50 bg-white/15',
  },
  
  // Navigation styles
  navigation: {
    bottom: 'absolute bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-white/10',
    tab: deviceType.isPhone ? 'py-3 px-2' : 'py-4 px-4',
    tabActive: 'bg-red-500/20 rounded-xl',
  },
};

// Layout Utilities
export const layout = {
  // Container max widths
  container: {
    sm: '100%',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
  
  // Grid systems
  grid: {
    // Mobile-first grid
    mobile: {
      cols1: 'flex-1',
      cols2: 'flex-1 max-w-[48%]',
      gap: 'gap-4',
    },
    tablet: {
      cols2: 'flex-1 min-w-[45%] max-w-[48%]',
      cols3: 'flex-1 min-w-[30%] max-w-[32%]',
      gap: 'gap-6',
    },
    desktop: {
      cols3: 'flex-1 min-w-[30%] max-w-[32%]',
      cols4: 'flex-1 min-w-[22%] max-w-[24%]',
      gap: 'gap-8',
    },
  },
  
  // Responsive utilities
  responsive: {
    // Show/hide based on screen size
    showOnMobile: deviceType.isPhone ? '' : 'hidden',
    hideOnMobile: deviceType.isPhone ? 'hidden' : '',
    showOnTablet: deviceType.isTablet ? '' : 'hidden',
    hideOnTablet: deviceType.isTablet ? 'hidden' : '',
    showOnDesktop: deviceType.isDesktop ? '' : 'hidden',
    hideOnDesktop: deviceType.isDesktop ? 'hidden' : '',
  },
};

// Animation and Interaction
export const interactions = {
  // Touch feedback
  touchable: Platform.OS === 'ios' ? 'active:scale-95' : 'active:opacity-80',
  
  // Transitions
  transition: 'transition-all duration-200 ease-in-out',
  
  // Hover effects (for web/desktop)
  hover: Platform.OS === 'web' ? 'hover:scale-105 hover:shadow-lg' : '',
  
  // Focus states
  focus: 'focus:ring-2 focus:ring-red-500/50 focus:border-red-500',
};

// Accessibility
export const accessibility = {
  // Minimum touch targets
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
  
  // Focus indicators
  focusRing: 'focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
  
  // Screen reader
  srOnly: 'sr-only',
};

// Utility functions
export const utils = {
  // Get responsive class based on screen size
  getResponsiveClass: (mobile: string, tablet?: string, desktop?: string) => {
    if (deviceType.isDesktop && desktop) return desktop;
    if (deviceType.isTablet && tablet) return tablet;
    return mobile;
  },
  
  // Get responsive value
  getResponsiveValue: <T>(mobile: T, tablet?: T, desktop?: T): T => {
    if (deviceType.isDesktop && desktop !== undefined) return desktop;
    if (deviceType.isTablet && tablet !== undefined) return tablet;
    return mobile;
  },
  
  // Combine classes conditionally
  cn: (...classes: (string | undefined | false)[]): string => {
    return classes.filter(Boolean).join(' ');
  },
};

export default {
  breakpoints,
  getCurrentBreakpoint,
  deviceType,
  spacing,
  typography,
  colors,
  components,
  layout,
  interactions,
  accessibility,
  utils,
};
