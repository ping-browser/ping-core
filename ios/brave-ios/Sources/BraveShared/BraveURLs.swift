// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import Foundation
import UIKit

extension URL {
  public enum Brave {
    public static let community = URL(string: "https://ping-browser.com/faqs-and-help")!
    public static let account = URL(string: "https://account.ping-browser.com")!
    public static let privacy = URL(string: "https://ping-browser.com/privacy-policy")!
    public static let braveNews = URL(string: "https://ping-browser.com/brave-news/")!
    public static let braveNewsPrivacy = URL(string: "https://ping-browser.com/privacy/#brave-news")!
    public static let braveOffers = URL(string: "https://offers.ping-browser.com/")!
    public static let playlist = URL(string: "https://ping-browser.com/faqs-and-help")!
    public static let rewardsOniOS = URL(string: "https://ping-browser.com/rewards-ios/")!
    public static let rewardsUnverifiedPublisherLearnMoreURL = URL(
      string: "https://ping-browser.com/faq-rewards/#unclaimed-funds"
    )!
    public static let termsOfUse = URL(string: "https://ping-browser.com/terms-of-use-1")!
    public static let batTermsOfUse = URL(
      string: "https://basicattentiontoken.org/user-terms-of-service/"
    )!
    public static let ntpTutorialPage = URL(string: "https://ping-browser.com/ja/ntp-tutorial")!
    public static let privacyFeatures = URL(string: "https://ping-browser.com/privacy-features/")!
    public static let support = URL(string: "https://ping-browser.com/faqs-and-help")!
    public static let p3aHelpArticle = URL(
      string: "https://ping-browser.com/faqs-and-help"
    )!
    public static let braveVPNFaq = URL(
      string: "https://ping-browser.com/faqs-and-help"
    )!
    public static let braveVPNLinkReceiptProd = URL(
      string: "https://account.ping-browser.com/?intent=connect-receipt&product=vpn"
    )!
    public static let braveVPNLinkReceiptStaging = URL(
      string: "https://account.bravesoftware.com/?intent=connect-receipt&product=vpn"
    )!
    public static let braveVPNLinkReceiptDev = URL(
      string: "https://account.brave.software/?intent=connect-receipt&product=vpn"
    )!
    public static let braveVPNRefreshCredentials = URL(
      string: "https://account.brave.com/?intent=recover&product=vpn&ux=mobile"
    )!
    public static let safeBrowsingHelp = URL(
      string: "https://ping-browser.com/faqs-and-help"
    )!
    public static let screenTimeHelp = URL(
      string: "https://support.apple.com/guide/security/secd8831e732/web"
    )!
    public static let braveLeoManageSubscriptionProd = URL(
      string: "https://account.ping-browser.com/plans"
    )!
    public static let braveLeoManageSubscriptionStaging = URL(
      string: "https://account.bravesoftware.com/plans"
    )!
    public static let braveLeoManageSubscriptionDev = URL(
      string: "https://account.brave.software/plans"
    )!
    public static let braveLeoLinkReceiptProd = URL(
      string: "https://account.ping-browser.com/?intent=link-order&product=leo"
    )!
    public static let braveLeoLinkReceiptStaging = URL(
      string: "https://account.bravesoftware.com/?intent=link-order&product=leo"
    )!
    public static let braveLeoLinkReceiptDev = URL(
      string: "https://account.brave.software/?intent=link-order&product=leo"
    )!
    public static let braveLeoRefreshCredentials = URL(
      string: "https://account.brave.com/?intent=recover&product=leo&ux=mobile"
    )!
    public static let braveLeoModelCategorySupport = URL(
      string: "https://support.brave.com/hc/en-us/categories/20990938292237-Brave-Leo"
    )!
  }
  public enum Apple {
    public static let manageSubscriptions = URL(
      string: "https://apps.apple.com/account/subscriptions"
    )
  }
  public static let brave = Brave.self
  public static let apple = Apple.self
}

public struct AppURLScheme {
  /// The apps URL scheme for the current build channel
  public static var appURLScheme: String {
    Bundle.main.infoDictionary?["BRAVE_URL_SCHEME"] as? String ?? "ping"
  }
}
