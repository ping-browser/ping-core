/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
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
    StyledPDFName
} from './styles';
import pdfLogo from '../../../assets/pdfLogo.png';
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
}) => {
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
                <StyledCurrentPage onClick={handlePageNumberClick}>{pageNumber}</StyledCurrentPage>
                <StyledSeparator>/</StyledSeparator>
                <StyledTotalPages>{numPages || '-'}</StyledTotalPages>
            </>
        )
    );

    const renderHeaderControls = () => (
        pdfFile && !isSelectionEnabled ? (
            <>
                <StyledStatus>
                    <AnimatedStatus
                        message={statusMessage}
                        type={statusType}
                        visible={isStatusVisible}
                    />
                </StyledStatus>
                <StyledFadeAway fadeAnimation={isStatusVisible}>
                    <StyledHeaderButton onClick={handleSignButtonClick}>Add signature</StyledHeaderButton>
                    <StyledHeaderControlsBar />
                    <StyledHeaderButton
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
            <StyledNavBar onVerificationSuccess={isVerified}>
                <StyledPDFLogo
                    src={pdfLogo}
                    alt="PDF Logo"
                    onClick={handleLogoClick}
                />
                <StyledPDFName>{pdfFileName}</StyledPDFName>
                <StyledHeaderControls>
                    {renderHeaderControls()}
                    <StyledPageChangingControls>
                        <StyledPageControl as="div" direction="previous" onClick={handlePreviousPage}>&lt;</StyledPageControl>
                        <StyledPageNumber>
                            {renderPageNumber()}
                        </StyledPageNumber>
                        <StyledPageControl as="div" direction="next" onClick={handleNextPage}>&gt;</StyledPageControl>
                    </StyledPageChangingControls>
                </StyledHeaderControls>
                <StyledSaveButton onClick={handleDownloadButtonClick}>Save</StyledSaveButton>
            </StyledNavBar>
            <StyledHelpButton>?</StyledHelpButton>
        </StyledHeader>
    );
};