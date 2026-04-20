package com.rasavisio.mokshapatam;

import android.os.Bundle;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity — entry point for the Capacitor WebView.
 *
 * IMMERSIVE MODE: both the status bar and the navigation/gesture bar
 * are hidden from the moment the activity starts, so the game uses the
 * entire screen as a full-bleed canvas. The user can still reveal them
 * transiently by swiping from the top or bottom edge (sticky-swipe),
 * and the bars auto-hide a couple of seconds later.
 *
 * Why here (Java side) and not in JS via StatusBar plugin:
 *   - @capacitor/status-bar can hide the status bar, but does NOT
 *     control the Android navigation bar (there's no official plugin).
 *   - Doing it at activity onCreate means the bars are hidden BEFORE
 *     the WebView even loads, so there's no flash of visible chrome
 *     on startup.
 *   - WindowInsetsControllerCompat is the modern replacement for the
 *     deprecated SYSTEM_UI_FLAG_* constants and works on every Android
 *     version we support (minSdk 24).
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Let the app draw behind the system bars (required for immersive).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        WindowInsetsControllerCompat controller =
                new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());

        // Hide BOTH status bar (top) and navigation/gesture bar (bottom).
        controller.hide(WindowInsetsCompat.Type.systemBars());

        // Swipe-from-edge reveals the bars transiently, then they auto-
        // hide. Matches how PUBG / CoD / Genshin handle immersive.
        controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

        // Keep screen on — complements the JS Wake Lock and handles the
        // case where the JS wake lock fails to acquire.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    /**
     * If the user ever dismisses immersive (notification shade pull,
     * accessibility gesture), re-assert it on next focus gain so the
     * bars don't stay visible permanently.
     */
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            WindowInsetsControllerCompat controller =
                    new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
            controller.hide(WindowInsetsCompat.Type.systemBars());
            controller.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }
    }
}
