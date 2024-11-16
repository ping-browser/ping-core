/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_API_HANDLER_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_API_HANDLER_H_

#include <memory>
#include <string>
#include <vector>

#include "base/memory/weak_ptr.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "services/network/public/cpp/simple_url_loader.h"

class BraveCustomNotesAPIHandler {
 public:
  // Constructor that initializes the URL loader factory
  explicit BraveCustomNotesAPIHandler(
      scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory);
  
  // Destructor
  ~BraveCustomNotesAPIHandler();

  // Delete copy constructor and assignment operator to avoid object copying
  BraveCustomNotesAPIHandler(const BraveCustomNotesAPIHandler&) = delete;
  BraveCustomNotesAPIHandler& operator=(const BraveCustomNotesAPIHandler&) = delete;

  void CallSummarizeAPI(
    const std::string& content,
    base::OnceCallback<void(const std::string&)> callback);

void CallRephraseAPI(
    const std::string& content,
    base::OnceCallback<void(const std::string&)> callback);

 private:
  // Private method to handle the success response from Summarize API
  void OnSummarizeAPIResponse(network::SimpleURLLoader* loader,
                             std::string* summary,
                             std::unique_ptr<std::string> response_body);

  // Private method to handle the success response from Rephrase API
  void OnRephraseAPIResponse(network::SimpleURLLoader* loader,
                            std::string* rephrased_content,
                            std::unique_ptr<std::string> response_body);

  // URL loader factory to handle network requests
  scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory_;

  // A vector to hold all active URL loaders to manage their lifetimes
  std::vector<std::unique_ptr<network::SimpleURLLoader>> loaders_;

  // Weak pointer factory to safely manage asynchronous callbacks
  base::WeakPtrFactory<BraveCustomNotesAPIHandler> weak_ptr_factory_{this};
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_API_HANDLER_H_
