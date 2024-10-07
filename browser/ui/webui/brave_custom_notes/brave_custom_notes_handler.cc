// Copyright (c) 2024 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_handler.h"

#include <utility>

#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "brave_custom_notes_handler.h"

BraveCustomNotesPageHandler::BraveCustomNotesPageHandler(
    content::WebContents* web_contents,
    mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler> receiver)
    : web_contents_(web_contents), receiver_(this, std::move(receiver)) {}

BraveCustomNotesPageHandler::~BraveCustomNotesPageHandler() = default;

void BraveCustomNotesPageHandler::SetClientPage(
    mojo::PendingRemote<brave_custom_notes::mojom::CustomNotesPage> page) {
  page_.Bind(std::move(page));
}

void BraveCustomNotesPageHandler::CreateNote(const std::string& title,
                                             const std::string& content,
                                             CreateNoteCallback callback) {
  auto new_note = brave_custom_notes::mojom::Note::New();
  new_note->id = notes_.size() + 1;  // Simple ID generation
  new_note->title = title;
  new_note->content = content;

  notes_.push_back(std::move(new_note));

  std::move(callback).Run(true);

  if (page_) {
    page_->OnNotesUpdated(notes_);
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
    std::move(callback).Run(true);

    if (page_) {
      page_->OnNotesUpdated(notes_);
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
    std::move(callback).Run(true);

    if (page_) {
      page_->OnNotesUpdated(notes_);
    }
  } else {
    std::move(callback).Run(false);
  }
}

void BraveCustomNotesPageHandler::GetAllNotes(GetAllNotesCallback callback) {
  std::vector<brave_custom_notes::mojom::NotePtr> notes_copy;
  for (const auto& note : notes_) {
    notes_copy.push_back(note.Clone());
  }
  std::move(callback).Run(std::move(notes_copy));
}
