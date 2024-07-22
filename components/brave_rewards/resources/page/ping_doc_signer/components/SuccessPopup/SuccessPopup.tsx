/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import {
  StyledSuccessPopup,
  StyledSuccessTitle,
  StyledSuccessMessage,
  StyledSuccessName,
  StyledSuccessButtons,
  StyledConfirmButton
} from './styles';
import { SuccessPopupProps } from '../../utils/types';

export const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, onSave, onContinue, isVerification }) => (
  <StyledSuccessPopup>
    <StyledSuccessTitle verification={isVerification}>
      {isVerification ? "Verification Successful!" : "Signature complete!"}
    </StyledSuccessTitle>
    <StyledSuccessMessage>{message}</StyledSuccessMessage>
    {!isVerification && (
      <StyledSuccessName>Placeholder</StyledSuccessName>
    )}
    <StyledSuccessButtons>
      <StyledConfirmButton onClick={onSave}>Save as</StyledConfirmButton>
      <StyledConfirmButton onClick={onContinue} $continue>Continue</StyledConfirmButton>
    </StyledSuccessButtons>
  </StyledSuccessPopup>
);