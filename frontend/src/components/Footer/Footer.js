import React from 'react';
import { Link } from 'react-router-dom';
import ProvenWinners from '../../assets/img/proven-winners.png';
import { StyledFooter } from './Footer.styled';

class Footer extends React.Component {
    render() {
        return (
            <StyledFooter>
                <div className="footer-row">
                    {/* Column 1 */}
                    <div className="footer-col">
                        <ul className="footer-ul">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <ul className="footer-ul">
                            <li><a href={require('../../assets/downloads/Confidential_Commercial_Credit_Application-2010.doc')} download="Confidential_Commercial_Credit_Application">Credit App</a></li>
                            <li><Link to="/sales">Sales</Link></li>
                            <li><Link to="/gallery">Gallery</Link></li>
                            <li><Link to="/featured">Featured Plants</Link></li>
                            <li><Link to="/smile">A SMILE when you need one!</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                            <address className="footer-ul addy">
                                <h5>NEW LIFE NURSERY INC.</h5>
                                <a href="https://www.google.com/maps/place/106+S+Woodruff+Rd,+Bridgeton,+NJ+08302/@39.4559443,-75.1793432,17z/">
                                    106 South Woodruff Road
                                <br />Bridgeton, NJ 08302</a>
                                <a href="tel:+18564553601">Phone: (856) 455-3601</a>
                                <a href="tel:+18564511530">Fax: (856) 451-1530</a>
                                <a href="mailto:info@newlifenurseryinc.com">Email: info@newlifenurseryinc.com</a>
                            </address>
                    </div>
                    <div className="footer-col">
                        <img src={ProvenWinners} alt="We Sell Proven Winners - The #1 Plant Brand" className="proven-winner" />
                    </div>
                </div>
                <hr />
                <div className="footer-row">
                    <p className="col-sm">
                        &copy;{new Date().getFullYear()} New Life Nursery Inc. | <Link to="/privacy-policy">Privacy Policy</Link> | Terms Of Service
                        </p>
                </div>
            </StyledFooter >
        );
    }
}

Footer.propTypes = {

}

export default Footer;