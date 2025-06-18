#!/usr/bin/env node

/**
 * Mobile-First Dashboard Responsiveness & Button Functionality Audit
 * Comprehensive testing suite for RoadSide+ app mobile optimization
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Mobile-First Dashboard Responsiveness & Button Functionality Audit');
console.log('=====================================================================\n');

// Test 1: Mobile Design System Validation
console.log('📋 Test 1: Mobile Design System Validation...');

const designSystemPath = path.join(__dirname, 'app', 'styles', 'MobileDesignSystem.ts');
const responsiveComponentsPath = path.join(__dirname, 'app', 'components', 'responsive', 'ResponsiveComponents.tsx');

let mobileSystemValid = true;
let responsiveComponentsValid = true;

if (fs.existsSync(designSystemPath)) {
  const designSystemContent = fs.readFileSync(designSystemPath, 'utf8');
  
  // Check for mobile-first breakpoints
  const hasBreakpoints = designSystemContent.includes('breakpoints') && 
                        designSystemContent.includes('xs: 0') &&
                        designSystemContent.includes('sm: 576');
  
  // Check for touch targets
  const hasTouchTargets = designSystemContent.includes('touchTarget') &&
                         designSystemContent.includes('min: 44');
  
  // Check for responsive spacing
  const hasResponsiveSpacing = designSystemContent.includes('responsive:') &&
                              designSystemContent.includes('deviceType.isPhone');
  
  // Check for mobile-first typography
  const hasMobileTypography = designSystemContent.includes('fontSize:') &&
                             designSystemContent.includes('deviceType.isPhone ? 14 : 16');
  
  console.log(`✅ Mobile Design System found`);
  console.log(`${hasBreakpoints ? '✅' : '❌'} Mobile-first breakpoints (xs: 0, sm: 576)`);
  console.log(`${hasTouchTargets ? '✅' : '❌'} Touch targets (min: 44px)`);
  console.log(`${hasResponsiveSpacing ? '✅' : '❌'} Responsive spacing system`);
  console.log(`${hasMobileTypography ? '✅' : '❌'} Mobile-first typography`);
  
  mobileSystemValid = hasBreakpoints && hasTouchTargets && hasResponsiveSpacing && hasMobileTypography;
} else {
  console.log('❌ Mobile Design System not found');
  mobileSystemValid = false;
}

if (fs.existsSync(responsiveComponentsPath)) {
  const responsiveContent = fs.readFileSync(responsiveComponentsPath, 'utf8');
  
  // Check for responsive components
  const hasResponsiveButton = responsiveContent.includes('ResponsiveButton') &&
                             responsiveContent.includes('minHeight: designSystem.spacing.touchTarget.min');
  
  const hasResponsiveGrid = responsiveContent.includes('ResponsiveGrid') &&
                           responsiveContent.includes('flex-wrap');
  
  const hasResponsiveContainer = responsiveContent.includes('ResponsiveContainer') &&
                                responsiveContent.includes('getResponsiveClass');
  
  const hasAccessibility = responsiveContent.includes('accessibilityRole') &&
                          responsiveContent.includes('accessibilityLabel');
  
  console.log(`✅ Responsive Components found`);
  console.log(`${hasResponsiveButton ? '✅' : '❌'} ResponsiveButton with touch targets`);
  console.log(`${hasResponsiveGrid ? '✅' : '❌'} ResponsiveGrid with flex layouts`);
  console.log(`${hasResponsiveContainer ? '✅' : '❌'} ResponsiveContainer with breakpoints`);
  console.log(`${hasAccessibility ? '✅' : '❌'} Accessibility attributes`);
  
  responsiveComponentsValid = hasResponsiveButton && hasResponsiveGrid && hasResponsiveContainer && hasAccessibility;
} else {
  console.log('❌ Responsive Components not found');
  responsiveComponentsValid = false;
}

// Test 2: Dashboard Component Analysis
console.log('\n📋 Test 2: Dashboard Component Mobile Responsiveness...');

const dashboardComponents = [
  'CustomerDashboard.tsx',
  'AdminDashboard.tsx', 
  'TechnicianDashboard.tsx',
  'PartnerManagement.tsx',
  'SecurityOperationsCenter.tsx',
  'ActivityFeed.tsx',
  'LiveServiceMap.tsx',
  'SystemAlertsView.tsx',
  'PerplexityAssistant.tsx'
];

let dashboardResponsiveness = {
  total: dashboardComponents.length,
  responsive: 0,
  hasButtons: 0,
  hasAccessibility: 0,
  hasTouchTargets: 0
};

dashboardComponents.forEach(component => {
  const componentPath = path.join(__dirname, 'app', 'components', component);
  
  if (fs.existsSync(componentPath)) {
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    // Check for responsive design patterns
    const usesResponsiveComponents = componentContent.includes('ResponsiveContainer') ||
                                   componentContent.includes('ResponsiveGrid') ||
                                   componentContent.includes('ResponsiveButton');
    
    const usesDesignSystem = componentContent.includes('designSystem') ||
                           componentContent.includes('MobileDesignSystem');
    
    const hasFlexLayouts = componentContent.includes('flex-row') ||
                          componentContent.includes('flex-col') ||
                          componentContent.includes('flex-wrap');
    
    // Check for button functionality
    const hasButtons = componentContent.includes('TouchableOpacity') ||
                      componentContent.includes('onPress') ||
                      componentContent.includes('ResponsiveButton');
    
    // Check for accessibility
    const hasAccessibility = componentContent.includes('accessibilityRole') ||
                           componentContent.includes('accessibilityLabel') ||
                           componentContent.includes('accessibilityHint');
    
    // Check for touch targets
    const hasTouchTargets = componentContent.includes('minHeight') ||
                          componentContent.includes('touchTarget') ||
                          componentContent.includes('min-h-[44px]');
    
    const isResponsive = usesResponsiveComponents || (usesDesignSystem && hasFlexLayouts);
    
    console.log(`${component}:`);
    console.log(`  ${isResponsive ? '✅' : '❌'} Mobile responsive design`);
    console.log(`  ${hasButtons ? '✅' : '❌'} Interactive buttons`);
    console.log(`  ${hasAccessibility ? '✅' : '❌'} Accessibility attributes`);
    console.log(`  ${hasTouchTargets ? '✅' : '❌'} Touch target compliance`);
    
    if (isResponsive) dashboardResponsiveness.responsive++;
    if (hasButtons) dashboardResponsiveness.hasButtons++;
    if (hasAccessibility) dashboardResponsiveness.hasAccessibility++;
    if (hasTouchTargets) dashboardResponsiveness.hasTouchTargets++;
  } else {
    console.log(`❌ ${component} - Not found`);
  }
});

// Test 3: Button Functionality Analysis
console.log('\n📋 Test 3: Button Functionality Analysis...');

const buttonPatterns = [
  { name: 'TouchableOpacity', pattern: /TouchableOpacity/g },
  { name: 'onPress handlers', pattern: /onPress\s*=\s*{[^}]*}/g },
  { name: 'ResponsiveButton', pattern: /ResponsiveButton/g },
  { name: 'Navigation buttons', pattern: /onPress.*navigate|router\./g },
  { name: 'Form submission', pattern: /onPress.*submit|handleSubmit/g },
  { name: 'State updates', pattern: /onPress.*set[A-Z]|setState/g },
  { name: 'API calls', pattern: /onPress.*await|\.then\(/g },
  { name: 'Error handling', pattern: /catch|try.*onPress|onPress.*catch/g }
];

let totalButtons = 0;
let functionalButtons = 0;

dashboardComponents.forEach(component => {
  const componentPath = path.join(__dirname, 'app', 'components', component);
  
  if (fs.existsSync(componentPath)) {
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    buttonPatterns.forEach(pattern => {
      const matches = componentContent.match(pattern.pattern);
      if (matches) {
        totalButtons += matches.length;
        if (pattern.name !== 'TouchableOpacity') {
          functionalButtons += matches.length;
        }
      }
    });
  }
});

console.log(`✅ Total interactive elements found: ${totalButtons}`);
console.log(`✅ Functional button patterns: ${functionalButtons}`);
console.log(`✅ Button functionality ratio: ${totalButtons > 0 ? Math.round((functionalButtons / totalButtons) * 100) : 0}%`);

// Summary Report
console.log('\n🎯 Mobile Responsiveness & Button Functionality Summary:');
console.log('========================================================');
console.log(`Mobile Design System: ${mobileSystemValid ? '✅ Valid' : '❌ Issues Found'}`);
console.log(`Responsive Components: ${responsiveComponentsValid ? '✅ Valid' : '❌ Issues Found'}`);
console.log(`Dashboard Responsiveness: ${dashboardResponsiveness.responsive}/${dashboardResponsiveness.total} components`);
console.log(`Button Functionality: ${totalButtons} interactive elements found`);
console.log(`Accessibility Compliance: ${dashboardResponsiveness.hasAccessibility}/${dashboardResponsiveness.total} components`);
console.log(`Touch Target Compliance: ${dashboardResponsiveness.hasTouchTargets}/${dashboardResponsiveness.total} components`);

// Recommendations
console.log('\n📋 Recommendations for Mobile Optimization:');
console.log('==========================================');

if (dashboardResponsiveness.responsive < dashboardResponsiveness.total) {
  console.log('⚠️  Some dashboards need responsive design improvements');
  console.log('   - Implement ResponsiveContainer, ResponsiveGrid, ResponsiveButton');
  console.log('   - Use mobile-first breakpoints and flexible layouts');
}

if (dashboardResponsiveness.hasAccessibility < dashboardResponsiveness.total) {
  console.log('⚠️  Accessibility improvements needed');
  console.log('   - Add accessibilityRole, accessibilityLabel to all interactive elements');
  console.log('   - Implement proper focus management and screen reader support');
}

if (dashboardResponsiveness.hasTouchTargets < dashboardResponsiveness.total) {
  console.log('⚠️  Touch target compliance improvements needed');
  console.log('   - Ensure all buttons meet minimum 44px touch target size');
  console.log('   - Use designSystem.spacing.touchTarget.min for consistency');
}

console.log('\n✨ Audit Complete!');
console.log('Next: Run device-specific tests and manual button functionality validation');

// Exit with appropriate code
const overallSuccess = mobileSystemValid && responsiveComponentsValid && 
                      (dashboardResponsiveness.responsive >= dashboardResponsiveness.total * 0.8);
process.exit(overallSuccess ? 0 : 1);
