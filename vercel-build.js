const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build for RoadSide+ app...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Run the Expo export command
  console.log('📦 Building Expo web output...');
  execSync('npx expo export --platform web', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify dist directory exists
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Build failed: dist directory not created');
  }

  // Create _redirects file in dist directory for SPA routing
  const redirectsContent = `# SPA routing for RoadSide+ app
/* /index.html 200

# Cache static assets
/_expo/static/* /\_expo/static/:splat 200
/assets/* /assets/:splat 200
/images/* /images/:splat 200`;

  fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);
  console.log('✅ Created _redirects file for SPA routing');

  // Create a simple 404.html fallback
  const notFoundContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RoadSide+ - Page Not Found</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #0f172a; color: white; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .logo { font-size: 3rem; margin-bottom: 1rem; }
        .message { font-size: 1.2rem; margin-bottom: 2rem; color: #94a3b8; }
        .button { background: #3b82f6; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚗 RoadSide+</div>
        <h1>Page Not Found</h1>
        <p class="message">The page you're looking for doesn't exist.</p>
        <a href="/" class="button">Go to Dashboard</a>
    </div>
    <script>
        // Redirect to home after 3 seconds
        setTimeout(() => window.location.href = '/', 3000);
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, '404.html'), notFoundContent);
  console.log('✅ Created 404.html fallback page');

  // Verify critical files exist
  const criticalFiles = ['index.html', '_expo', 'assets'];
  for (const file of criticalFiles) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: ${file} not found in build output`);
    } else {
      console.log(`✅ Verified: ${file} exists`);
    }
  }

  console.log('🎉 Build completed successfully!');
  console.log(`📁 Output directory: ${distDir}`);

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
