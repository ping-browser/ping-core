/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { Page } from 'react-pdf';
import { PageContainer, OverlayCanvas } from './styles';

interface PdfPageProps {
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
                loading={<div>Loading page...</div>}
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
