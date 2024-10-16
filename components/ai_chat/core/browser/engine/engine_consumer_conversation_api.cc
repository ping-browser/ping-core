// Copyright (c) 2024 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

#include "brave/components/ai_chat/core/browser/engine/engine_consumer_conversation_api.h"

#include <string>
#include <utility>
#include <vector>

#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/memory/weak_ptr.h"
#include "base/notreached.h"
#include "base/strings/string_split.h"
#include "base/strings/string_util.h"
#include "base/types/expected.h"
#include "brave/components/ai_chat/core/common/mojom/ai_chat.mojom.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"

namespace ai_chat {

namespace {

using ConversationEvent = ConversationAPIClient::ConversationEvent;
using ConversationEventType = ConversationAPIClient::ConversationEventType;

ConversationEvent GetAssociatedContentConversationEvent(
    const std::string& content,
    const bool is_video) {
  ConversationEvent event;
  event.role = mojom::CharacterType::HUMAN;
  event.content = content;
  // TODO(petemill): Differentiate video XML / VTT
  event.type = is_video ? ConversationEventType::VideoTranscriptXML
                        : ConversationEventType::PageText;
  return event;
}

}  // namespace

EngineConsumerConversationAPI::EngineConsumerConversationAPI(
    const mojom::Model& model,
    scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory,
    AIChatCredentialManager* credential_manager) {
  DCHECK(!model.name.empty());
  api_ = std::make_unique<ConversationAPIClient>(model.name, url_loader_factory,
                                                 credential_manager);
}

EngineConsumerConversationAPI::~EngineConsumerConversationAPI() = default;

void EngineConsumerConversationAPI::ClearAllQueries() {
  api_->ClearAllQueries();
}

void EngineConsumerConversationAPI::GenerateRewriteSuggestion(
    std::string text,
    const std::string& question,
    GenerationDataCallback received_callback,
    GenerationCompletedCallback completed_callback) {
  std::vector<ConversationEvent> conversation = {
      {mojom::CharacterType::HUMAN, ConversationEventType::UserText, text},
      {mojom::CharacterType::HUMAN, ConversationEventType::RequestRewrite,
       question}};
  api_->PerformRequest(std::move(conversation), std::move(received_callback),
                       std::move(completed_callback));
}

void EngineConsumerConversationAPI::GenerateQuestionSuggestions(
    const bool& is_video,
    const std::string& page_content,
    SuggestedQuestionsCallback callback) {
  std::vector<ConversationEvent> conversation{
      GetAssociatedContentConversationEvent(page_content, is_video),
      {mojom::CharacterType::HUMAN,
       ConversationEventType::RequestSuggestedActions, ""}};

  auto on_response = base::BindOnce(
      &EngineConsumerConversationAPI::OnGenerateQuestionSuggestionsResponse,
      weak_ptr_factory_.GetWeakPtr(), std::move(callback));

  api_->PerformRequest(std::move(conversation), base::NullCallback(),
                       std::move(on_response));
}

void EngineConsumerConversationAPI::OnGenerateQuestionSuggestionsResponse(
    SuggestedQuestionsCallback callback,
    GenerationResult result) {
  if (!result.has_value() || result->empty()) {
    // Query resulted in error
    std::move(callback).Run(base::unexpected(std::move(result.error())));
    return;
  }

  // Success
  std::vector<std::string> questions =
      base::SplitString(*result, "|", base::WhitespaceHandling::TRIM_WHITESPACE,
                        base::SplitResult::SPLIT_WANT_NONEMPTY);
  std::move(callback).Run(std::move(questions));
}

void EngineConsumerConversationAPI::GenerateAssistantResponse(
    const bool& is_video,
    const std::string& page_content,
    const ConversationHistory& conversation_history,
    const std::string& human_input,
    GenerationDataCallback data_received_callback,
    GenerationCompletedCallback completed_callback) {
  if (conversation_history.empty()) {
    std::move(completed_callback).Run(base::unexpected(mojom::APIError::None));
    return;
  }

  const mojom::ConversationTurnPtr& last_turn = conversation_history.back();
  if (last_turn->character_type != mojom::CharacterType::HUMAN) {
    std::move(completed_callback).Run(base::unexpected(mojom::APIError::None));
    return;
  }

  std::vector<ConversationEvent> conversation;
  // associated content
  if (!page_content.empty()) {
    conversation.push_back(
        GetAssociatedContentConversationEvent(page_content, is_video));
  }
  // history
  for (const auto& message : conversation_history) {
    if (message->selected_text.has_value() &&
        !message->selected_text->empty()) {
      conversation.push_back({mojom::CharacterType::HUMAN,
                              ConversationEventType::PageExcerpt,
                              message->selected_text.value()});
    }
    ConversationEvent event;
    event.role = message->character_type;
    event.content = (message == last_turn) ? human_input : message->text;
    // TODO(petemill): Shouldn't the server handle the map of mojom::ActionType
    // to prompts? (e.g. SUMMARIZE_PAGE, PARAPHRASE, etc.)
    event.type = ConversationEventType::ChatMessage;
    conversation.push_back(std::move(event));
  }

  api_->PerformRequest(std::move(conversation),
                       std::move(data_received_callback),
                       std::move(completed_callback));
}

void EngineConsumerConversationAPI::SanitizeInput(std::string& input) {
  // Sanitization is handled by the server
}

bool EngineConsumerConversationAPI::SupportsDeltaTextResponses() const {
  return true;
}

}  // namespace ai_chat
