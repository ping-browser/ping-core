/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * you can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_api_handler.h"

#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "url/gurl.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/values.h"
#include "net/traffic_annotation/network_traffic_annotation.h"

// Traffic annotation for the network requests
constexpr net::NetworkTrafficAnnotationTag kTrafficAnnotation = net::DefineNetworkTrafficAnnotation(
    "brave_custom_notes_api",
    R"(
    semantics {
      sender: "Brave Custom Notes API"
      description: "Handles summarizing and rephrasing notes."
      trigger: "User interacts with note features to summarize or rephrase content."
      data: "User-provided note content."
      destination: OTHER
    }
    policy {
      cookies_allowed: NO
      setting: "No user settings needed."
      policy_exception_justification: "Not required."
    })");

// API Endpoints
const char kSummarizeAPIEndpoint[] = "https://openai-text-summarizer.azurewebsites.net/summarize";
const char kRephraseAPIEndpoint[] = "https://openai-text-summarizer.azurewebsites.net/rephrase";

namespace {

std::unique_ptr<network::SimpleURLLoader> CreateLoader(
    const GURL& api_url, 
    const std::string& content) {
  VLOG(1) << "Creating loader for URL: " << api_url.spec();
  LOG(INFO) << "Request content length: " << content.length();

  auto resource_request = std::make_unique<network::ResourceRequest>();
  resource_request->url = api_url;
  resource_request->method = "POST";
  resource_request->headers.SetHeader("Content-Type", "application/json");

  auto loader = network::SimpleURLLoader::Create(
      std::move(resource_request), 
      kTrafficAnnotation);
  
  base::Value::Dict request_dict;
  request_dict.Set("content", content);
  std::string request_body;
  base::JSONWriter::Write(request_dict, &request_body);

  VLOG(2) << "Request body: " << request_body;
  
  loader->AttachStringForUpload(request_body, "application/json");
  
  // Set retry options
  loader->SetRetryOptions(
      3,  // max retries
      network::SimpleURLLoader::RetryMode::RETRY_ON_NETWORK_CHANGE);

  return loader;
}

}  // namespace

BraveCustomNotesAPIHandler::BraveCustomNotesAPIHandler(
    scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory)
    : url_loader_factory_(std::move(url_loader_factory)) {
      LOG(INFO) << "BraveCustomNotesAPIHandler initialized";
    }

BraveCustomNotesAPIHandler::~BraveCustomNotesAPIHandler(){
  LOG(INFO) << "BraveCustomNotesAPIHandler destroyed";
  if (!loaders_.empty()) {
    LOG(WARNING) << "Destroying handler with " << loaders_.size() 
                << " pending requests";
  }
}

void BraveCustomNotesAPIHandler::CallSummarizeAPI(
    const std::string& content, std::string* summary) {
       VLOG(1) << "Calling summarize API";
  GURL api_url(kSummarizeAPIEndpoint);
  auto loader = CreateLoader(api_url, content);

  loader->DownloadToString(
      url_loader_factory_.get(),
      base::BindOnce(&BraveCustomNotesAPIHandler::OnSummarizeAPISuccess,
                     weak_ptr_factory_.GetWeakPtr(), loader.get(), summary),
      1024 * 1024 /* 1MB max size */);

  loaders_.push_back(std::move(loader));
  VLOG(1) << "Summarize request sent. Active loaders: " << loaders_.size();
}

void BraveCustomNotesAPIHandler::CallRephraseAPI(
    const std::string& content, std::string* rephrased_content) {
      VLOG(1) << "Calling rephrase API";
  GURL api_url(kRephraseAPIEndpoint);
  auto loader = CreateLoader(api_url, content);

  loader->DownloadToString(
      url_loader_factory_.get(),
      base::BindOnce(&BraveCustomNotesAPIHandler::OnRephraseAPISuccess,
                     weak_ptr_factory_.GetWeakPtr(), loader.get(), rephrased_content),
      1024 * 1024 /* 1MB max size */);

  loaders_.push_back(std::move(loader));
  VLOG(1) << "Rephrase request sent. Active loaders: " << loaders_.size();
}

void BraveCustomNotesAPIHandler::OnSummarizeAPISuccess(
    network::SimpleURLLoader* loader,
    std::string* summary,
    std::unique_ptr<std::string> response_body) {
      VLOG(1) << "Processing summarize API response";
  if (response_body) {
    auto json_result = base::JSONReader::Read(*response_body);
    if (json_result && json_result->is_dict()) {
      const std::string* api_result = json_result->GetDict().FindString("summary");
      if (api_result) {
        *summary = *api_result;
      } else {
        *summary = "Key 'summary' not found in the response.";
      }
    } else {
      *summary = "Invalid JSON response.";
    }
  } else {
    *summary = "Failed to get a response.";
  }

  // Cleanup completed loader
  auto it = std::find_if(loaders_.begin(), loaders_.end(),
                         [loader](const std::unique_ptr<network::SimpleURLLoader>& l) {
                           return l.get() == loader;
                         });
  if (it != loaders_.end()) {
    loaders_.erase(it);
  }
}

void BraveCustomNotesAPIHandler::OnRephraseAPISuccess(
    network::SimpleURLLoader* loader,
    std::string* rephrased_content,
    std::unique_ptr<std::string> response_body) {
  if (response_body) {
    auto json_result = base::JSONReader::Read(*response_body);
    if (json_result && json_result->is_dict()) {
      const std::string* api_result = json_result->GetDict().FindString("rephrased_content");
      if (api_result) {
        *rephrased_content = *api_result;
      } else {
        *rephrased_content = "Key 'rephrased_content' not found in the response.";
      }
    } else {
      *rephrased_content = "Invalid JSON response.";
    }
  } else {
    *rephrased_content = "Failed to get a response.";
  }

  // Cleanup completed loader
  auto it = std::find_if(loaders_.begin(), loaders_.end(),
                         [loader](const std::unique_ptr<network::SimpleURLLoader>& l) {
                           return l.get() == loader;
                         });
  if (it != loaders_.end()) {
    loaders_.erase(it);
  }
}