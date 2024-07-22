/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState } from 'react';
import * as React from 'react';
import {
  StyledPopupOverlay,
  StyledPopupContent,
  StyledPopupContentH2,
  StyledCloseButton,
  StyledSelectedSignature,
  StyledSelectedSignatureH3,
  StyledSelectedSignatureP,
  StyledEncKey,
  StyledBrowseImage,
  StyledSignatureList,
  StyledSignatureOption,
  StyledSignatureOptionInput,
  StyledSignatureName,
  StyledIssueName,
  StyledIssueDate,
  StyledButtons,
  StyledAddButton,
  StyledConfirmButton
} from './styles';

import { SignaturePopupProps } from '../../utils/types';

export const SignaturePopup: React.FC<SignaturePopupProps> = ({ onClose, onConfirm }) => {
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);

  const signatures = [
    { id: '1', name: 'Presley Abernathy', issueDate: '05/07/2024 15:30' },
    { id: '2', name: 'Harrison Wilderman', issueDate: '05/07/2024 15:30' },
    { id: '3', name: 'Rudolf Wolf', issueDate: '05/07/2024 15:30' },
  ];

  const handleConfirm = () => {
    if (selectedSignature) {
      onConfirm(selectedSignature);
    }
  };

  return (
    <StyledPopupOverlay>
      <StyledPopupContent selected={!!selectedSignature}>
        <StyledPopupContentH2>Choose a digital ID to sign with:</StyledPopupContentH2>
        <StyledCloseButton onClick={onClose}>×</StyledCloseButton>

        {selectedSignature && (
          <StyledSelectedSignature>
            <StyledSelectedSignatureH3>{signatures.find(sig => sig.id === selectedSignature)?.name}</StyledSelectedSignatureH3>
            <StyledSelectedSignatureP>Project manager, Apple</StyledSelectedSignatureP>
            <StyledSelectedSignatureP>presleyabernathy@gmail.com</StyledSelectedSignatureP>
            <StyledSelectedSignatureP>05/07/2024, IST 21:35</StyledSelectedSignatureP>
            <StyledEncKey>Enc. Key: 87478632758654</StyledEncKey>
            <StyledBrowseImage>Browse for Image</StyledBrowseImage>
          </StyledSelectedSignature>
        )}

        <StyledSignatureList>
          {signatures.map(sig => (
            <StyledSignatureOption key={sig.id}>
              <StyledSignatureOptionInput
                type="radio"
                name="signature"
                value={sig.id}
                checked={selectedSignature === sig.id}
                onChange={() => setSelectedSignature(sig.id)}
              />
              <StyledSignatureName>
                <StyledIssueName>{sig.name}</StyledIssueName>
                <StyledIssueDate>Issued: {sig.issueDate}</StyledIssueDate>
              </StyledSignatureName>
            </StyledSignatureOption>
          ))}
        </StyledSignatureList>

        <StyledButtons>
          <StyledAddButton>+ Add</StyledAddButton>
          <StyledConfirmButton
            onClick={handleConfirm}
            disabled={!selectedSignature}
          >
            Confirm signature
          </StyledConfirmButton>
        </StyledButtons>
      </StyledPopupContent>
    </StyledPopupOverlay>
  );
};
