import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rasavisio.mokshapatam',
  appName: 'Moksha Patam 108',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      // App hides it manually after first render for smooth handoff
      launchAutoHide: false,
      launchShowDuration: 1500,
      backgroundColor: '#0c0a07',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // LIGHT icons visible on our dark background
      style: 'LIGHT',
      backgroundColor: '#0c0a07',
      overlaysWebView: false,
    },
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#0c0a07',
    allowMixedContent: false,
    captureInput: true,
    // TODO: set to false for release build
    webContentsDebuggingEnabled: true,
  },
};

export default config;
