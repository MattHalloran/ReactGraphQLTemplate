import React from 'react';
import MenuContainer from './MenuContainer';
import { themes } from 'storage';

const themeConverter = (themeString) => {
    return themes[themeString];
}

export default {
    title: 'MenuContainer',
    component: MenuContainer,
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
        side: {
            control: {
                type: 'select',
                options: [
                    'left',
                    'right'
                ]
            }
        }
    }
}

const MenuContents = () => <div>
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
    return <MenuContainer theme={themeMap} {...rest} >
        <MenuContents />
    </MenuContainer>
}