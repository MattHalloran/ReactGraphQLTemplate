import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { getSession, getRoles } from 'utils/storage';
import { BottomNavigation, BottomNavigationAction, Badge } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import ShopIcon from '@material-ui/icons/Shop';
import PersonIcon from '@material-ui/icons/Person';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { LINKS, USER_ROLES, PUBS } from 'utils/consts';
import PubSub from 'utils/pubsub';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.primary.light,
        position: 'fixed',
        zIndex: 5,
        bottom: '0',
        width: '100%',
    },
    icon: {
        color: theme.palette.primary.contrastText,
    },
    [theme.breakpoints.up(960)]: {
        root: {
            display: 'none',
        }
    },
}));

function IconNav({
    cart,
    ...props
}) {
    let history = useHistory();
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [roles, setRoles] = useState(getRoles());
    const [value, setValue] = useState('recents');

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setRoles(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(roleSub);
        })
    }, [])

    let actions = [];

    // If an admin is logged in, display admin links
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === USER_ROLES.Admin) {
                actions.push([LINKS.Admin, SettingsIcon, 'Admin', 'admin', 0]);
            }
        })
    }

    // If someone is not logged in, display sign up/log in links
    if (!session) {
        actions.push([LINKS.LogIn, PersonAddIcon, 'Log In', 'login', 0]);
    } else {
        actions.push([LINKS.Shopping, ShopIcon, 'Availability', 'availability', 0],
            [LINKS.Profile, PersonIcon, 'Profile', 'profile', 0],
            [LINKS.Cart, ShoppingCartIcon, 'Cart', 'cart', cart?.items?.length ?? 0]);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <BottomNavigation value={value} onChange={handleChange} className={classes.root} {...props}>
            {actions.map(([link, Icon, label, value, badgeNum], index) => (
                        <BottomNavigationAction 
                            key={index} 
                            className={classes.icon} 
                            label={label} 
                            value={value} 
                            onClick={() => history.push(link)}
                            icon={<Badge badgeContent={badgeNum} color="error"><Icon /></Badge>} />
                    ))}
        </BottomNavigation>
    );
}

IconNav.propTypes = {
    cart: PropTypes.object,
}

export default IconNav;