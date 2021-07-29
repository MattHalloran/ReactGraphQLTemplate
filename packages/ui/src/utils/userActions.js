import {
    Person as PersonIcon,
    PersonAdd as PersonAddIcon,
    Settings as SettingsIcon,
    Shop as ShopIcon,
    ShoppingCart as ShoppingCartIcon
} from '@material-ui/icons';
import { CUSTOMER_ROLES } from '@local/shared';
import { LINKS } from 'utils';

// Returns user actions, in a list of this format:
//  [
//      label: str,
//      value: str,
//      link: str,
//      onClick: func,
//      icon: Material-UI Icon,
//      number of notifications: int,
//  ]
export function getUserActions(session, roles, cart) {
    let actions = [];

    // If someone is not logged in, display sign up/log in links
    if (!session) {
        actions.push(['Log In', 'login', LINKS.LogIn, null, PersonAddIcon, 0]);
    } else {
        // If an admin is logged in, display admin links
        if (roles instanceof Array) {
            roles?.forEach(r => {
                if (r.title === CUSTOMER_ROLES.Admin) {
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