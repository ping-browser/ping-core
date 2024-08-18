/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
 import styled from 'styled-components';

 interface StyledDisabledProps {
   pdfFile?: Blob | null;
   isSigned?: boolean;
 }
 
 interface HeaderControlsProps {
   verificationStatus: 'success' | 'failed' | 'none';
 }
 
 interface HeaderControlsContainerProps {
   verificationStatus: 'success' | 'failed' | 'none';
 }
 
 const breakpoints = {
   small: '576px',
   medium: '768px',
   large: '992px',
   xlarge: '1200px',
 };
 
 export const StyledHeader = styled('header')`
   display: flex;
   justify-content: center;
   align-items: center;
   width: 100%;
   height: 70px;
   padding: 10px 20px;
   background-color: #323639;
   border-bottom: 1px solid #383535;
   z-index: 10000;
 `;
 
 export const StyledNavBar = styled('nav')`
   position: relative;
   display: flex;
   flex-direction: row;
   width: 1350px;
   align-items: center;
   justify-content: space-around;
   gap: 50px;
 
   @media (max-width: 1385px) {
     gap: 20px;
   }
 `;
 
 export const StyledHeaderControlsBar = styled.div`
   &::after {
     content: '';
     display: block;
     width: 4px;
     height: 18px;
     background-color: #707375;
     border-radius: 10px;
     right: 2px;
   }
 `;
 
 export const StyledHeaderControls = styled('div')<HeaderControlsProps>`
   width: 100%;
   max-width: 610px;
   min-width: 570px;
   height: 42px;
   display: flex;
   align-items: center;
   position: relative;
   padding: 0 5px;
   border-radius: 55px;
   border: 1px solid ${({ verificationStatus }) => 
     verificationStatus === 'success' ? '#2BB563' : 
     verificationStatus === 'failed' ? '#BE5656' : 
     '#717171'};
   background: rgba(255, 255, 255, 0.10);
   justify-content: center;
   gap: 20px;
   transition: border-color 0.3s ease;
 `;
 
 export const StyledHeaderControlsContainer = styled.div<HeaderControlsContainerProps>`
   display: flex;
   align-items: center;
   width: 100%;
   justify-content: center;
   margin-left: 60px;
   position: relative;
 
   @media (max-width: 1385px) {
     margin-left: 138px;
   }
 `;
 
 export const StyledHeaderButton = styled('button')<StyledDisabledProps>`
   background-color: transparent;
   color: ${({ pdfFile }) => (pdfFile ? '#FFF' : 'gray')};
   border: none;
   padding: 5px 10px;
   margin-left: 10px;
   cursor: ${({ pdfFile }) => (pdfFile ? 'pointer' : 'not-allowed')};
   pointer-events: ${({ pdfFile }) => (pdfFile ? 'auto' : 'none')};
   font-family: Poppins, sans-serif;
   font-size: 16px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
   transition: color 0.3s ease;
 
   @media (max-width: ${breakpoints.small}) {
     font-size: 14px;
     padding: 3px 8px;
   }
 
   &:hover {
     color: #C3FFDB;
   }
 
   &.verify-button {
     position: relative;
 
     .tooltip {
       visibility: hidden;
       position: absolute;
       z-index: 1;
       bottom: 125%;
       left: 50%;
       transform: translateX(-50%);
       background-color: #ff4444;
       color: #fff;
       text-align: center;
       padding: 5px;
       border-radius: 6px;
       opacity: 0;
       transition: opacity 0.3s;
     }
 
     &.failed:hover .tooltip {
       visibility: visible;
       opacity: 1;
     }
   }
 `;
 
 export const StyledPageChangingControls = styled('div')`
   position: absolute;
   right: 40px;
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: center;
   gap: 20px;
 `;
 
 export const StyledPageControl = styled('span')<{ direction?: 'previous' | 'next' } & StyledDisabledProps>`
   font-size: 13px;
   font-weight: bold;
   cursor: ${({ pdfFile }) => (pdfFile ? 'pointer' : 'not-allowed')};
   pointer-events: ${({ pdfFile }) => (pdfFile ? 'auto' : 'none')};
   color: ${({ pdfFile }) => (pdfFile ? '#FFF' : 'gray')};
 `;
 
 export const StyledSeparator = styled('span')<StyledDisabledProps>`
   font-size: 13px;
   color: ${({ pdfFile }) => (pdfFile ? '#FFF' : 'gray')};
   font-weight: bold;
 `;
 
 export const StyledTotalPages = styled('span')<StyledDisabledProps>`
   font-size: 13px;
   pointer-events: ${({ pdfFile }) => (pdfFile ? 'auto' : 'none')};
   color: ${({ pdfFile }) => (pdfFile ? '#FFF' : 'gray')};
   font-weight: bold;
 `;
 
 export const StyledPageNumber = styled('div')`
   display: flex;
   flex-direction: row;
   gap: 20px;
   align-items: center;
   justify-content: center;
   padding: 0 5px;
 `;
 
 export const StyledCurrentPage = styled('div')<StyledDisabledProps>`
   width: 29px;
   height: 28px;
   flex-shrink: 0;
   background-color: #191b1c;
   border-radius: 5px;
   display: flex;
   align-items: center;
   justify-content: center;
   pointer-events: ${({ pdfFile }) => (pdfFile ? 'auto' : 'none')};
   color: ${({ pdfFile }) => (pdfFile ? '#FFF' : 'gray')};
 `;
 
 export const StyledPageNumberInput = styled('input')`
   width: 29px;
   height: 28px;
   flex-shrink: 0;
   background-color: #191b1c;
   border-radius: 5px;
   display: flex;
   align-items: center;
   justify-content: center;
   color: white;
 `;
 
 export const StyledInputPDF = styled.img`
   cursor: pointer;
   max-width: 100px;
   height: auto;
   margin-right: 8px;
 `;
 
 export const StyledPDFLogo = styled.img`
   cursor: pointer;
   max-width: 33px;
   height: auto;
   margin-right: 8px;
   border-radius: 12%;
 
   &:hover {
     background: #FFF;
   }
 `;
 
 export const StyledPDFLogoContainer = styled.div`
   display: flex;
   align-items: center;
   width: 210px;
 
   @media (max-width: 1385px) {
     width: auto;
   }
 `;
 
 export const StyledSaveButton = styled('button')<StyledDisabledProps>`
   width: 122px;
   height: 41px;
   flex-shrink: 0;
   border-radius: 35px;
   background: ${({ pdfFile }) => (pdfFile ? '#E6E9EB' : 'gray')};
   color: #000;
   font-family: Poppins, sans-serif;
   font-size: 16px;
   font-style: normal;
   font-weight: 400;
   border: none;
   line-height: normal;
   margin-right: 12px;
   cursor: ${({ pdfFile }) => (pdfFile ? 'pointer' : 'not-allowed')};
   pointer-events: ${({ pdfFile }) => (pdfFile ? 'auto' : 'none')};
   margin-left: 20px;
   visibility: ${({ isSigned }) => (isSigned ? 'visible' : 'hidden')};
   transition: 0.3s background ease-in-out;

   &:hover{
    background: rgba(255,255,255,0.5);
   }
 `;
 
 export const StyledHelpButton = styled('button')`
   font-size: 18px;
   color: #FFF;
   width: 34px;
   height: 34px;
   border: 2px solid #FFF;
   border-radius: 20px;
   background: transparent;
   cursor: pointer;
 `;
 
 export const StyledHelpButtonContainer = styled.div`
   width: 210px;
   display: flex;
   justify-content: end;
 
   @media (max-width: 1385px) {
     width: auto;
   }
 
   .help-button {
     position: relative;
 
     .tooltip {
       visibility: hidden;
       position: absolute;
       z-index: 1;
       bottom: 125%;
       right: 0;
       background-color: #555;
       color: #fff;
       text-align: center;
       padding: 5px;
       border-radius: 6px;
       opacity: 0;
       transition: opacity 0.3s;
     }
 
     &:hover .tooltip {
       visibility: visible;
       opacity: 1;
     }
   }
 `;
 
 export const StyledFadeAway = styled('div')<{ fadeAnimation: boolean }>`
   opacity: ${p => p.fadeAnimation ? 0 : 1};
   transform: ${p => p.fadeAnimation ? 'translateY(20px)' : 'translateY(0)'};
   display: flex;
   position: absolute;
   left: 30px;
   width: fit-content;
   align-items: center;
   justify-content: center;
   gap: 10px;
   transition: opacity 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
   pointer-events: ${p => p.fadeAnimation ? 'none' : 'auto'};
 `;
 
 export const StyledVerified = styled('span')`
   color: #2BB563;
   transition: all 0.3s ease-in-out;
 `;
 
 export const StyledNotVerified = styled('span')`
   color: #BE5656;
   transition: all 0.3s ease-in-out;
 `;
 
 export const StyledInstructionText = styled('p')`
   position: absolute;
   left: 75px;
   color: #2BB563;
   font-family: Poppins, sans-serif;
   font-size: 17.121px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
 `;
 
 export const StyledStatus = styled('div')`
   position: absolute;
   left: 75px;
   font-family: Poppins, sans-serif;
   font-size: 17.121px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
 `;
 
 export const StyledPDFName = styled('div')`
   color: #FFF;
   font-family: Poppins, sans-serif;
   font-size: 16px;
   font-weight: 500;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   width: 169px;
   font-size: 15px;
   margin-right: auto;
   position: relative;
 
   @media (max-width: 1385px) {
     max-width: 150px;
     margin-right: 10px;
     display: none;
   }
 
   .tooltip {
     visibility: hidden;
     position: absolute;
     z-index: 1;
     bottom: 125%;
     left: 50%;
     transform: translateX(-50%);
     background-color: #555;
     color: #fff;
     text-align: center;
     padding: 5px;
     border-radius: 6px;
     opacity: 0;
     transition: opacity 0.3s;
   }
 
   &:hover .tooltip {
     visibility: visible;
     opacity: 1;
   }
 `;
 