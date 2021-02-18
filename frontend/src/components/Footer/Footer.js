import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProvenWinners from 'assets/img/proven-winners.png';
import { StyledFooter } from './Footer.styled';
import { getTheme } from 'utils/storage';
import { GOOGLE_MAPS_ADDRESS, LINKS } from 'utils/consts';
import { printAvailability } from 'utils/printAvailability';

function Footer({
    theme=getTheme(),
}) {

    return (
        <StyledFooter theme={theme}>
            <div className="flexed">
                <div className="footer-group">
                    <ul className="footer-ul">
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to={LINKS.Terms}>Terms & Conditions</Link></li>
                    </ul>
                </div>
                <div className="footer-group">
                    <ul className="footer-ul">
                        <li><a href={require('assets/downloads/Confidential_Commercial_Credit_Application-2010.doc')} target="_blank" download="Confidential_Commercial_Credit_Application">Credit App</a></li>
                        <li style={{cursor:'pointer'}} onClick={printAvailability}>Print Availability</li>
                        <li><Link to="/gallery">Gallery</Link></li>
                        <li><Link to="/featured">Featured Plants</Link></li>
                    </ul>
                </div>
                <div className="footer-group">
                    <address className="footer-ul addy">
                        <h5>NEW LIFE NURSERY INC.</h5>
                        <a href={GOOGLE_MAPS_ADDRESS}>
                            106 South Woodruff Road
                                <br />Bridgeton, NJ 08302</a>
                        <a href="tel:+18564553601">Phone: (856) 455-3601</a>
                        <a href="tel:+18564511530">Fax: (856) 451-1530</a>
                        <a href="mailto:info@newlifenurseryinc.com">Email: info@newlifenurseryinc.com</a>
                    </address>
                </div>
                <div className="footer-group winner-div">
                    <img src={ProvenWinners} alt="We Sell Proven Winners - The #1 Plant Brand" className="proven-winner" />
                </div>
            </div>
        </StyledFooter >
    );
}

Footer.propTypes = {
    theme: PropTypes.object,
}

export default Footer;