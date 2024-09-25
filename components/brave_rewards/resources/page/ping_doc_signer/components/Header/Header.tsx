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
import { Tooltip } from '../ToolTip/ToolTip';

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
    isSigned,
    message,
    tempButtonState
}) => {
    const [logoSrc, setLogoSrc] = useState(uploadLogo);

    const getVerificationStatus = () => {
        if (isVerified) return 'success';
        if (isVerificationFailed) return 'failed';
        return 'none';
    };

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
                    <Tooltip
                        text={message}
                        isVisible={isVerificationFailed}
                        isError={true}
                        isFileName={false}
                    >
                        <StyledHeaderButton
                            pdfFile={pdfFile}
                            onClick={handleVerifyButtonClick}
                            as={tempButtonState === 'verified' ? StyledVerified : tempButtonState === 'failed' ? StyledNotVerified : 'button'}
                        >
                            Verify document
                        </StyledHeaderButton>
                    </Tooltip>
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
                    <Tooltip
                        text={pdfFileName}
                        isFileName={true}
                    >
                        <StyledPDFName>
                            {pdfFileName}
                        </StyledPDFName>
                    </Tooltip>
                </StyledPDFLogoContainer>
                <StyledHeaderControlsContainer verificationStatus={getVerificationStatus()}>
                    <StyledHeaderControls verificationStatus={getVerificationStatus()}>
                        {renderHeaderControls()}
                        <StyledPageChangingControls>
                            <StyledPageControl as="div" direction="previous" pdfFile={pdfFile} onClick={handlePreviousPage}>&lt;</StyledPageControl>
                            <StyledPageNumber>
                                {renderPageNumber()}
                            </StyledPageNumber>
                            <StyledPageControl as="div" direction="next" pdfFile={pdfFile} onClick={handleNextPage}>&gt;</StyledPageControl>
                        </StyledPageChangingControls>
                    </StyledHeaderControls>
                    <StyledSaveButton isSigned={isSigned} onClick={handleDownloadButtonClick} disabled={!pdfFile} pdfFile={pdfFile}>Save</StyledSaveButton>
                </StyledHeaderControlsContainer>
                <StyledHelpButtonContainer>
                    <Tooltip
                        text="Get help"
                        isFileName={false}
                    >
                        <a
                            href="https://ping-browser.com/help-1"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <StyledHelpButton>?</StyledHelpButton>
                        </a>
                    </Tooltip>
                </StyledHelpButtonContainer>
            </StyledNavBar>
        </StyledHeader >
    );
};