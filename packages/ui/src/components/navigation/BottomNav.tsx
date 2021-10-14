import React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { BottomNavigation, Theme } from '@material-ui/core';
import { actionsToBottomNav, getUserActions } from 'utils';
import { CommonProps } from 'types';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        background: theme.palette.primary.dark,
        position: 'fixed',
        zIndex: 5,
        bottom: '0',
        width: '100%',
    },
    icon: {
        color: theme.palette.primary.contrastText,
    },
    [theme.breakpoints.up(1000)]: {
        root: {
            display: 'none',
        }
    },
}));

export const BottomNav = ({
    userRoles,
    cart,
    ...props
}: Pick<CommonProps, 'userRoles' | 'cart'>) => {
    let history = useHistory();
    const classes = useStyles();

    let actions = actionsToBottomNav({
        actions: getUserActions({ userRoles, cart, exclude: ['logout'] }),
        history,
        classes: { action: classes.icon }
    });

    return (
        <BottomNavigation
            className={classes.root}
            showLabels
            {...props}
        >
            {actions}
        </BottomNavigation>
    );
}