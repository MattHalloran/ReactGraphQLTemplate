import React from 'react'

class ContactInfo extends React.Component{
    render() {
        return (
            <li>
                <p><b>Hours</b></p>
                <p>MON-THUR: 7:30 am to 12:00 PM 1:00 to 5:00 pm</p>
                <p>FRI: 7:30 am to 12:00 PM 1:00 to 3:00 pm</p>
                <p>SAT 7:30 am to 12:00 PM  </p>
                <p>SUN: Closed</p>
                <p>Note: Closed daily from 12:00 pm to 1:00 pm</p>
                <p><b>Phone:</b> (856) 455-3601</p>
            </li>
        );
    }
}

export default ContactInfo;