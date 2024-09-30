#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_UI_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_UI_H_

#include "content/public/browser/web_ui_controller.h"

class BraveCustomNotesUI : public content::WebUIController {
 public:
  explicit BraveCustomNotesUI(content::WebUI* web_ui);
  ~BraveCustomNotesUI() override;

 private:
  // Prevent copy and assign
  BraveCustomNotesUI(const BraveCustomNotesUI&) = delete;
  BraveCustomNotesUI& operator=(const BraveCustomNotesUI&) = delete;
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_UI_H_
