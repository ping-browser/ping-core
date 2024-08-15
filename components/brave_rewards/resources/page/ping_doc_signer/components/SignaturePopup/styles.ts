/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
 import styled from "styled-components";
 
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
 height: fit-content;
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

export const StyledSelectedSignature = styled('div')`
 background-color: white;
 border: 1px solid #e0e0e0;
 border-radius: 4px;
 padding: 42px;
 margin-bottom: 20px;
`

export const StyledSelectedSignatureH3 = styled('h3')`
 font-size: 40px;
 margin: 0 0 5px 0;
`

export const StyledSelectedSignatureP = styled('p')`
 font-size: 16px;
 color: #313030b0;
 margin: 0;
`

export const StyledEncKey = styled('p')`
 font-size: 14px;
 color: #fff;
 margin-top: 5px;
`

export const StyledBrowseImage = styled('span')`
 color: #007aff;
 font-size: 14px;
 text-align: right;
 cursor: pointer;
 margin-top: 10px;
`

export const StyledSignatureList = styled('div')`
 max-height: 200px;
 overflow-y: auto;
 margin-bottom: 20px;
 padding: 0 15px;
`

export const StyledSignatureOption = styled('label')`
 display: flex;
 align-items: center;
 gap: 11px;
 padding: 10px 0;
 cursor: pointer;
`

export const StyledSignatureOptionInput = styled('input')`
 margin-right: 5px;
 width: 17px;
 height: 17px;
`

export const StyledSignatureName = styled('div')`
 display: flex;
 flex-direction: column;
 gap: 10px;
`

export const StyledIssueName = styled('span')`
color: #E6E9EB;
font-family: Poppins;
font-size: 20px;
font-style: normal;
font-weight: 400;
line-height: normal;
`

export const StyledIssueDate = styled('span')`
color: #E6E9EB;
font-family: Poppins;
font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: normal;
`

export const StyledButtons = styled('div')`
display: flex;
flex-direction: row;
justify-content: space-between;
padding: 0 20px 12px 20px;
align-items: center;
`

export const StyledAddButton = styled('button')`
  display: flex;
  background: none;
  align-items: baseline;
  border: 2px solid white;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 15px 35px;
  border-radius: 50px;
`

export const StyledConfirmButton = styled('button')<{ disabled?: boolean }>`
  display: flex;
  padding: 15px 35px;
  align-items: baseline;
  gap: 10px;
  background-color: ${p => p.disabled ? '#ccc' : 'white'};
  color: ${p => p.disabled ? '#666' : 'black'};
  border: none;
  border-radius: 40px;
  font-size: 16px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background-color: ${p => p.disabled ? '#ccc' : '#2BB563'};
    color: ${p => p.disabled ? '#666' : 'white'};
  }
`