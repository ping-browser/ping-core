/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import styled from 'styled-components';

type PopupType = 'error' | 'success' | 'info' | 'input';

interface PopupPromptProps {
    message: string;
    onClose: () => void;
    type?: PopupType;
    duration?: number;
    onInputSubmit: (value: string) => void;
    inputType?: string;
    placeholder?: string;
}

const getColorByType = (type: PopupType): string => {
    switch (type) {
        case 'error':
            return '#ff4d4d';
        case 'success':
            return '#4caf50';
        case 'info':
            return '#2196f3';
        case 'input':
            return '#ff9800';
        default:
            return '#2196f3';
    }
};

const PopupOverlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(0, 0, 0, 0.5);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 1000;
 `;

const PopupContent = styled.div<{ type: PopupType }>`
   background-color: white;
   padding: 20px;
   border-radius: 8px;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
   max-width: 400px;
   width: 90%;
   position: relative;
   border-top: 4px solid ${({ type }) => getColorByType(type)};
 `;

const Message = styled.p`
   margin: 0 0 15px 0;
   font-size: 16px;
 `;

const Input = styled.input`
   width: 100%;
   padding: 8px;
   margin-bottom: 10px;
   border: 1px solid #ccc;
   border-radius: 4px;
 `;

const Button = styled.button`
   padding: 8px 16px;
   border: none;
   border-radius: 4px;
   cursor: pointer;
   font-size: 14px;
   transition: background-color 0.3s;
 `;

const SubmitButton = styled(Button) <{ popupType: PopupType }>`
   background-color: ${({ popupType }) => getColorByType(popupType)};
   color: white;
   
   &:hover {
     background-color: ${({ popupType }) => {
        const color = getColorByType(popupType);
        return color.replace(/^#/, '#66');
    }};
   }
 `;

const CloseButton = styled(Button)`
   position: absolute;
   top: 10px;
   right: 10px;
   background-color: transparent;
   font-size: 20px;
   color: #666;
   
   &:hover {
     color: #333;
   }
 `;

export const ErrorPopup: React.FC<PopupPromptProps> = ({
    message,
    onClose,
    type = 'input',
    duration = 0,
    onInputSubmit,
    inputType = 'text',
    placeholder = 'Enter your response...'
}) => {
    const [inputValue, setInputValue] = React.useState('');

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
        return () => { };
    }, [duration, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInputSubmit(inputValue);
        onClose();
    };

    return (
        <PopupOverlay>
            <PopupContent type={type}>
                <Message>{message}</Message>
                <form onSubmit={handleSubmit}>
                    <Input
                        type={inputType}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                    />
                    <SubmitButton type="submit" popupType={type}>Submit</SubmitButton>
                </form>
                <CloseButton onClick={onClose}>×</CloseButton>
            </PopupContent>
        </PopupOverlay>
    );
};