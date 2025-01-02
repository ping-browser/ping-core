/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/login/login_screen_view.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/controls/label.h"
#include "base/logging.h"

LoginScreenView::LoginScreenView() {
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
      base::BindRepeating(&LoginScreenView::OnLoginButtonPressed, base::Unretained(this)),
      u"Login");
  AddChildView(login_button_);
}

void LoginScreenView::OnLoginButtonPressed() {
  std::u16string username = username_field_->GetText();
  std::u16string password = password_field_->GetText();
  // Dummy check for username and password
  if (username == u"admin" && password == u"password") {
    LOG(INFO) << "Login successful!";
    // TODO: Removing the login screen and unblock the browser
  } else {
    LOG(INFO) << "Login failed!";
  }
}