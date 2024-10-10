// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.
#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_HANDLER_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_HANDLER_H_

#include <memory>
#include <string>
#include <vector>

#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "brave/components/brave_custom_notes/common/brave_custom_notes.mojom.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "mojo/public/cpp/bindings/pending_remote.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"

class Profile;
namespace content {
class WebContents;
}

class BraveCustomNotesPageHandler
    : public brave_custom_notes::mojom::NotesPageHandler {
 public:
  BraveCustomNotesPageHandler(
      Profile* profile,
      content::WebContents* web_contents,
      mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler>
          receiver);
  ~BraveCustomNotesPageHandler() override;

  BraveCustomNotesPageHandler(const BraveCustomNotesPageHandler&) = delete;
  BraveCustomNotesPageHandler& operator=(const BraveCustomNotesPageHandler&) =
      delete;

  // brave_custom_notes::mojom::NotesPageHandler:
  void SetClientPage(
      mojo::PendingRemote<brave_custom_notes::mojom::CustomNotesPage> page)
      override;
  void CreateNote(const std::string& title,
                  const std::string& content,
                  CreateNoteCallback callback) override;
  void EditNote(int32_t note_id,
                const std::string& new_title,
                const std::string& new_content,
                EditNoteCallback callback) override;
  void DeleteNote(int32_t note_id, DeleteNoteCallback callback) override;
  void GetNoteContent(int32_t note_id,
                      GetNoteContentCallback callback) override;
  void GetAllNotes(GetAllNotesCallback callback) override;
  void AddNote(const std::string& content, AddNoteCallback callback) override;

 private:
  void LoadNotesFromPrefs();
  void SaveNotesToPrefs();
  void UpdatePageWithNotes();

  raw_ptr<Profile> profile_;
  raw_ptr<content::WebContents> web_contents_;
  mojo::Receiver<brave_custom_notes::mojom::NotesPageHandler> receiver_;
  mojo::Remote<brave_custom_notes::mojom::CustomNotesPage> page_;

  std::vector<brave_custom_notes::mojom::NotePtr> notes_;

  base::WeakPtrFactory<BraveCustomNotesPageHandler> weak_ptr_factory_{this};
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_HANDLER_H_
