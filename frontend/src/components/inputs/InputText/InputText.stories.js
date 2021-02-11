import React from 'react';
import InputText from './InputText';
import * as validation from 'utils/validations';
import { themes } from 'utils/storage';

const themeConverter = (themeString) => {
    return themes[themeString];
}

export default {
    title: 'InputText',
    component: InputText,
    argTypes: {
        label: 'Field Title',
        type: "text",
        value: null,
        valueFunc: () => { },
        errorFunc: () => { },
        validation: validation.passwordValidation,
        disabled: false,
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
    return <InputText theme={themeMap} {...rest} />
}