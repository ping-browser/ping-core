/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
// @ts-nocheck
import * as React from 'react'
import * as urls from '../../lib/rewards_urls'
import { useState, useRef, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  './pdfjs-dist-worker.js',
  import.meta.url
).toString();

interface Props {
  onEnable?: () => void;
}

export function PdfRenderer(props: Props) {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSelectionEnabled, setIsSelectionEnabled] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [selectionCoords, setSelectionCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const [pdfBuff, setPdfBuff] = useState(0);
  const overlayCanvasRefs = useRef([]);
  const pdfCanvasRefs = useRef([]);
  const pdfContainerRef = useRef(null);
  const pageRefs = useRef([]);
  const fixedText = "Signed by user";

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onPageLoadSuccess = useCallback((pageIndex) => {
    const pageCanvas = pdfCanvasRefs.current[pageIndex];
    const overlayCanvas = overlayCanvasRefs.current[pageIndex];
    if (pageCanvas && overlayCanvas) {
      overlayCanvas.width = pageCanvas.width;
      overlayCanvas.height = pageCanvas.height;
    }
    // Set the max width of the pdfContainerRef to the width of the page
    if (pageCanvas && pdfContainerRef.current) {
      pdfContainerRef.current.style.maxWidth = `${pageCanvas.width}px`;
    }
  }, []);

  const handleFileInput = async(event) => {
    const file = event.target.files[0];
    const pdfBuff = await file.arrayBuffer();
    setPdfBuff(pdfBuff);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPdfFile(reader.result);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uint8ArrayToArrayBuffer = (uint8Array) => {
    return uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
  }

  // const handleCertChange = (e) => setCertFile(e.target.files[0]);

  // const handleSignature = async () => {
  //   if(!pdfFile || !certFile){
  //     alert('Upload both pdf and certificate');
  //     return;
  //   }
  //   const formData = new FormData();
  //   formData.append('pdf', pdfFile);
  //   formData.append('cert', certFile);

  //   try{
  //     const response = await fetch('http://localhost:5000/sign', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     const signatureHash = await response.
  //   } catch (error) {
  //     console.error('Error signing PDF:', error);
  //   }
  // };

  const addPlaceholder = async (pdfBuff, signerName) => {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuff);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
  
      // Adjust these values based on your PDF dimensions and desired positioning
      const boxLeft = 20;
      const boxBottom = 20;
      const boxWidth = 200;
      const boxHeight = 50;
  
      // Draw the rectangle
      firstPage.drawRectangle({
        x: boxLeft,
        y: firstPage.getHeight() - boxBottom - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
  
      // Add text inside the rectangle
      const now = new Date();
      const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      firstPage.drawText(`Signed by ${signerName} using Ping\n${timestamp}`, {
        x: boxLeft + 10,
        y: firstPage.getHeight() - boxBottom - boxHeight + 20,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
  
      const modifiedPdfBytes = await pdfDoc.save();
  
      return modifiedPdfBytes;
    } catch (error) {
      console.error('Error adding placeholder:', error);
      throw error;
    }
  };

  const signpdf = (pdfBuffer, certificate, signatureHash) => {
    // Extract signer's name from the certificate
    const signerName = certificate.subject.getField('CN').value;
    console.log(signerName);
  
    // Adding placeholder

    const pdfH = uint8ArrayToArrayBuffer(pdfBuffer);

    // TODO: implementing plainaddplaceholder that takes arraybuffer as input.
    pdfBuffer = plainAddPlaceholder({
      pdfH,
      reason: `Signed by ${signerName} using Ping`,
    });

    console.log("pdf: ", pdfBuffer);
    console.log('Added placeholder:', pdfBuffer.toString('utf8', 0, 200)); // Log first 200 bytes
  
    let pdf = removeTrailingNewLine(pdfH);
    console.log(
      'PDF after removing trailing new lines:',
      pdf.toString('utf8', 0, 200),
    ); // Log first 200 bytes
  
    const byteRangePlaceholder = [
      0,
      `/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`,
      `/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`,
      `/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`,
    ];
    const byteRangeString = `/ByteRange [${byteRangePlaceholder.join(' ')}]`;
    const byteRangePos = pdf.indexOf(byteRangeString);
    if (byteRangePos === -1) {
      console.error(`Could not find ByteRange placeholder: ${byteRangeString}`);
      throw new Error(`Could not find ByteRange placeholder: ${byteRangeString}`);
    }
    console.log(`ByteRange found at position: ${byteRangePos}`);
  
    const byteRangeEnd = byteRangePos + byteRangeString.length;
    const contentsTagPos = pdf.indexOf('/Contents ', byteRangeEnd);
    const placeholderPos = pdf.indexOf('<', contentsTagPos);
    const placeholderEnd = pdf.indexOf('>', placeholderPos);
    const placeholderLengthWithBrackets = placeholderEnd + 1 - placeholderPos;
    const placeholderLength = placeholderLengthWithBrackets - 2;
    const byteRange = [0, 0, 0, 0];
    byteRange[1] = placeholderPos;
    byteRange[2] = byteRange[1] + placeholderLengthWithBrackets;
    byteRange[3] = pdf.length - byteRange[2];
    let actualByteRange = `/ByteRange [${byteRange.join(' ')}]`;
    actualByteRange += ' '.repeat(
      byteRangeString.length - actualByteRange.length,
    );
  
    pdf = Buffer.concat([
      pdf.slice(0, byteRangePos),
      Buffer.from(actualByteRange),
      pdf.slice(byteRangeEnd),
    ]);
    console.log(
      'PDF with updated ByteRange:',
      pdf.toString('utf8', byteRangePos, byteRangePos + 200),
    ); // Log 200 bytes around the ByteRange
  
    pdf = Buffer.concat([
      pdf.slice(0, byteRange[1]),
      pdf.slice(byteRange[2], byteRange[2] + byteRange[3]),
    ]);
    console.log(
      'PDF with removed placeholder content:',
      pdf.toString('utf8', 0, 200),
    ); // Log first 200 bytes
  
    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(pdf.toString('binary'));
    p7.addCertificate(certificate);
    p7.addSigner({
      key: { sign: () => signatureHash },
      certificate,
      digestAlgorithm: forge.pki.oids.sha256,
      authenticatedAttributes: [
        { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
        { type: forge.pki.oids.messageDigest },
        { type: forge.pki.oids.signingTime, value: new Date() },
      ],
    });
    p7.sign({ detached: true });
    const raw = forge.asn1.toDer(p7.toAsn1()).getBytes();
    if (raw.length * 2 > placeholderLength) {
      console.error(
        `Signature exceeds placeholder length: ${
          raw.length * 2
        } > ${placeholderLength}`,
      );
      throw new Error(
        `Signature exceeds placeholder length: ${
          raw.length * 2
        } > ${placeholderLength}`,
      );
    }
    let signature = Buffer.from(raw, 'binary').toString('hex');
    signature += Buffer.from(
      String.fromCharCode(0).repeat(placeholderLength / 2 - raw.length),
    ).toString('hex');
    pdf = Buffer.concat([
      pdf.slice(0, byteRange[1]),
      Buffer.from(`<${signature}>`),
      pdf.slice(byteRange[1]),
    ]);
    return pdf;
  };
  

  const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (event, pageIndex) => {
    if (!isSelectionEnabled) return;
    setIsSelecting(true);
    const pos = getMousePos(overlayCanvasRefs.current[pageIndex], event);
    setSelectionCoords({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
  };

  const handleMouseMove = (event, pageIndex) => {
    if (!isSelecting || !isSelectionEnabled) return;
    const pos = getMousePos(overlayCanvasRefs.current[pageIndex], event);
    setSelectionCoords({ ...selectionCoords, endX: pos.x, endY: pos.y });
    drawSelection(pos.x, pos.y, pageIndex);
  };

  const handleMouseUp = (pageIndex) => {
    if (!isSelectionEnabled) return;
    setIsSelecting(false);
    showEmbedSignConfirmation(pageIndex);
  };

  const drawSelection = (endX, endY, pageIndex) => {
    const { startX, startY } = selectionCoords;
    const overlayCtx = overlayCanvasRefs.current[pageIndex].getContext('2d');
    clearOverlay(pageIndex);
    overlayCtx.strokeStyle = 'blue';
    overlayCtx.lineWidth = 2;
    overlayCtx.strokeRect(startX, startY, endX - startX, endY - startY);
  };

  const clearOverlay = (pageIndex) => {
    const overlayCtx = overlayCanvasRefs.current[pageIndex].getContext('2d');
    overlayCtx.clearRect(0, 0, overlayCanvasRefs.current[pageIndex].width, overlayCanvasRefs.current[pageIndex].height);
  };

  const showEmbedSignConfirmation = (pageIndex) => {
    const confirmation = window.confirm("Do you want to embed text in the selected area?");
    if (confirmation) {
      embedSignature(pageIndex);
    } else {
      clearSelection(pageIndex);
    }
  };

  const embedSignature = async (pageIndex) => {
    const { startX, startY, endX, endY } = selectionCoords;

    // Example: Replace with your actual signing API endpoint
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile as Blob);
      formData.append('pageIndex', String(pageIndex));
      formData.append('selectionCoords', JSON.stringify({ startX, startY, endX, endY }));

      const response = await fetch('http://localhost:5000/v1/api/sign', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const signedPdfBuffer = await response.arrayBuffer();
        setPdfFile(new File([signedPdfBuffer], `${pdfFile?.name}_signed.pdf`, { type: 'application/pdf' }));
        setIsSigned(true);
        setIsSelectionEnabled(false);
        console.log(`Page number: ${pageIndex + 1}, Selected area coordinates: Start(${startX}, ${startY}) - End(${endX}, ${endY})`);
        document.getElementById('signButton').disabled = true;
      } else {
        console.error('Failed to sign PDF:', response.statusText);
        // Handle error condition here
      }
    } catch (error) {
      console.error('Error signing PDF:', error);
      // Handle error condition here
    }
  };

  const verifyDocument = async () => {
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile as Blob);
      const response = await fetch('http://localhost:5000/v1/api/verify', {
        method: 'POST',
        body: formData, // Adjust this to send necessary verification data
      });
  
      if (response.ok) {
        const verificationResult = await response.json();
        if (verificationResult.isValid) {
          alert('Document verification successful!');
        } else {
          alert('Document verification failed.');
        }
      } else {
        console.error('Failed to verify document:', response.statusText);
        // Handle error condition here
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      // Handle error condition here
    }
  };
  
  // Example integration within PdfRenderer component
  const handleVerifyButtonClick = async () => {
    try {
      await verifyDocument();
    } catch (error) {
      console.error('Error initiating document verification:', error);
      // Handle error condition here
    }
  };

  const clearSelection = (pageIndex) => {
    setSelectionCoords({ startX: 0, startY: 0, endX: 0, endY: 0 });
    clearOverlay(pageIndex);
  };

  const handleSignButtonClick = () => {
    if (!isSigned) {
      setIsSelectionEnabled(true);
      console.log("Selection tool enabled. Click and drag on the PDF to select an area.");
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      scrollToPage(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
      scrollToPage(pageNumber + 1);
    }
  };

  const handlePageInputChange = (event) => {
    const newPageNumber = parseInt(event.target.value, 10);
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
      scrollToPage(newPageNumber);
    }
  };

  const scrollToPage = (pageNum) => {
    const pageElement = pageRefs.current[pageNum - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = pageRefs.current.indexOf(entry.target) + 1;
            setPageNumber(pageIndex);
          }
        });
      },
      { root: pdfContainerRef.current, rootMargin: '0px', threshold: 0.7 }
    );

    pageRefs.current.forEach((page) => {
      if (page) observer.observe(page);
    });

    return () => {
      pageRefs.current.forEach((page) => {
        if (page) observer.unobserve(page);
      });
    };
  }, [numPages]);

  return (
    <>
      <div className="App">
      <div id="controls">
        <input type="file" id="pdfInput" accept="application/pdf" onChange={handleFileInput} />
        {/* <input type="file" id="certInput" accept=".pem" onChange={handleCertChange} /> */}
        <button id="signButton" onClick={handleSignButtonClick} disabled={isSigned}>Sign</button>
        <button onClick={handleVerifyPdf}>Verify PDF</button>
        <button onClick={handlePreviousPage} disabled={pageNumber === 1}>Previous Page</button>
        <button onClick={handleNextPage} disabled={pageNumber === numPages}>Next Page</button>
        <input
          type="number"
          value={pageNumber}
          onChange={handlePageInputChange}
          min={1}
          max={numPages}
          style={{ width: '60px' }}
        />
      </div>
      <div id="canvasContainer" style={{ position: 'relative' }}>
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Loading PDF...</div>}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            width={600}
            renderMode="canvas"
            onLoadSuccess={onPageLoadSuccess}
            canvasRef={pdfCanvasRef}
            loading={<div>Loading page...</div>}
          />
        </Document>
        <canvas
          id="overlayCanvas"
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: isSelectionEnabled ? 'auto' : 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
    </>
  );
}