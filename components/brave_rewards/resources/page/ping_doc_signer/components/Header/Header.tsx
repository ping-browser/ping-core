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
    StyledInstructionText
} from './styles';
import pdfLogo from '../../../assets/pdfLogo.png';
import { AnimatedStatus } from '../AnimatedStatus/AnimatedStatus';

interface HeaderProps {
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
}

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
    return (
        <StyledHeader>
            <StyledNavBar onVerificationSuccess={isVerified}>
                <img
                    src={pdfLogo}
                    alt="PDF Logo"
                    onClick={handleLogoClick}
                />
                <div>{pdfFileName}</div>
                {pdfFile && !isSelectionEnabled ? (
                    <StyledHeaderControls>
                        <AnimatedStatus
                            message={statusMessage}
                            type={statusType}
                            visible={isStatusVisible}
                        />
                        <StyledFadeAway fadeAnimation={isStatusVisible}>
                            <StyledHeaderButton onClick={handleSignButtonClick}>Add signature</StyledHeaderButton>
                            <StyledHeaderButton
                                onClick={handleVerifyButtonClick}
                                as={isVerified ? StyledVerified : isVerificationFailed ? StyledNotVerified : 'button'}
                            >
                                Verify document
                            </StyledHeaderButton>
                        </StyledFadeAway>
                        <StyledPageChangingControls>
                            <StyledPageControl as="div" direction="previous" onClick={handlePreviousPage}>&lt;</StyledPageControl>
                            <StyledPageNumber>
                                {isEditingPageNumber ? (
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
                                )}
                            </StyledPageNumber>
                            <StyledPageControl as="div" direction="next" onClick={handleNextPage}>&gt;</StyledPageControl>
                        </StyledPageChangingControls>
                    </StyledHeaderControls>
                ) : (
                    <StyledHeaderControls>
                        <StyledInstructionText>Start by holding right click and drag</StyledInstructionText>
                        <StyledPageChangingControls>
                            <StyledPageControl as="div" direction="previous" onClick={handlePreviousPage}>&lt;</StyledPageControl>
                            <StyledPageNumber>
                                {isEditingPageNumber ? (
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
                                )}
                            </StyledPageNumber>
                            <StyledPageControl as="div" direction="next" onClick={handleNextPage}>&gt;</StyledPageControl>
                        </StyledPageChangingControls>
                    </StyledHeaderControls>
                )}
                <StyledSaveButton onClick={handleDownloadButtonClick}>Save</StyledSaveButton>
            </StyledNavBar>
            <StyledHelpButton>?</StyledHelpButton>
        </StyledHeader>
    );
};