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
import getUserActions from 'utils/userActions';

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

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setRoles(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(roleSub);
        })
    }, [])

    let actions = getUserActions(session, roles, cart);

    return (
        <BottomNavigation 
            className={classes.root} 
            showLabels
            {...props}
        >
            {actions.map(([label, value, link, onClick, Icon, badgeNum], index) => (
                        <BottomNavigationAction 
                            key={index} 
                            className={classes.icon} 
                            label={label} 
                            value={value} 
                            onClick={() => {history.push(link); if(onClick) onClick()}}
                            icon={<Badge badgeContent={badgeNum} color="error"><Icon /></Badge>} />
                    ))}
        </BottomNavigation>
    );
}

IconNav.propTypes = {
    cart: PropTypes.object,
}

export default IconNav;