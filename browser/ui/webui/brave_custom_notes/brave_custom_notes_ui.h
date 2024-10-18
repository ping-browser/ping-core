// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_UI_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_UI_H_

#include <memory>
#include <string>

#include "brave/components/brave_custom_notes/common/brave_custom_notes.mojom.h"
#include "content/public/browser/web_ui_controller.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "ui/webui/mojo_web_ui_controller.h"

class BraveCustomNotesPageHandler;  // Forward declaration

class BraveCustomNotesUI : public ui::MojoWebUIController {
 public:
  BraveCustomNotesUI(content::WebUI* web_ui, const std::string& name);
  ~BraveCustomNotesUI() override;

  BraveCustomNotesUI(const BraveCustomNotesUI&) = delete;
  BraveCustomNotesUI& operator=(const BraveCustomNotesUI&) = delete;

  void BindInterface(
      mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler> receiver);

 private:
  std::unique_ptr<BraveCustomNotesPageHandler> custom_notes_handler_;

  WEB_UI_CONTROLLER_TYPE_DECL();
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CUSTOM_NOTES_BRAVE_CUSTOM_NOTES_UI_H_