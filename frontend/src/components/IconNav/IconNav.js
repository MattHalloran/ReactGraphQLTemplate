import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { getSession, getRoles } from 'utils/storage';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import SettingsIcon from '@material-ui/icons/Settings';
import ShopIcon from '@material-ui/icons/Shop';
import PersonIcon from '@material-ui/icons/Person';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { ShoppingCartIcon } from 'assets/img';
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
                actions.push([LINKS.Admin, SettingsIcon, 'Admin', 'admin']);
            }
        })
    }

    // If someone is not logged in, display sign up/log in links
    if (!session) {
        actions.push([LINKS.LogIn, PersonAddIcon, 'Log In', 'login']);
    } else {
        actions.push([LINKS.Shopping, ShopIcon, 'Availability', 'availability'],
            [LINKS.Profile, PersonIcon, 'Profile', 'profile'],
            [LINKS.Cart, ShoppingCartIcon, 'Cart', 'cart', { width: '30px', height: '30px', cart: props.cart }]);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <BottomNavigation value={value} onChange={handleChange} className={classes.root} {...props}>
            {actions.map(([link, Icon, label, value, extra_props], index) => (
                        <BottomNavigationAction 
                            key={index} 
                            className={classes.icon} 
                            label={label} 
                            value={value} 
                            onClick={() => history.push(link)}
                            icon={<Icon {...extra_props} />} />
                    ))}
        </BottomNavigation>
    );
}

IconNav.propTypes = {
    cart: PropTypes.object,
}

export default IconNav;