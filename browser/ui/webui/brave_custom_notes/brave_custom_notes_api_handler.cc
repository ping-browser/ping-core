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

// Handle API response for both Summarize and Rephrase
void BraveCustomNotesAPIHandler::OnAPIResponse(
    network::SimpleURLLoader* loader,
    std::string* output_content,
    std::unique_ptr<std::string> response_body) {
  LOG(INFO) << "Processing API response";

  if (response_body) {
    LOG(INFO) << "API response body: " << *response_body;

    // Attempt to read and parse the JSON response
    auto json_result = base::JSONReader::Read(*response_body);
    
    if (!json_result) {
      LOG(ERROR) << "Failed to parse JSON response.";
      *output_content = "Failed to parse JSON response.";
      return;
    }
    
    if (!json_result->is_dict()) {
      LOG(ERROR) << "Parsed JSON is not a dictionary.";
      *output_content = "Parsed JSON is not a dictionary.";
      return;
    }

    // Get the list of choices
    const base::Value::List* choices = json_result->GetDict().FindList("choices");
    if (!choices) {
      LOG(ERROR) << "'choices' not found in the response.";
      *output_content = "'choices' not found in the response.";
      return;
    }

    if (choices->empty()) {
      LOG(ERROR) << "No choices found in the response.";
      *output_content = "No choices found in the response.";
      return;
    }

    // Access the first choice
    const base::Value::Dict& first_choice = choices->front().GetDict();

    // Log the entire first choice for debugging
    LOG(INFO) << "First choice: " << first_choice.DebugString();

    // Extract the message content
    const base::Value::Dict* message = first_choice.FindDict("message");
    if (!message) {
      LOG(ERROR) << "'message' not found in the first choice.";
      *output_content = "'message' not found in the first choice.";
      return;
    }

    const std::string* api_result = message->FindString("content");
    if (api_result) {
      *output_content = *api_result; // Set output_content to the extracted message
    } else {
      LOG(ERROR) << "'content' not found in 'message'.";
      *output_content = "'content' not found in 'message'.";
    }

    // Optionally log content filter results
    const base::Value::Dict* content_filter_results = first_choice.FindDict("content_filter_results");
    if (content_filter_results) {
      LOG(INFO) << "Content filter results: " << content_filter_results->DebugString();
    } else {
      LOG(INFO) << "No content filter results found.";
    }
  } else {
    LOG(ERROR) << "Failed to get a response.";
    *output_content = "Failed to get a response.";
  }

  // Log the output content for debugging
  LOG(INFO) << "Output content: " << *output_content;

  // Remove completed loader from the active loaders list
  auto it = std::find_if(loaders_.begin(), loaders_.end(),
                         [loader](const std::unique_ptr<network::SimpleURLLoader>& l) {
                           return l.get() == loader;
                         });
  if (it != loaders_.end()) {
    loaders_.erase(it);
  }
}


// Function to call the Summarize API
void BraveCustomNotesAPIHandler::CallSummarizeAPI(
    const std::string& content, std::string* summary) {
  
  GURL api_url(kSummarizeAPIEndpoint);
  LOG(INFO) << "Attempting to call Summarize API at: " << api_url.spec();
  auto loader = CreateLoader(api_url, content, "summarize");

  // Check if loader was created successfully
  if (!loader) {
    LOG(ERROR) << "Failed to create loader for Summarize API.";
    return;
  }

  loader->DownloadToStringOfUnboundedSizeUntilCrashAndDie(
      url_loader_factory_.get(),
      base::BindOnce(&BraveCustomNotesAPIHandler::OnAPIResponse,
                     base::Unretained(this), loader.get(), summary));

  loaders_.push_back(std::move(loader));
}

// Function to call the Rephrase API
void BraveCustomNotesAPIHandler::CallRephraseAPI(
    const std::string& content, std::string* rephrased_content) {
  
  GURL api_url(kRephraseAPIEndpoint);
  LOG(INFO) << "Attempting to call Rephrase API at: " << api_url.spec();
  auto loader = CreateLoader(api_url, content, "rephrase");

  // Check if loader was created successfully
  if (!loader) {
    LOG(ERROR) << "Failed to create loader for Rephrase API.";
    return;
  }

  loader->DownloadToStringOfUnboundedSizeUntilCrashAndDie(
      url_loader_factory_.get(),
      base::BindOnce(&BraveCustomNotesAPIHandler::OnAPIResponse,
                     base::Unretained(this), loader.get(), rephrased_content));

  loaders_.push_back(std::move(loader));
}
