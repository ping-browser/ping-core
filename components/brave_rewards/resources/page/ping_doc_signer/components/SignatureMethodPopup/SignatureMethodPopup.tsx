/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import {
  StyledPopupOverlay,
  StyledPopupContent,
  StyledPopupContentH2,
  StyledCloseButton,
  StyledMethodOptions,
  StyledMethodOptionsButton,
  StyledButtonTitle,
  StyledButtonDesc
} from './styles';
import { SignatureMethodPopupProps } from '../../utils/types';

export const SignatureMethodPopup: React.FC<SignatureMethodPopupProps> = ({ onClose, onSelectMethod }) => (
  <StyledPopupOverlay>
    <StyledPopupContent>
      <StyledPopupContentH2>Choose Your Digital Signature Method</StyledPopupContentH2>
      <StyledCloseButton onClick={onClose}>×</StyledCloseButton>
      <StyledMethodOptions>
        <StyledMethodOptionsButton onClick={() => onSelectMethod('digitalID')}>
          <StyledButtonTitle>Sign with digital ID (Recommended)</StyledButtonTitle>
          <StyledButtonDesc>Sign documents quickly using your pre-uploaded signature data for a seamless and efficient signing process</StyledButtonDesc>
        </StyledMethodOptionsButton>
        <StyledMethodOptionsButton onClick={() => onSelectMethod('imageUpload')}>
          <StyledButtonTitle>Upload Image Signature</StyledButtonTitle>
          <StyledButtonDesc>Select and upload an image of your signature from your device to sign documents easily and securely.</StyledButtonDesc>
        </StyledMethodOptionsButton>
      </StyledMethodOptions>
    </StyledPopupContent>
  </StyledPopupOverlay>
);
