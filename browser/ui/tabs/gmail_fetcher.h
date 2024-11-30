#ifndef BRAVE_BROWSER_UI_TABS_GMAIL_FETCHER_H_
#define BRAVE_BROWSER_UI_TABS_GMAIL_FETCHER_H_

#include "base/memory/weak_ptr.h"
#include "base/memory/raw_ptr.h"
#include "chrome/browser/profiles/profile.h"
#include "components/keyed_service/core/keyed_service.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"

class GmailFetcher : public KeyedService, public content::WebContentsObserver {
public:
    using NavigationSuccessCallback = std::function<void(const GURL&)>;

    explicit GmailFetcher(base::raw_ptr<Profile> profile);
    ~GmailFetcher() override;

    // Initiates fetching Gmail
    void FetchGmail();

    // Sets the success callback
    void SetNavigationSuccessCallback(NavigationSuccessCallback callback);

    // Destroys the WebContents instance
    void DestroyGmailContents();

    // content::WebContentsObserver overrides
    void DidFinishNavigation(content::NavigationHandle* navigation_handle) override;

    base::WeakPtr<GmailFetcher> GetWeakPtr() {
        return weak_ptr_factory_.GetWeakPtr();
    }
private:
    base::raw_ptr<Profile> profile_; // Profile associated with this fetcher
    std::unique_ptr<content::WebContents> gmail_contents_; // Stores the WebContents instance
    NavigationSuccessCallback success_callback_; // Success callback for navigation

    base::WeakPtrFactory<GmailFetcher> weak_ptr_factory_{this}; // For creating weak pointers
};

#endif // BRAVE_BROWSER_UI_TABS_GMAIL_FETCHER_H_
