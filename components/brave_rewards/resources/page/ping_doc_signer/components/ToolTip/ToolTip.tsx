/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { TooltipContainer, TooltipText } from './styles';
import { TooltipProps } from '../../utils/types';

const breakDownFileName = (fileName: string, maxLength: number = 20): string => {
  if (fileName.length <= maxLength) return fileName;

  const parts = fileName.split(/[-_.,]/);
  if (parts.length === 1) {
    // If it's a single long word, break it arbitrarily
    return fileName.match(new RegExp('.{1,' + maxLength + '}', 'g'))?.join('\n') || fileName;
  }

  let result = '';
  let currentLine = '';

  for (const part of parts) {
    if (currentLine.length + part.length > maxLength) {
      result += (result ? '\n' : '') + currentLine;
      currentLine = part;
    } else {
      currentLine += (currentLine ? ' ' : '') + part;
    }
  }

  return result + (result ? '\n' : '') + currentLine;
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  isVisible = true,
  isError = false,
  errorDelay = 1000,
  isFileName = false
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

  const displayText = isFileName ? breakDownFileName(text) : text;

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
          {displayText.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < displayText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </TooltipText>
      )}
    </TooltipContainer>
  );
};

