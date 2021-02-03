import React from 'react';
import Button from './Button';
import { lightTheme, darkTheme } from 'storage';

export default {
    title: 'Button',
    component: Button
}

export const Light = (args) => <Button {...args} >Click Me!</Button>
Light.args = {
    theme: lightTheme
}

export const Dark = (args) => <Button {...args} >Click Me!</Button>
Dark.args = {
    theme: darkTheme
}
