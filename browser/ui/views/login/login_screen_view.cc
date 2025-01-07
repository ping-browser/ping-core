/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/login/login_screen_view.h"

#include "ui/views/layout/box_layout.h"
#include "ui/views/controls/label.h"
#include "base/logging.h"
#include "base/task/sequenced_task_runner.h"

LoginScreenView::LoginScreenView(raw_ptr<Profile> profile,
                               base::OnceCallback<void()> on_login_success)
    : profile_(profile),
      username_field_(nullptr),
      password_field_(nullptr),
      login_button_(nullptr),
      on_login_success_(std::move(on_login_success)) {
  CreateUI();
}

LoginScreenView::~LoginScreenView() = default;

void LoginScreenView::CreateUI() {
  SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets(10), 10));

  auto* username_label = new views::Label(u"Username:");
  AddChildView(username_label);
  
  username_field_ = new views::Textfield();
  AddChildView(username_field_);
  
  auto* password_label = new views::Label(u"Password:");
  AddChildView(password_label);
  
  password_field_ = new views::Textfield();
  password_field_->SetTextInputType(ui::TextInputType::TEXT_INPUT_TYPE_PASSWORD);
  AddChildView(password_field_);
  
  login_button_ = new views::MdTextButton(
      base::BindRepeating(&LoginScreenView::OnLoginButtonPressed,
                         weak_ptr_factory_.GetWeakPtr()),
      u"Login");
  AddChildView(login_button_);
}

bool LoginScreenView::Accept() {
  return true;
}

void LoginScreenView::CloseAndRunCallback() {
  // Taking ownership of the callback before closing the widget
  auto callback = std::move(on_login_success_);
  GetWidget()->CloseNow();
  
  // Posting the callback to the task runner to avoid re-entrancy
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE,
      base::BindOnce([](base::OnceCallback<void()> callback) {
        std::move(callback).Run();
      },
      std::move(callback)));
}

void LoginScreenView::OnLoginButtonPressed() {
  std::u16string username = username_field_->GetText();
  std::u16string password = password_field_->GetText();
  
  if (username == u"admin" && password == u"password") {
    LOG(INFO) << "Login successful!";
    CloseAndRunCallback();
  } else {
    LOG(INFO) << "Login failed!";
  }
}
