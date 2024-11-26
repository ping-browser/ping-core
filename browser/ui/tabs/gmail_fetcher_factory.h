/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_TABS_GMAIL_FETCHER_FACTORY_H_
#define BRAVE_BROWSER_UI_TABS_GMAIL_FETCHER_FACTORY_H_

#include <memory>

#include "chrome/browser/profiles/profile_keyed_service_factory.h"

namespace base {
template <typename T>
class NoDestructor;
}  // namespace base

class GmailFetcher;

class GmailFetcherFactory : public ProfileKeyedServiceFactory {
 public:
  static GmailFetcher* GetForProfile(Profile* profile);

  static GmailFetcherFactory* GetInstance();

 private:
  friend base::NoDestructor<GmailFetcherFactory>;

  GmailFetcherFactory();
  ~GmailFetcherFactory() override;

  // BrowserContextKeyedServiceFactory:
  std::unique_ptr<KeyedService> BuildServiceInstanceForBrowserContext(
      content::BrowserContext* context) const override;
  bool ServiceIsCreatedWithBrowserContext() const override;
};

#endif  // BRAVE_BROWSER_UI_TABS_GMAIL_FETCHER_FACTORY_H_