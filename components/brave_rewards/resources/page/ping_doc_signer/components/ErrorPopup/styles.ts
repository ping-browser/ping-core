/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

 import styled, { keyframes } from 'styled-components';

 const slideIn = keyframes`
  from { transform: translate(-50%, -100%); }
  to { transform: translate(-50%, -50%); }
 `;
 
 export const PopupOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
 `;
 
 export const PopupContent = styled.div<{ type: 'error' | 'success' | 'info' | 'input' }>`
  background-color: ${({ type }) => {
    switch (type) {
      case 'error': return '#FF5252';
      case 'success': return '#4CAF50';
      case 'info': return '#2196F3';
      case 'input': return '#FFFFFF';
      default: return '#2196F3';
    }
  }};
  color: ${({ type }) => type === 'input' ? '#333333' : '#FFFFFF'};
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  position: relative;
  animation: ${slideIn} 0.3s ease-out;
 `;
 
 export const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.7);
  transition: width 0.1s linear;
 `;
 
 export const Message = styled.p`
  margin: 0 0 10px;
  font-size: 16px;
 `;
 
 export const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
 `;
 
 export const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
 `;
 
 export const SubmitButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #1976D2;
  }
 `;