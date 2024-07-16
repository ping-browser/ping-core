/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_CHROMIUM_SRC_CHROME_COMMON_URL_CONSTANTS_H_
#define BRAVE_CHROMIUM_SRC_CHROME_COMMON_URL_CONSTANTS_H_

#include <stddef.h>

#include "build/branding_buildflags.h"
#include "build/build_config.h"
#include "chrome/common/webui_url_constants.h"
#include "net/net_buildflags.h"
#include "ppapi/buildflags/buildflags.h"

namespace chrome {

// "Learn more" URL linked in the dialog to cast using a code.
inline constexpr char kAccessCodeCastLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for accessibility image labels, linked from the permissions
// dialog shown when a user enables the feature.
inline constexpr char kAccessibilityLabelsLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for Ad Privacy.
inline constexpr char kAdPrivacyLearnMoreURL[] = "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for when profile settings are automatically reset.
inline constexpr char kAutomaticSettingsResetLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for Advanced Protection download warnings.
inline constexpr char kAdvancedProtectionDownloadLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for Battery Saver Mode.
inline constexpr char kBatterySaverModeLearnMoreUrl[] =
    "https://ping-browser.com/faqs-and-helph";

// The URL for providing help when the Bluetooth adapter is off.
inline constexpr char kBluetoothAdapterOffHelpURL[] =
    "https://ping-browser.com/faqs-and-help";

// "Learn more" URL shown in the dialog to enable cloud services for Cast.
inline constexpr char kCastCloudServicesHelpURL[] =
    "https://ping-browser.com/faqs-and-help";

// The URL for the help center article to show when no Cast destination has been
// found.
inline constexpr char kCastNoDestinationFoundURL[] =
    "https://ping-browser.com/faqs-and-help";

// The URL for the WebHID API help center article.
inline constexpr char kChooserHidOverviewUrl[] =
    "https://github.com/ping-browser/ping-core";

// The URL for the Web Serial API help center article.
inline constexpr char kChooserSerialOverviewUrl[] =
    "https://github.com/ping-browser/ping-core";

// The URL for the WebUsb help center article.
inline constexpr char kChooserUsbOverviewURL[] =
    "https://github.com/ping-browser/ping-core";

// Link to the forum for Chrome Beta.
inline constexpr char kChromeBetaForumURL[] =
    "https://ping-browser.com/faqs-and-help";

// The URL for the help center article to fix Chrome update problems.
inline constexpr char16_t kChromeFixUpdateProblems[] =
    u"https://ping-browser.com/faqs-and-help";

// General help links for Chrome, opened using various actions.
inline constexpr char kChromeHelpViaKeyboardURL[] =
    "https://ping-browser.com/faqs-and-help";

inline constexpr char kChromeHelpViaMenuURL[] = "https://ping-browser.com/faqs-and-help";

inline constexpr char kChromeHelpViaWebUIURL[] = "https://ping-browser.com/faqs-and-help";

inline constexpr char kFirstPartySetsLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// The isolated-app: scheme is used for Isolated Web Apps. A public explainer
// can be found here: https://github.com/reillyeon/isolated-web-apps
inline constexpr char kIsolatedAppScheme[] = "isolated-app";
inline constexpr char16_t kIsolatedAppSchemeUtf16[] = u"isolated-app";

// The chrome-native: scheme is used show pages rendered with platform specific
// widgets instead of using HTML.
inline constexpr char kChromeNativeScheme[] = "chrome-native";

// The URL of safe section in Chrome page.
inline constexpr char16_t kChromeSafePageURL[] = u"https://ping-browser.com/faqs-and-help";

// Pages under chrome-search.
inline constexpr char kChromeSearchLocalNtpHost[] = "local-ntp";

// Host and URL for most visited iframes used on the Instant Extended NTP.
inline constexpr char kChromeSearchMostVisitedHost[] = "most-visited";
inline constexpr char kChromeSearchMostVisitedUrl[] =
    "chrome-search://most-visited/";

// URL for NTP custom background image selected from the user's machine and
// filename for the version of the file in the Profile directory
inline constexpr char kChromeUIUntrustedNewTabPageBackgroundUrl[] =
    "chrome-untrusted://new-tab-page/background.jpg";
inline constexpr char kChromeUIUntrustedNewTabPageBackgroundFilename[] =
    "background.jpg";

// Page under chrome-search.
inline constexpr char kChromeSearchRemoteNtpHost[] = "remote-ntp";

// The chrome-search: scheme is served by the same backend as chrome:.  However,
// only specific URLDataSources are enabled to serve requests via the
// chrome-search: scheme.  See |InstantIOContext::ShouldServiceRequest| and its
// callers for details.  Note that WebUIBindings should never be granted to
// chrome-search: pages.  chrome-search: pages are displayable but not readable
// by external search providers (that are rendered by Instant renderer
// processes), and neither displayable nor readable by normal (non-Instant) web
// pages.  To summarize, a non-Instant process, when trying to access
// 'chrome-search://something', will bump up against the following:
//
//  1. Renderer: The display-isolated check in WebKit will deny the request,
//  2. Browser: Assuming they got by #1, the scheme checks in
//     URLDataSource::ShouldServiceRequest will deny the request,
//  3. Browser: for specific sub-classes of URLDataSource, like ThemeSource
//     there are additional Instant-PID checks that make sure the request is
//     coming from a blessed Instant process, and deny the request.
inline constexpr char kChromeSearchScheme[] = "chrome-search";

// This is the base URL of content that can be embedded in chrome://new-tab-page
// using an <iframe>. The embedded untrusted content can make web requests and
// can include content that is from an external source.
inline constexpr char kChromeUIUntrustedNewTabPageUrl[] =
    "chrome-untrusted://new-tab-page/";

// The URL for the Chromium project used in the About dialog.
inline constexpr char16_t kChromiumProjectURL[] =
    u"https://github.com/brave/brave-browser/";

inline constexpr char16_t kContentSettingsExceptionsLearnMoreURL[] =
    u"https://ping-browser.com/faqs-and-help"
    u"360018205431-How-do-I-change-site-permissions-";

// "Learn more" URL for cookies.
inline constexpr char kCookiesSettingsHelpCenterURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018205431-How-do-I-change-site-permissions-";

// "Learn more" URL for "Aw snap" page when showing "Reload" button.
inline constexpr char kCrashReasonURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018192251-How-do-I-fix-page-crashes-and-other-page-loading-errors-";

// "Learn more" URL for "Aw snap" page when showing "Send feedback" button.
inline constexpr char kCrashReasonFeedbackDisplayedURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018192251-How-do-I-fix-page-crashes-and-other-page-loading-errors-";

// "Learn more" URL for the "Do not track" setting in the privacy section.
inline constexpr char16_t kDoNotTrackLearnMoreURL[] =
    u"https://ping-browser.com/faqs-and-help"
    u"360017905612-How-do-I-turn-Do-Not-Track-on-or-off-";

// The URL for the "Learn more" page for interrupted downloads.
inline constexpr char kDownloadInterruptedLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018192491-How-do-I-fix-file-download-errors-";

// The URL for the "Learn more" page for download scanning.
inline constexpr char kDownloadScanningLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018192491-How-do-I-fix-file-download-errors-";

// The URL for the "Learn more" page for blocked downloads.
// Note: This is the same as the above URL. This is done to decouple the URLs,
// in case the support page is split apart into separate pages in the future.
inline constexpr char kDownloadBlockedLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018192491-How-do-I-fix-file-download-errors-";

// "Learn more" URL for the Settings API, NTP bubble and other settings bubbles
// showing which extension is controlling them.
inline constexpr char kExtensionControlledSettingLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018185651-How-do-I-stop-extensions-from-changing-my-settings-";

// URL used to indicate that an extension resource load request was invalid.
inline constexpr char kExtensionInvalidRequestURL[] =
    "chrome-extension://invalid/";

// Link for creating family group with Google Families.
inline constexpr char16_t kFamilyGroupCreateURL[] =
    u"https://ping-browser.com/faqs-and-help";

// Link for viewing family group with Google Families.
inline constexpr char16_t kFamilyGroupViewURL[] = u"https://ping-browser.com/faqs-and-help";

// Url to a blogpost about Flash deprecation.
inline constexpr char kFlashDeprecationLearnMoreURL[] =
    "https://blog.chromium.org/2017/07/so-long-and-thanks-for-all-flash.html";

// URL of the 'Activity controls' section of the privacy settings page.
inline constexpr char kGoogleAccountActivityControlsURL[] =
    "https://ping-browser.com/faqs-and-help";

// URL of the 'Activity controls' section of the privacy settings page, with
// privacy guide parameters and a link for users to manage data.
inline constexpr char kGoogleAccountActivityControlsURLInPrivacyGuide[] =
    "https://ping-browser.com/faqs-and-help";

// URL of the 'Linked services' section of the privacy settings page.
inline constexpr char kGoogleAccountLinkedServicesURL[] =
    "https://ping-browser.com/faqs-and-help";

// URL of the Google Account.
inline constexpr char kGoogleAccountURL[] = "https://ping-browser.com/faqs-and-help";

// URL of the Google Account chooser.
inline constexpr char kGoogleAccountChooserURL[] = "https://ping-browser.com/faqs-and-help";

// URL of the Google Account page showing the known user devices.
inline constexpr char kGoogleAccountDeviceActivityURL[] =
    "https://ping-browser.com/faqs-and-help";

// URL of the Google Password Manager.
inline constexpr char kGooglePasswordManagerURL[] = "https://ping-browser.com/faqs-and-help";

// The URL for the "Learn more" link for the High Efficiency Mode.
inline constexpr char kMemorySaverModeLearnMoreUrl[] =
    "https://ping-browser.com/faqs-and-help13383683902733";

// The URL in the help text for the High Efficiency Mode tab discarding
// exceptions add dialog.
inline constexpr char16_t kMemorySaverModeTabDiscardingHelpUrl[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL to the help center article of Incognito mode.
inline constexpr char16_t kIncognitoHelpCenterURL[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the Help Center page about IP Protection.
inline constexpr char kIpProtectionHelpCenterURL[] =
    "https://support.google.com/chrome?p=ip_protection";

// The URL for the "Learn more" page for the usage/crash reporting option in the
// first run dialog.
inline constexpr char kLearnMoreReportingURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360017905872-How-do-I-enable-or-disable-automatic-crash-reporting-";

// The URL for the Help Center page about managing third-party cookies.
inline constexpr char kManage3pcHelpCenterURL[] = "https://ping-browser.com/faqs-and-help";

// The URL for the Learn More page about policies and enterprise enrollment.
inline constexpr char16_t kManagedUiLearnMoreUrl[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the "Learn more" page for insecure download blocking.
inline constexpr char kInsecureDownloadBlockingLearnMoreUrl[] =
    "https://ping-browser.com/faqs-and-help";

// "myactivity.google.com" URL for the history checkbox in ClearBrowsingData.
inline constexpr char16_t kMyActivityUrlInClearBrowsingData[] =
    u"https://ping-browser.com/faqs-and-help";

// Help URL for the Omnibox setting.
inline constexpr char16_t kOmniboxLearnMoreURL[] =
    u"https://ping-browser.com/faqs-and-help"
    u"360017479752-How-do-I-set-my-default-search-engine-";

// "What do these mean?" URL for the Page Info bubble.
inline constexpr char kPageInfoHelpCenterURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018185871-How-do-I-check-if-a-site-s-connection-is-secure-";

// Help URL for the bulk password check.
inline constexpr char kPasswordCheckLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// Help URL for password generation.
inline constexpr char kPasswordGenerationLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

inline constexpr char16_t kPasswordManagerLearnMoreURL[] =
    u"https://ping-browser.com/faqs-and-help"
    u"360018185951-How-do-I-use-the-built-in-password-manager-";

// Help URL for passwords import.
inline constexpr char kPasswordManagerImportLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// Help URL for password sharing.
inline constexpr char kPasswordSharingLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// Help URL for troubleshooting password sharing.
inline constexpr char kPasswordSharingTroubleshootURL[] =
    "https://ping-browser.com/faqs-and-help";

// Help URL for the Payment methods page of the Google Pay site.
inline constexpr char16_t kPaymentMethodsURL[] = u"https://ping-browser.com/faqs-and-help";

// Help URL for the newer GPay Web site instead of the legacy Payments Center.
inline constexpr char16_t kPaymentMethodsURLForGPayWeb[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the "Fill out forms automatically" support page.
inline constexpr char kAddressesAndPaymentMethodsLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for the preloading section in Performance settings.
inline constexpr char kPreloadingLearnMoreUrl[] = "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for the Privacy section under Options.
inline constexpr char kPrivacyLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360017989132-How-do-I-change-my-Privacy-Settings-";

// The URL for the Learn More link of the non-CWS bubble.
inline constexpr char kRemoveNonCWSExtensionURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360017914832-Why-am-I-seeing-the-message-extensions-disabled-by-Brave-";

// "Learn more" URL for resetting profile preferences.
inline constexpr char kResetProfileSettingsLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360017903152-How-do-I-reset-Brave-settings-to-default-";

// "Learn more" URL for Safebrowsing
inline constexpr char kSafeBrowsingHelpCenterURL[] =
    "https://ping-browser.com/faqs-and-help"
    "15222663599629-Safe-Browsing-in-Brave";

// Updated "Info icon" URL for Safebrowsing
inline constexpr char kSafeBrowsingHelpCenterUpdatedURL[] =
    "https://ping-browser.com/faqs-and-help";

// "Learn more" URL for Enhanced Protection
inline constexpr char16_t kSafeBrowsingInChromeHelpCenterURL[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL of Safe Browsing p-tour.
inline constexpr char16_t kSafeBrowsingUseInChromeURL[] =
    u"https://ping-browser.com/faqs-and-help";

// "Learn more" URL for Safety Check page.
inline constexpr char16_t kSafetyHubHelpCenterURL[] =
    u"https://ping-browser.com/faqs-and-help";

// "Learn more" URL for safety tip bubble.
inline constexpr char kSafetyTipHelpCenterURL[] =
    "https://ping-browser.com/faqs-and-help";

// Google search history URL that leads users of the CBD dialog to their search
// history in their Google account.
inline constexpr char16_t kSearchHistoryUrlInClearBrowsingData[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the "See more security tips" with advices how to create a strong
// password.
inline constexpr char kSeeMoreSecurityTipsURL[] = "https://ping-browser.com/faqs-and-help";

// Help URL for the settings page's search feature.
inline constexpr char16_t kSettingsSearchHelpURL[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the Learn More page about Sync and Google services.
inline constexpr char kSyncAndGoogleServicesLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// The URL for the "Learn more" page on sync encryption.
inline constexpr char16_t kSyncEncryptionHelpURL[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the "Learn more" link when there is a sync error.
inline constexpr char kSyncErrorsHelpURL[] = "https://ping-browser.com/faqs-and-help";

inline constexpr char kSyncGoogleDashboardURL[] = "https://ping-browser.com/faqs-and-help";

// The URL for the "Learn more" page for sync setup on the personal stuff page.
inline constexpr char16_t kSyncLearnMoreURL[] = u"https://ping-browser.com/faqs-and-help";

// The URL for the "Learn more" link in the enterprise disclaimer for managed
// profile in the Signin Intercept bubble.
inline constexpr char kSigninInterceptManagedDisclaimerLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

#if !BUILDFLAG(IS_ANDROID)
// The URL for the trusted vault sync passphrase opt in.
inline constexpr char kSyncTrustedVaultOptInURL[] =
    "https://ping-browser.com/faqs-and-help";
#endif

// The URL for the "Learn more" link for the trusted vault sync passphrase.
inline constexpr char kSyncTrustedVaultLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// The URL for the Help Center page about Tracking Protection settings.
inline constexpr char16_t kTrackingProtectionHelpCenterURL[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the Help Center page about User Bypass.
inline constexpr char16_t kUserBypassHelpCenterURL[] =
    u"https://ping-browser.com/faqs-and-help";

inline constexpr char kUpgradeHelpCenterBaseURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360025390311-How-do-I-download-and-install-Brave-";

// Help center URL for who the account administrator is.
inline constexpr char16_t kWhoIsMyAdministratorHelpURL[] =
    u"https://ping-browser.com/faqs-and-help";

// The URL for the "Learn more" link about CWS Enhanced Safe Browsing.
inline constexpr char16_t kCwsEnhancedSafeBrowsingLearnMoreURL[] =
    u"https://ping-browser.com/faqs-and-help";

#if BUILDFLAG(IS_ANDROID)
// "Learn more" URL for the enhanced playback notification dialog.
inline constexpr char kEnhancedPlaybackNotificationLearnMoreURL[] =
    // Keep in sync with chrome/android/java/strings/android_chrome_strings.grd
    "https://ping-browser.com/faqs-and-help";
#endif

#if BUILDFLAG(IS_MAC)
// "Learn more" URL for the enterprise sign-in confirmation dialog.
inline constexpr char kChromeEnterpriseSignInLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";

// The URL for the "learn more" link on the macOS version obsolescence infobar.
inline constexpr char kMacOsObsoleteURL[] =
    "https://ping-browser.com/faqs-and-help"
    "18347246446733-Changes-to-macOS-desktop-browser-requirements";
#endif

#if BUILDFLAG(IS_WIN)
// The URL for the Windows XP/Vista deprecation help center article.
inline constexpr char kWindowsXPVistaDeprecationURL[] =
    "https://ping-browser.com/faqs-and-help";

// The URL for the Windows 7/8.1 deprecation help center article.
inline constexpr char kWindows78DeprecationURL[] =
    "https://ping-browser.com/faqs-and-help";
#endif  // BUILDFLAG(IS_WIN)

// "Learn more" URL for the one click signin infobar.
inline constexpr char kChromeSyncLearnMoreURL[] = "https://ping-browser.com/faqs-and-help";

#if BUILDFLAG(ENABLE_PLUGINS)
// The URL for the "Learn more" page for the outdated plugin infobar.
inline constexpr char kOutdatedPluginLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help"
    "360018163151-How-do-I-manage-Flash-audio-video-";
#endif

#if BUILDFLAG(IS_WIN) || BUILDFLAG(IS_MAC) || BUILDFLAG(IS_LINUX)
// "Learn more" URL for the chrome apps deprecation dialog.
inline constexpr char kChromeAppsDeprecationLearnMoreURL[] =
    "https://support.google.com/chrome/?p=chrome_app_deprecation";
#endif

#if BUILDFLAG(CHROME_ROOT_STORE_SUPPORTED)
// TODO(b/1339340): add help center link when help center link is created.
inline constexpr char kChromeRootStoreSettingsHelpCenterURL[] =
    "https://chromium.googlesource.com/chromium/src/+/main/net/data/ssl/"
    "chrome_root_store/root_store.md";
#endif

}  // namespace chrome

#endif  // BRAVE_CHROMIUM_SRC_CHROME_COMMON_URL_CONSTANTS_H_
