#ifndef BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_
#define BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_

#include "base/memory/raw_ptr.h"
#include "ui/views/view.h"
#include "ui/views/controls/button/md_text_button.h"
#include "ui/views/controls/textfield/textfield.h"

class LoginScreenView : public views::View {
 public:
  LoginScreenView();
  ~LoginScreenView() override;

 private:
  void CreateUI();
  void OnLoginButtonPressed();

  raw_ptr<views::Textfield> username_field_;
  raw_ptr<views::Textfield> password_field_;
  raw_ptr<views::MdTextButton> login_button_;

  LoginScreenView(const LoginScreenView&) = delete;
  LoginScreenView& operator=(const LoginScreenView&) = delete;
};

#endif  // BRAVE_BROWSER_UI_VIEWS_LOGIN_SCREEN_VIEW_H_
