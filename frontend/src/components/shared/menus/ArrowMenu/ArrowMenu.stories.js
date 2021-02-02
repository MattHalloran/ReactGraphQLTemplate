import React from 'react';
import ArrowMenu from './ArrowMenu';
import { themes } from 'theme';

const themeConverter = (themeString) => {
    return themes[themeString];
}

export default {
    title: 'ArrowMenu',
    component: ArrowMenu,
    argTypes: {
        open: true,
        toggleOpen: () => { },
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

export const Template = ({ theme, ...rest }) => {
    const themeMap = themeConverter(theme);
    return <ArrowMenu theme={themeMap} {...rest} />
}