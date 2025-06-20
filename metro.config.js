const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// Enable context require for expo-router
config.transformer.unstable_allowRequireContext = true;

// Add support for .cjs files to resolve nanoid/non-secure and other CommonJS modules
config.resolver.sourceExts.push("cjs");

// Export with NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });
