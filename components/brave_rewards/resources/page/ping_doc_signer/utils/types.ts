/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
 export type SelectionCoords = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export type DropZoneProps = {
  onFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;

}

export type HeaderProps = {
  pdfFileName: string;
  pdfFile: Blob | null;
  isSelectionEnabled: boolean;
  handleSignButtonClick: () => void;
  handleVerifyButtonClick: () => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handlePageNumberClick: () => void;
  handlePageNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePageNumberSubmit: (e: React.FormEvent) => void;
  handleDownloadButtonClick: () => void;
  pageNumber: number;
  numPages: number | null;
  isEditingPageNumber: boolean;
  tempPageNumber: string;
  isVerified: boolean;
  isVerificationFailed: boolean;
  isStatusVisible: boolean;
  statusMessage: string;
  statusType: string;
}

export type SignatureMethodPopupProps = {
  onClose: () => void;
  onSelectMethod: (method: 'digitalID' | 'imageUpload') => void;
}

export type SignaturePopupProps = {
  onClose: () => void;
  onConfirm: (signature: string) => void;
}

export type SignatureTypePopupProps = {
  onClose: () => void;
  onConfirm: (signatureName: string) => void;
}

export type SuccessPopupProps = {
  message: string;
  onSave: () => void;
  onContinue: () => void;
  isVerification: boolean;
}

export type AnimatedStatusProps = {
  message: string;
  type: string;
}

export type PdfPageProps = {
  pageNumber: number;
  onLoadSuccess: () => void;
  isSelectionEnabled: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  pdfCanvasRef: React.Ref<HTMLCanvasElement>;
  overlayCanvasRef: React.Ref<HTMLCanvasElement>;
  pageRef: React.Ref<HTMLDivElement>;
}