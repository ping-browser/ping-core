/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { TooltipContainer, TooltipText } from './styles';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  isVisible?: boolean;
  isError?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  isVisible = true,
  isError = false
}) => {
  return (
    <TooltipContainer>
      {children}
      <TooltipText isVisible={isVisible} isError={isError}>
        {text}
      </TooltipText>
    </TooltipContainer>
  );
};