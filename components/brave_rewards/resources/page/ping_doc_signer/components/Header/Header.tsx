/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { useState } from 'react';
import {
    StyledHeader,
    StyledNavBar,
    StyledHeaderControls,
    StyledHeaderButton,
    StyledPageChangingControls,
    StyledPageControl,
    StyledSeparator,
    StyledTotalPages,
    StyledPageNumber,
    StyledCurrentPage,
    StyledPageNumberInput,
    StyledSaveButton,
    StyledHelpButton,
    StyledFadeAway,
    StyledVerified,
    StyledNotVerified,
    StyledInstructionText,
    StyledHeaderControlsBar,
    StyledStatus,
    StyledPDFLogo,
    StyledPDFName,
    StyledPDFLogoContainer,
    StyledHeaderControlsContainer,
    StyledHelpButtonContainer
} from './styles';
import uploadLogo from '../../../assets/upload.svg';
import uploadHoverLogo from '../../../assets/uploadHover.svg';
import { AnimatedStatus } from '../AnimatedStatus/AnimatedStatus';
import { HeaderProps } from '../../utils/types';

export const Header: React.FC<HeaderProps> = ({
    pdfFileName,
    pdfFile,
    isSelectionEnabled,
    handleSignButtonClick,
    handleVerifyButtonClick,
    handlePreviousPage,
    handleNextPage,
    handlePageNumberClick,
    handlePageNumberChange,
    handlePageNumberSubmit,
    handleDownloadButtonClick,
    pageNumber,
    numPages,
    isEditingPageNumber,
    tempPageNumber,
    isVerified,
    isVerificationFailed,
    isStatusVisible,
    statusMessage,
    statusType,
    handleLogoClick,
    fileInputRef,
}) => {
    const [logoSrc, setLogoSrc] = useState(uploadLogo);
    const renderPageNumber = () => (
        isEditingPageNumber ? (
            <form onSubmit={handlePageNumberSubmit}>
                <StyledPageNumberInput
                    type="text"
                    value={tempPageNumber}
                    onChange={handlePageNumberChange}
                    onBlur={handlePageNumberSubmit}
                    autoFocus
                />
            </form>
        ) : (
            <>
                <StyledCurrentPage pdfFile={pdfFile} onClick={handlePageNumberClick}>{pageNumber}</StyledCurrentPage>
                <StyledSeparator pdfFile={pdfFile}>/</StyledSeparator>
                <StyledTotalPages pdfFile={pdfFile}>{numPages || '-'}</StyledTotalPages>
            </>
        )
    );

    const renderHeaderControls = () => (
        !isSelectionEnabled ? (
            <>
                <StyledStatus>
                    <AnimatedStatus
                        message={statusMessage}
                        type={statusType}
                        visible={isStatusVisible}
                    />
                </StyledStatus>
                <StyledFadeAway fadeAnimation={isStatusVisible}>
                    <StyledHeaderButton pdfFile={pdfFile} onClick={handleSignButtonClick}>Add signature</StyledHeaderButton>
                    <StyledHeaderControlsBar />
                    <StyledHeaderButton
                        pdfFile={pdfFile}
                        onClick={handleVerifyButtonClick}
                        as={isVerified ? StyledVerified : isVerificationFailed ? StyledNotVerified : 'button'}
                    >
                        Verify document
                    </StyledHeaderButton>
                    <StyledHeaderControlsBar />
                </StyledFadeAway>
            </>
        ) : (
            <StyledInstructionText>Start by holding right click and drag</StyledInstructionText>
        )
    );

    return (
        <StyledHeader>
            <StyledNavBar>
                <StyledPDFLogoContainer>
                <StyledPDFLogo
                    src={logoSrc}
                    alt="PDF Logo"
                    onClick={handleLogoClick}
                    onMouseEnter={() => setLogoSrc(uploadHoverLogo)}
                    onMouseLeave={() => setLogoSrc(uploadLogo)}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                />
                <StyledPDFName>{pdfFileName}</StyledPDFName>
                </StyledPDFLogoContainer>
                <StyledHeaderControlsContainer>
                <StyledHeaderControls>
                    {renderHeaderControls()}
                    <StyledPageChangingControls>
                        <StyledPageControl as="div" direction="previous" pdfFile={pdfFile} onClick={handlePreviousPage}>&lt;</StyledPageControl>
                        <StyledPageNumber>
                            {renderPageNumber()}
                        </StyledPageNumber>
                        <StyledPageControl as="div" direction="next" pdfFile={pdfFile} onClick={handleNextPage}>&gt;</StyledPageControl>
                    </StyledPageChangingControls>
                </StyledHeaderControls>
                <StyledSaveButton onClick={handleDownloadButtonClick} disabled={!pdfFile} pdfFile={pdfFile}>Save</StyledSaveButton>
                </StyledHeaderControlsContainer>
                <StyledHelpButtonContainer>
                <a href="https://ping-browser.com/help-1" target="_blank" rel="noopener noreferrer">
                    <StyledHelpButton>?</StyledHelpButton>
                </a>
                </StyledHelpButtonContainer>
            </StyledNavBar>          
        </StyledHeader>
    );
};