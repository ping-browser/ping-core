/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState } from 'react';
import * as React from 'react';
import { StyledPopupOverlay, StyledH3, StyledPopupTypeContent, StyledPopupContentH2, StyledTypedSignature, StyledTypeButtons, StyledConfirmButton, StyledCloseButton, StyledNameInput } from './styles';
import { SignatureTypePopupProps } from '../../utils/types';

export const SignatureTypePopup: React.FC<SignatureTypePopupProps> = ({ onClose, onConfirm }) => {
  const [signatureName, setSignatureName] = useState<string>("John Doe");

  const handleConfirm = () => {
    if (signatureName) {
      onConfirm(signatureName);
    }
  };

  return (
    <StyledPopupOverlay>
      <StyledPopupTypeContent>
        <StyledPopupContentH2>Choose a digital ID to sign with:</StyledPopupContentH2>
        <StyledCloseButton onClick={onClose}>×</StyledCloseButton>
        <StyledTypedSignature>
          <StyledH3>{signatureName}</StyledH3>
        </StyledTypedSignature>
        <StyledNameInput
          type="text"
          placeholder="Type your name"
          value={signatureName}
          onChange={(e) => setSignatureName(e.target.value)}
        />
        <StyledTypeButtons>
          <StyledConfirmButton onClick={handleConfirm}>
            Confirm signature
          </StyledConfirmButton>
        </StyledTypeButtons>
      </StyledPopupTypeContent>
    </StyledPopupOverlay>
  );
};