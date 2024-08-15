/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import styled from 'styled-components';

export const TooltipContainer = styled.div`
   position: relative;
   display: inline-block;
 `;

export const TooltipText = styled.div<{ isVisible: boolean; isError: boolean }>`
  visibility: hidden;
  width: fit-content;
  text-wrap: wrap;
  background-color: ${props => props.isError ? '#ff4d4d' : '#555'};
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 50%;
  margin-left: -60px;
  transition: opacity 0.3s, visibility 0.3s;

  ${TooltipContainer}:hover & {
    visibility: ${props => props.isVisible ? 'visible' : 'hidden'};

  }

  &::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent ${props => props.isError ? '#ff4d4d' : '#555'} transparent;
  }
  `;