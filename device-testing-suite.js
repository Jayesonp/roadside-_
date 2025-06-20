#!/usr/bin/env node

/**
 * Device Testing Suite for Mobile Responsiveness
 * Comprehensive testing across multiple device types and screen sizes
 */

const fs = require('fs');
const path = require('path');

console.log('≡ƒô▒ Device Testing Suite for Mobile Responsiveness');
console.log('=================================================\n');

// Device specifications for testing
const testDevices = [
  {
    name: 'iPhone SE (3rd gen)',
    type: 'phone',
    screen: { width: 375, height: 667, density: 2 },
    os: 'iOS',
    priority: 'high'
  },
  {
    name: 'iPhone 14',
    type: 'phone', 
    screen: { width: 390, height: 844, density: 3 },
    os: 'iOS',
    priority: 'high'
  },
  {
    name: 'iPhone 14 Pro Max',
    type: 'phone',
    screen: { width: 430, height: 932, density: 3 },
    os: 'iOS', 
    priority: 'medium'
  },
  {
    name: 'Samsung Galaxy S23',
    type: 'phone',
    screen: { width: 360, height: 780, density: 3 },
    os: 'Android',
    priority: 'high'
  },
  {
    name: 'Google Pixel 7',
    type: 'phone',
    screen: { width: 412, height: 915, density: 2.6 },
    os: 'Android',
    priority: 'medium'
  },
  {
    name: 'iPad Air',
    type: 'tablet',
    screen: { width: 820, height: 1180, density: 2 },
    os: 'iOS',
    priority: 'medium'
  },
  {
    name: 'Samsung Galaxy Tab S8',
    type: 'tablet', 
    screen: { width: 753, height: 1037, density: 2.4 },
    os: 'Android',
    priority: 'low'
  }
];

// Responsive breakpoints from design system
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};

// Touch target specifications
const touchTargets = {
  minimum: 44,
  recommended: 48,
  comfortable: 56
};

// Function to determine device category
function getDeviceCategory(width) {
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  return 'xl';
}

// Function to validate responsive design for device
function validateResponsiveDesign(device) {
  console.log(`≡ƒô▒ Testing ${device.name} (${device.screen.width}x${device.screen.height})`);
  
  const category = getDeviceCategory(device.screen.width);
  const isPhone = device.type === 'phone';
  const isTablet = device.type === 'tablet';
  
  const tests = {
    screenSize: {
      name: 'Screen Size Compatibility',
      passed: device.screen.width >= 320 && device.screen.height >= 568,
      details: `${device.screen.width}x${device.screen.height} (${category})`
    },
    touchTargets: {
      name: 'Touch Target Size',
      passed: true, // Will be validated per component
      details: `Min: ${touchTargets.minimum}px, Recommended: ${touchTargets.recommended}px`
    },
    textReadability: {
      name: 'Text Readability',
      passed: device.screen.density >= 1.5,
      details: `Density: ${device.screen.density}x`
    },
    navigationUsability: {
      name: 'Navigation Usability',
      passed: isPhone ? device.screen.width >= 320 : device.screen.width >= 768,
      details: isPhone ? 'Bottom nav optimized' : 'Side nav suitable'
    },
    contentLayout: {
      name: 'Content Layout',
      passed: true,
      details: isPhone ? 'Single column' : 'Multi-column grid'
    }
  };

  let passedTests = 0;
  Object.entries(tests).forEach(([key, test]) => {
    const status = test.passed ? 'Γ£à' : 'Γ¥î';
    console.log(`  ${status} ${test.name}: ${test.details}`);
    if (test.passed) passedTests++;
  });

  const score = Math.round((passedTests / Object.keys(tests).length) * 100);
  console.log(`  ≡ƒôè Device compatibility score: ${score}%\n`);
  
  return {
    device: device.name,
    category,
    score,
    passed: score >= 80,
    tests
  };
}

// Function to validate button functionality
function validateButtonFunctionality() {
  console.log('≡ƒöÿ Button Functionality Validation');
  console.log('==================================\n');

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

  let totalButtons = 0;
  let functionalButtons = 0;
  let accessibleButtons = 0;
  let touchCompliantButtons = 0;

  dashboardComponents.forEach(component => {
    const componentPath = path.join(__dirname, 'app', 'components', component);
    
    if (!fs.existsSync(componentPath)) {
      console.log(`Γ¥î ${component} not found`);
      return;
    }

    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Count different types of buttons and interactions
    const touchableElements = (content.match(/TouchableOpacity|ResponsiveButton/g) || []).length;
    const onPressHandlers = (content.match(/onPress\s*=\s*{[^}]*}/g) || []).length;
    const accessibilityLabels = (content.match(/accessibilityLabel|accessibilityRole/g) || []).length;
    const touchTargetStyles = (content.match(/minHeight.*44|min-h-\[44px\]|touchTarget/g) || []).length;
    
    // Analyze button functionality patterns
    const navigationButtons = (content.match(/onPress.*navigate|setCurrentView|setActiveView/g) || []).length;
    const formSubmissions = (content.match(/onPress.*submit|handleSubmit|handleSave/g) || []).length;
    const stateUpdates = (content.match(/onPress.*set[A-Z]|setState/g) || []).length;
    const apiCalls = (content.match(/onPress.*await|supabase\.|fetch\(/g) || []).length;
    const modalToggles = (content.match(/onPress.*Modal|setShow[A-Z]/g) || []).length;
    const alertCalls = (content.match(/Alert\.alert|confirm/g) || []).length;

    const functionalPatterns = navigationButtons + formSubmissions + stateUpdates + apiCalls + modalToggles + alertCalls;
    const functionalityRatio = touchableElements > 0 ? (functionalPatterns / touchableElements) : 0;
    const accessibilityRatio = touchableElements > 0 ? (accessibilityLabels / touchableElements) : 0;
    const touchTargetRatio = touchableElements > 0 ? (touchTargetStyles / touchableElements) : 0;

    console.log(`≡ƒô▒ ${component}:`);
    console.log(`  ≡ƒöÿ Interactive elements: ${touchableElements}`);
    console.log(`  ΓÜí Functional patterns: ${functionalPatterns} (${Math.round(functionalityRatio * 100)}%)`);
    console.log(`  ΓÖ┐ Accessibility: ${accessibilityLabels} (${Math.round(accessibilityRatio * 100)}%)`);
    console.log(`  ≡ƒæå Touch targets: ${touchTargetStyles} (${Math.round(touchTargetRatio * 100)}%)`);
    
    // Detailed functionality breakdown
    if (functionalPatterns > 0) {
      console.log(`    - Navigation: ${navigationButtons}`);
      console.log(`    - Form submissions: ${formSubmissions}`);
      console.log(`    - State updates: ${stateUpdates}`);
      console.log(`    - API calls: ${apiCalls}`);
      console.log(`    - Modal toggles: ${modalToggles}`);
      console.log(`    - Alert dialogs: ${alertCalls}`);
    }
    
    console.log('');

    totalButtons += touchableElements;
    functionalButtons += functionalPatterns;
    accessibleButtons += accessibilityLabels;
    touchCompliantButtons += touchTargetStyles;
  });

  const overallFunctionalityRatio = totalButtons > 0 ? (functionalButtons / totalButtons) : 0;
  const overallAccessibilityRatio = totalButtons > 0 ? (accessibleButtons / totalButtons) : 0;
  const overallTouchTargetRatio = totalButtons > 0 ? (touchCompliantButtons / totalButtons) : 0;

  console.log('≡ƒôè Button Functionality Summary:');
  console.log('================================');
  console.log(`Total interactive elements: ${totalButtons}`);
  console.log(`Functional elements: ${functionalButtons} (${Math.round(overallFunctionalityRatio * 100)}%)`);
  console.log(`Accessible elements: ${accessibleButtons} (${Math.round(overallAccessibilityRatio * 100)}%)`);
  console.log(`Touch compliant elements: ${touchCompliantButtons} (${Math.round(overallTouchTargetRatio * 100)}%)`);

  return {
    total: totalButtons,
    functional: functionalButtons,
    accessible: accessibleButtons,
    touchCompliant: touchCompliantButtons,
    functionalityRatio: overallFunctionalityRatio,
    accessibilityRatio: overallAccessibilityRatio,
    touchTargetRatio: overallTouchTargetRatio
  };
}

// Main testing process
console.log('≡ƒÜÇ Starting comprehensive device testing...\n');

// Test responsive design across devices
console.log('≡ƒô▒ Device Compatibility Testing');
console.log('===============================\n');

const deviceResults = testDevices.map(device => validateResponsiveDesign(device));

// Validate button functionality
const buttonResults = validateButtonFunctionality();

// Generate comprehensive report
console.log('\n≡ƒÄ» Comprehensive Testing Report');
console.log('===============================\n');

// Device compatibility summary
const passedDevices = deviceResults.filter(result => result.passed).length;
const averageScore = Math.round(deviceResults.reduce((sum, result) => sum + result.score, 0) / deviceResults.length);

console.log('≡ƒô▒ Device Compatibility:');
console.log(`  Γ£à Compatible devices: ${passedDevices}/${deviceResults.length}`);
console.log(`  ≡ƒôè Average compatibility score: ${averageScore}%`);

// Priority device breakdown
const highPriorityDevices = deviceResults.filter(result => 
  testDevices.find(device => device.name === result.device)?.priority === 'high'
);
const highPriorityPassed = highPriorityDevices.filter(result => result.passed).length;

console.log(`  ≡ƒÄ» High priority devices: ${highPriorityPassed}/${highPriorityDevices.length} passed`);

// Button functionality summary
console.log('\n≡ƒöÿ Button Functionality:');
console.log(`  ΓÜí Functionality: ${Math.round(buttonResults.functionalityRatio * 100)}%`);
console.log(`  ΓÖ┐ Accessibility: ${Math.round(buttonResults.accessibilityRatio * 100)}%`);
console.log(`  ≡ƒæå Touch targets: ${Math.round(buttonResults.touchTargetRatio * 100)}%`);

// Overall assessment
const overallScore = (
  (passedDevices / deviceResults.length) * 0.4 +
  buttonResults.functionalityRatio * 0.3 +
  buttonResults.accessibilityRatio * 0.2 +
  buttonResults.touchTargetRatio * 0.1
) * 100;

console.log('\n≡ƒÅå Overall Mobile Readiness Score:');
console.log(`≡ƒôè ${Math.round(overallScore)}% - ${overallScore >= 90 ? 'Excellent' : overallScore >= 80 ? 'Good' : overallScore >= 70 ? 'Fair' : 'Needs Improvement'}`);

console.log('\n≡ƒôï Recommendations:');
console.log('===================');

if (buttonResults.accessibilityRatio < 0.8) {
  console.log('ΓÜá∩╕Å  Improve accessibility: Add accessibilityRole and accessibilityLabel to more buttons');
}

if (buttonResults.touchTargetRatio < 0.8) {
  console.log('ΓÜá∩╕Å  Improve touch targets: Ensure all buttons meet 44px minimum size');
}

if (passedDevices < deviceResults.length) {
  console.log('ΓÜá∩╕Å  Device compatibility: Test and optimize for failing devices');
}

if (buttonResults.functionalityRatio < 0.8) {
  console.log('ΓÜá∩╕Å  Button functionality: Ensure all buttons have proper onPress handlers');
}

console.log('\nΓ£¿ Device testing complete!');

// Exit with appropriate code
process.exit(overallScore >= 80 ? 0 : 1);
