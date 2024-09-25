/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import * as S from './styles';
import loading from '../../../assets/loader.png'

const Loader = () => (
    <S.LoaderContainer>
        <img src={loading} alt="Loading..." />
    </S.LoaderContainer>
);

export default Loader;
