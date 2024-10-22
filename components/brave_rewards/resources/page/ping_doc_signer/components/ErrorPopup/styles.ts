/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
 import styled from "styled-components";

 export const StyledErrorPopup = styled('div')`
   position: fixed;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   background-color: #323639;
   border-radius: 24px;
   padding: 20px 45px;
   width: 590px;
   display: flex;
   flex-direction: column;
   gap: 12px;
   height: fit-content;
   border: 1px solid #CACACA;
   transition: height 0.3s ease;
   overflow: hidden;
   z-index: 1000;
 `
 
 export const StyledErrorTitle = styled('h2')<{ verification?: boolean }>`
   color: #BE5656;
   font-family: Poppins;
   font-size: 30px;
   margin: 12px 0 0 0;
   padding: 0;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
 `
 
 export const StyledErrorHelpMessageContainer = styled('div')`
 display: flex;
 flex-direction: row;
 gap: 8px;
 `

 export const StyledErrorMessage = styled('div')`
   color: #FFF;
   font-family: Poppins;
   font-size: 20px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
   margin-top: -5px;
 `
 
 export const StyledErrorHelpLink = styled('div')`
 color: #2BB563;
 font-family: Poppins;
 font-size: 16px;
 font-weight: 400;
 text-decoration: none;
 transition: 0.3s color ease-out;

 &:hover{
  color: rgba(43, 181, 99,0.5);
 }
 `

 export const StyledErrorHelpMessage = styled('div')`
 color: white;
 font-size: 16px;
 font-family: Poppins;
 font-weight: 400;
 `
 
 export const StyledErrorName = styled('p')`
   color: #FFF;
   font-family: Poppins;
   font-size: 25px;
   font-style: normal;
   margin: -10px 0 10px 0;
   font-weight: 700;
   line-height: normal;
 `
 
 export const StyledErrorButtons = styled('div')`
   display: flex;
   margin-top: 45px;
   justify-content: center;
   gap: 28px;
   margin-left: 350px;
 `
 
 export const StyledConfirmButton = styled('button')<{ $continue?: boolean }>`
   display: flex;
   padding: 15px 35px;
   align-items: baseline;
   gap: 10px;
   background-color: white;
   color: black;
   border: none;
   border-radius: 40px;
   font-size: 16px;
   cursor: pointer;
   &:hover {
     background-color: '#2BB563';
   }
 `