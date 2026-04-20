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
      // overlaysWebView:true — the WebView draws UNDER the status bar
      // so the status bar area shows our own #0c0a07 body background
      // (not the OS-default white). Combined with viewport-fit=cover
      // + env(safe-area-inset-*) padding in CSS, this gives us edge-
      // to-edge dark chrome on Android 13+.
      overlaysWebView: true,
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
