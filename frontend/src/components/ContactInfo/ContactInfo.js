import React from 'react';
import PropTypes from 'prop-types';
import { StyledContactInfo } from './ContactInfo.styled';
import { GeoIcon, EmailIcon, PhoneIcon } from 'assets/img';
import { getTheme } from 'utils/storage';
import { GOOGLE_MAPS_ADDRESS } from 'utils/consts';
import Button from 'components/Button/Button';

function ContactInfo({
    theme = getTheme(),
}) {
    return (
        <StyledContactInfo theme={theme}>
                <table className="hours-content-div">
                    <tbody>
                        <tr><th className="hours-header">Hours</th></tr>
                        <tr><td>MON-THUR: 7:30 am to 12:00 PM 1:00 to 5:00 pm</td></tr>
                        <tr><td>FRI: 7:30 am to 12:00 PM 1:00 to 3:00 pm</td></tr>
                        <tr><td>SAT 7:30 am to 12:00 PM</td></tr>
                        <tr><td>SUN: Closed</td></tr>
                        <tr><td>Note: Closed daily from 12:00 pm to 1:00 pm</td></tr>
                    </tbody>
                </table>
                <div className="icon-container external-links">
                    <div className="icon-group" onClick={() => window.open(GOOGLE_MAPS_ADDRESS, "_blank")}>
                        <div className="icon">
                            <GeoIcon width="30px" height="30px"/>
                        </div>
                        <p className="external-link-text">106 South Woodruff Road<br />Bridgeton, NJ 08302</p>
                    </div>
                    <div className="icon-group" onClick={() => window.open("mailto:info@newlifenurseryinc.com", "_blank")}>
                        <div className="icon">
                            <EmailIcon width="30px" height="30px" />
                        </div>
                        <p className="external-link-text">info@newlifenurseryinc.com</p>
                    </div>
                    <div className="icon-group" onClick={() => window.open("tel:+18564553601", "_blank")}>
                        <div className="icon">
                            <PhoneIcon width="30px" height="30px"/>
                        </div>
                        <p className="external-link-text">(856) 455-3601</p>
                    </div>
                </div>
                <div className="icon-container external-links bottom-div">
                    <Button>Contact Form</Button>
                    <Button>Give Feedback</Button>
                </div>
        </StyledContactInfo >
    );
}

ContactInfo.propTypes = {
    theme: PropTypes.object,
}

export default ContactInfo;