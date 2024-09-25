/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { StyledAnimatedStatus, StyledStatusText, StyledStatusContent, StyledStatusIcon } from './styles';
import { AnimatedStatusProps } from '../../utils/types';

export const AnimatedStatus: React.FC<AnimatedStatusProps> = ({ message, type, visible }) => (
    <StyledAnimatedStatus visible={visible}>
        <StyledStatusContent>
            <StyledStatusIcon />
            <StyledStatusText status={type}>{message}</StyledStatusText>
        </StyledStatusContent>
    </StyledAnimatedStatus>
);