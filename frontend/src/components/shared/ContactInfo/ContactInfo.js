import React from 'react';
import PropTypes from 'prop-types';
import { StyledContactInfo } from './ContactInfo.styled';
import PhoneIcon from 'assets/img/PhoneIcon';

function ContactInfo({theme}) {
    return (
        <StyledContactInfo theme={theme}>
            <table className="hours-content-div">
                <tbody>
                    <tr><th className="contact-header"><b>Hours</b></th></tr>
                    <tr><td>MON-THUR: 7:30 am to 12:00 PM 1:00 to 5:00 pm</td></tr>
                    <tr><td>FRI: 7:30 am to 12:00 PM 1:00 to 3:00 pm</td></tr>
                    <tr><td>SAT 7:30 am to 12:00 PM</td></tr>
                    <tr><td>SUN: Closed</td></tr>
                    <tr><td>Note: Closed daily from 12:00 pm to 1:00 pm</td></tr>
                </tbody>
            </table>
            <p><a href="tel:+18564553601"><PhoneIcon className="phone" />(856) 455-3601</a></p>
        </StyledContactInfo>
    );
}

ContactInfo.propTypes = {
    theme: PropTypes.object,
}

export default ContactInfo;