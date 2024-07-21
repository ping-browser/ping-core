/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useRef } from 'react';
import * as React from 'react';
import {
  StyledDropZoneContainer,
  StyledDropZone,
  StyledPdfLogo,
  StyledPdfText,
  StyledAddFileButton,
  StyledLegalText
} from './styles';
import pdfMain from '../../../assets/pdfMain.png';

interface DropZoneProps {
  onFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileInput, isDragging, handleDrop, setIsDragging }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <StyledDropZoneContainer>
      <StyledDropZone
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
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
          onChange={onFileInput}
          style={{ display: 'none' }}
        />
        <StyledLegalText>
          By clicking on add file, you agree to Ping's <br />
          <a href="#" style={{ color: '#2BB563', textDecoration: 'none' }}> Privacy policy </a>
          &
          <a href="#" style={{ color: '#2BB563', textDecoration: 'none' }}> Terms of use</a>
        </StyledLegalText>
      </StyledDropZone>
    </StyledDropZoneContainer>
  );
};