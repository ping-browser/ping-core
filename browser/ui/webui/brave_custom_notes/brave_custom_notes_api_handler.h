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
  explicit BraveCustomNotesAPIHandler(
      scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory);
  ~BraveCustomNotesAPIHandler();

  BraveCustomNotesAPIHandler(const BraveCustomNotesAPIHandler&) = delete;
  BraveCustomNotesAPIHandler& operator=(const BraveCustomNotesAPIHandler&) = delete;

  void CallSummarizeAPI(const std::string& content, std::string* summary);
  void CallRephraseAPI(const std::string& content, std::string* rephrased_content);

 private:
  void OnSummarizeAPISuccess(network::SimpleURLLoader* loader,
                             std::string* summary,
                             std::unique_ptr<std::string> response_body);
  void OnRephraseAPISuccess(network::SimpleURLLoader* loader,
                            std::string* rephrased_content,
                            std::unique_ptr<std::string> response_body);

  scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory_;
  std::vector<std::unique_ptr<network::SimpleURLLoader>> loaders_;
  base::WeakPtrFactory<BraveCustomNotesAPIHandler> weak_ptr_factory_{this};
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_API_HANDLER_H_