// Copyright (c) 2019 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

#ifndef BRAVE_COMPONENTS_BRAVE_SHIELDS_CORE_COMMON_BRAVE_SHIELD_CONSTANTS_H_
#define BRAVE_COMPONENTS_BRAVE_SHIELDS_CORE_COMMON_BRAVE_SHIELD_CONSTANTS_H_

#include "base/files/file_path.h"

namespace brave_shields {

inline constexpr char kAds[] = "shieldsAds";
inline constexpr char kCosmeticFiltering[] = "cosmeticFiltering";
inline constexpr char kTrackers[] = "trackers";
inline constexpr char kHTTPUpgradableResources[] = "httpUpgradableResources";
inline constexpr char kHTTPSUpgrades[] = "httpsUpgrades";
inline constexpr char kJavaScript[] = "javascript";
inline constexpr char kFingerprintingV2[] = "fingerprintingV2";
inline constexpr char kBraveShields[] = "braveShields";
inline constexpr char kReferrers[] = "referrers";
inline constexpr char kCookies[] = "shieldsCookiesV3";
inline constexpr char kFacebookEmbeds[] = "fb-embeds";
inline constexpr char kTwitterEmbeds[] = "twitter-embeds";
inline constexpr char kLinkedInEmbeds[] = "linked-in-embeds";

// Values used before the migration away from ResourceIdentifier, kept around
// for migration purposes only.
inline constexpr char kObsoleteAds[] = "ads";
inline constexpr char kObsoleteCookies[] = "cookies";
inline constexpr char kObsoleteShieldsCookies[] = "shieldsCookies";

// Some users were not properly migrated from fingerprinting V1.
inline constexpr char kObsoleteFingerprinting[] = "fingerprinting";

// Key for procedural and action filters in the UrlCosmeticResources struct from
// adblock-rust
inline constexpr char kCosmeticResourcesProceduralActions[] =
    "procedural_actions";

// Filename for cached text from a custom filter list subscription
const base::FilePath::CharType kCustomSubscriptionListText[] =
    FILE_PATH_LITERAL("list_text.txt");

inline constexpr char kCookieListUuid[] =
    "AC023D22-AE88-4060-A978-4FEEEC4221693";
inline constexpr char kMobileNotificationsListUuid[] =
    "2F3DCE16-A19A-493C-A88F-2E110FBD37D6";
inline constexpr char kExperimentalListUuid[] =
    "564C3B75-8731-404C-AD7C-5683258BA0B0";

inline constexpr char kAdBlockResourceComponentName[] =
    "Brave Ad Block Resources Library";
inline constexpr char kAdBlockResourceComponentId[] =
    "blhkcadgbdffefgjpldgmejkjljinmle";
inline constexpr char kAdBlockResourceComponentBase64PublicKey[] =
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArZUCk8AVlgg5PKFweivKwThDmwfCdIPQ5fdoRBzoPKwjXHGSm9ZVglL5Y2S3v8vnI1pf55zANO/cW6pVze8SAuXmQh234UglhDaeJfzjkZemIBqKxdeWX004Im7CuPTXPk2Obb1k6jZz6YHFY/nl+Cg7bDbAkT/zCQc5mIPYpNlA/S5hSFR1vQ0TBLNUd2vR8E7wZmqggUYU7F1aMA2MWIVwqYkOvqjzj55UrKYIquqGKe2eih8Aoyqks00Yh8mSpmJs43PeuBO3Wv44Sz6GNUtB6wch4e1cQwccVoyB8YYLFy3LKrybtOL1mI2KB0UdAXGwGh0f9CgjTvh1M44rOQIDAQAB";

inline constexpr char kAdBlockFilterListCatalogComponentName[] =
    "Brave Ad Block List Catalog";
inline constexpr char kAdBlockFilterListCatalogComponentId[] =
    "bjneejakfglnppfnebmlgaolhghnplaa";
inline constexpr char kAdBlockFilterListCatalogComponentBase64PublicKey[] =
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiO2W67NWAbLMfHvBkFreLc6ulCFv509BL4nmK6Tmpd0wNJwMYtjHDkAjOaCZoQrcMGf+LSIf6NspzFoVjJry/lIaA0wfHrfZeQZXKsCo/+J30+KTGK0CzNzhg0QWZiuFb3dxfeAu7JPkA9kUsawHoXKl8cGTUFz25/M8kX8LbzU/7Nlwbadqr/F7hvOygZXo2BgfBBOzDGGWMVZUEKVe8o4oSXOfv2P6bUTi87XqGe2XY8312YpGQOfA+rVG7vYVuZagfy/MYN07N4rKRK2PXWr6oGdiAJlVqEraB7cr9LjcoTn2dzVKh5ps1T9EIYX6HBSrOyriDbDqhDdZLtbflQIDAQAB";

inline constexpr char kCookieListEnabledHistogram[] =
    "Brave.Shields.CookieListEnabled";
inline constexpr char kCookieListPromptHistogram[] =
    "Brave.Shields.CookieListPrompt";

}  // namespace brave_shields

#endif  // BRAVE_COMPONENTS_BRAVE_SHIELDS_CORE_COMMON_BRAVE_SHIELD_CONSTANTS_H_
