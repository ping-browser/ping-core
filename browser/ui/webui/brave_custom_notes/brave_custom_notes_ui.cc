// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_ui.h"

#include <utility>

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_handler.h"
#include "brave/browser/ui/webui/brave_webui_source.h"
#include "brave/components/brave_custom_notes/common/constants.h"
#include "brave/components/brave_custom_notes/resources/page/grit/brave_custom_notes_generated_map.h"
#include "brave/components/l10n/common/localization_util.h"
#include "chrome/browser/profiles/profile.h"
#include "components/grit/brave_components_resources.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "components/strings/grit/components_strings.h"
#include "content/public/browser/web_ui_data_source.h"

BraveCustomNotesUI::BraveCustomNotesUI(content::WebUI* web_ui,
                                      const std::string& name)
    : ui::MojoWebUIController(web_ui, false) {
  Profile* profile = Profile::FromWebUI(web_ui);
  content::WebUIDataSource* source = CreateAndAddWebUIDataSource(
      web_ui, name, kBraveCustomNotesGenerated, kBraveCustomNotesGeneratedSize,
      IDR_BRAVE_CUSTOM_NOTES_HTML);

  for (const auto& str : brave_custom_notes::kLocalizedStrings) {
    std::u16string l10n_str =
        brave_l10n::GetLocalizedResourceUTF16String(str.id);
    source->AddString(str.name, l10n_str);
  }

  source->AddBoolean("isWindowTor", profile->IsTor());
  AddBackgroundColorToSource(source, web_ui->GetWebContents());
}

BraveCustomNotesUI::~BraveCustomNotesUI() = default;

void BraveCustomNotesUI::BindInterface(
    mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler> receiver) {
  custom_notes_handler_ = std::make_unique<BraveCustomNotesPageHandler>(
      Profile::FromWebUI(web_ui()),
      web_ui()->GetWebContents(),
      std::move(receiver),  // Pass receiver first
      Profile::FromWebUI(web_ui())->GetURLLoaderFactory());  // URL loader factory last
}

WEB_UI_CONTROLLER_TYPE_IMPL(BraveCustomNotesUI)