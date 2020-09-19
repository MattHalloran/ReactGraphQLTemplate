import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import ProvenWinners from '../../assets/img/proven-winners.png';

class Footer extends React.Component {
    render() {
        return (
            <footer className="main-footer">
                <div className="footer-row">
                    {/* Column 1 */}
                    <div className="footer-col">
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact Us</Link>
                        <Link to="/terms-and-conditions">Terms & Conditions</Link>
                    </div>
                    <div className="footer-col">
                        <Link to="/credit-app">Credit App</Link>
                        <Link to="/sales">Sales</Link>
                        <Link to="/gallery">Gallery</Link>
                        <Link to="/featured">Featured Plants</Link>
                        <Link to="/smile">A SMILE when you need one!</Link>
                    </div>
                    <address className="footer-col">
                        <h5>NEW LIFE NURSERY INC.</h5>
                        <a href="https://www.google.com/maps/place/106+S+Woodruff+Rd,+Bridgeton,+NJ+08302/@39.4559443,-75.1793432,17z/">
                            106 South Woodruff Road
                                <br />Bridgeton, NJ 08302</a>
                        <a href="tel+8564553601">Phone: (856) 455-3601</a>
                        <p>Fax: (856) 451-1530</p>
                        <a href="mailto:info@newlifenurseryinc.com">Email: info@newlifenurseryinc.com</a>
                    </address>
                    <div className="footer-col">
                        <img src={ProvenWinners} alt="We Sell Proven Winners - The #1 Plant Brand" className="proven-winner"/>
                    </div>
                </div>
                <hr />
                <div className="footer-row">
                    <p className="col-sm">
                        &copy;{new Date().getFullYear()} New Life Nursery Inc. | Privacy Policy | Terms Of Service
                        </p>
                </div>
            </footer >
        );
    }
}

export default Footer;