/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_
#define BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_

#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "ui/views/window/dialog_delegate.h"
#include "ui/views/controls/button/md_text_button.h"
#include "ui/views/controls/textfield/textfield.h"
#include "chrome/browser/profiles/profile.h"
#include "base/functional/callback.h"

class LoginScreenView : public views::DialogDelegateView {
 public:
  explicit LoginScreenView(raw_ptr<Profile> profile,
                         base::OnceCallback<void()> on_login_success);
  ~LoginScreenView() override;

  bool Accept() override;

 private:
  void CreateUI();
  void OnLoginButtonPressed();
  void CloseAndRunCallback();
  
  raw_ptr<Profile> profile_;
  
  raw_ptr<views::Textfield> username_field_;
  raw_ptr<views::Textfield> password_field_;
  raw_ptr<views::MdTextButton> login_button_;
  
  base::OnceCallback<void()> on_login_success_;
  
  base::WeakPtrFactory<LoginScreenView> weak_ptr_factory_{this};
  
  LoginScreenView(const LoginScreenView&) = delete;
  LoginScreenView& operator=(const LoginScreenView&) = delete;
};

#endif  // BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_