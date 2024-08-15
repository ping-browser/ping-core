/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState, useEffect } from 'react';
import * as React from 'react';
import {
  StyledPopupOverlay,
  StyledPopupContent,
  StyledPopupContentH2,
  StyledCloseButton,
  StyledSelectedSignature,
  StyledSelectedSignatureH3,
  StyledSelectedSignatureP,
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
import { SignaturePopupProps, Signature } from '../../utils/types';
import { addSignature, getSignatures } from '../../utils/pdf_signer';
import InputPopup from '../InputPopup/InputPopup';  // Adjust the import path as necessary

export const SignaturePopup: React.FC<SignaturePopupProps> = ({ onClose, onConfirm }) => {
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [showInputPopup, setShowInputPopup] = useState(false);

  useEffect(() => {
    const loadSignatures = async () => {
      try {
        const loadedSignatures = await getSignatures();
        setSignatures(loadedSignatures);
      } catch (error) {
        console.error('Error loading signatures:', error);
        alert('Failed to load signatures. Please try again.');
      }
    };
    loadSignatures();
  }, []);

  const handleConfirm = () => {
    if (selectedSignature) {
      onConfirm(selectedSignature);
    }
  };

  const handleAddSignature = () => {
    setShowInputPopup(true);
  };

  const handleInputComplete = async (path: string) => {
    setShowInputPopup(false);
    if (path) {
      try {
        await addSignature(path);
        const updatedSignatures = await getSignatures();
        setSignatures(updatedSignatures);
      } catch (error) {
        console.error('Error adding signature:', error);
        alert('Failed to add signature. Please try again.');
      }
    }
  };

  const handleInputBack = () => {
    setShowInputPopup(false);
  };

  return (
    <StyledPopupOverlay>
      <StyledPopupContent selected={!!selectedSignature}>
        <StyledPopupContentH2>Choose a digital ID to sign with:</StyledPopupContentH2>
        <StyledCloseButton onClick={onClose}>x</StyledCloseButton>

        {signatures.length === 0 ? (
          <StyledSignatureList>
            <StyledSignatureOption>
              <StyledSignatureName>
                <StyledIssueName>No digital IDs found</StyledIssueName>
                <StyledIssueDate>
                  Click the "Add" button below to add a new digital ID.
                </StyledIssueDate>
              </StyledSignatureName>
            </StyledSignatureOption>
          </StyledSignatureList>
        ) : (
          <>
            {selectedSignature && (
              <StyledSelectedSignature>
                <StyledSelectedSignatureH3>{selectedSignature.name}</StyledSelectedSignatureH3>
                <StyledSelectedSignatureP>Valid until: {selectedSignature.expiry.toLocaleString()}</StyledSelectedSignatureP>
              </StyledSelectedSignature>
            )}
            <StyledSignatureList>
              {signatures.map(sig => (
                <StyledSignatureOption key={sig.id}>
                  <StyledSignatureOptionInput
                    type="radio"
                    name="signature"
                    value={sig.id}
                    checked={selectedSignature?.id === sig.id}
                    onChange={() => setSelectedSignature(sig)}
                  />
                  <StyledSignatureName>
                    <StyledIssueName>{sig.name}</StyledIssueName>
                    <StyledIssueDate>
                      Expires: {sig.expiry.toLocaleDateString()}
                    </StyledIssueDate>
                  </StyledSignatureName>
                </StyledSignatureOption>
              ))}
            </StyledSignatureList>
          </>
        )}

        <StyledButtons>
          <StyledAddButton onClick={handleAddSignature}>+ Add</StyledAddButton>
          <StyledConfirmButton
            onClick={handleConfirm}
            disabled={!selectedSignature}
          >
            Confirm signature
          </StyledConfirmButton>
        </StyledButtons>

        {showInputPopup && (
          <InputPopup
            userName="Add Digital ID"
            onBack={handleInputBack}
            onComplete={handleInputComplete}
            popupType="path"
          />
        )}
      </StyledPopupContent>
    </StyledPopupOverlay>
  );
};