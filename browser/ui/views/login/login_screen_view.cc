/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/login/login_screen_view.h"

#include "login_screen_view.h"
#include "ui/views/layout/box_layout.h"
#include "base/logging.h"
#include "base/task/sequenced_task_runner.h"
#include "base/task/single_thread_task_runner.h"
#include "ui/gfx/geometry/insets.h"

LoginScreenView::LoginScreenView(Profile* profile,
                               base::OnceCallback<void()> on_login_success)
    : profile_(profile->GetWeakPtr()),
      username_field_(nullptr),
      password_field_(nullptr),
      login_button_(nullptr),
      on_login_success_(std::move(on_login_success)) {
    
    DCHECK(profile) << "Profile cannot be null";
    CreateUI();
}

LoginScreenView::~LoginScreenView() {
    LOG(INFO) << "LoginScreenView destroyed";
}

void LoginScreenView::CreateUI() {
  SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical,
      gfx::Insets(20),
      10));

  auto* title = new views::Label(u"Ping Login");
  title->SetHorizontalAlignment(gfx::ALIGN_CENTER);
  AddChildView(title);

  // Username section
  auto* username_label = new views::Label(u"Username:");
  AddChildView(username_label);
  
  username_field_ = new views::Textfield();
  AddChildView(username_field_);
  
  // Password section
  auto* password_label = new views::Label(u"Password:");
  AddChildView(password_label);
  
  password_field_ = new views::Textfield();
  password_field_->SetTextInputType(ui::TextInputType::TEXT_INPUT_TYPE_PASSWORD);
  AddChildView(password_field_);
  
  // Login button
  login_button_ = new views::MdTextButton(
      base::BindRepeating(&LoginScreenView::OnLoginButtonPressed,
                         weak_ptr_factory_.GetWeakPtr()),
      u"Login");
  login_button_->SetIsDefault(true);
  AddChildView(login_button_);
}

bool LoginScreenView::Cancel() {
    // Closing the login dialog
    CloseAndRunCallback();
    return true;
}

bool LoginScreenView::Accept() {
  // Returning false to prevent the default functionality of OK button
  return false;
}

void LoginScreenView::CloseAndRunCallback() {
    LOG(INFO) << "Processing login success";
    
    // Taking ownership of the callback before closing the widget
    auto callback = std::move(on_login_success_);
    auto* widget = GetWidget();
    
    // Posting the task to ensure safe execution order
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(
            [](base::OnceCallback<void()> callback,
               views::Widget* widget,
               base::WeakPtr<Profile> profile) {
                if (!profile) {
                    LOG(ERROR) << "Profile no longer valid";
                    return;
                }
                
                LOG(INFO) << "Executing login callback";
                std::move(callback).Run();
                
                LOG(INFO) << "Closing login dialog";
                if (widget)
                    widget->CloseNow();
            },
            std::move(callback),
            widget,
            profile_));
}

void LoginScreenView::OnLoginButtonPressed() {
    if (!profile_) {
        LOG(ERROR) << "Profile no longer valid during login";
        return;
    }

    std::u16string username = username_field_->GetText();
    std::u16string password = password_field_->GetText();

    LOG(INFO) << "Processing login attempt";
    
    // Test authentication
    if (username == u"admin" && password == u"password") {
        LOG(INFO) << "Login credentials validated";
        CloseAndRunCallback();
    } else {
        LOG(INFO) << "Login validation failed";
        // TODO: Adding user feedback
    }
}