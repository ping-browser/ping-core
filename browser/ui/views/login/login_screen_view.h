/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_
#define BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_

#include "base/memory/raw_ptr.h"
#include "ui/views/window/dialog_delegate.h"
#include "ui/views/controls/button/md_text_button.h"
#include "ui/views/controls/textfield/textfield.h"
#include "chrome/browser/profiles/profile.h"

class LoginScreenView : public views::DialogDelegateView {
 public:
  explicit LoginScreenView(Profile* profile);
  ~LoginScreenView() override;

  bool Accept() override;

 private:
  void CreateUI(Profile* profile);
  void OnLoginButtonPressed();

  raw_ptr<views::Textfield> username_field_;
  raw_ptr<views::Textfield> password_field_;
  raw_ptr<views::MdTextButton> login_button_;

  LoginScreenView(const LoginScreenView&) = delete;
  LoginScreenView& operator=(const LoginScreenView&) = delete;
};

#endif  // BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_