#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_ui.h"

#include "brave/browser/ui/webui/brave_webui_source.h"
#include "brave/components/brave_custom_notes/resources/page/grit/brave_custom_notes_generated_map.h"
#include "chrome/browser/profiles/profile.h"
#include "components/grit/brave_components_resources.h"  // For resources like HTML
#include "components/strings/grit/components_strings.h"  // For string resources
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"

BraveCustomNotesUI::BraveCustomNotesUI(content::WebUI* web_ui,
                                       const std::string& name)
    : WebUIController(web_ui) {
  // Create and add a WebUIDataSource for our hello world page
  content::WebUIDataSource* source = CreateAndAddWebUIDataSource(
      web_ui, name, kBraveCustomNotesGenerated, kBraveCustomNotesGeneratedSize,
      IDR_BRAVE_CUSTOM_NOTES_HTML);

  // Adding a string to the source that can be used in the HTML
  source->AddString("message", "Hello World");
}

BraveCustomNotesUI::~BraveCustomNotesUI() = default;
