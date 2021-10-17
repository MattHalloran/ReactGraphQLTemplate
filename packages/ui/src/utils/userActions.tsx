import {
    ExitToApp as ExitToAppIcon,
    Person as PersonIcon,
    PersonAdd as PersonAddIcon,
    Settings as SettingsIcon,
    Shop as ShopIcon,
    ShoppingCart as ShoppingCartIcon
} from '@material-ui/icons';
import { ROLES } from '@local/shared';
import { LINKS } from 'utils';
import { initializeApollo } from 'graphql/utils/initialize';
import { logoutMutation } from 'graphql/mutation';
import {
    Badge,
    BottomNavigationAction,
    Button,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import { Cart, UserRoles } from 'types';

export type ActionArray = [string, any, string, (() => any) | null, any, number];
interface Action {
    label: string;
    value: any;
    link: string;
    onClick: (() => any) | null;
    Icon: any;
    numNotifications: number;
}

// Returns navigational actions available to the user
interface GetUserActionsProps {
    userRoles: UserRoles;
    cart: Cart;
    exclude?: string[] | undefined;
}
export function getUserActions({ userRoles, cart, exclude = [] }: GetUserActionsProps): Action[] {
    let actions: ActionArray[] = [];

    // If someone is not logged in, display sign up/log in links
    if (!userRoles) {
        actions.push(['Log In', 'login', LINKS.LogIn, null, PersonAddIcon, 0]);
    } else {
        // If an owner admin is logged in, display owner links
        if (userRoles.some(r => [ROLES.Owner, ROLES.Admin].includes(r?.title))) {
            actions.push(['Manage Site', 'admin', LINKS.Admin, null, SettingsIcon, 0]);
        }
        actions.push(['Shop', 'shop', LINKS.Shopping, null, ShopIcon, 0],
            ['Profile', 'profile', LINKS.Profile, null, PersonIcon, 0],
            ['Cart', 'cart', LINKS.Cart, null, ShoppingCartIcon, cart?.items?.length ?? 0],
            ['Log out', 'logout', LINKS.Home, () => { const client = initializeApollo(); client.mutate({ mutation: logoutMutation }) }, ExitToAppIcon, 0]);
    }
    return createActions(actions).filter((a: any) => !exclude.includes(a.value));
}

// Factory for creating action objects
const createAction = (action: ActionArray): Action => {
    const keys = ['label', 'value', 'link', 'onClick', 'Icon', 'numNotifications'];
    return action.reduce((obj: {}, val: any, i: number) => { obj[keys[i]] = val; return obj }, {}) as Action;
}

// Factory for creating a list of action objects
export const createActions = (actions: ActionArray[]): Action[] => actions.map(a => createAction(a));

// Display actions as a list
interface ActionsToListProps {
    actions: Action[];
    history: any;
    classes?: {[key: string]: string};
    showIcon?: boolean;
    onAnyClick?: () => any;
}
export const actionsToList = ({ actions, history, classes = { listItem: '', listItemIcon: '' }, showIcon = true, onAnyClick = () => {} }: ActionsToListProps) => {
    return actions.map(({ label, value, link, onClick, Icon, numNotifications }) => (
        <ListItem
            key={value}
            classes={{ root: classes.listItem }}
            onClick={() => {
                history.push(link);
                if (onClick) onClick();
                if (onAnyClick) onAnyClick();
            }}>
            {showIcon && Icon ?
                (<ListItemIcon>
                    <Badge badgeContent={numNotifications} color="error">
                        <Icon className={classes.listItemIcon} />
                    </Badge>
                </ListItemIcon>) : ''}
            <ListItemText primary={label} />
        </ListItem>
    ))
}

// Display actions in a horizontal menu
interface ActionsToMenuProps {
    actions: Action[];
    history: any;
    classes?: {[key: string]: string};
}
export const actionsToMenu = ({ actions, history, classes = { root: '' } }: ActionsToMenuProps) => {
    return actions.map(({ label, value, link, onClick }) => (
        <Button
            key={value}
            variant="text"
            size="large"
            classes={classes}
            onClick={() => { history.push(link); if (onClick) onClick() }}
        >
            {label}
        </Button>
    ));
}

// Display actions in a bottom navigation
interface ActionsToBottomNavProps {
    actions: Action[];
    history: any;
    classes?: {[key: string]: string};
}
export const actionsToBottomNav = ({ actions, history, classes = { root: '' } }: ActionsToBottomNavProps) => {
    return actions.map(({ label, value, link, onClick, Icon, numNotifications }) => (
        <BottomNavigationAction
            key={value}
            classes={classes}
            label={label}
            value={value}
            onClick={() => { history.push(link); if (onClick) onClick() }}
            icon={<Badge badgeContent={numNotifications} color="error"><Icon /></Badge>} />
    ))
}

// Display an action as an icon button
interface ActionToIconButtonProps {
    action: Action;
    history: any;
    classes?: {[key: string]: string};
}
export const actionToIconButton = ({ action, history, classes = { root: '' } }: ActionToIconButtonProps) => {
    const { value, link, Icon, numNotifications } = action;
    return <IconButton  classes={classes} edge="start" color="inherit" aria-label={value} onClick={() => history.push(link)}>
        <Badge badgeContent={numNotifications} color="error">
            <Icon />
        </Badge>
    </IconButton>
}