// Copyright(c) 2022 The Brave Authors.All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_handler.h"

#include <algorithm>
#include <string>
#include <utility>
#include <vector>

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

namespace {
const char kCustomNotesKey[] = "custom_notes";
}  // namespace

BraveCustomNotesPageHandler::BraveCustomNotesPageHandler(
    Profile* profile,
    content::WebContents* web_contents,
    mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler> receiver)
    : profile_(profile),
      web_contents_(web_contents),
      receiver_(this, std::move(receiver)) {
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
  auto it =
      std::find_if(notes_.begin(), notes_.end(),
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
  auto it =
      std::find_if(notes_.begin(), notes_.end(),
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
