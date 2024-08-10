/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

 import { pki } from "node-forge";

 export type SelectionCoords = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export type DropZoneProps = {
  onFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
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
  statusType: 'checking' | 'success' | 'error';
  handleLogoClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export type StoredSignature = {
  hsmPath: string
  certString: string
}

export type Signature = StoredSignature & {
  id: string
  certificate: pki.Certificate
  name: string
  expiry: Date
}

export type SignatureMethodPopupProps = {
  onClose: () => void;
  onSelectMethod: (method: 'digitalID' | 'imageUpload') => void;
}

export type SignaturePopupProps = {
  onClose: () => void;
  onConfirm: (signature: Signature) => void;
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
  type: 'checking' | 'success' | 'error';
  visible: boolean;
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

export type TooltipProps = {
  text: string;
  isVisible: boolean;
  isVerificationFailed: boolean;
  children: React.ReactNode;
}