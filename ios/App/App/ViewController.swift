import UIKit
import Capacitor

class ViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        let dark = UIColor(red: 12/255, green: 10/255, blue: 7/255, alpha: 1)

        // Dark WebView background — eliminates white flash on overscroll
        webView?.backgroundColor = dark
        webView?.isOpaque = false
        webView?.scrollView.backgroundColor = dark

        // Kill bounce entirely — no white rubber-band at top/bottom
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
        webView?.scrollView.alwaysBounceHorizontal = false

        // Remove scroll indicators (more native game feel)
        webView?.scrollView.showsVerticalScrollIndicator = false
        webView?.scrollView.showsHorizontalScrollIndicator = false
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
