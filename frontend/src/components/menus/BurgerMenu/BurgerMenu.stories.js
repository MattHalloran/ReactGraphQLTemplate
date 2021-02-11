import React from 'react';
import BurgerMenu from './BurgerMenu';
import { themes } from 'utils/storage';

const themeConverter = (themeString) => {
    return themes[themeString];
}

export default {
    title: 'BurgerMenu',
    component: BurgerMenu,
    argTypes: {
        open: true,
        closeMenu: () => { },
        theme: {
            control: {
                type: 'select',
                options: [
                    'lightTheme',
                    'darkTheme'
                ],
            },
        },
    }
}

const BurgerContents = () => <div>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
    <p>AAAAAAAAAAAAA</p>
</div>

export const Template = ({ theme, ...rest }) => {
    const themeMap = themeConverter(theme);
    return <BurgerMenu theme={themeMap} {...rest} >
        <BurgerContents />
    </BurgerMenu>
}