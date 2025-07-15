const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the Expo export command
console.log('Building Expo web output...');
execSync('npx expo export --platform web', { stdio: 'inherit' });

// Ensure the public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create the _redirects file for SPA routing
const redirectsContent = '/* /index.html 200';
fs.writeFileSync(path.join(publicDir, '_redirects'), redirectsContent);

console.log('Build completed successfully!');
