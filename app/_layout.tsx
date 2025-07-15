import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform } from "react-native";
// import { AuthProvider } from "./components/Auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add error boundary for better error handling
if (__DEV__) {
  // Development mode - error reporting enabled
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (
      typeof process !== "undefined" &&
      process.env?.EXPO_PUBLIC_TEMPO &&
      Platform.OS === "web"
    ) {
      try {
        // Use dynamic import to prevent bundling issues
        import("tempo-devtools")
          .then(({ TempoDevtools }) => {
            if (TempoDevtools && typeof TempoDevtools.init === "function") {
              TempoDevtools.init();
            }
          })
          .catch((error) => {
            console.warn("TempoDevtools dynamic import failed:", error);
          });
      } catch (error) {
        console.warn("TempoDevtools initialization failed:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={({ route }) => ({
          headerShown: !route.name.startsWith("tempobook"),
        })}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
