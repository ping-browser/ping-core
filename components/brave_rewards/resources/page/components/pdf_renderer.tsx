/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useState, useCallback } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { signWithPkcs11 } from './pdf_signer';
import { verifyPDF } from './pdf_verify';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  './pdfjs-dist-worker.js',
  import.meta.url
).toString();

// const ERROR_MAP = {
//   ERROR_MODULE_NOT_FOUND: 'ERROR_MODULE_NOT_FOUND',
//   ERROR_SLOT_NOT_FOUND: 'ERROR_SLOT_NOT_FOUND',
//   ERROR_LOGIN_FAILED: 'ERROR_LOGIN_FAILED',
//   ERROR_SIGNING_FAILURE: 'ERROR_SIGNING_FAILURE',
//   ERROR_NO_OBJS_FOUND: 'ERROR_NO_OBJS_FOUND',
// }

export function PdfRenderer() {
  const [pdfFile, setPdfFile] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfBuff, setPdfBuff] = useState<Buffer | null>(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [hsmPath, setHsmPath] = useState('');
  // const [selectedSignature, setSelectedSignature] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const showToast = useCallback((message: string, type: string) => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
  }, []);

  // const getSignatureHandler = (signature: string, dataToSign: string) => {
  //   switch (signature) {
  //     case ERROR_MAP.ERROR_MODULE_NOT_FOUND:
  //       showToast('Module not found. Entered PKCS #11 module path maybe incorrect', 'error');
  //       break;
  //     case ERROR_MAP.ERROR_SLOT_NOT_FOUND:
  //       showToast('No slots found. Module might be disconnected', 'error');
  //       break;
  //     case ERROR_MAP.ERROR_LOGIN_FAILED:
  //       showToast('Login failed, entered PIN is incorrect', 'error');
  //       break;
  //     case ERROR_MAP.ERROR_SIGNING_FAILURE:
  //       showToast('Signing failed, please try again', 'error');
  //       break;
  //     case ERROR_MAP.ERROR_NO_OBJS_FOUND:
  //       showToast('There might be an issue with your token', 'error');
  //       break;
  //     default:
  //       showToast('Sent signature', 'info');
  //       console.log('Sending signature to server:', signature);
  //       // ws.send(JSON.stringify({
  //       //   action: 'signature',
  //       //   data: {
  //       //     dataToSign,
  //       //     signedData: signature,
  //       //   },
  //       // }));
  //   }
  // }

  const handleFileInput = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event === null) return;
    const file = event.target?.files?.[0];
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        setPdfBuff(buffer);
        setPdfFile(new Blob([buffer], { type: 'application/pdf' }));
        setVerificationResult(null);
      } catch (error) {
        console.error('Error reading PDF file:', error);
        showToast('Error reading PDF file. Please try again.', 'error');
      }
    }
  }, [showToast]);

  const promptHsmPath = () => {
    const path = prompt("Enter HSM path:");
    if (path) setHsmPath(path);
    return path;
  };

  const selectSignature = () => {
    // Mock function for now. In reality, this would involve fetching signatures from the HSM
    // setSelectedSignature("mock_signature");
  };

  const showConfirmationPreview = () => {
    setShowConfirmation(true);
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      sendSignRequest();
    }
    setShowConfirmation(false);
  };

  const sendSignRequest = async () => {
    const pin = prompt('Enter PIN:');
    if (pdfBuff === null || pin === null) return;
    const signedBuffer = await signWithPkcs11(pdfBuff, hsmPath, pin)
    try {
      if(verifyPDF(signedBuffer)) {
        showToast('Document is verified', 'success');
      }
    } catch (error) {
      console.error('Error verifying PDF:', error);
      showToast('Verification failed', 'error');
    }
    setPdfFile(new Blob([signedBuffer], { type: 'application/pdf' }));
    setPdfBuff(signedBuffer);

    downloadSignedPdf(signedBuffer);
  };

  const downloadSignedPdf = (signedPdf: Buffer) => {
    if (!signedPdf) {
      console.error("No signed PDF data available.");
      return;
    }

    // Create a Blob from the signed PDF data
    const blob = new Blob([signedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signed.pdf';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSignButtonClick = useCallback(() => {
    if (!pdfBuff) {
      showToast('Please upload a PDF first', 'error');
      return;
    }

    const path = promptHsmPath();
    if (!path) return;

    selectSignature();
    showConfirmationPreview();
  }, [pdfBuff, showToast]);

  const handleVerifyButtonClick = useCallback(() => {
    if (!pdfBuff) {
      showToast('Please upload a PDF first', 'error');
      return;
    }
    try {
      if(verifyPDF(pdfBuff)) {
        showToast('Document is verified', 'success');
      }
    } catch (error) {
      console.error('Error verifying PDF:', error);
      showToast('Verification failed', 'error');
    }
  }, [pdfBuff, showToast]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: {numPages: number}) => {
    setNumPages(numPages);
  }, []);

  const ConfirmationDialog = ({ onConfirm }: {onConfirm: Function}) => (
    <div className="confirmation-dialog">
      <h3>Confirm Signature</h3>
      <p>Are you sure you want to sign the document?</p>
      <button onClick={() => onConfirm(true)}>Confirm</button>
      <button onClick={() => onConfirm(false)}>Cancel</button>
    </div>
  );

  return (
    <div className="App" style={{ padding: '20px' }}>
      <div id="controls" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <input
          type="file"
          id="pdfInput"
          accept="application/pdf"
          onChange={handleFileInput}
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button
          id="signButton"
          onClick={handleSignButtonClick}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          Sign
        </button>
        <button
          id="verifyButton"
          onClick={handleVerifyButtonClick}
          style={{ padding: '10px' }}
        >
          Verify
        </button>
      </div>
      {verificationResult !== null && (
        <div id="verificationResult" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h3>Verification Result:</h3>
          <p>{verificationResult ? 'Document is verified' : 'Document verification failed'}</p>
        </div>
      )}
      {showConfirmation && (
        <ConfirmationDialog onConfirm={handleConfirmation} />
      )}
      <div id="pdfContainer" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} width={600} />
          ))}
        </Document>
      </div>
      {/* {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )} */}
      <style>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1001;
        }
        .loading-spinner {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          border-radius: 4px;
          color: white;
          opacity: 0.9;
          transition: opacity 0.3s ease;
          z-index: 1002;
        }
        .toast.success { background-color: #4CAF50; }
        .toast.error { background-color: #F44336; }
        .toast.info { background-color: #2196F3; }
        .toast.fade-out { opacity: 0; }
        .confirmation-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          z-index: 1003;
        }
      `}</style>
    </div>
  );
}