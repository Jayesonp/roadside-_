import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * WebPerformanceMonitor - Monitors web performance metrics
 * Only active in production builds on web platform
 */
export default function WebPerformanceMonitor() {
  useEffect(() => {
    // Only run on web platform in production
    if (Platform.OS !== 'web' || __DEV__) {
      return;
    }

    // Check if Performance API is available
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    const measurePerformance = () => {
      try {
        // Core Web Vitals
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = {
            // Time to First Byte
            ttfb: navigation.responseStart - navigation.requestStart,
            
            // DOM Content Loaded
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            
            // Load Complete
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            
            // Total Load Time
            totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          };

          // Log performance metrics (in production, send to analytics)
          console.log('RoadSide+ Performance Metrics:', metrics);
          
          // Report to analytics service (placeholder)
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_load_time', {
              value: Math.round(metrics.totalLoadTime),
              custom_parameter: 'roadside_plus_app'
            });
          }
        }

        // Measure Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            console.log('LCP:', Math.round(lastEntry.startTime), 'ms');
            
            // Report LCP to analytics
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'lcp', {
                value: Math.round(lastEntry.startTime),
                custom_parameter: 'roadside_plus_app'
              });
            }
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // Measure First Input Delay (FID)
        if ('PerformanceObserver' in window) {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const fid = entry.processingStart - entry.startTime;
              console.log('FID:', Math.round(fid), 'ms');
              
              // Report FID to analytics
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'fid', {
                  value: Math.round(fid),
                  custom_parameter: 'roadside_plus_app'
                });
              }
            });
          });
          
          fidObserver.observe({ entryTypes: ['first-input'] });
        }

        // Measure Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
          let clsValue = 0;
          
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            
            console.log('CLS:', clsValue.toFixed(4));
            
            // Report CLS to analytics
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'cls', {
                value: Math.round(clsValue * 1000),
                custom_parameter: 'roadside_plus_app'
              });
            }
          });
          
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        }

      } catch (error) {
        console.warn('Performance monitoring error:', error);
      }
    };

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Cleanup
    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Type declarations for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
