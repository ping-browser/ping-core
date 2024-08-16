/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { TooltipContainer, TooltipText } from './styles';
import { TooltipProps } from '../../utils/types';

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  isVisible = true,
  isError = false,
  errorDelay = 1000
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showErrorTooltip, setShowErrorTooltip] = React.useState(false);
  const firstHoverRef = React.useRef(true);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isError && isHovered) {
      if (firstHoverRef.current) {
        timer = setTimeout(() => {
          setShowErrorTooltip(true);
          firstHoverRef.current = false;
        }, errorDelay);
      } else {
        setShowErrorTooltip(true);
      }
    } else {
      setShowErrorTooltip(false);
    }
    return () => clearTimeout(timer);
  }, [isError, isHovered, errorDelay]);

  return (
    <TooltipContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowErrorTooltip(false);
      }}
    >
      {children}
      {isVisible && (
        <TooltipText
          isVisible={isError ? showErrorTooltip : isHovered}
          isError={isError}
        >
          {text}
        </TooltipText>
      )}
    </TooltipContainer>
  );
};