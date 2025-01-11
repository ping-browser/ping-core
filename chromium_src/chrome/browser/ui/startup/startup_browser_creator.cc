/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "chrome/browser/ui/startup/startup_browser_creator.h"
#include "brave/components/constants/brave_switches.h"
#include "brave/components/tor/buildflags/buildflags.h"
#include "chrome/browser/ui/startup/startup_browser_creator_impl.h"
#include "brave/browser/ui/views/login/login_screen_view.h"
#include "ui/views/widget/widget.h"
#include "base/memory/raw_ptr.h"
#include "base/run_loop.h"
#include "base/task/thread_pool.h"
#include "base/task/thread_pool/thread_pool_instance.h"
#include "base/task/sequenced_task_runner.h"
#include "base/threading/sequence_bound.h"

#if BUILDFLAG(ENABLE_TOR)
#include "brave/browser/tor/tor_profile_manager.h"
#endif

#ifdef LaunchModeRecorder
static_assert(false,
              "Replace the use of OldLaunchModeRecorder with "
              "LaunchModeRecorder, and remove this assert.");
#endif  // #ifdef LaunchModeRecorder

class BraveStartupBrowserCreatorImpl;

// Launch parameters structure
struct LaunchParams {
    // Using WeakPtr for safer profile access
    base::WeakPtr<Profile> profile;
    chrome::startup::IsProcessStartup process_startup;
    bool restore_tabbed_browser;
    // Owned RunLoop instance for better lifetime management
    std::unique_ptr<base::RunLoop> run_loop;

    LaunchParams(Profile* p,
                chrome::startup::IsProcessStartup ps,
                bool rtb)
        : profile(p->GetWeakPtr()),
          process_startup(ps),
          restore_tabbed_browser(rtb),
          run_loop(std::make_unique<base::RunLoop>()) {}
};

class BraveStartupBrowserCreatorImpl final : public StartupBrowserCreatorImpl {
 public:
  BraveStartupBrowserCreatorImpl(const base::FilePath& cur_dir,
                                 const base::CommandLine& command_line,
                                 chrome::startup::IsFirstRun is_first_run);

  BraveStartupBrowserCreatorImpl(const base::FilePath& cur_dir,
                                 const base::CommandLine& command_line,
                                 StartupBrowserCreator* browser_creator,
                                 chrome::startup::IsFirstRun is_first_run);

  void Launch(Profile* profile,
              chrome::startup::IsProcessStartup process_startup,
              bool restore_tabbed_browser);

  private:

    void LaunchWithAuth(std::shared_ptr<LaunchParams> params);
    void OnLoginSuccess(std::shared_ptr<LaunchParams> params);
    void FinishLaunch(std::shared_ptr<LaunchParams> params);

    // Thread safe flag to check if the user is logged in
    static std::atomic<bool> is_logged_in_;

    // Using weak pointer factory for safe callback handling
    base::WeakPtrFactory<BraveStartupBrowserCreatorImpl> weak_ptr_factory_{this};
};

std::atomic<bool> BraveStartupBrowserCreatorImpl::is_logged_in_(false);

BraveStartupBrowserCreatorImpl::BraveStartupBrowserCreatorImpl(
    const base::FilePath& cur_dir,
    const base::CommandLine& command_line,
    chrome::startup::IsFirstRun is_first_run)
    : StartupBrowserCreatorImpl(cur_dir, command_line, is_first_run) {}

BraveStartupBrowserCreatorImpl::BraveStartupBrowserCreatorImpl(
    const base::FilePath& cur_dir,
    const base::CommandLine& command_line,
    StartupBrowserCreator* browser_creator,
    chrome::startup::IsFirstRun is_first_run)
    : StartupBrowserCreatorImpl(cur_dir,
                                command_line,
                                browser_creator,
                                is_first_run) {}

// If the --tor command line flag was provided, switch the profile to Tor mode
// and then call the original Launch method.
//
// Note that if the --tor switch is used together with --silent-launch, Tor
// won't be launched.

void BraveStartupBrowserCreatorImpl::Launch(
    Profile* profile,
    chrome::startup::IsProcessStartup process_startup,
    bool restore_tabbed_browser) {

    DCHECK(profile) << "Profile cannot be null";

    LOG(INFO) << "Starting browser launch process";
    LOG(INFO) << "Current thread: " << base::PlatformThread::CurrentId();

#if BUILDFLAG(ENABLE_TOR)
  if (StartupBrowserCreatorImpl::command_line_->HasSwitch(switches::kTor)) {
    // Call StartupBrowserCreatorImpl::Launch() with the Tor profile so that if
    // one runs brave-browser --tor "? search query" the search query is not
    // passed to the default search engine of the regular profile.
    LOG(INFO) << "Switching to Tor profile and starting Tor service.";
    profile = TorProfileManager::GetInstance().GetTorProfile(profile);
  }
#endif

    auto params = std::make_shared<LaunchParams>(
        profile, process_startup, restore_tabbed_browser);
    
    // Capturing the stack trace for debugging
    base::debug::StackTrace stack_trace;
    LOG(INFO) << "Launch stack trace: " << stack_trace.ToString();

    LaunchWithAuth(params);

    // Only entering the RunLoop if authentication is needed
    if (!is_logged_in_) {
        LOG(INFO) << "Waiting for authentication...";
        params->run_loop->Run();
        LOG(INFO) << "Authentication complete";
    }
}

void BraveStartupBrowserCreatorImpl::LaunchWithAuth(
    std::shared_ptr<LaunchParams> params) {
    
    DCHECK(params);
    DCHECK(params->profile.get()) << "Invalid profile in launch params";

    if (!is_logged_in_) {
        LOG(INFO) << "Starting authentication process";
        
        // Creating the login callback
        auto login_callback = base::BindOnce(
            [](base::WeakPtr<BraveStartupBrowserCreatorImpl> weak_this,
               std::shared_ptr<LaunchParams> params) {
                if (weak_this) {
                    // Posting to UI thread for safe execution
                    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
                        FROM_HERE,
                        base::BindOnce(
                            &BraveStartupBrowserCreatorImpl::OnLoginSuccess,
                            weak_this,
                            params));
                }
            },
            weak_ptr_factory_.GetWeakPtr(),
            params);

        // Create and show login dialog
        views::Widget* widget = views::DialogDelegate::CreateDialogWidget(
            new LoginScreenView(params->profile.get(), std::move(login_callback)),
            nullptr,
            nullptr);
            
        LOG(INFO) << "Showing login dialog";
        widget->Show();
    } else {
        // Already logged in, proceeding with launch
        FinishLaunch(params);
    }
}

void BraveStartupBrowserCreatorImpl::OnLoginSuccess(
    std::shared_ptr<LaunchParams> params) {
    
    LOG(INFO) << "Login success callback executed";

    if (!params || !params->profile.get()) {
        LOG(ERROR) << "Invalid launch parameters in OnLoginSuccess";
        return;
    }

    is_logged_in_ = true;
    FinishLaunch(params);
}

void BraveStartupBrowserCreatorImpl::FinishLaunch(
    std::shared_ptr<LaunchParams> params) {
    
    LOG(INFO) << "Starting browser launch";

    if (!params || !params->profile.get()) {
        LOG(ERROR) << "Invalid launch parameters in FinishLaunch";
        return;
    }

    // Launching the browser with safe profile access
    StartupBrowserCreatorImpl::Launch(
        params->profile.get(),
        params->process_startup,
        params->restore_tabbed_browser);

    // Quitting the RunLoop if it exists
    if (params->run_loop) {
        LOG(INFO) << "Quitting launch RunLoop";
        params->run_loop->Quit();
    }
    
    LOG(INFO) << "Browser launch complete";
}

#define StartupBrowserCreatorImpl BraveStartupBrowserCreatorImpl
#include "src/chrome/browser/ui/startup/startup_browser_creator.cc"
#undef StartupBrowserCreatorImpl
