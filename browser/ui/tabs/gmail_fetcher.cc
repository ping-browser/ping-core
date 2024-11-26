#include "gmail_fetcher.h"

#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_handle.h"

// Constructor
GmailFetcher::GmailFetcher(base::raw_ptr<Profile> profile) : profile_(profile) {
    LOG(INFO) << "GmailFetcher created with profile: " << profile;
}

// Destructor
GmailFetcher::~GmailFetcher() {
    DestroyGmailContents();
    LOG(INFO) << "GmailFetcher destroyed";
}

// Fetch Gmail
void GmailFetcher::FetchGmail() {
    content::WebContents::CreateParams create_params(profile_);
    create_params.initially_hidden = true; // WebContents is hidden
    create_params.desired_renderer_state = content::WebContents::CreateParams::kNoRendererProcess;

    gmail_contents_ = content::WebContents::Create(create_params);
    LOG(INFO) << "Dummy WebContents created: " << gmail_contents_.get();

    // Start observing WebContents for navigation events
    Observe(gmail_contents_.get());

    gmail_contents_->GetController().LoadURL(GURL("https://www.google.com"), content::Referrer(), ui::PAGE_TRANSITION_TYPED, std::string());
    LOG(INFO) << "Loading Gmail URL: " << gmail_contents_->GetURL().spec();
}

// Handle navigation completion
void GmailFetcher::DidFinishNavigation(content::NavigationHandle* navigation_handle) {
    LOG(INFO) << "Navigation completed for URL: " << navigation_handle->GetURL().spec();
    LOG(INFO) << "Net error code: " << navigation_handle->GetNetErrorCode();
    LOG(INFO) << "Is error page: " << navigation_handle->IsErrorPage();
    LOG(INFO) << "Has committed: " << navigation_handle->HasCommitted();
    LOG(INFO) << "Is same document: " << navigation_handle->IsSameDocument();
    LOG(INFO) << "Is renderer initiated: " << navigation_handle->IsRendererInitiated();
    LOG(INFO) << "Is main frame: " << navigation_handle->IsInMainFrame();

    if (navigation_handle->HasCommitted() && !navigation_handle->IsErrorPage()) {
        LOG(INFO) << "Navigation finished. Committed URL: " << navigation_handle->GetURL().spec();
    } else {
        LOG(INFO) << "Navigation did not commit successfully.";
    }
}


// Destroy Gmail WebContents
void GmailFetcher::DestroyGmailContents() {
    if (gmail_contents_) {
        LOG(INFO) << "Destroying WebContents: " << gmail_contents_.get();
        Observe(nullptr); // Stop observing
        gmail_contents_->Close();
        gmail_contents_.reset();
        LOG(INFO) << "WebContents destroyed";
    }
}
