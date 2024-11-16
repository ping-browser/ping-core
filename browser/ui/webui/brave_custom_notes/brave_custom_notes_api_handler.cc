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
#include "base/logging.h"

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
const char kSummarizeAPIEndpoint[] = "https://ping.openai.azure.com/openai/deployments/ai-summariser-gpt-35-turbo/chat/completions?api-version=2024-02-15-preview";
const char kRephraseAPIEndpoint[] = "https://ping.openai.azure.com/openai/deployments/ai-summariser-gpt-35-turbo/chat/completions?api-version=2024-02-15-preview";
const char kAPIKey[] = "b487c4dc0bc1490e801cb6220cf04039";

// Constructor implementation
BraveCustomNotesAPIHandler::BraveCustomNotesAPIHandler(
    scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory)
    : url_loader_factory_(std::move(url_loader_factory)) {}

// Destructor implementation
BraveCustomNotesAPIHandler::~BraveCustomNotesAPIHandler() = default;

namespace {

// Create network request loader
std::unique_ptr<network::SimpleURLLoader> CreateLoader(
    const GURL& api_url, 
    const std::string& content, 
    const std::string& mode) {
  
  LOG(INFO) << "Creating loader for URL: " << api_url.spec();
  LOG(INFO) << "Request content to send: " << content;

  // Create the resource request
  auto resource_request = std::make_unique<network::ResourceRequest>();
  resource_request->url = api_url;
  resource_request->method = "POST";
  resource_request->headers.SetHeader("Content-Type", "application/json");
  
  // Add API key header (as provided in the CURL command)
  resource_request->headers.SetHeader("api-key", kAPIKey);

  // Create the URL loader
  auto loader = network::SimpleURLLoader::Create(
      std::move(resource_request), 
      kTrafficAnnotation);

  // Set timeout duration
  constexpr base::TimeDelta kRequestTimeout = base::Seconds(60);
  loader->SetTimeoutDuration(kRequestTimeout);

  // Building JSON body for the request
  base::Value::Dict system_message;
  if (mode == "summarize") {
    system_message.Set("role", "system");
    system_message.Set("content", "You are a Ping AI summariser whose job is to create a summary of the text in a webpage. You help the user by creating bullet points which make it easier to get a gist of the webpage he is viewing. You also add emojis in the bullet points to make it more engaging. You create short to the point summaries for the user. Each point must not be more than a short sentence.");
  } else if (mode == "rephrase") {
    system_message.Set("role", "system");
    system_message.Set("content", "You are an AI designed to rephrase text. Please rephrase the provided content to make it clearer and more concise.");
  }

  base::Value::Dict user_message;
  user_message.Set("role", "user");
  user_message.Set("content", content);

  base::Value::List messages;
  messages.Append(std::move(system_message));
  messages.Append(std::move(user_message));

  base::Value::Dict request_dict;
  request_dict.Set("messages", std::move(messages));
  request_dict.Set("max_tokens", 800);
  request_dict.Set("temperature", 0.5);
  request_dict.Set("frequency_penalty", 0);
  request_dict.Set("presence_penalty", 0);
  request_dict.Set("top_p", 0.95);

  std::string request_body;
  base::JSONWriter::Write(request_dict, &request_body);

  LOG(INFO) << "JSON request body: " << request_body;
  
  // Attach the JSON body to the loader
  loader->AttachStringForUpload(request_body, "application/json");

  // Set retry options in case of network errors
  loader->SetRetryOptions(
      3,  // max retries
      network::SimpleURLLoader::RetryMode::RETRY_ON_NETWORK_CHANGE);

  return loader;
}


}  // namespace


void BraveCustomNotesAPIHandler::CallSummarizeAPI(
    const std::string& content,
    base::OnceCallback<void(const std::string&)> callback) {
  auto loader = CreateLoader(GURL(kSummarizeAPIEndpoint), content, "summarize");

  loader->DownloadToString(
      url_loader_factory_.get(),
      base::BindOnce(
          [](std::unique_ptr<network::SimpleURLLoader> loader,
             base::OnceCallback<void(const std::string&)> callback,
             std::unique_ptr<std::string> response_body) {
            if (response_body && !response_body->empty()) {
              LOG(INFO) << "Summarize API response: " << *response_body;
              std::move(callback).Run(*response_body);
            } else {
              LOG(ERROR) << "Failed to get response from Summarize API.";
              std::move(callback).Run("");
            }
          },
          std::move(loader), std::move(callback)),
      1024 * 1024); // Max response body size
}

void BraveCustomNotesAPIHandler::CallRephraseAPI(
    const std::string& content,
    base::OnceCallback<void(const std::string&)> callback) {
  auto loader = CreateLoader(GURL(kRephraseAPIEndpoint), content, "rephrase");

  loader->DownloadToString(
      url_loader_factory_.get(),
      base::BindOnce(
          [](std::unique_ptr<network::SimpleURLLoader> loader,
             base::OnceCallback<void(const std::string&)> callback,
             std::unique_ptr<std::string> response_body) {
            if (response_body && !response_body->empty()) {
              LOG(INFO) << "Rephrase API response: " << *response_body;
              std::move(callback).Run(*response_body);
            } else {
              LOG(ERROR) << "Failed to get response from Rephrase API.";
              std::move(callback).Run("");
            }
          },
          std::move(loader), std::move(callback)),
      1024 * 1024); // Max response body size
}

