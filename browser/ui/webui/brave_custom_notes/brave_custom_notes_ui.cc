#include "brave/browser/ui/webui/brave_custom_notes/brave_custom_notes_ui.h"

#include "chrome/browser/profiles/profile.h"
#include "components/grit/brave_components_resources.h"  // For resources like HTML
#include "components/strings/grit/components_strings.h"  // For string resources
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"

// Define the custom notes host constant
namespace chrome {
const char kBraveCustomNotesHost[] = "custom-notes";
}

BraveCustomNotesUI::BraveCustomNotesUI(content::WebUI* web_ui)
    : WebUIController(web_ui) {
  // Create and add a WebUIDataSource for our hello world page
  content::WebUIDataSource* source = content::WebUIDataSource::CreateAndAdd(
      Profile::FromWebUI(web_ui), chrome::kBraveCustomNotesHost);

  // Adding a simple HTML resource and default fallback
  source->AddResourcePath("brave_custom_notes.html",
                          IDR_BRAVE_CUSTOM_NOTES_HTML);
  source->SetDefaultResource(IDR_BRAVE_CUSTOM_NOTES_HTML);

  // Adding a string to the source that can be used in the HTML
  source->AddString("message", "Hello World");
}

BraveCustomNotesUI::~BraveCustomNotesUI() = default;
