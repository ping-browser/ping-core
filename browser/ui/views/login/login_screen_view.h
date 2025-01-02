/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_
#define BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_

#include "ui/views/view.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/textfield/textfield.h"

class LoginScreenView : public views::View, public views::ButtonListener {
 public:
  LoginScreenView();
  ~LoginScreenView() override;

  void ButtonPressed(views::Button* sender, const ui::Event& event) override;

 private:
  void CreateUI();
  views::Textfield* username_field_;
  views::Textfield* password_field_;
  views::Button* login_button_;

  DISALLOW_COPY_AND_ASSIGN(LoginScreenView);
};

#endif  // BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_
