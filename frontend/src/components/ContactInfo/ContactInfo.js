import PropTypes from 'prop-types';
import { StyledContactInfo } from './ContactInfo.styled';
import { GeoIcon, EmailIcon, PhoneIcon } from 'assets/img';
import { GOOGLE_MAPS_ADDRESS } from 'utils/consts';
import Button from 'components/Button/Button';

function ContactInfo() {

    const openMaps = (e) => {
        window.location = GOOGLE_MAPS_ADDRESS;
        e.preventDefault();
    }

    const openMail = (e) => {
        window.location = "mailto:info@newlifenurseryinc.com";
        e.preventDefault();
    }

    const openPhone = (e) => {
        window.location = "tel:+18564553601";
        e.preventDefault();
    }

    return (
        <StyledContactInfo>
                <table className="hours-content-div">
                    <tbody>
                        <tr><th className="hours-header">Hours</th></tr>
                        <tr><td>MON-FRI: 8:00 am to 3:00 pm</td></tr>
                        <tr><td>SAT-SUN: Closed</td></tr>
                        <tr><td>Note: Closed daily from 12:00 pm to 1:00 pm</td></tr>
                    </tbody>
                </table>
                <div className="icon-container external-links">
                    <div className="icon-group" onClick={openMaps}>
                        <div className="icon">
                            <GeoIcon width="30px" height="30px"/>
                        </div>
                        <p className="external-link-text">106 South Woodruff Road<br />Bridgeton, NJ 08302</p>
                    </div>
                    <div className="icon-group" onClick={openMail}>
                        <div className="icon">
                            <EmailIcon width="30px" height="30px" />
                        </div>
                        <p className="external-link-text">info@newlifenurseryinc.com</p>
                    </div>
                    <div className="icon-group" onClick={openPhone}>
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
}

export default ContactInfo;