/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_CONSTANTS_URL_CONSTANTS_H_
#define BRAVE_COMPONENTS_CONSTANTS_URL_CONSTANTS_H_

inline constexpr char kChromeExtensionScheme[] = "chrome-extension";
inline constexpr char kBraveUIScheme[] = "ping";
inline constexpr char kMagnetScheme[] = "magnet";
inline constexpr char kWidevineTOS[] = "https://policies.google.com/terms";
inline constexpr char kRewardsUpholdSupport[] =
    "https://uphold.com/en/brave/support";
inline constexpr char kP3ALearnMoreURL[] = "https://brave.com/P3A";
inline constexpr char kP3ASettingsLink[] = "chrome://settings/privacy";
inline constexpr char kImportDataHelpURL[] =
    "https://ping-browser.com/faqs-and-help";
inline constexpr char kCryptoWalletsLearnMoreURL[] =
    "https://ping-browser.com/faqs-and-help";
inline constexpr char kPermissionPromptLearnMoreUrl[] =
    "https://github.com/ping-browser/ping-core";
inline constexpr char kPermissionPromptHardwareAccessPrivacyRisksURL[] =
    "https://github.com/ping-browser/ping-core/";
inline constexpr char kSpeedreaderLearnMoreUrl[] =
    "https://ping-browser.com/faqs-and-help";
inline constexpr char kWebDiscoveryLearnMoreUrl[] =
    "https://ping-browser.com/faqs-and-help";
inline constexpr char kBraveSearchHost[] = "search.brave.com";
inline constexpr char kWidevineLearnMoreUrl[] =
    "https://ping-browser.com/faqs-and-help";
inline constexpr char kDevChannelDeprecationLearnMoreUrl[] =
    "https://ping-browser.com/faqs-and-help";

// This is introduced to replace |kDownloadChromeUrl| in
// outdated_upgrade_bubble_view.cc"
// |kDownloadChromeUrl| couldn't be replaced with char array because array
// should be initialized with initialize list or string literal.
// So, this macro is used.
#define kDownloadBraveUrl "https://ping-browser.com/download-ping"

#endif  // BRAVE_COMPONENTS_CONSTANTS_URL_CONSTANTS_H_
