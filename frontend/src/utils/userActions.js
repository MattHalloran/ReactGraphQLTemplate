import SettingsIcon from '@material-ui/icons/Settings';
import ShopIcon from '@material-ui/icons/Shop';
import PersonIcon from '@material-ui/icons/Person';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { LINKS, USER_ROLES } from 'utils/consts';

// Returns user actions, in a list of this format:
//  [
//      label: str,
//      value: str,
//      link: str,
//      onClick: func,
//      icon: Material-UI Icon,
//      number of notifications: int,
//  ]
export default function getUserActions(session, roles, cart) {
    let actions = [];

    // If someone is not logged in, display sign up/log in links
    if (!session) {
        actions.push(['Log In', 'login', LINKS.LogIn, null, PersonAddIcon, 0]);
    } else {
        // If an admin is logged in, display admin links
        if (roles instanceof Array) {
            roles?.forEach(r => {
                if (r.title === USER_ROLES.Admin) {
                    actions.push(['Admin', 'admin', LINKS.Admin, null, SettingsIcon, 0]);
                }
            })
        }
        actions.push(['Availability', 'availability', LINKS.Shopping, null, ShopIcon, 0],
            ['Profile', 'profile', LINKS.Profile, null, PersonIcon, 0],
            ['Cart', 'cart', LINKS.Cart, null, ShoppingCartIcon, cart?.items?.length ?? 0]);
    }

    return actions;
}