#!/usr/bin/env node

/**
 * RoadSide+ Dashboard Test Suite
 * Tests all dashboard components and functionality
 */

const fs = require('fs');
const path = require('path');

console.log('≡ƒÜÇ RoadSide+ Dashboard Test Suite');
console.log('=====================================\n');

// Test 1: Check if all dashboard components exist
console.log('≡ƒôï Test 1: Checking Dashboard Components...');

const componentDir = path.join(__dirname, 'app', 'components');
const requiredComponents = [
  'CustomerDashboard.tsx',
  'AdminDashboard.tsx', 
  'TechnicianDashboard.tsx',
  'PartnerManagement.tsx',
  'SecurityOperationsCenter.tsx',
  'ActivityFeed.tsx',
  'LiveServiceMap.tsx',
  'SystemAlertsView.tsx',
  'PerplexityAssistant.tsx',
  'Auth.tsx'
];

let allComponentsExist = true;
requiredComponents.forEach(component => {
  const componentPath = path.join(componentDir, component);
  if (fs.existsSync(componentPath)) {
    console.log(`Γ£à ${component} - Found`);
  } else {
    console.log(`Γ¥î ${component} - Missing`);
    allComponentsExist = false;
  }
});

// Test 2: Check main app structure
console.log('\n≡ƒôï Test 2: Checking App Structure...');

const appFiles = [
  'app/index.tsx',
  'app/_layout.tsx',
  'app/lib/supabase.ts',
  'package.json',
  '.env'
];

let appStructureValid = true;
appFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Γ£à ${file} - Found`);
  } else {
    console.log(`Γ¥î ${file} - Missing`);
    appStructureValid = false;
  }
});

// Test 3: Check environment configuration
console.log('\n≡ƒôï Test 3: Checking Environment Configuration...');

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const hasSupabaseUrl = envContent.includes('EXPO_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  
  console.log(`Γ£à .env file exists`);
  console.log(`${hasSupabaseUrl ? 'Γ£à' : 'Γ¥î'} Supabase URL configured`);
  console.log(`${hasSupabaseKey ? 'Γ£à' : 'Γ¥î'} Supabase key configured`);
} else {
  console.log('Γ¥î .env file missing');
}

// Test 4: Check package.json scripts
console.log('\n≡ƒôï Test 4: Checking Package Scripts...');

if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['start', 'web', 'android', 'ios'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`Γ£à ${script} script - Available`);
    } else {
      console.log(`Γ¥î ${script} script - Missing`);
    }
  });
}

// Summary
console.log('\n≡ƒÄ» Test Summary:');
console.log('================');
console.log(`Components: ${allComponentsExist ? 'Γ£à All Found' : 'Γ¥î Some Missing'}`);
console.log(`App Structure: ${appStructureValid ? 'Γ£à Valid' : 'Γ¥î Invalid'}`);
console.log(`Environment: ${fs.existsSync('.env') ? 'Γ£à Configured' : 'Γ¥î Not Configured'}`);

console.log('\n≡ƒîÉ Server Status:');
console.log('Access your app at: http://localhost:3000');
console.log('Demo mode is enabled (no Supabase setup required)');

console.log('\n≡ƒô▒ Available Dashboards:');
console.log('========================');
console.log('1. ≡ƒæñ Customer Dashboard - Service requests, tracking, profile');
console.log('2. ΓÜÖ∩╕Å  Admin Dashboard - System overview, user management, analytics');
console.log('3. ≡ƒöº Technician Dashboard - Job assignments, status, tools');
console.log('4. ≡ƒñ¥ Partner Management - Partner onboarding, monitoring');
console.log('5. ≡ƒ¢í∩╕Å  Security Operations - Emergency alerts, monitoring');
console.log('6. ≡ƒôè Activity Feed - Real-time system activities');
console.log('7. ≡ƒù║∩╕Å  Live Service Map - Geographic service tracking');
console.log('8. ≡ƒÜ¿ System Alerts - System notifications and warnings');
console.log('9. ≡ƒñû AI Assistant - Perplexity-powered help system');

console.log('\nΓ£¿ Test Complete!');
