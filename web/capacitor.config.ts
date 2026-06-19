import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor wraps the same Vite/React build (webDir: dist) into native iOS/Android.
// Install deps when native wrapping begins:
//   npm i @capacitor/core @capacitor/cli && npx cap init && npx cap add ios android
const config: CapacitorConfig = {
  appId: "com.arskymap.app",
  appName: "AR Sky-Map",
  webDir: "dist",
};

export default config;
