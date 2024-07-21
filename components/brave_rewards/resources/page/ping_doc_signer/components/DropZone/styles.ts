/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

 import styled from 'styled-components';

 export const StyledDropZoneContainer = styled('div')`
   width: 70%;
   max-width: 1020px;
   flex-shrink: 0;
   height: 70vh;
   background-color: transparent;
   border: 3px dashed #888787;
   margin-top: 80px;
   border-radius: 10px;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 30px 20px 20px 20px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
 `

 export const StyledPdfLogo = styled('img')`
   width: 50px;
   height: 50px;
   cursor: pointer;
 `

 export const StyledDropZone = styled('div')`
 padding: 100px;
 text-align: center;
 transition: all 0.3s ease;
 display: flex;
 flex-direction: column;
 gap: 20px;
 justify-content: center;
 align-items: center;
`

export const StyledPdfText = styled('p')`
   color: #FFF;
   text-align: center;
   font-family: Poppins;
   font-size: 30px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
   margin-bottom: 20px;
 `

 export const StyledAddFileButton = styled('button')`
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 42.5px;
   background: #0E4D87;
   color: white;
   border: none;
   width: 273px;
   height: 85px;
   text-align: center;
   font-family: Poppins;
   font-size: 25px;
   font-weight: 400;
   cursor: pointer;
   transition: background-color 0.3s;
 `

 export const StyledLegalText = styled('p')`
   color: #FFF;
   text-align: center;
   font-family: Poppins;
   font-size: 16px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
   margin-top: 60px;
 `