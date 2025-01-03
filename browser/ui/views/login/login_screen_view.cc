/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/login/login_screen_view.h"
#include "chrome/browser/profiles/profile.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/controls/label.h"
#include "base/logging.h"

LoginScreenView::LoginScreenView(Profile* profile) {
  CreateUI(profile);
}

LoginScreenView::~LoginScreenView() = default;

void LoginScreenView::CreateUI(Profile* profile) {
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
      base::BindRepeating(&LoginScreenView::OnLoginButtonPressed, base::Unretained(this)),
      u"Login");
  AddChildView(login_button_);
}

bool LoginScreenView::Accept() {
  // TODO: Implement a login logic, that will return a callback to the startup browser creator
  return true;
}

void LoginScreenView::OnLoginButtonPressed() {
  std::u16string username = username_field_->GetText();
  std::u16string password = password_field_->GetText();
  // TODO: Implement a login logic to check the username and password
  if (username == u"admin" && password == u"password") {
    LOG(INFO) << "Login successful!";
    // TODO: Removing the login screen and unblocking the browser
  } else {
    LOG(INFO) << "Login failed!";
  }
}