// Copyright(c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_HANDLER_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_HANDLER_H_

#include <memory>
#include <string>
#include <vector>
#include <map>

#include "base/memory/weak_ptr.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "mojo/public/cpp/bindings/pending_remote.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "brave/components/brave_custom_notes/common/brave_custom_notes.mojom.h"

class Profile;
class BraveCustomNotesAPIHandler;

namespace content {
class WebContents;
}

class BraveCustomNotesPageHandler
    : public brave_custom_notes::mojom::NotesPageHandler {
 public:
  BraveCustomNotesPageHandler(
      Profile* profile,
      content::WebContents* web_contents,
      mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler> receiver,
      scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory);

  BraveCustomNotesPageHandler(const BraveCustomNotesPageHandler&) = delete;
  BraveCustomNotesPageHandler& operator=(const BraveCustomNotesPageHandler&) = delete;

  ~BraveCustomNotesPageHandler() override;

  // brave_custom_notes::mojom::NotesPageHandler:
  void SetClientPage(
      mojo::PendingRemote<brave_custom_notes::mojom::CustomNotesPage> page) override;
  void CreateNote(const std::string& title,
                 const std::string& content,
                 CreateNoteCallback callback) override;
  void AddNote(const std::string& content, AddNoteCallback callback) override;
  void EditNote(int32_t note_id,
               const std::string& new_title,
               const std::string& new_content,
               EditNoteCallback callback) override;
  void DeleteNote(int32_t note_id, DeleteNoteCallback callback) override;
  void GetNoteContent(int32_t note_id,
                     GetNoteContentCallback callback) override;
  void GetAllNotes(GetAllNotesCallback callback) override;
  void SummarizeNoteContent(int32_t note_id,
                           SummarizeNoteContentCallback callback) override;
  void RephraseNoteContent(int32_t note_id,
                          RephraseNoteContentCallback callback) override;
  std::optional<std::string> ExtractContentFromJson(const std::string& json_response);

 private:
  class APICallbackHelper;

  void LoadNotesFromPrefs();
  void SaveNotesToPrefs();
  void UpdatePageWithNotes();

  raw_ptr<Profile> profile_;
  raw_ptr<content::WebContents> web_contents_;
  mojo::Receiver<brave_custom_notes::mojom::NotesPageHandler> receiver_;
  mojo::Remote<brave_custom_notes::mojom::CustomNotesPage> page_;
  std::unique_ptr<BraveCustomNotesAPIHandler> api_handler_;

  std::vector<brave_custom_notes::mojom::NotePtr> notes_;
  
  std::map<int32_t, SummarizeNoteContentCallback> pending_summarize_callbacks_;
  std::map<int32_t, std::unique_ptr<std::string>> pending_summaries_;
  
  std::map<int32_t, RephraseNoteContentCallback> pending_rephrase_callbacks_;
  std::map<int32_t, std::unique_ptr<std::string>> pending_rephrased_;

  base::WeakPtrFactory<BraveCustomNotesPageHandler> weak_ptr_factory_;
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_HANDLER_H_