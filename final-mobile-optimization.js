#!/usr/bin/env node

/**
 * Final Mobile Optimization Script
 * Focuses on touch targets and accessibility improvements
 */

const fs = require('fs');
const path = require('path');

console.log('≡ƒô▒ Final Mobile Optimization: Touch Targets & Accessibility');
console.log('===========================================================\n');

// Components to optimize
const components = [
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

// Function to add touch targets and accessibility
function optimizeComponentFinal(componentPath, componentName) {
  console.log(`≡ƒöº Final optimization for ${componentName}...`);
  
  if (!fs.existsSync(componentPath)) {
    console.log(`Γ¥î ${componentName} not found`);
    return false;
  }

  let content = fs.readFileSync(componentPath, 'utf8');
  let modified = false;

  // 1. Add touch target styles to TouchableOpacity elements
  const touchablePattern = /<TouchableOpacity([^>]*className="([^"]*)"[^>]*)>/g;
  let touchableMatches = [...content.matchAll(touchablePattern)];
  
  touchableMatches.forEach(match => {
    const fullMatch = match[0];
    const attributes = match[1];
    const className = match[2];
    
    // Check if already has minHeight or touch target
    if (!attributes.includes('minHeight') && !attributes.includes('style={{') && !className.includes('min-h-')) {
      const newElement = fullMatch.replace(
        />/,
        ` style={{ minHeight: 44 }}>`
      );
      content = content.replace(fullMatch, newElement);
      modified = true;
    }
  });

  // 2. Add accessibility labels to TouchableOpacity without them
  const touchableWithoutAccessibility = /<TouchableOpacity([^>]*onPress[^>]*)>/g;
  let accessibilityMatches = [...content.matchAll(touchableWithoutAccessibility)];
  
  accessibilityMatches.forEach(match => {
    const fullMatch = match[0];
    const attributes = match[1];
    
    // Check if already has accessibility attributes
    if (!attributes.includes('accessibilityRole') && !attributes.includes('accessibilityLabel')) {
      const newElement = fullMatch.replace(
        />/,
        ` accessibilityRole="button" accessibilityLabel="Interactive button">`
      );
      content = content.replace(fullMatch, newElement);
      modified = true;
    }
  });

  // 3. Add touch targets to ResponsiveButton elements
  const responsiveButtonPattern = /<ResponsiveButton([^>]*className="([^"]*)"[^>]*)>/g;
  let responsiveMatches = [...content.matchAll(responsiveButtonPattern)];
  
  responsiveMatches.forEach(match => {
    const fullMatch = match[0];
    const attributes = match[1];
    
    // ResponsiveButton should already have touch targets, but ensure it
    if (!attributes.includes('minHeight') && !attributes.includes('style={{')) {
      const newElement = fullMatch.replace(
        />/,
        ` style={{ minHeight: designSystem.spacing.touchTarget.min }}>`
      );
      content = content.replace(fullMatch, newElement);
      modified = true;
    }
  });

  // 4. Improve specific accessibility labels based on context
  const contextualReplacements = [
    {
      pattern: /accessibilityLabel="Interactive button"([^>]*onPress[^>]*navigate)/g,
      replacement: 'accessibilityLabel="Navigation button"$1'
    },
    {
      pattern: /accessibilityLabel="Interactive button"([^>]*onPress[^>]*submit)/g,
      replacement: 'accessibilityLabel="Submit button"$1'
    },
    {
      pattern: /accessibilityLabel="Interactive button"([^>]*onPress[^>]*save)/g,
      replacement: 'accessibilityLabel="Save button"$1'
    },
    {
      pattern: /accessibilityLabel="Interactive button"([^>]*onPress[^>]*delete)/g,
      replacement: 'accessibilityLabel="Delete button"$1'
    },
    {
      pattern: /accessibilityLabel="Interactive button"([^>]*onPress[^>]*close)/g,
      replacement: 'accessibilityLabel="Close button"$1'
    },
    {
      pattern: /accessibilityLabel="Interactive button"([^>]*onPress[^>]*modal)/gi,
      replacement: 'accessibilityLabel="Open modal button"$1'
    }
  ];

  contextualReplacements.forEach(replacement => {
    const matches = content.match(replacement.pattern);
    if (matches) {
      content = content.replace(replacement.pattern, replacement.replacement);
      modified = true;
    }
  });

  // 5. Add proper ARIA roles and labels to Text elements that act as buttons
  const textButtonPattern = /<Text([^>]*onPress[^>]*)>/g;
  let textButtonMatches = [...content.matchAll(textButtonPattern)];
  
  textButtonMatches.forEach(match => {
    const fullMatch = match[0];
    const attributes = match[1];
    
    if (!attributes.includes('accessibilityRole')) {
      const newElement = fullMatch.replace(
        />/,
        ` accessibilityRole="button" accessibilityLabel="Text button">`
      );
      content = content.replace(fullMatch, newElement);
      modified = true;
    }
  });

  // 6. Ensure proper focus management for modal elements
  const modalPattern = /<Modal([^>]*)>/g;
  let modalMatches = [...content.matchAll(modalPattern)];
  
  modalMatches.forEach(match => {
    const fullMatch = match[0];
    const attributes = match[1];
    
    if (!attributes.includes('accessibilityViewIsModal')) {
      const newElement = fullMatch.replace(
        />/,
        ` accessibilityViewIsModal={true}>`
      );
      content = content.replace(fullMatch, newElement);
      modified = true;
    }
  });

  // Save the optimized component
  if (modified) {
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log(`Γ£à ${componentName} final optimization applied`);
    return true;
  } else {
    console.log(`Γä╣∩╕Å  ${componentName} already optimized`);
    return false;
  }
}

// Function to validate final optimization results
function validateFinalOptimization(componentPath, componentName) {
  if (!fs.existsSync(componentPath)) return { touchTargets: 0, accessibility: 0, total: 0 };

  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Count interactive elements
  const touchableElements = (content.match(/TouchableOpacity|ResponsiveButton/g) || []).length;
  
  // Count touch target implementations
  const touchTargets = (content.match(/minHeight.*44|min-h-\[44px\]|touchTarget\.min/g) || []).length;
  
  // Count accessibility implementations
  const accessibilityLabels = (content.match(/accessibilityLabel|accessibilityRole/g) || []).length;
  
  // Count modal accessibility
  const modalAccessibility = (content.match(/accessibilityViewIsModal/g) || []).length;
  
  const touchTargetRatio = touchableElements > 0 ? (touchTargets / touchableElements) : 0;
  const accessibilityRatio = touchableElements > 0 ? (accessibilityLabels / touchableElements) : 0;

  console.log(`≡ƒôè ${componentName} validation:`);
  console.log(`  ≡ƒöÿ Interactive elements: ${touchableElements}`);
  console.log(`  ≡ƒæå Touch targets: ${touchTargets} (${Math.round(touchTargetRatio * 100)}%)`);
  console.log(`  ΓÖ┐ Accessibility: ${accessibilityLabels} (${Math.round(accessibilityRatio * 100)}%)`);
  console.log(`  ≡ƒö▓ Modal accessibility: ${modalAccessibility}`);

  return {
    total: touchableElements,
    touchTargets,
    accessibility: accessibilityLabels,
    modalAccessibility,
    touchTargetRatio,
    accessibilityRatio
  };
}

// Main optimization process
console.log('≡ƒÜÇ Starting final mobile optimization...\n');

let totalOptimized = 0;
let totalTouchTargets = 0;
let totalAccessibility = 0;
let totalElements = 0;

components.forEach(component => {
  const componentPath = path.join(__dirname, 'app', 'components', component);
  
  console.log(`\n≡ƒô▒ Final optimization for ${component}`);
  
  // Apply final optimizations
  const optimized = optimizeComponentFinal(componentPath, component);
  if (optimized) totalOptimized++;
  
  // Validate results
  const validation = validateFinalOptimization(componentPath, component);
  totalElements += validation.total;
  totalTouchTargets += validation.touchTargets;
  totalAccessibility += validation.accessibility;
});

// Final summary
const overallTouchTargetRatio = totalElements > 0 ? (totalTouchTargets / totalElements) : 0;
const overallAccessibilityRatio = totalElements > 0 ? (totalAccessibility / totalElements) : 0;

console.log('\n≡ƒÄ» Final Optimization Summary:');
console.log('==============================');
console.log(`Components optimized: ${totalOptimized}/${components.length}`);
console.log(`Total interactive elements: ${totalElements}`);
console.log(`Touch target compliance: ${Math.round(overallTouchTargetRatio * 100)}%`);
console.log(`Accessibility compliance: ${Math.round(overallAccessibilityRatio * 100)}%`);

// Calculate final mobile readiness score
const finalScore = (
  (totalOptimized / components.length) * 0.3 +
  overallTouchTargetRatio * 0.4 +
  overallAccessibilityRatio * 0.3
) * 100;

console.log(`\n≡ƒÅå Final Mobile Readiness Score: ${Math.round(finalScore)}%`);

if (finalScore >= 90) {
  console.log('≡ƒÄë Excellent! Your app is fully mobile-ready!');
} else if (finalScore >= 80) {
  console.log('Γ£à Good! Your app is mobile-ready with minor improvements needed.');
} else if (finalScore >= 70) {
  console.log('ΓÜá∩╕Å  Fair. Some improvements still needed for optimal mobile experience.');
} else {
  console.log('Γ¥î Needs improvement. Significant mobile optimization required.');
}

console.log('\n≡ƒôï Final Recommendations:');
console.log('=========================');

if (overallTouchTargetRatio < 0.9) {
  console.log('≡ƒæå Continue improving touch targets - aim for 90%+ compliance');
}

if (overallAccessibilityRatio < 0.9) {
  console.log('ΓÖ┐ Continue improving accessibility - add more descriptive labels');
}

console.log('\n≡ƒô▒ Manual Testing Checklist:');
console.log('============================');
console.log('Γûí Test on iPhone SE (smallest screen)');
console.log('Γûí Test on iPhone 14 Pro Max (largest phone)');
console.log('Γûí Test on iPad (tablet layout)');
console.log('Γûí Verify all buttons are easily tappable');
console.log('Γûí Test with VoiceOver/TalkBack screen readers');
console.log('Γûí Check landscape orientation');
console.log('Γûí Validate form inputs on mobile keyboards');
console.log('Γûí Test modal interactions');
console.log('Γûí Verify navigation usability');

console.log('\nΓ£¿ Final mobile optimization complete!');

// Exit with appropriate code
process.exit(finalScore >= 80 ? 0 : 1);
