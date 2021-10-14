import React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { BottomNavigation, Theme } from '@material-ui/core';
import { actionsToBottomNav, getUserActions } from 'utils';

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

interface Props {
    session: any;
    userRoles: any[];
    cart: any;
}

export const BottomNav: React.FC<Props> = ({
    session,
    userRoles,
    cart,
    ...props
}) => {
    let history = useHistory();
    const classes = useStyles();

    let actions = actionsToBottomNav({
        actions: getUserActions({ session, userRoles, cart, exclude: ['logout'] }),
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