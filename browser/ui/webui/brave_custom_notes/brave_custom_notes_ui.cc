#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_ui.h"

#include <utility>

#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_handler.h"
#include "brave/browser/ui/webui/brave_webui_source.h"
#include "brave/components/brave_custom_notes/common/constants.h"
#include "brave/components/brave_custom_notes/resources/page/grit/brave_custom_notes_generated_map.h"
#include "brave/components/l10n/common/localization_util.h"
#include "components/grit/brave_components_resources.h"
#include "components/strings/grit/components_strings.h"
#include "content/public/browser/web_ui_data_source.h"

BraveCustomNotesUI::BraveCustomNotesUI(content::WebUI* web_ui,
                                       const std::string& name)
    : ui::MojoWebUIController(web_ui, false) {
  content::WebUIDataSource* source = CreateAndAddWebUIDataSource(
      web_ui, name, kBraveCustomNotesGenerated, kBraveCustomNotesGeneratedSize,
      IDR_BRAVE_CUSTOM_NOTES_HTML);

  for (const auto& str : brave_custom_notes::kLocalizedStrings) {
    std::u16string l10n_str =
        brave_l10n::GetLocalizedResourceUTF16String(str.id);
    source->AddString(str.name, l10n_str);
  }
}

BraveCustomNotesUI::~BraveCustomNotesUI() = default;

void BraveCustomNotesUI::BindInterface(
    mojo::PendingReceiver<brave_custom_notes::mojom::NotesPageHandler>
        receiver) {
  custom_notes_handler_ = std::make_unique<BraveCustomNotesPageHandler>(
      web_ui()->GetWebContents(), std::move(receiver));
}

// Move WEB_UI_CONTROLLER_TYPE_IMPL outside any function or block
WEB_UI_CONTROLLER_TYPE_IMPL(BraveCustomNotesUI)
