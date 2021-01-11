import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom';
import { StyledProfilePage } from './ProfilePage.styled';
import { withRouter } from "react-router";
import TextField from 'components/shared/inputs/TextField/TextField';
import * as validation from 'utils/validations';

function ProfilePage(props) {
    const urlParams = useParams();
    const [editing, setEditing] = useState(urlParams.edit === 'editing');
    const [showErrors, setShowErrors] = useState(false);
    let ref = useRef({
        first_name: "",
        first_name_error: "",
        last_name: "",
        last_name_error: "",
        email: "",
        email_error: "",
        password: "",
        password_error: "",
        confirm_password: "",
        confirm_password_error: "",
        phone: "",
        phone_error: "",
        address: "",
        address_error: "",
        active_orders: null,
        order_history: null,
    });

    useEffect(() => {
        document.title = "Profile | New Life Nursery";
    }, [])

    const change = (name, value) => {
        ref.current[name] = value;
    }

    return (
        <StyledProfilePage>
            <div id="profile-image-div">
            </div>
            <TextField
                nameField="first_name"
                errorField="first_name_error"
                type="text"
                label="First Name"
                autocomplete="John"
                onChange={change}
                validate={validation.firstNameValidation}
                showErrors={showErrors}
                locked={!editing}
            />
            <TextField
                nameField="last_name"
                errorField="last_name_error"
                type="text"
                label="Last Name"
                autocomplete="Doe"
                onChange={change}
                validate={validation.lastNameValidation}
                showErrors={showErrors}
                locked={!editing}
            />
            <TextField
                nameField="email"
                errorField="email_error"
                type="email"
                label="Email"
                autocomplete="john.doe@gmail.com"
                onChange={change}
                validate={validation.emailValidation}
                showErrors={showErrors}
                locked={!editing}
            />
            <TextField
                nameField="phone"
                errorField="phone_error"
                type="text"
                label="Phone Number"
                autocomplete="555-867-5309"
                onChange={change}
                validate={validation.phoneNumberValidation}
                showErrors={showErrors}
                locked={!editing}
            />
            <TextField
                nameField="address"
                errorField="address_error"
                type="text"
                label="Delivery Address"
                autocomplete="123 Fake Street Philadelphia PA"
                onChange={change}
                validate={validation.addressValidation}
                showErrors={showErrors}
                locked={!editing}
            />
            <TextField
                nameField="password"
                errorField="password_error"
                type="password"
                label="Password"
                onChange={change}
                validate={validation.passwordValidation}
                showErrors={showErrors}
                locked={!editing}
            />
            <TextField
                nameField="confirm_password"
                type="password"
                label="Confirm Password"
                onChange={change}
                locked={!editing}
            />
        </StyledProfilePage >
    );
}

ProfilePage.propTypes = {

}

export default withRouter(ProfilePage);