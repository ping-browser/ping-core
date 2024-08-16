/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState, useCallback, useEffect, useRef } from 'react';
import * as React from 'react';
import { pdfjs, Document } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { verifyPdf } from './utils/pdf_verify';
import { signPdf } from './utils/pdf_signer';
import { Signature } from './utils/types';
import { ErrorPopup } from './components/ErrorPopup/ErrorPopup';
import { Header } from './components/Header/Header';
import { DropZone } from './components/DropZone/DropZone';
import PdfPage from './components/PdfPage/PdfPage';
import { SignatureMethodPopup } from './components/SignatureMethodPopup/SignatureMethodPopup';
import { SignaturePopup } from './components/SignaturePopup/SignaturePopup';
import { SignatureTypePopup } from './components/SignatureTypePopup/SignatureTypePopup';
import { SuccessPopup } from './components/SuccessPopup/SuccessPopup';
import InputPopup from './components/InputPopup/InputPopup';

import * as S from './styles';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  './utils/pdfjs-dist-worker.js',
  import.meta.url,
).toString();

export interface SelectionCoords {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const PdfRenderer: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfBuff, setPdfBuff] = useState<Buffer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [isSelectionEnabled, setIsSelectionEnabled] = useState<boolean>(false);
  const [selectionCoords, setSelectionCoords] = useState<SelectionCoords>({ startX: 1, startY: 1, endX: 1, endY: 1 });
  const [currentPageIndex, setCurrentPageIndex] = useState<number | null>(null);
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isEditingPageNumber, setIsEditingPageNumber] = useState<boolean>(false);
  const [tempPageNumber, setTempPageNumber] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSignaturePopup, setShowSignaturePopup] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSignatureMethodPopup, setShowSignatureMethodPopup] = useState<boolean>(false);
  const [isVerification, setIsVerification] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerificationFailed, setIsVerificationFailed] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isStatusVisible, setIsStatusVisible] = useState<boolean>(false);
  const [showTypeSignaturePopup, setShowTypeSignaturePopup] = useState<boolean>(false);
  const [statusType, setStatusType] = useState<'checking' | 'success' | 'error'>('checking');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPinPopup, setShowPinPopup] = useState<boolean>(false);
  const overlayCanvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const pdfCanvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [verificationErrorMessage, setVerificationErrorMessage] = useState<string>('');

  const resetSignatureState = useCallback(() => {
    setIsSelectionEnabled(false);
    setStatusMessage('');
    setIsStatusVisible(false);
    setShowSignatureMethodPopup(false);
    setShowSignaturePopup(false);
    setShowTypeSignaturePopup(false);
    setSelectedSignature(null);
  }, []);

  const resetVerificationState = useCallback(() => {
    setIsVerification(false);
    setIsVerified(false);
    setIsVerificationFailed(false);
    setStatusMessage('');
    setIsStatusVisible(false);
  }, []);

  const handleFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
      const file = 'files' in event.target && event.target.files?.[0]
        ? event.target.files[0]
        : (event as React.DragEvent<HTMLDivElement>).dataTransfer.files?.[0];
      setIsSigned(false);
      if (file && file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buff = Buffer.from(arrayBuffer);
          setPdfBuff(buff);
          setPdfFile(new Blob([arrayBuffer], { type: 'application/pdf' }));
          setPdfFileName(file.name);
          resetSignatureState();
          resetVerificationState();
        } catch (error) {
          console.error('Error reading PDF file:', error);
          setErrorMessage('Error reading PDF file. Please try again.');
        }
      } else {
        setErrorMessage('Please upload a valid PDF file.');
        setShowError(true);
      }
    },
    [resetSignatureState, resetVerificationState]
  );

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const getMousePos = (canvas: HTMLCanvasElement, event: React.MouseEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const isSelectionValid = (): boolean => {
    const { startX, startY, endX, endY } = selectionCoords;
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const minSize = 50; // Minimum size in pixels
    return width >= minSize && height >= minSize;
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>, pageIndex: number) => {
    if (!isSelectionEnabled) return;
    setIsSelecting(true);
    const canvas = overlayCanvasRefs.current[pageIndex];
    if (canvas) {
      const pos = getMousePos(canvas, event);
      setSelectionCoords({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
      setCurrentPageIndex(pageIndex);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>, pageIndex: number) => {
    if (!isSelecting || !isSelectionEnabled) return;
    const canvas = overlayCanvasRefs.current[pageIndex];
    if (canvas) {
      const pos = getMousePos(canvas, event);
      setSelectionCoords(prev => ({ ...prev, endX: pos.x, endY: pos.y }));
      drawSelection(pos.x, pos.y, pageIndex);
    }
  };

  const handleMouseUp = (pageIndex: number) => {
    if (!isSelectionEnabled) return;
    setIsSelecting(false);
    if (isSelectionValid()) {
      showEmbedSignConfirmation(pageIndex);
    } else {
      setErrorMessage('Selected area is too small. Please select a larger area.');
      setShowError(true);
      clearSelection(pageIndex);
    }
  };

  const handleErrorContinue = () => {
    setShowError(false);
    setIsSelectionEnabled(false);
    // setStatusMessage('Error Signing PDF');
    setTimeout(() => {
      setIsStatusVisible(false);
      setStatusMessage('');
    }, 3000);
  }

  const drawSelection = (endX: number, endY: number, pageIndex: number) => {
    const { startX, startY } = selectionCoords;
    const canvas = overlayCanvasRefs.current[pageIndex];
    if (canvas) {
      const overlayCtx = canvas.getContext('2d');
      if (overlayCtx) {
        clearOverlay(pageIndex);
        overlayCtx.strokeStyle = 'blue';
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeRect(startX, startY, endX - startX, endY - startY);
      }
    }
  };

  const clearOverlay = (pageIndex: number) => {
    const canvas = overlayCanvasRefs.current[pageIndex];
    if (canvas) {
      const overlayCtx = canvas.getContext('2d');
      if (overlayCtx) {
        overlayCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const clearAllSelections = () => {
    overlayCanvasRefs.current.forEach((canvas, index) => {
      if (canvas) {
        clearOverlay(index);
      }
    });
  };

  const showEmbedSignConfirmation = (pageIndex: number) => {
    const confirmation = window.confirm("Do you want to embed the signature in the selected area?");
    if (confirmation) {
      setCurrentPageIndex(pageIndex);
      sendSignRequest();
    } else {
      clearSelection(pageIndex);
    }
  };

  const clearSelection = (pageIndex: number) => {
    clearOverlay(pageIndex);
    setSelectionCoords({ startX: 1, startY: 1, endX: 1, endY: 1 });
  };

  const sendSignRequest = async () => {
    if (!pdfBuff || currentPageIndex === null || selectedSignature === null) {
      setErrorMessage('Missing required data for signing');
      setShowError(true);
      return;
    }
    setStatusMessage('Signing ...');
    setStatusType('checking');
    setIsStatusVisible(true);
    setShowPinPopup(true);
  };

  const handlePinSubmit = async (pin: string) => {
    setShowPinPopup(false);
    setIsLoading(true);
    try {
      const signedPdfBuffer = await signPdf(
        pdfBuff!,
        currentPageIndex!,
        selectionCoords,
        selectedSignature!,
        pin
      );
      setPdfFile(new Blob([signedPdfBuffer], { type: 'application/pdf' }));
      setPdfBuff(Buffer.from(signedPdfBuffer));
      setStatusMessage('Signature Complete');
      setStatusType('success');
      setIsStatusVisible(true);
      setIsVerified(true);
      setTimeout(() => {
        setIsStatusVisible(false);
        setStatusMessage('');
      }, 3000);
      setIsSelectionEnabled(false);
      setShowSuccessPopup(true);
      setIsSigned(true);
      setSuccessMessage(`Your document has been signed`);
    } catch (error) {
      console.error('Signing error:', error);
      setStatusType('error');
      setIsStatusVisible(true);

      setErrorMessage(`${error}`);
      setIsSelectionEnabled(false);
      setIsVerified(false);
      clearAllSelections();
      setShowError(true);
    } finally {
      setIsLoading(false);
      clearAllSelections();
    }
  };

  const handleSignButtonClick = useCallback(() => {
    if (!pdfBuff) {
      setErrorMessage('Please upload a PDF first');
      setShowError(true);
      return;
    }

    setStatusMessage('Preparing to sign ...');
    setStatusType('checking');
    setIsStatusVisible(true);
    setShowSignatureMethodPopup(true);

  }, [pdfBuff]);

  const handleVerifyButtonClick = useCallback(async () => {
    if (!pdfBuff) {
      setErrorMessage('Please upload a PDF first');
      setShowError(true);
      return;
    }
    setStatusMessage('Checking ...');
    setStatusType('checking');
    setIsStatusVisible(true);

    try {
      const verificationResult = verifyPdf(pdfBuff);
      if (verificationResult) {
        setStatusMessage('Verification Successful');
        setStatusType('success');
        setIsVerified(true);
        setIsVerificationFailed(false);
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      setStatusMessage('Verification Failed');
      setStatusType('error');
      setVerificationErrorMessage(`${error}`);
      setIsVerified(false);
      setIsVerificationFailed(true);
    } finally {
      setIsStatusVisible(true);
      setTimeout(() => {
        setIsStatusVisible(false);
        if (isVerified) {
          setIsVerification(true);
        }
        setStatusMessage('');
      }, 3000);
    }
  }, [pdfBuff, isVerified]);

  const handleDownloadButtonClick = () => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'signed_document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsVerified(false);
    setPageNumber(1);
  }, []);

  const onPageLoadSuccess = useCallback((pageIndex: number) => {
    const pageCanvas = pdfCanvasRefs.current[pageIndex];
    const overlayCanvas = overlayCanvasRefs.current[pageIndex];
    if (pageCanvas && overlayCanvas) {
      overlayCanvas.width = pageCanvas.width;
      overlayCanvas.height = pageCanvas.height;
    }
    if (pageCanvas && pdfContainerRef.current) {
      pdfContainerRef.current.style.maxWidth = `${pageCanvas.width}px`;
    }
  }, []);

  const scrollToPage = (pageNum: number) => {
    const pageElement = pageRefs.current[pageNum - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePreviousPage = useCallback(() => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = Math.max(prevPageNumber - 1, 1);
      scrollToPage(newPageNumber);
      return newPageNumber;
    });
  }, []);

  const handleNextPage = useCallback(() => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = numPages ? Math.min(prevPageNumber + 1, numPages) : prevPageNumber;
      scrollToPage(newPageNumber);
      return newPageNumber;
    });
  }, [numPages]);

  const handlePageNumberClick = () => {
    setIsEditingPageNumber(true);
    setTempPageNumber(pageNumber.toString());
  };

  const handlePageNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPageNumber(e.target.value);
  };

  const handlePageNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPageNumber = parseInt(tempPageNumber, 10);
    if (!isNaN(newPageNumber) && newPageNumber >= 1 && newPageNumber <= (numPages || 0)) {
      setPageNumber(newPageNumber);
      scrollToPage(newPageNumber);
    }
    setIsEditingPageNumber(false);
  };

  const handleSaveAs = () => {
    handleDownloadButtonClick();
    setShowSuccessPopup(false);
  };

  const handleContinue = () => {
    setShowSuccessPopup(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePreviousPage();
      } else if (event.key === 'ArrowRight') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePreviousPage, handleNextPage]);

  return (
    <S.AppContainer>
      <Header
        pdfFileName={pdfFileName}
        pdfFile={pdfFile}
        isSelectionEnabled={isSelectionEnabled}
        handleSignButtonClick={handleSignButtonClick}
        handleVerifyButtonClick={handleVerifyButtonClick}
        isStatusVisible={isStatusVisible}
        statusMessage={statusMessage}
        statusType={statusType}
        isVerified={isVerified}
        isVerificationFailed={isVerificationFailed}
        pageNumber={pageNumber}
        numPages={numPages}
        handlePreviousPage={handlePreviousPage}
        handleNextPage={handleNextPage}
        handlePageNumberClick={handlePageNumberClick}
        isEditingPageNumber={isEditingPageNumber}
        tempPageNumber={tempPageNumber}
        handlePageNumberChange={handlePageNumberChange}
        handlePageNumberSubmit={handlePageNumberSubmit}
        handleDownloadButtonClick={handleDownloadButtonClick}
        handleLogoClick={handleLogoClick}
        fileInputRef={fileInputRef}
        isSigned={isSigned}
        message={verificationErrorMessage}
      />
      <S.PdfContainer>
        {!pdfFile ? (
          <DropZone
            onFileInput={handleFileInput}
            isDragging={isDragging}
            handleDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFileInput(event);
            }}
            setIsDragging={setIsDragging}
          />
        ) : (
          <S.DocumentContainer ref={pdfContainerRef}>
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<S.Loader>Loading PDF...</S.Loader>}
              error={<div>Error loading PDF. Please try again.</div>}
            >
              {numPages &&
                Array.from({ length: numPages }, (_, index) => (
                  <PdfPage
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    onLoadSuccess={() => onPageLoadSuccess(index)}
                    isSelectionEnabled={isSelectionEnabled}
                    handleMouseDown={(e) => handleMouseDown(e, index)}
                    handleMouseMove={(e) => handleMouseMove(e, index)}
                    handleMouseUp={() => handleMouseUp(index)}
                    pdfCanvasRef={(el) => (pdfCanvasRefs.current[index] = el)}
                    overlayCanvasRef={(el) => (overlayCanvasRefs.current[index] = el)}
                    pageRef={(el) => (pageRefs.current[index] = el)}
                  />
                ))}
            </Document>
          </S.DocumentContainer>
        )}
      </S.PdfContainer>
      {showSignatureMethodPopup && (
        <SignatureMethodPopup
          onClose={() => {
            setShowSignatureMethodPopup(false);
            resetSignatureState();
          }}
          onSelectMethod={(method) => {
            setShowSignatureMethodPopup(false);
            if (method === 'digitalID') {
              setShowSignaturePopup(true);
            } else {
              setShowTypeSignaturePopup(true);
            }
          }}
        />
      )}
      {showSignaturePopup && (
        <SignaturePopup
          onClose={() => {
            setShowSignaturePopup(false);
            resetSignatureState();
          }}
          onConfirm={(signature) => {
            setSelectedSignature(signature);
            setShowSignaturePopup(false);
            setIsSelectionEnabled(true);
          }}
        />
      )}
      {showTypeSignaturePopup && (
        <SignatureTypePopup
          onClose={() => {
            setShowTypeSignaturePopup(false);
            resetSignatureState();
          }}
          onConfirm={(signatureName) => {
            // Handle typed signature confirmation
            setIsSelectionEnabled(true);
            setShowTypeSignaturePopup(false);
          }}
        />
      )}
      {showSuccessPopup && (
        <SuccessPopup
          message={successMessage}
          onSave={handleSaveAs}
          onContinue={handleContinue}
          isVerification={isVerification}
        />
      )}
      {isLoading && (
        <S.LoadingOverlay>
          <S.LoadingSpinner />
        </S.LoadingOverlay>
      )}
      {showError && (
        <ErrorPopup
          message={errorMessage}
          onContinue={handleErrorContinue}
        />
      )}
      {showPinPopup && (
        <InputPopup
          userName={selectedSignature?.name || 'User'}
          onBack={() => {
            setShowPinPopup(false);
            setIsStatusVisible(false);
            setIsSelectionEnabled(false);
            setStatusMessage('');
            clearAllSelections();
          }}
          onComplete={handlePinSubmit}
          popupType={'pin'}
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInput}
        accept="application/pdf"
      />
    </S.AppContainer>
  );
};

export default PdfRenderer;