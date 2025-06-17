/**
 * Responsive Testing Utilities
 * Comprehensive testing tools for mobile-first responsive design
 */

import { Dimensions, Platform } from 'react-native';

// Device breakpoints for testing
export const BREAKPOINTS = {
  xs: 0,     // Extra small devices (phones)
  sm: 576,   // Small devices (large phones)
  md: 768,   // Medium devices (tablets)
  lg: 992,   // Large devices (desktops)
  xl: 1200,  // Extra large devices (large desktops)
  xxl: 1400, // Extra extra large devices
};

// Common device dimensions for testing
export const TEST_DEVICES = {
  // Mobile Phones
  iPhoneSE: { width: 375, height: 667, name: 'iPhone SE' },
  iPhone12: { width: 390, height: 844, name: 'iPhone 12/13/14' },
  iPhone12Pro: { width: 393, height: 852, name: 'iPhone 12/13/14 Pro' },
  iPhone12ProMax: { width: 428, height: 926, name: 'iPhone 12/13/14 Pro Max' },
  galaxyS21: { width: 384, height: 854, name: 'Galaxy S21' },
  pixelXL: { width: 411, height: 823, name: 'Pixel XL' },
  
  // Tablets
  iPadMini: { width: 768, height: 1024, name: 'iPad Mini' },
  iPad: { width: 820, height: 1180, name: 'iPad' },
  iPadPro: { width: 1024, height: 1366, name: 'iPad Pro' },
  galaxyTab: { width: 800, height: 1280, name: 'Galaxy Tab' },
  
  // Desktop
  laptop: { width: 1366, height: 768, name: 'Laptop' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  ultrawide: { width: 2560, height: 1440, name: 'Ultrawide' },
};

// Touch target testing
export const TOUCH_TARGETS = {
  minimum: 44,      // iOS HIG minimum
  comfortable: 48,  // Material Design recommendation
  large: 56,        // Large touch targets
};

// Responsive testing utilities
export class ResponsiveTestingUtils {
  static getCurrentBreakpoint(): string {
    const { width } = Dimensions.get('window');
    
    if (width >= BREAKPOINTS.xxl) return 'xxl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }

  static getDeviceCategory(): 'phone' | 'tablet' | 'desktop' {
    const { width } = Dimensions.get('window');
    
    if (width < BREAKPOINTS.md) return 'phone';
    if (width < BREAKPOINTS.lg) return 'tablet';
    return 'desktop';
  }

  static isPortrait(): boolean {
    const { width, height } = Dimensions.get('window');
    return height > width;
  }

  static getDimensions() {
    return {
      window: Dimensions.get('window'),
      screen: Dimensions.get('screen'),
      breakpoint: this.getCurrentBreakpoint(),
      category: this.getDeviceCategory(),
      isPortrait: this.isPortrait(),
      platform: Platform.OS,
    };
  }

  // Test if touch target meets minimum size requirements
  static validateTouchTarget(width: number, height: number): {
    isValid: boolean;
    recommendation: string;
    size: { width: number; height: number };
  } {
    const minSize = TOUCH_TARGETS.minimum;
    const isValid = width >= minSize && height >= minSize;
    
    let recommendation = 'Good';
    if (!isValid) {
      recommendation = `Increase to minimum ${minSize}px`;
    } else if (width < TOUCH_TARGETS.comfortable || height < TOUCH_TARGETS.comfortable) {
      recommendation = `Consider increasing to ${TOUCH_TARGETS.comfortable}px for better UX`;
    }

    return {
      isValid,
      recommendation,
      size: { width, height },
    };
  }

  // Generate test report
  static generateTestReport(): string {
    const dims = this.getDimensions();
    
    return `
📱 RESPONSIVE TEST REPORT
========================
Device Info:
- Platform: ${dims.platform}
- Screen: ${dims.screen.width}x${dims.screen.height}
- Window: ${dims.window.width}x${dims.window.height}
- Breakpoint: ${dims.breakpoint}
- Category: ${dims.category}
- Orientation: ${dims.isPortrait ? 'Portrait' : 'Landscape'}

Recommended Tests:
${this.getRecommendedTests(dims.category)}
    `;
  }

  private static getRecommendedTests(category: string): string {
    const tests = {
      phone: [
        '✓ Touch targets ≥44px',
        '✓ Text readability at small sizes',
        '✓ Navigation thumb-friendly',
        '✓ Content fits without horizontal scroll',
        '✓ Forms are easy to fill',
      ],
      tablet: [
        '✓ Grid layouts adapt properly',
        '✓ Navigation scales appropriately',
        '✓ Content uses available space',
        '✓ Touch targets remain accessible',
        '✓ Typography scales well',
      ],
      desktop: [
        '✓ Layout uses full width effectively',
        '✓ Mouse interactions work properly',
        '✓ Keyboard navigation functional',
        '✓ Content doesn\'t stretch too wide',
        '✓ Hover states are clear',
      ],
    };

    return tests[category]?.join('\n') || 'No specific tests defined';
  }
}

// Testing hooks for React components
export const useResponsiveTest = () => {
  const dimensions = ResponsiveTestingUtils.getDimensions();
  
  return {
    ...dimensions,
    utils: ResponsiveTestingUtils,
    log: () => console.log(ResponsiveTestingUtils.generateTestReport()),
  };
};

// Component testing helpers
export const TestingHelpers = {
  // Log component render info
  logComponentRender: (componentName: string, props?: any) => {
    const dims = ResponsiveTestingUtils.getDimensions();
    console.log(`🧪 ${componentName} rendered:`, {
      breakpoint: dims.breakpoint,
      category: dims.category,
      dimensions: dims.window,
      props: props ? Object.keys(props) : 'none',
    });
  },

  // Validate responsive props
  validateResponsiveProps: (props: any) => {
    const requiredResponsiveProps = ['className', 'style'];
    const hasResponsive = requiredResponsiveProps.some(prop => 
      props[prop] && typeof props[prop] === 'string' && 
      (props[prop].includes('sm:') || props[prop].includes('md:') || props[prop].includes('lg:'))
    );
    
    if (!hasResponsive) {
      console.warn('⚠️ Component may not be responsive - no responsive classes detected');
    }
    
    return hasResponsive;
  },
};

export default ResponsiveTestingUtils;
