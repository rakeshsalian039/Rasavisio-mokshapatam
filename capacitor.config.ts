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
      // overlaysWebView:false — WebView is sandboxed BETWEEN the status
      // bar and the navigation/gesture bar. Both bars are painted by
      // Android OS using theme colors (set explicitly in styles.xml to
      // #0c0a07 so they match the app). This avoids content bleeding
      // into the status bar and into the bottom gesture area, which
      // position:fixed overlays can't easily respect.
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
