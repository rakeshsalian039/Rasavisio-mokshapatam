import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Configure WebView appearance once app is fully active
        configureWebView()
    }

    private func configureWebView() {
        guard let rootVC = window?.rootViewController else { return }
        let dark = UIColor(red: 12/255, green: 10/255, blue: 7/255, alpha: 1)
        for wv in allWebViews(in: rootVC.view) {
            wv.backgroundColor = dark
            wv.isOpaque = false
            wv.scrollView.backgroundColor = dark
            wv.scrollView.bounces = false
            wv.scrollView.alwaysBounceVertical = false
            wv.scrollView.alwaysBounceHorizontal = false
            wv.scrollView.showsVerticalScrollIndicator = false
            wv.scrollView.showsHorizontalScrollIndicator = false
        }
    }

    private func allWebViews(in view: UIView) -> [WKWebView] {
        var result: [WKWebView] = []
        if let wv = view as? WKWebView { result.append(wv) }
        view.subviews.forEach { result += allWebViews(in: $0) }
        return result
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
