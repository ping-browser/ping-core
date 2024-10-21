/* Copyright(c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * you can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_handler.h"

#include <algorithm>
#include <string>
#include <utility>
#include <vector>
#include <map>

#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "brave/components/search_engines/brave_prepopulated_engines.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_finder.h"
#include "components/prefs/pref_service.h"
#include "components/prefs/scoped_user_pref_update.h"
#include "content/public/browser/page_navigator.h"
#include "content/public/browser/web_contents.h"

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_api_handler.h"

namespace {
const char kCustomNotesKey[] = "custom_notes";
}  // namespace

class BraveCustomNotesPageHandler::APICallbackHelper {
 public:
  explicit APICallbackHelper(base::WeakPtr<BraveCustomNotesPageHandler> handler,
                           int32_t note_id)
      : handler_(handler),
        note_id_(note_id) {}

  void OnSummarizeComplete(const std::string& summary) {
    if (handler_)
      handler_->OnSummarizeComplete(note_id_, summary);
  }

  void OnRephraseComplete(const std::string& rephrased) {
    if (handler_)
      handler_->OnRephraseComplete(note_id_, rephrased);
  }

 private:
  base::WeakPtr<BraveCustomNotesPageHandler> handler_;
  int32_t note_id_;
};

BraveCustomNotesPageHandler::BraveCustomNotesPageHandler(
    Profile* profile,
    content::WebContents* web_contents,
    mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler> receiver,
    scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory)
    : profile_(profile),
      web_contents_(web_contents),
      receiver_(this, std::move(receiver)),
      api_handler_(std::make_unique<BraveCustomNotesAPIHandler>(url_loader_factory)),
      weak_ptr_factory_(this) {
  LoadNotesFromPrefs();
}

BraveCustomNotesPageHandler::~BraveCustomNotesPageHandler() = default;

void BraveCustomNotesPageHandler::SetClientPage(
    mojo::PendingRemote<brave_custom_notes::mojom::CustomNotesPage> page) {
  page_.Bind(std::move(page));
}

void BraveCustomNotesPageHandler::CreateNote(const std::string& title,
                                           const std::string& content,
                                           CreateNoteCallback callback) {
  auto new_note = brave_custom_notes::mojom::Note::New();
  new_note->id = notes_.empty() ? 1 : notes_.back()->id + 1;
  new_note->title = title;
  new_note->content = content;

  notes_.push_back(std::move(new_note));
  SaveNotesToPrefs();

  std::move(callback).Run(true);

  if (page_) {
    UpdatePageWithNotes();
  }
}

void BraveCustomNotesPageHandler::AddNote(const std::string& content,
                                        AddNoteCallback callback) {
  auto new_note = brave_custom_notes::mojom::Note::New();
  new_note->id = notes_.empty() ? 1 : notes_.back()->id + 1;
  new_note->title = "New Note";
  new_note->content = content;

  notes_.push_back(std::move(new_note));
  SaveNotesToPrefs();

  std::move(callback).Run(true);

  if (page_) {
    UpdatePageWithNotes();
  }
}

void BraveCustomNotesPageHandler::EditNote(int32_t note_id,
                                         const std::string& new_title,
                                         const std::string& new_content,
                                         EditNoteCallback callback) {
  auto it = std::find_if(notes_.begin(), notes_.end(),
                        [note_id](const auto& note) { return note->id == note_id; });

  if (it != notes_.end()) {
    (*it)->title = new_title;
    (*it)->content = new_content;
    SaveNotesToPrefs();
    std::move(callback).Run(true);

    if (page_) {
      UpdatePageWithNotes();
    }
  } else {
    std::move(callback).Run(false);
  }
}

void BraveCustomNotesPageHandler::SummarizeNoteContent(
    int32_t note_id, SummarizeNoteContentCallback callback) {
  auto it = std::find_if(notes_.begin(), notes_.end(),
                        [note_id](const auto& note) { return note->id == note_id; });

  if (it != notes_.end()) {
    // Log the start of the summarization process
    LOG(INFO) << "Starting to summarize note with ID: " << note_id;

    // Store the callback for later use
    pending_summarize_callbacks_[note_id] = std::move(callback);
    
    // Create a string to store the summary
    auto summary = std::make_unique<std::string>();
    
    // Create a helper to handle the API callback
    auto helper = std::make_unique<APICallbackHelper>(
        weak_ptr_factory_.GetWeakPtr(), note_id);
    
    // Log the note content being passed to the summarization API
    LOG(INFO) << "Note content being summarized: " << (*it)->content;

    // Call the API with the note content
    api_handler_->CallSummarizeAPI((*it)->content, summary.get());
    
    // Store the output string
    pending_summaries_[note_id] = std::move(summary);

  } else {
    LOG(WARNING) << "Failed to find note with ID: " << note_id;
    std::move(callback).Run(false, "Note not found");
  }
}

// Inside the RephraseNoteContent function
void BraveCustomNotesPageHandler::RephraseNoteContent(
    int32_t note_id, RephraseNoteContentCallback callback) {
  auto it = std::find_if(notes_.begin(), notes_.end(),
                        [note_id](const auto& note) { return note->id == note_id; });

  if (it != notes_.end()) {
    // Log the start of the rephrasing process
    LOG(INFO) << "Starting to rephrase note with ID: " << note_id;

    // Store the callback for later use
    pending_rephrase_callbacks_[note_id] = std::move(callback);
    
    // Create a string to store the rephrased content
    auto rephrased = std::make_unique<std::string>();
    
    // Create a helper to handle the API callback
    auto helper = std::make_unique<APICallbackHelper>(
        weak_ptr_factory_.GetWeakPtr(), note_id);
    
    // Log the note content being passed to the rephrasing API
    LOG(INFO) << "Note content being rephrased: " << (*it)->content;

    // Call the API with the note content
    api_handler_->CallRephraseAPI((*it)->content, rephrased.get());
    
    // Store the output string
    pending_rephrased_[note_id] = std::move(rephrased);
  } else {
    LOG(WARNING) << "Failed to find note with ID: " << note_id;
    std::move(callback).Run(false, "Note not found");
  }
}

// Inside the OnSummarizeComplete function
void BraveCustomNotesPageHandler::OnSummarizeComplete(
    int32_t note_id,
    const std::string& summary) {
  auto callback_it = pending_summarize_callbacks_.find(note_id);
  auto summary_it = pending_summaries_.find(note_id);
  
  if (callback_it != pending_summarize_callbacks_.end() &&
      summary_it != pending_summaries_.end()) {
    // Log the completion of the summarization process
    LOG(INFO) << "Summarization complete for note with ID: " << note_id;
    LOG(INFO) << "Summary: " << summary;

    std::move(callback_it->second).Run(true, summary);
    pending_summarize_callbacks_.erase(callback_it);
    pending_summaries_.erase(summary_it);
  } else {
    LOG(WARNING) << "Summarization callback or summary not found for note with ID: " << note_id;
  }
}

// Inside the OnRephraseComplete function
void BraveCustomNotesPageHandler::OnRephraseComplete(
    int32_t note_id,
    const std::string& rephrased) {
  auto callback_it = pending_rephrase_callbacks_.find(note_id);
  auto rephrased_it = pending_rephrased_.find(note_id);
  
  if (callback_it != pending_rephrase_callbacks_.end() &&
      rephrased_it != pending_rephrased_.end()) {
    // Log the completion of the rephrasing process
    LOG(INFO) << "Rephrasing complete for note with ID: " << note_id;
    LOG(INFO) << "Rephrased content: " << rephrased;

    std::move(callback_it->second).Run(true, rephrased);
    pending_rephrase_callbacks_.erase(callback_it);
    pending_rephrased_.erase(rephrased_it);
  } else {
    LOG(WARNING) << "Rephrasing callback or rephrased content not found for note with ID: " << note_id;
  }
}

void BraveCustomNotesPageHandler::DeleteNote(int32_t note_id,
                                           DeleteNoteCallback callback) {
  auto it = std::remove_if(
      notes_.begin(), notes_.end(),
      [note_id](const auto& note) { return note->id == note_id; });

  if (it != notes_.end()) {
    notes_.erase(it, notes_.end());
    SaveNotesToPrefs();
    std::move(callback).Run(true);

    if (page_) {
      UpdatePageWithNotes();
    }
  } else {
    std::move(callback).Run(false);
  }
}

void BraveCustomNotesPageHandler::GetNoteContent(
    int32_t note_id,
    GetNoteContentCallback callback) {
  auto it = std::find_if(notes_.begin(), notes_.end(),
                        [note_id](const auto& note) { return note->id == note_id; });

  if (it != notes_.end()) {
    std::move(callback).Run(true, (*it)->content);
  } else {
    std::move(callback).Run(false, std::string());
  }
}

void BraveCustomNotesPageHandler::GetAllNotes(GetAllNotesCallback callback) {
  std::vector<brave_custom_notes::mojom::NotePtr> notes_copy;
  notes_copy.reserve(notes_.size());
  for (const auto& note : notes_) {
    notes_copy.push_back(note.Clone());
  }
  std::move(callback).Run(std::move(notes_copy));
}

void BraveCustomNotesPageHandler::LoadNotesFromPrefs() {
  notes_.clear();
  const base::Value::List& stored_notes =
      profile_->GetPrefs()->GetList(kCustomNotesKey);

  for (const auto& note_value : stored_notes) {
    if (!note_value.is_dict()) {
      continue;
    }

    const auto& dict = note_value.GetDict();
    auto note = brave_custom_notes::mojom::Note::New();

    note->id = dict.FindInt("id").value_or(0);
    const std::string* title = dict.FindString("title");
    note->title = title ? *title : "";
    const std::string* content = dict.FindString("content");
    note->content = content ? *content : "";

    if (note->id > 0) {  // Only add valid notes
      notes_.push_back(std::move(note));
    }
  }
}

void BraveCustomNotesPageHandler::SaveNotesToPrefs() {
  ScopedListPrefUpdate update(profile_->GetPrefs(), kCustomNotesKey);
  base::Value::List& prefs_notes = update.Get();
  prefs_notes.clear();

  for (const auto& note : notes_) {
    base::Value::Dict note_dict;
    note_dict.Set("id", note->id);
    note_dict.Set("title", note->title);
    note_dict.Set("content", note->content);
    prefs_notes.Append(std::move(note_dict));
  }
}

void BraveCustomNotesPageHandler::UpdatePageWithNotes() {
  if (!page_) {
    return;
  }

  std::vector<brave_custom_notes::mojom::NotePtr> notes_copy;
  notes_copy.reserve(notes_.size());
  for (const auto& note : notes_) {
    notes_copy.push_back(note.Clone());
  }
  page_->OnNotesUpdated(std::move(notes_copy));
}