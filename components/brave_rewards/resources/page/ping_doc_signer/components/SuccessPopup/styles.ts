/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
 import styled from "styled-components";

 export const StyledSuccessPopup = styled('div')`
   position: fixed;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   background-color: #323639;
   border-radius: 24px;
   padding: 20px 45px;
   width: 595px;
   display: flex;
   flex-direction: column;
   gap: 10px;
   height: 350px;
   border: 1px solid #CACACA;
   transition: height 0.3s ease;
   overflow: hidden;
   z-index: 1000;
 `
 
 export const StyledSuccessTitle = styled('h2')<{ verification?: boolean }>`
   color: #2BB563;
   font-family: Poppins;
   font-size: ${p => p.verification ? '40px' : '45px'};
   margin: 12px 0 0 0;
   padding: 0;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
 `
 
 export const StyledSuccessMessage = styled('p')`
   color: #FFF;
   font-family: Poppins;
   font-size: 20px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
   margin-top: -5px;
 `
 
 export const StyledSuccessName = styled('p')`
   color: #FFF;
   font-family: Poppins;
   font-size: 25px;
   font-style: normal;
   margin: -10px 0 10px 0;
   font-weight: 700;
   line-height: normal;
 `
 
 export const StyledSuccessButtons = styled('div')`
   display: flex;
   margin-top: 62px;
   justify-content: center;
   gap: 28px;
   margin-left: 208px;
 `
 
 export const StyledConfirmButton = styled('button')<{ $continue?: boolean }>`
   display: flex;
   padding: 15px 35px;
   align-items: baseline;
   gap: 10px;
   background-color: ${p => p.$continue ? '#2BB563' : 'white'};
   color: ${p => p.$continue ? 'white' : 'black'};
   border: none;
   border-radius: 40px;
   font-size: 16px;
   cursor: pointer;
   &:hover {
     background-color: ${p => p.$continue ? '#2BB563' : '#2BB563'};
     color: white;
   }
 `