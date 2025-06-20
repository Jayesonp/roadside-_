#!/usr/bin/env node

/**
 * Mobile Responsiveness Optimization Script
 * Applies mobile-first design fixes to all dashboard components
 */

const fs = require('fs');
const path = require('path');

console.log('≡ƒô▒ Mobile Responsiveness Optimization Script');
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
  console.log(`≡ƒöº Optimizing ${componentName}...`);
  
  if (!fs.existsSync(componentPath)) {
    console.log(`Γ¥î ${componentName} not found`);
    return false;
  }

  let content = fs.readFileSync(componentPath, 'utf8');
  let modified = false;

  // Check if already using responsive components
  const hasResponsiveImports = content.includes('ResponsiveContainer') || 
                              content.includes('ResponsiveButton') ||
                              content.includes('ResponsiveGrid');

  if (hasResponsiveImports) {
    console.log(`Γ£à ${componentName} already uses responsive components`);
    return true;
  }

  // Apply optimization patterns
  Object.entries(optimizationPatterns).forEach(([patternName, pattern]) => {
    if (pattern.pattern && pattern.replacement) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        content = content.replace(pattern.pattern, pattern.replacement);
        modified = true;
        console.log(`  Γ£à Applied ${patternName}: ${matches.length} replacements`);
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
      console.log(`  Γ£à Added MobileDesignSystem import`);
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
      console.log(`  Γ£à Added ResponsiveComponents import`);
    }
  }

  // Save the optimized component
  if (modified) {
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log(`Γ£à ${componentName} optimized and saved`);
    return true;
  } else {
    console.log(`Γä╣∩╕Å  ${componentName} no changes needed`);
    return false;
  }
}

// Function to validate button functionality
function validateButtonFunctionality(componentPath, componentName) {
  console.log(`≡ƒöì Validating button functionality in ${componentName}...`);
  
  if (!fs.existsSync(componentPath)) {
    console.log(`Γ¥î ${componentName} not found`);
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

  console.log(`  ≡ƒôè Interactive elements: ${touchableElements}`);
  console.log(`  ≡ƒôè onPress handlers: ${onPressHandlers}`);
  console.log(`  ≡ƒôè Navigation calls: ${navigationCalls}`);
  console.log(`  ≡ƒôè State updates: ${stateUpdates}`);
  console.log(`  ≡ƒôè API calls: ${apiCalls}`);
  console.log(`  ≡ƒôè Error handling: ${errorHandling}`);
  console.log(`  ≡ƒôè Functionality ratio: ${Math.round(functionalityRatio * 100)}%`);

  return {
    total: touchableElements,
    functional: functionalityScore,
    ratio: functionalityRatio,
    hasErrorHandling: errorHandling > 0
  };
}

// Main optimization process
console.log('≡ƒÜÇ Starting mobile optimization process...\n');

let totalOptimized = 0;
let totalButtons = 0;
let totalFunctional = 0;

dashboardsToOptimize.forEach(dashboard => {
  const componentPath = path.join(__dirname, 'app', 'components', dashboard.name);
  
  console.log(`\n≡ƒô▒ Processing ${dashboard.name} (Priority: ${dashboard.priority})`);
  console.log(`Issues to fix: ${dashboard.issues.join(', ')}`);
  
  // Apply mobile optimizations
  const optimized = optimizeComponent(componentPath, dashboard.name);
  if (optimized) totalOptimized++;
  
  // Validate button functionality
  const buttonValidation = validateButtonFunctionality(componentPath, dashboard.name);
  totalButtons += buttonValidation.total;
  totalFunctional += buttonValidation.functional;
  
  console.log(`${optimized ? 'Γ£à' : 'Γä╣∩╕Å'} ${dashboard.name} processing complete`);
});

// Summary report
console.log('\n≡ƒÄ» Mobile Optimization Summary:');
console.log('===============================');
console.log(`Components optimized: ${totalOptimized}/${dashboardsToOptimize.length}`);
console.log(`Total interactive elements: ${totalButtons}`);
console.log(`Functional elements: ${totalFunctional}`);
console.log(`Overall functionality ratio: ${totalButtons > 0 ? Math.round((totalFunctional / totalButtons) * 100) : 0}%`);

console.log('\n≡ƒôï Next Steps:');
console.log('==============');
console.log('1. Test each dashboard on mobile devices');
console.log('2. Verify touch targets meet 44px minimum');
console.log('3. Check accessibility with screen readers');
console.log('4. Validate button functionality manually');
console.log('5. Test responsive layouts on different screen sizes');

console.log('\nΓ£¿ Mobile optimization complete!');

// Exit with success if most components were optimized
process.exit(totalOptimized >= dashboardsToOptimize.length * 0.7 ? 0 : 1);
