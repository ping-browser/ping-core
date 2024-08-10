/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import { useRef, useState } from 'react';
import * as React from 'react';
import {
  StyledDropZoneContainer,
  StyledDropZone,
  StyledPdfLogo,
  StyledPdfText,
  StyledAddFileButton,
  StyledLegalText,
  StyledErrorMessage
} from './styles';
import pdfMain from '../../../assets/pdfMain.png';
import { DropZoneProps } from '../../utils/types';
import { DropZoneErrorType } from '../../utils/errorTypes';

export const DropZone: React.FC<DropZoneProps> = ({ onFileInput, isDragging }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<DropZoneErrorType | null>(null);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): DropZoneErrorType | null => {
    if (file.type !== 'application/pdf') {
      return DropZoneErrorType.INVALID_FILE_TYPE;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return DropZoneErrorType.FILE_TOO_LARGE;
    }
    return null;
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError(DropZoneErrorType.NO_FILE_SELECTED);
      return;
    }
    if (files.length > 1) {
      setError(DropZoneErrorType.MULTIPLE_FILES_SELECTED);
      return;
    }

    const file = files[0];
    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setError(null);
    onFileInput(event);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (files.length === 0) {
      setError(DropZoneErrorType.NO_FILE_SELECTED);
      return;
    }
    if (files.length > 1) {
      setError(DropZoneErrorType.MULTIPLE_FILES_SELECTED);
      return;
    }

    const file = files[0];
    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setError(null);
    // Create a new file input event to pass to onFileInput
    const fileInputEvent = {
      target: {
        files: files
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onFileInput(fileInputEvent);
  };

  const getErrorMessage = (errorType: DropZoneErrorType): string => {
    switch (errorType) {
      case DropZoneErrorType.FILE_TOO_LARGE:
        return "File is too large. Please select a file smaller than 10MB.";
      case DropZoneErrorType.INVALID_FILE_TYPE:
        return "Invalid file type. Please select a PDF file.";
      case DropZoneErrorType.MULTIPLE_FILES_SELECTED:
        return "Please select only one file.";
      case DropZoneErrorType.NO_FILE_SELECTED:
        return "No file selected. Please choose a PDF file.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  };

  return (
    <StyledDropZoneContainer>
      <StyledDropZone
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        onDragLeave={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <StyledPdfLogo
          src={pdfMain}
          alt="PDF Logo"
          onClick={handleLogoClick}
        />
        <StyledPdfText>Choose a PDF file to add your digital signature</StyledPdfText>
        <StyledAddFileButton as="label" htmlFor="fileInput">
          + Add file
        </StyledAddFileButton>
        <input
          id="fileInput"
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        {error && <StyledErrorMessage>{getErrorMessage(error)}</StyledErrorMessage>}
        <StyledLegalText>
          By clicking on add file, you agree to Ping's <br />
          <a href="https://ping-browser.com/privacy-policy" style={{ color: '#2BB563', textDecoration: 'none' }}> Privacy policy </a>
          &
          <a href="https://ping-browser.com/terms-of-use-1" style={{ color: '#2BB563', textDecoration: 'none' }}> Terms of use</a>
        </StyledLegalText>
      </StyledDropZone>
    </StyledDropZoneContainer>
  );
};