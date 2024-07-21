/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState, useCallback, useEffect, useRef } from 'react';
import * as React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import pdfLogo from '../assets/pdfLogo.png';
import styles from './ping-sign-pdf.module.css';
import { verifyPDF } from './utils/pdf_verify';
import { signPdf } from './utils/pdf_signer';
import { DropZone } from './components/DropZone/DropZone';
import { SignatureTypePopup } from './components/SignatureTypePopup/SignatureTypePopup';
import { SignaturePopup } from './components/SignaturePopup/SignaturePopup';
import { SignatureMethodPopup } from './components/SignatureMethodPopup/SignatureMethodPopup';
import { SuccessPopup } from './components/SuccessPopup/SuccessPopup';
import { AnimatedStatus } from './components/AnimatedStatus/AnimatedStatus';

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
  const [hsmPath, setHsmPath] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isEditingPageNumber, setIsEditingPageNumber] = useState<boolean>(false);
  const [tempPageNumber, setTempPageNumber] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // TODO: ADD the setIsDragging state populator
  const [isDragging] = useState<boolean>(false);
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

  const overlayCanvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const pdfCanvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const promptHsmPath = async () => {
      const path = "hardcoded-for-now";
      if (path) {
        setHsmPath(path);
      }
    };
    promptHsmPath();
  }, []);

  const handleFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
      const file = 'files' in event.target
        ? event.target.files?.[0]
        : (event as React.DragEvent<HTMLDivElement>).dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buff = Buffer.from(arrayBuffer);
          setPdfBuff(buff);
          setPdfFile(new Blob([arrayBuffer], { type: 'application/pdf' }));
          setPdfFileName(file.name);
        } catch (error) {
          console.error('Error reading PDF file:', error);
          alert('Error reading PDF file. Please try again.');
        }
      } else {
        alert('Please upload a valid PDF file.');
      }
    },
    []
  );

  // const handleDrop = useCallback(
  //   (event: React.DragEvent<HTMLDivElement>) => {
  //     event.preventDefault();
  //     setIsDragging(false);
  //     handleFileInput(event);
  //   },
  //   [handleFileInput]
  // );

  const handleLogoClick = () => {
    if (!pdfFile) {
      fileInputRef.current?.click();
    }
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
      alert('Selected area is too small. Please select a larger area.');
      clearSelection(pageIndex);
    }
  };

  const handleCloseSignatureTypePopup = () => {
    setShowTypeSignaturePopup(false)
    setIsStatusVisible(false);
  }

  const handleCloseSignaturePopup = () => {
    setShowSignaturePopup(false);
    setIsStatusVisible(false);
  }

  const handleCloseSignatureMethodPopup = () => {
    setShowSignatureMethodPopup(false);
    setIsStatusVisible(false);
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
    if (!pdfBuff || currentPageIndex === null) return;

    setIsLoading(true);
    setStatusMessage('Signing ...');
    setStatusType('checking');
    setIsStatusVisible(true);

    try {
      const signedPdfBuffer = await signPdf(
        pdfBuff,
        currentPageIndex,
        selectionCoords,
        hsmPath,
        pin,
      );

      setPdfFile(new Blob([signedPdfBuffer], { type: 'application/pdf' }));
      setPdfBuff(Buffer.from(signedPdfBuffer));
      setStatusMessage('Signature Complete');
      setStatusType('success');
      setIsStatusVisible(true);
      setTimeout(() => {
        setIsStatusVisible(false);
      }, 3000);
      setIsSelectionEnabled(false);
      setShowSuccessPopup(true);
      setSuccessMessage(`Your document has been signed`);
    } catch (error) {
      console.error('Signing error:', error);
      setStatusMessage('Error');
      setStatusType('error');
      setIsStatusVisible(true);
      setTimeout(() => {
        setIsStatusVisible(false);
        alert(`Error: ${error}`);
      }, 3000);
    } finally {
      setIsLoading(false);
      clearAllSelections();
      setPin(''); // Clear the PIN after use
    }
  };

  const handleSignButtonClick = useCallback(() => {
    if (!pdfBuff) {
      alert('Please upload a PDF first');
      return;
    }
    const enteredPin = prompt('Please enter your PIN:');
    if (enteredPin) {
      setPin(enteredPin);
      setStatusMessage('Preparing to sign ...');
      setStatusType('checking');
      setIsStatusVisible(true);
      setShowSignatureMethodPopup(true);
    } else {
      alert('PIN is required to sign the document');
    }
  }, [pdfBuff]);

  const handleVerifyButtonClick = useCallback(async () => {
    if (!pdfBuff) {
      alert('Please upload a PDF first');
      return;
    }
    setStatusMessage('Checking ...');
    setStatusType('checking');
    setIsStatusVisible(true);

    try {
      const isVerified = await verifyPDF(pdfBuff);
      if (isVerified) {
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
      setIsVerified(false);
      setIsVerificationFailed(true);
    } finally {
      setIsStatusVisible(true);
      setTimeout(() => {
        setIsStatusVisible(false);
        if (isVerified) {
          setSuccessMessage('Document verification successful!');
          setIsVerification(true);
          setShowSuccessPopup(true);
        }
      }, 3000);
    }
  }, [pdfBuff, isVerified]);

  const handleDownloadButtonClick = () => {
    if (pdfFile) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfFile);
      link.download = 'signed_document.pdf';
      link.click();
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
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.navBar}>
          <img
            src={pdfLogo}
            alt="PDF Logo"
            className={styles.logo}
            onClick={handleLogoClick}
          />
          <div className={styles.pdfFileName}>{pdfFileName}</div>
          {pdfFile && !isSelectionEnabled ? (
            <div className={styles.headerControls}>
              {isStatusVisible ? (
                <AnimatedStatus message={statusMessage} type={statusType} visible={false} />
              ) : (
                <div className={`${styles.fadeAway} ${isStatusVisible ? styles.fadeAnimation : ""}`}>
                  <button className={styles.headerButton} onClick={handleSignButtonClick}>Add signature</button>
                  <div className={styles.headerControlsBar}></div>
                  <button
                    className={`${styles.headerButton} ${isVerified ? styles.verified : ""} ${isVerificationFailed ? styles.notVerified : ""}`}
                    onClick={handleVerifyButtonClick}
                  >
                    Verify document
                  </button>
                </div>
              )}
              <div className={styles.headerControlsBar}></div>
              <div className={styles.pageChangingControls}>
                <div className={styles.previousPage} onClick={handlePreviousPage}>&lt;</div>
                <div className={styles.pageNumber}>
                  {isEditingPageNumber ? (
                    <form onSubmit={handlePageNumberSubmit}>
                      <input
                        type="text"
                        value={tempPageNumber}
                        onChange={handlePageNumberChange}
                        onBlur={handlePageNumberSubmit}
                        autoFocus
                        className={styles.pageNumberInput}
                      />
                    </form>
                  ) : (
                    <>
                      <div className={styles.currentPage} onClick={handlePageNumberClick}>{pageNumber}</div>
                      <div className={styles.separator}>/</div>
                      <div className={styles.totalPages}>{numPages || '-'}</div>
                    </>
                  )}
                </div>
                <div className={styles.nextPage} onClick={handleNextPage}>&gt;</div>
              </div>
            </div>
          ) : (
            <div className={styles.headerControls}>
              <div className={styles.instructionText}>Start by holding right click and drag</div>
              <div className={styles.headerControlsBar}></div>
              <div className={styles.pageChangingControls}>
                <div className={styles.previousPage} onClick={handlePreviousPage}>&lt;</div>
                <div className={styles.pageNumber}>
                  {isEditingPageNumber ? (
                    <form onSubmit={handlePageNumberSubmit}>
                      <input
                        type="text"
                        value={tempPageNumber}
                        onChange={handlePageNumberChange}
                        onBlur={handlePageNumberSubmit}
                        autoFocus
                        className={styles.pageNumberInput}
                      />
                    </form>
                  ) : (
                    <>
                      <div className={styles.currentPage} onClick={handlePageNumberClick}>{pageNumber}</div>
                      <div className={styles.separator}>/</div>
                      <div className={styles.totalPages}>{numPages || '-'}</div>
                    </>
                  )}
                </div>
                <div className={styles.nextPage} onClick={handleNextPage}>&gt;</div>
              </div>
            </div>
          )}
          <div className={styles.headerControlsSave}>
            <button className={`${styles.headerButton} ${styles.saveButton}`} onClick={handleDownloadButtonClick}>Save</button>
          </div>
        </div>
        <button className={`${styles.headerButton} ${styles.helpButton}`}>?</button>
      </header>
      <div className={styles.pdfContainer}>
        {!pdfFile ? (
          <DropZone onFileInput={handleFileInput} isDragging={isDragging} handleDrop={function (event: React.DragEvent<HTMLDivElement>): void {
            throw new Error('Function not implemented.');
          }} setIsDragging={function (value: React.SetStateAction<boolean>): void {
            throw new Error('Function not implemented.');
          }} />
        ) : (
          <div className={styles.documentContainer} ref={pdfContainerRef}>
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div>Loading PDF...</div>}
            >
              {numPages &&
                Array.from({ length: numPages }, (_, index) => (
                  <div key={`page_${index + 1}`} style={{ position: 'relative', marginBottom: '20px' }} ref={(el) => (pageRefs.current[index] = el)}>
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderMode="canvas"
                      onLoadSuccess={() => onPageLoadSuccess(index)}
                      canvasRef={(el) => (pdfCanvasRefs.current[index] = el)}
                      loading={<div>Loading page...</div>}
                    />
                    <canvas
                      id={`overlayCanvas_${index}`}
                      ref={(el) => (overlayCanvasRefs.current[index] = el)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: isSelectionEnabled ? 'auto' : 'none',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, index)}
                      onMouseMove={(e) => handleMouseMove(e, index)}
                      onMouseUp={() => handleMouseUp(index)}
                    />
                  </div>
                ))}
            </Document>
          </div>
        )}
      </div>
      {showSignatureMethodPopup && (
        <SignatureMethodPopup
          onClose={handleCloseSignatureMethodPopup}
          onSelectMethod={(method: string) => {
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
          onClose={handleCloseSignaturePopup}
          onConfirm={() => {
            setShowSignaturePopup(false);
            setIsSelectionEnabled(true);
          }}
        />
      )}
      {showTypeSignaturePopup && (
        <SignatureTypePopup
          onClose={handleCloseSignatureTypePopup}
          onConfirm={() => {
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
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
};

export default PdfRenderer;