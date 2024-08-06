/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { Page } from 'react-pdf';
import { PageContainer, OverlayCanvas } from './styles';
import { PdfPageProps } from '../../utils/types';

const PdfPage: React.FC<PdfPageProps> = ({
    pageNumber,
    onLoadSuccess,
    isSelectionEnabled,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    pdfCanvasRef,
    overlayCanvasRef,
    pageRef,
}) => {
    return (
        <PageContainer ref={pageRef}>
            <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderMode="canvas"
                onLoadSuccess={onLoadSuccess}
                canvasRef={pdfCanvasRef}
            />
            <OverlayCanvas
                ref={overlayCanvasRef}
                style={{ pointerEvents: isSelectionEnabled ? 'auto' : 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </PageContainer>
    );
};

export default PdfPage;
