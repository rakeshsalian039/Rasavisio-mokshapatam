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
      style: 'LIGHT',
      backgroundColor: '#0c0a07',
      // overlaysWebView:true — Android 15+ (targetSdk 35+) FORCES apps
      // into edge-to-edge mode. Setting overlaysWebView:false was being
      // silently ignored. Embracing edge-to-edge: WebView draws under
      // status bar + nav bar, we handle insets via CSS env() vars.
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
