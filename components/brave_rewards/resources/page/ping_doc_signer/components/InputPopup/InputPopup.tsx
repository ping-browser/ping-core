/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState } from 'react';
import * as React from 'react';
import { PopupContainer, PopupContent, Title, InputField, ButtonContainer, BackButton, CompleteButton, InputWrapper, EyeButton } from './styles';

interface InputPopupProps {
    userName: string;
    onBack: () => void;
    onComplete: (pin: string) => void;
}

const InputPopup: React.FC<InputPopupProps> = ({ userName, onBack, onComplete }) => {
    const [pin, setPin] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handlePinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPin(event.target.value);
    };

    const handleComplete = () => {
        onComplete(pin);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <PopupContainer>
            <PopupContent>
                <Title>{userName}</Title>
                <InputWrapper>
                    <InputField
                        type={showPassword ? "text" : "password"}
                        placeholder="Please enter your signature pin"
                        value={pin}
                        onChange={handlePinChange}
                    />
                    <EyeButton onClick={togglePasswordVisibility}>
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                    </EyeButton>
                </InputWrapper>
                <ButtonContainer>
                    <BackButton onClick={onBack}>Back</BackButton>
                    <CompleteButton onClick={handleComplete}>Complete signature</CompleteButton>
                </ButtonContainer>
            </PopupContent>
        </PopupContainer>
    );
};

export default InputPopup;