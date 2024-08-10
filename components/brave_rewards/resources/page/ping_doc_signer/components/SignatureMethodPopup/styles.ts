/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
 
 import styled from "styled-components"
 
 export const StyledPopupOverlay = styled('div')`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: rgba(0, 0, 0, 0.5);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 1000;
 `

 export const StyledPopupContent = styled('div')<{ selected?: boolean }>`
   border-radius: 24px;
   padding: 20px 25px;
   width: 595px;
   display: flex;
   flex-direction: column;
   gap: 10px;
   min-height: 268px;
   max-height: ${p => p.selected ? '656px' : '390px'};
   border: 1px solid #CACACA;
   background: #323639;
   position: relative;
   transition: height 0.3s ease;
   overflow: hidden;
 `

 export const StyledPopupContentH2 = styled('h2')`
   color: #E6E9EB;
   font-family: Poppins;
   font-size: 24px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
   padding: 0 10px;
 `

  export const StyledCloseButton = styled('button')`
   position: absolute;
   top: 10px;
   right: 10px;
   background: none;
   border: none;
   font-size: 20px;
   cursor: pointer;
   color: #999;
 `

 export const StyledMethodOptions = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 18px;
`

export const StyledMethodOptionsButton = styled('button')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  padding: 19px 63px;
  background-color: #464A4C;
  border: none;
  border-radius: 97px;
  height: 98px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    color: #000;
    background-color: #ffffff86;
  }
`

export const StyledButtonTitle = styled('span')`
  font-size: 20px;
  color: #fff;
`

export const StyledButtonDesc = styled('span')`
  text-align: left;
  font-size: 12px;
  color: #fff;
  opacity: 0.5;
`



