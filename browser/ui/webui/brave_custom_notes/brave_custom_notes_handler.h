#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_PAGE_HANDLER_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_PAGE_HANDLER_H_

#include <memory>
#include <string>
#include <vector>

#include "base/scoped_observation.h"
#include "brave/components/brave_custom_notes/common/brave_custom_notes.mojom.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "mojo/public/cpp/bindings/pending_remote.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"

namespace content {
class WebContents;
}  // namespace content

class BraveCustomNotesPageHandler
    : public brave_custom_notes::mojom::NotesPageHandler {
 public:
  BraveCustomNotesPageHandler(
      content::WebContents* web_contents,
      mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler>
          receiver);
  BraveCustomNotesPageHandler(const BraveCustomNotesPageHandler&) = delete;
  BraveCustomNotesPageHandler& operator=(const BraveCustomNotesPageHandler&) =
      delete;
  ~BraveCustomNotesPageHandler() override;

  // brave_custom_notes::mojom::PageHandler overrides:
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
  void GetAllNotes(GetAllNotesCallback callback) override;

 private:
  // Handle back to the page by which we can pass results.
  mojo::Remote<brave_custom_notes::mojom::CustomNotesPage> page_;

  // The Profile* handed to us in our constructor.
  raw_ptr<content::WebContents> web_contents_ = nullptr;
  mojo::Receiver<brave_custom_notes::mojom::NotesPageHandler> receiver_;
  std::vector<brave_custom_notes::mojom::NotePtr> notes_;
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_PAGE_HANDLER_H_
