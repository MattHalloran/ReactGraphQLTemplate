import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import BurgerMenu from 'components/menus/BurgerMenu/BurgerMenu';
import { clearStorage, getSession, getRoles } from 'utils/storage';
import ContactInfo from 'components/ContactInfo/ContactInfo';
import { FULL_BUSINESS_NAME, USER_ROLES, LINKS, PUBS } from 'utils/consts';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import { BagPlusIcon, PersonIcon, ShoppingCartIcon, XIcon, GearIcon, PersonPlusIcon } from 'assets/img';
import PubSub from 'utils/pubsub';
import { SocialIcon } from 'react-social-icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    
});

function Hamburger(props) {
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [user_roles, setUserRoles] = useState(getRoles());
    let history = useHistory();
    let nav_options = [];
    let top_links = [];

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setUserRoles(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(roleSub);
        })
    }, [])

    // If an admin is logged in, display admin links
    let roles = user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === USER_ROLES.Admin) {
                top_links.push([LINKS.Admin, GearIcon]);
            }
        })
    }

    // If someone is not logged in, display sign up/log in links
    if (!session) {
        top_links.push([LINKS.LogIn, PersonPlusIcon]);
    } else {
        top_links.push([LINKS.Shopping, BagPlusIcon],
            [LINKS.Profile, PersonIcon],
            [LINKS.Cart, ShoppingCartIcon, { cart: props.cart }]);
    }

    nav_options.push(
        [LINKS.Home, 'Home'],
        [LINKS.Gallery, 'Gallery'],
        [LINKS.About, 'About Us']
    );

    if (session !== null) {
        nav_options.push([LINKS.Home, 'Log Out', clearStorage]);
    }

    return (
        <BurgerMenu {...props}>
            <div className="icon-container" style={{ margin: '10px 5px 10px 5px' }}>
                {top_links.map(([link, Icon, extra_props], index) => (
                    <Icon key={index} {...extra_props} width="40px" height="40px" onClick={() => history.push(link)} />
                ))}
                <XIcon width="40px" height="40px" onClick={() => PubSub.publish(PUBS.BurgerMenuOpen, false)} />
            </div>
            <Collapsible contentClassName='' title="Contact" initial_open={true}>
                <ContactInfo />
            </Collapsible>
            {/* { nav_options.map(([link, text, onClick], index) => (
                <p key={index}><Link style={{ color: `${theme.headerText}` }} to={link} onClick={onClick}>{text}</Link></p>
            ))} */}
            {/* <div style={{ display: 'flex', justifyContent: 'space-around', background: `${theme.lightPrimaryColor}` }}>
                <SocialIcon style={{ marginBottom: '0' }} fgColor={theme.headerText} url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon style={{ marginBottom: '0' }} fgColor={theme.headerText} url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </div>
            <p>
                &copy;{new Date().getFullYear()} {FULL_BUSINESS_NAME} | <Link style={{ color: `${theme.headerText}` }} to={LINKS.PrivacyPolicy}>Privacy</Link> | <Link style={{ color: `${theme.headerText}` }} to={LINKS.Terms}>Terms & Conditions</Link>
            </p> */}
        </BurgerMenu>
    );
}

Hamburger.propTypes = {

}

export default Hamburger;