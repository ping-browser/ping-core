/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import styled from 'styled-components';

export const StyledAnimatedStatus = styled('div')<{ visible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  margin-left: 50px;
  margin-top: 2px;
  font-weight: 400;
  margin-bottom: 2px;
  margin-right: 35px;
  transition: transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: ${p => p.visible ? 'translateY(0px)' : 'translateY(-50px)'};
  z-index: 1000;
`

export const StyledStatusText = styled('span')<{ status: 'checking' | 'success' | 'error' }>`
  margin-left: 10px;
  color: ${p => {
    switch (p.status) {
      case 'checking':
        return '#fff'
      case 'success':
        return '#2bb563'
      case 'error':
        return '#ff4d4f'
      default:
        return '#fff'
    }
  }};
`

export const StyledStatusContent = styled('div')`
  display: flex;
  align-items: center;
`

export const StyledStatusIcon = styled('span')`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
`