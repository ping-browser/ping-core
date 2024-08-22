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

 export const StyledPopupTypeContent = styled('div')`
  border-radius: 24px;
  padding: 20px 25px;
  width: 595px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 20px;
  color: #fff;
  height: 550px;
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

export const StyledTypedSignature = styled('div')`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  height: 227px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 500px;
  text-wrap: wrap;
  font-size: 50px;
  font-family: "Great Vibes";
  margin-left: 20px;
  /* padding: 23px 0px 58px 118px; */
  margin-bottom: 20px;
`

export const StyledTypeButtons = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 22px 12px 18px;
  align-items: center;
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

export const StyledCloseButton = styled('button')`
position: absolute;
top: 20px;
right: 20px;
width: 25.001px;
height: 20px;
font-size: 20px;
background: none;
border: none;
cursor: pointer;
color: #999;
`

export const StyledH3 = styled('h3')`
  font-size: 3vw;
  color: #000;
`

export const StyledNameInput = styled('input')`
  width: 93%;
  height: 50px;
  padding: 18px;
  margin-left: 17px;
  color: #9E9797;
  font-size: 20px;
  margin-bottom: 20px;
  background: #5E6163;
  border: none;
  border-radius: 10px;
`

export const StyledImageUpload = styled.div`
  margin-bottom: 20px;

  input[type="file"] {
    display: block;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
`;

export const StyledTabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

export const StyledTab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  background-color: ${props => props.active ? '#007bff' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 16px;

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover {
    background-color: ${props => props.active ? '#0056b3' : '#e0e0e0'};
  }
`;

export const StyledImage = styled.img`
   cursor: pointer;
   max-width: 33px;
   height: auto;
`;