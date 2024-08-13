/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import styled from 'styled-components';

export const TooltipContainer = styled.div`
   position: relative;
   display: inline-block;
 `;

export const StyledTooltip = styled.div<{ isError?: boolean }>`
   position: absolute;
   top: 110%;
   left: 50%;
   transform: translateX(-50%);
   background-color: ${({ isError }) => (isError ? '#e74c3c' : '#333')};
   color: #fff;
   padding: 5px;
   border-radius: 3px;
   white-space: nowrap;
   z-index: 1000;
   box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
   margin-top: 8px;
   opacity: 0.9;
 
   &::after {
     content: '';
     position: absolute;
     top: -5px;
     left: 50%;
     transform: translateX(-50%);
     border-width: 5px;
     border-style: solid;
     border-color: transparent transparent ${({ isError }) => (isError ? '#e74c3c' : '#333')} transparent;
   }
 `;
