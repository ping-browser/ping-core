/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
 import styled from 'styled-components';

 export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const EyeButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-75%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
`;

export const InputField = styled.input`
  width: 100%;
  padding: 10px;
  padding-right: 40px; // Make room for the eye button
  margin-bottom: 15px;
  background-color: #3a3a3a;
  border: none;
  border-radius: 4px;
  color: white;
`;


export const PopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PopupContent = styled.div`
    background-color: #2c2c2c;
    padding: 40px;
    border-radius: 24px;
    width: 550px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: fit-content;
    border: 1px solid white;
`;

export const Title = styled.h2`
  color: white;
  font-size: 25px;
  margin-bottom: 12px;
  margin-top: -2px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Button = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export const BackButton = styled.button`
    display: flex;
    align-items: center;
    padding: 10px 20px;
    background-color: transparent;
    border: 1px solid white;
    color: white;
    font-size: 16px;
    cursor: pointer;
    border-radius: 58px;

    span.arrow {
        display: inline-block;
        transition: transform 0.3s ease;
    }

    &:hover span.arrow {
        transform: translateX(-5px);
    }
`;

export const CompleteButton = styled(Button)`
    background-color: white;
    color: black;
    width: 208px;
    padding: 15px 30px;
    display: flex;
    justify-content: center;
    border-radius: 58px;
    align-items: baseline;
    font-size: 15px;
    gap: 10px;
}
`;

export const StyledImage = styled.img`
   cursor: pointer;
   max-width: 33px;
   height: auto;
`;