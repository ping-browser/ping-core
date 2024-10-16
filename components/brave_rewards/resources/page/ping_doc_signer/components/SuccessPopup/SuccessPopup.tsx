/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import {
  StyledSuccessPopup,
  StyledSuccessTitle,
  StyledSuccessMessage,
  StyledSuccessButtons,
  StyledConfirmButton
} from './styles';
import { SuccessPopupProps } from '../../utils/types';

export const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, onSave, onContinue }) => (
  <StyledSuccessPopup>
    <StyledSuccessTitle>
      Signature complete!
    </StyledSuccessTitle>
    <StyledSuccessMessage>{message}</StyledSuccessMessage>
    <StyledSuccessButtons>
      <StyledConfirmButton onClick={onSave}>Save as</StyledConfirmButton>
      <StyledConfirmButton onClick={onContinue} $continue>Continue</StyledConfirmButton>
    </StyledSuccessButtons>
  </StyledSuccessPopup>
);
