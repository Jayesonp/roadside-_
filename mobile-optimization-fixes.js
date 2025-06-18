#!/usr/bin/env node

/**
 * Mobile Responsiveness Optimization Script
 * Applies mobile-first design fixes to all dashboard components
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Mobile Responsiveness Optimization Script');
console.log('============================================\n');

// Dashboard components that need mobile optimization
const dashboardsToOptimize = [
  {
    name: 'AdminDashboard.tsx',
    priority: 'high',
    issues: ['responsive_design', 'accessibility', 'touch_targets']
  },
  {
    name: 'PartnerManagement.tsx', 
    priority: 'high',
    issues: ['responsive_design', 'accessibility']
  },
  {
    name: 'SecurityOperationsCenter.tsx',
    priority: 'medium',
    issues: ['responsive_design', 'accessibility']
  },
  {
    name: 'ActivityFeed.tsx',
    priority: 'medium', 
    issues: ['responsive_design', 'accessibility', 'touch_targets']
  },
  {
    name: 'LiveServiceMap.tsx',
    priority: 'medium',
    issues: ['responsive_design', 'accessibility', 'touch_targets']
  },
  {
    name: 'SystemAlertsView.tsx',
    priority: 'low',
    issues: ['responsive_design', 'accessibility', 'touch_targets']
  },
  {
    name: 'PerplexityAssistant.tsx',
    priority: 'low',
    issues: ['responsive_design', 'accessibility', 'touch_targets']
  }
];

// Mobile optimization patterns to apply
const optimizationPatterns = {
  // Import responsive components
  addResponsiveImports: {
    pattern: /import.*from "react-native";/,
    replacement: `import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import designSystem from "../styles/MobileDesignSystem";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
} from "./responsive/ResponsiveComponents";`
  },

  // Replace standard View with ResponsiveContainer
  replaceMainContainer: {
    pattern: /<View className="flex-1 bg-slate-900">/g,
    replacement: '<ResponsiveContainer className="flex-1 bg-slate-900">'
  },

  // Replace TouchableOpacity with ResponsiveButton for better touch targets
  replaceButtons: {
    pattern: /<TouchableOpacity([^>]*className="[^"]*"[^>]*)>/g,
    replacement: '<ResponsiveButton$1 accessibilityRole="button">'
  },

  // Add accessibility attributes to interactive elements
  addAccessibility: {
    pattern: /<TouchableOpacity([^>]*onPress={[^}]*}[^>]*)>/g,
    replacement: '<TouchableOpacity$1 accessibilityRole="button" accessibilityLabel="Interactive button">'
  },

  // Ensure minimum touch target sizes
  addTouchTargets: {
    pattern: /className="([^"]*h-8[^"]*)"/, 
    replacement: 'className="$1" style={{ minHeight: designSystem.spacing.touchTarget.min }}'
  },

  // Replace grid layouts with ResponsiveGrid
  replaceGrids: {
    pattern: /<View className="([^"]*grid[^"]*)">/g,
    replacement: '<ResponsiveGrid className="$1">'
  },

  // Add responsive text sizing
  replaceText: {
    pattern: /<Text className="([^"]*text-[^"]*)">/g,
    replacement: '<ResponsiveText className="$1">'
  }
};

// Function to apply mobile optimizations to a component
function optimizeComponent(componentPath, componentName) {
  console.log(`🔧 Optimizing ${componentName}...`);
  
  if (!fs.existsSync(componentPath)) {
    console.log(`❌ ${componentName} not found`);
    return false;
  }

  let content = fs.readFileSync(componentPath, 'utf8');
  let modified = false;

  // Check if already using responsive components
  const hasResponsiveImports = content.includes('ResponsiveContainer') || 
                              content.includes('ResponsiveButton') ||
                              content.includes('ResponsiveGrid');

  if (hasResponsiveImports) {
    console.log(`✅ ${componentName} already uses responsive components`);
    return true;
  }

  // Apply optimization patterns
  Object.entries(optimizationPatterns).forEach(([patternName, pattern]) => {
    if (pattern.pattern && pattern.replacement) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        content = content.replace(pattern.pattern, pattern.replacement);
        modified = true;
        console.log(`  ✅ Applied ${patternName}: ${matches.length} replacements`);
      }
    }
  });

  // Add mobile-first responsive design system import if not present
  if (!content.includes('designSystem') && !content.includes('MobileDesignSystem')) {
    const importIndex = content.indexOf('import {');
    if (importIndex !== -1) {
      const beforeImports = content.substring(0, importIndex);
      const afterImports = content.substring(importIndex);
      content = beforeImports + 
                'import designSystem from "../styles/MobileDesignSystem";\n' +
                afterImports;
      modified = true;
      console.log(`  ✅ Added MobileDesignSystem import`);
    }
  }

  // Add responsive components import if not present
  if (!content.includes('ResponsiveContainer')) {
    const reactNativeImportMatch = content.match(/import\s*{[^}]*}\s*from\s*["']react-native["'];/);
    if (reactNativeImportMatch) {
      const importEnd = content.indexOf(reactNativeImportMatch[0]) + reactNativeImportMatch[0].length;
      const beforeImport = content.substring(0, importEnd);
      const afterImport = content.substring(importEnd);
      
      const responsiveImport = `
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveText,
  ResponsiveMetricCard,
} from "./responsive/ResponsiveComponents";`;

      content = beforeImport + responsiveImport + afterImport;
      modified = true;
      console.log(`  ✅ Added ResponsiveComponents import`);
    }
  }

  // Save the optimized component
  if (modified) {
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log(`✅ ${componentName} optimized and saved`);
    return true;
  } else {
    console.log(`ℹ️  ${componentName} no changes needed`);
    return false;
  }
}

// Function to validate button functionality
function validateButtonFunctionality(componentPath, componentName) {
  console.log(`🔍 Validating button functionality in ${componentName}...`);
  
  if (!fs.existsSync(componentPath)) {
    console.log(`❌ ${componentName} not found`);
    return { total: 0, functional: 0 };
  }

  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Count interactive elements
  const touchableElements = (content.match(/TouchableOpacity|ResponsiveButton/g) || []).length;
  const onPressHandlers = (content.match(/onPress\s*=\s*{[^}]*}/g) || []).length;
  const navigationCalls = (content.match(/navigate|router\.|setCurrentView|setActiveView/g) || []).length;
  const stateUpdates = (content.match(/set[A-Z][a-zA-Z]*\(/g) || []).length;
  const apiCalls = (content.match(/await|\.then\(|supabase\./g) || []).length;
  const errorHandling = (content.match(/catch|try.*{|Alert\.alert/g) || []).length;

  const functionalityScore = onPressHandlers + navigationCalls + stateUpdates + apiCalls;
  const functionalityRatio = touchableElements > 0 ? (functionalityScore / touchableElements) : 0;

  console.log(`  📊 Interactive elements: ${touchableElements}`);
  console.log(`  📊 onPress handlers: ${onPressHandlers}`);
  console.log(`  📊 Navigation calls: ${navigationCalls}`);
  console.log(`  📊 State updates: ${stateUpdates}`);
  console.log(`  📊 API calls: ${apiCalls}`);
  console.log(`  📊 Error handling: ${errorHandling}`);
  console.log(`  📊 Functionality ratio: ${Math.round(functionalityRatio * 100)}%`);

  return {
    total: touchableElements,
    functional: functionalityScore,
    ratio: functionalityRatio,
    hasErrorHandling: errorHandling > 0
  };
}

// Main optimization process
console.log('🚀 Starting mobile optimization process...\n');

let totalOptimized = 0;
let totalButtons = 0;
let totalFunctional = 0;

dashboardsToOptimize.forEach(dashboard => {
  const componentPath = path.join(__dirname, 'app', 'components', dashboard.name);
  
  console.log(`\n📱 Processing ${dashboard.name} (Priority: ${dashboard.priority})`);
  console.log(`Issues to fix: ${dashboard.issues.join(', ')}`);
  
  // Apply mobile optimizations
  const optimized = optimizeComponent(componentPath, dashboard.name);
  if (optimized) totalOptimized++;
  
  // Validate button functionality
  const buttonValidation = validateButtonFunctionality(componentPath, dashboard.name);
  totalButtons += buttonValidation.total;
  totalFunctional += buttonValidation.functional;
  
  console.log(`${optimized ? '✅' : 'ℹ️'} ${dashboard.name} processing complete`);
});

// Summary report
console.log('\n🎯 Mobile Optimization Summary:');
console.log('===============================');
console.log(`Components optimized: ${totalOptimized}/${dashboardsToOptimize.length}`);
console.log(`Total interactive elements: ${totalButtons}`);
console.log(`Functional elements: ${totalFunctional}`);
console.log(`Overall functionality ratio: ${totalButtons > 0 ? Math.round((totalFunctional / totalButtons) * 100) : 0}%`);

console.log('\n📋 Next Steps:');
console.log('==============');
console.log('1. Test each dashboard on mobile devices');
console.log('2. Verify touch targets meet 44px minimum');
console.log('3. Check accessibility with screen readers');
console.log('4. Validate button functionality manually');
console.log('5. Test responsive layouts on different screen sizes');

console.log('\n✨ Mobile optimization complete!');

// Exit with success if most components were optimized
process.exit(totalOptimized >= dashboardsToOptimize.length * 0.7 ? 0 : 1);
