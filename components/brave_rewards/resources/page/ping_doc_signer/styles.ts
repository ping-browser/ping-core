/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const AppContainer = styled.div`
  font-family: Arial, sans-serif;
  background-color: #525659;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 1120px;
  overflow: overlay;
`;

export const Header = styled.header`
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

export const NavBar = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  width: 1350px;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
`;

export const Logo = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
`;

export const PdfFileName = styled.div`
  position: absolute;
  left: 38px;
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  color: white;
  padding: 5px;
`;

export const HeaderControls = styled.div`
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
`;

export const HeaderButton = styled.button`
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
`;

export const VerifiedButton = styled(HeaderButton)`
  color: #2BB563;
`;

export const NotVerifiedButton = styled(HeaderButton)`
  color: red;
`;

export const PageChangingControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

export const PageControl = styled.div`
  font-size: 13px;
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

export const PageNumber = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
`;

export const CurrentPage = styled.div`
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

export const PageNumberInput = styled.input`
  width: 30px;
  text-align: center;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
`;

export const Separator = styled.div`
  font-size: 13px;
  color: white;
  font-weight: bold;
`;

export const TotalPages = styled.div`
  font-size: 13px;
  color: white;
  font-weight: bold;
`;

export const SaveButton = styled(HeaderButton)`
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
`;

export const HelpButton = styled.button`
  position: absolute;
  top: 22px;
  right: 10px;
  font-size: 18px;
  color: #fff;
  width: 34px;
  height: 34px;
  border: 2px solid white;
  border-radius: 20px;
  background: transparent;
  cursor: pointer;
`;

export const PdfContainer = styled.div`
  display: flex;
  min-height: 500px;
  width: 100%;
  height: 100%;
  justify-content: center;
  overflow-y: overlay;
`;

export const DocumentContainer = styled.div`
  height: calc(100vh - 60px);
  direction: ltr;
`;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

export const LoadingSpinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;