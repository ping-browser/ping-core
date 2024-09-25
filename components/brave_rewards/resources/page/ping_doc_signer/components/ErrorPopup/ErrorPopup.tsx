/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import {
    StyledErrorPopup,
    StyledErrorTitle,
    StyledErrorMessage,
    StyledErrorButtons,
    StyledConfirmButton,
    StyledErrorHelpLink,
    StyledErrorHelpMessage,
    StyledErrorHelpMessageContainer
} from './styles';
import { ErrorPopupProps } from '../../utils/types';

export const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onContinue }) => (
    <StyledErrorPopup>
        <StyledErrorTitle>
            Action Incomplete!
        </StyledErrorTitle>
        <StyledErrorMessage>{message}</StyledErrorMessage>
        <StyledErrorHelpMessageContainer>
            <a
                href="https://ping-browser.com/help-1"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
            >
                <StyledErrorHelpLink>
                    Click here
                </StyledErrorHelpLink>
            </a>
            <StyledErrorHelpMessage>to look for solutions.</StyledErrorHelpMessage>
        </StyledErrorHelpMessageContainer>
        <StyledErrorButtons>
            <StyledConfirmButton onClick={onContinue} $continue>Continue</StyledConfirmButton>
        </StyledErrorButtons>
    </StyledErrorPopup>
);
