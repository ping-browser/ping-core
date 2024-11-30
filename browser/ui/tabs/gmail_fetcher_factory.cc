/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/tabs/gmail_fetcher_factory.h"

#include <memory>

#include "base/no_destructor.h"
#include "brave/browser/ui/tabs/gmail_fetcher.h"
#include "chrome/browser/profiles/profile.h"

// static
GmailFetcher* GmailFetcherFactory::GetForProfile(Profile* profile) {
  return static_cast<GmailFetcher*>(
      GetInstance()->GetServiceForBrowserContext(profile, true));
}

GmailFetcherFactory* GmailFetcherFactory::GetInstance() {
  static base::NoDestructor<GmailFetcherFactory> instance;
  return instance.get();
}

GmailFetcherFactory::GmailFetcherFactory()
    : ProfileKeyedServiceFactory(
          "GmailFetcher",
          ProfileSelections::Builder()
              .WithRegular(ProfileSelection::kOwnInstance)
              .WithGuest(ProfileSelection::kOwnInstance)
              .Build()) {}

GmailFetcherFactory::~GmailFetcherFactory() {}

std::unique_ptr<KeyedService>
GmailFetcherFactory::BuildServiceInstanceForBrowserContext(
    content::BrowserContext* context) const {
  return std::make_unique<GmailFetcher>(
      Profile::FromBrowserContext(context));
}

bool GmailFetcherFactory::ServiceIsCreatedWithBrowserContext() const {
  return true;
}