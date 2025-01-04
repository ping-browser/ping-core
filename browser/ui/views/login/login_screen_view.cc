/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/login/login_screen_view.h"
#include "chrome/browser/profiles/profile.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/controls/label.h"
#include "base/logging.h"

LoginScreenView::LoginScreenView(Profile* profile, base::OnceCallback<void()> on_login_success)
    : on_login_success_(std::move(on_login_success)) {
  CreateUI(profile);
}
LoginScreenView::~LoginScreenView() = default;

void LoginScreenView::CreateUI(Profile* profile) {
  SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets(10), 10));

  auto* username_label = new views::Label(u"Username:");
  AddChildView(username_label);

  usernamefield = new views::Textfield();
  AddChildView(usernamefield);

  auto* password_label = new views::Label(u"Password:");
  AddChildView(password_label);

  passwordfield = new views::Textfield();
  passwordfield->SetTextInputType(ui::TextInputType::TEXT_INPUT_TYPE_PASSWORD);
  AddChildView(passwordfield);

  loginbutton = new views::MdTextButton(
    base::BindRepeating(&LoginScreenView::OnLoginButtonPressed, base::Unretained(this)),
    u"Login");
  AddChildView(loginbutton);
}

bool LoginScreenView::Accept() {
  // TODO: Implement a login logic, that will return a callback to the startup browser creator
  return true;
}

void LoginScreenView::OnLoginButtonPressed() {
  std::u16string username = usernamefield->GetText();
  std::u16string password = passwordfield->GetText();

  if (username == u"admin" && password == u"password") {
    LOG(INFO) << "Login successful!";
    // Closing the login widget
    GetWidget()->CloseNow();
    if (on_login_success_)
     // Notifying the success callback
      std::move(on_login_success_).Run();
  } else {
    LOG(INFO) << "Login failed!";
  }
}