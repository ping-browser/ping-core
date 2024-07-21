/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import styled from 'styled-components';

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
   gap: 30px;
 `
 
 export const StyledNavBar = styled('nav')<{ onVerificationSuccess?: boolean }>`
   position: relative;
   display: flex;
   flex-direction: row;
   width: 1350px;
   align-items: center;
   justify-content: space-between;
   gap: 50px;
   background: ${p => p.onVerificationSuccess ? 'linear-gradient(to top, #2BB563, #323639, #D9D9D9 1%)' : 'none'};
 `
 
 export const StyledHeaderControls = styled('div')`
   width: 610px;
   height: 42px;
   display: flex;
   align-items: center;
   padding: 0 5px;
   border-radius: 55px;
   border: 1px solid #717171;
   background: rgba(255, 255, 255, 0.10);
   justify-content: center;
   gap: 20px;
   margin-left: 150px;
   margin-right: 100px;
 `
 
 export const StyledHeaderButton = styled('button')`
   background-color: transparent;
   border: none;
   padding: 5px 10px;
   margin-left: 10px;
   cursor: pointer;
   color: #FFF;
   font-family: Poppins;
   font-size: 16px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
 `
 
 export const StyledPageChangingControls = styled('div')`
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: center;
   gap: 20px;
 `
 
 export const StyledPageControl = styled('span')<{ direction?: 'previous' | 'next' }>`
   font-size: 13px;
   color: white;
   font-weight: bold;
   cursor: pointer;
 `
 
 export const StyledSeparator = styled('span')`
   font-size: 13px;
   color: white;
   font-weight: bold;
 `
 
 export const StyledTotalPages = styled('span')`
   font-size: 13px;
   color: white;
   font-weight: bold;
 `
 
 export const StyledPageNumber = styled('div')`
   display: flex;
   flex-direction: row;
   gap: 20px;
   align-items: center;
   justify-content: center;
   padding: 0 5px;
 `
 
 export const StyledCurrentPage = styled('div')`
   width: 29px;
   height: 28px;
   flex-shrink: 0;
   background-color: #191b1c;
   border-radius: 5px;
   display: flex;
   align-items: center;
   justify-content: center;
   color: white;
 `
 
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
 `
 
 export const StyledSaveButton = styled('button')`
   width: 142px;
   height: 41px;
   flex-shrink: 0;
   border-radius: 35px;
   background: #E6E9EB;
   color: #000;
   font-family: Poppins;
   font-size: 16px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
 `
 
 export const StyledHelpButton = styled('button')`
   position: absolute;
   top: 22px;
   right: 10px;
   font-size: 18px;
   color: #fff;
   width: 34px;
   height: 34px;
   border: 2px solid white;
   border-radius: 20px;
 `

 export const StyledFadeAway = styled('div')<{ fadeAnimation: boolean }>`
  opacity: ${p => p.fadeAnimation ? 0 : 1};
  transform: ${p => p.fadeAnimation ? 'translateY(20px)' : 'translateY(0)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: ${p => p.fadeAnimation ? 'none' : 'auto'};
`

export const StyledVerified = styled('span')`
  color: #2BB563;
`

export const StyledNotVerified = styled('span')`
  color: red;

  &::after {
    display: flex;
    position: absolute;
    content: "i";
    text-align: center;
    font-size: 6px;
    padding: 1px 0px 3px 4px;
    width: 12px;
    color: #ff7e00d4;
    height: 12px;
    border-radius: 10px;
    border: 1px solid #ff5b00b3;
    right: -8px;
    top: 12px;
  }
`
export const StyledInstructionText = styled('p')`
   color: #2BB563;
   font-family: Poppins;
   font-size: 17.121px;
   font-style: normal;
   font-weight: 400;
   line-height: normal;
 `
