import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rasavisio.mokshapatam',
  appName: 'Moksha Patam 108',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0c0a07',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0c0a07',
    },
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#0c0a07',
  },
};

export default config;
