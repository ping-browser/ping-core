/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import {
    StyledErrorPopup,
    StyledErrorTitle,
    StyledErrorMessage,
    StyledErrorButtons,
    StyledConfirmButton
} from './styles';
import { ErrorPopupProps } from '../../utils/types';

export const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onContinue }) => (
    <StyledErrorPopup>
        <StyledErrorTitle>
            Action Incomplete!
        </StyledErrorTitle>
        <StyledErrorMessage>{message}</StyledErrorMessage>
        <StyledErrorButtons>
            <StyledConfirmButton onClick={onContinue} $continue>Continue</StyledConfirmButton>
        </StyledErrorButtons>
    </StyledErrorPopup>
);
