/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState, KeyboardEvent } from 'react';
import * as React from 'react';
import { PopupContainer, PopupContent, Title, InputField, ButtonContainer, BackButton, CompleteButton, InputWrapper, EyeButton, StyledImage } from './styles';
import eyeoff from '../../../assets/visibility_off.png';
import arrow from '../../../assets/arrow_back.png';
import eyeon from '../../../assets/eye.png';

interface InputPopupProps {
    userName: string;
    onBack: () => void;
    onComplete: (input: string) => void;
    popupType: 'pin' | 'path';
}

const InputPopup: React.FC<InputPopupProps> = ({ userName, onBack, onComplete, popupType }) => {
    const [input, setInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleComplete = () => {
        onComplete(input);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isPinPopup = popupType === 'pin';

    const handleKeyEvent = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleComplete();
        }
    }

    return (
        <PopupContainer>
            <PopupContent>
                <Title>{userName}</Title>
                <InputWrapper>
                    <InputField
                        type={isPinPopup ? (showPassword ? "text" : "password") : "text"}
                        placeholder={isPinPopup ? "Please enter your signature pin" : "Enter path to PKCS #11 module"}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyEvent}
                    />
                    {isPinPopup && (
                        <EyeButton onClick={togglePasswordVisibility}>
                            {showPassword ?
                                <StyledImage
                                    src={eyeoff}
                                    height={18}
                                    width={18}
                                />
                                :
                                <StyledImage
                                    src={eyeon}
                                    height={18}
                                    width={18}
                                />
                            }
                        </EyeButton>
                    )}
                </InputWrapper>
                <ButtonContainer>
                    <BackButton onClick={onBack}>
                        <span className="arrow">
                            <StyledImage
                                src={arrow}
                                height={16}
                                width={16}
                            />
                        </span>
                        &nbsp;&nbsp;Cancel
                    </BackButton>
                    <CompleteButton onClick={handleComplete}>
                        {isPinPopup ? "Complete signature" : "Add Digital ID"}
                    </CompleteButton>
                </ButtonContainer>
            </PopupContent>
        </PopupContainer>
    );
};

export default InputPopup;