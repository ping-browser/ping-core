/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { TooltipContainer, StyledTooltip } from './styles';

interface TooltipProps {
  text: string;
  isVisible: boolean;
  isError?: boolean;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, isVisible, isError, children }) => (
  <TooltipContainer>
    {children}
    {isVisible && <StyledTooltip isError={isError}>{text}</StyledTooltip>}
  </TooltipContainer>
);