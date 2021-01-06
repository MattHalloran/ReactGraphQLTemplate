import React from 'react'
import { StyledProfilePage } from './ProfilePage.styled';
import { withRouter } from "react-router";
import TextField from 'components/shared/inputs/TextField';

class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: this.props.match.params['edit'] === 'editing',
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
        }
    }

    componentDidMount() {
        document.title = "Profile | New Life Nursery";
    }

    change = e => {
        console.log('IN CHANGEEEEE', e.target, this.state.email);
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        return (
            <StyledProfilePage>
                <div id="profile-image-div">
                </div>
                <TextField
                    name="first_name"
                    type="text"
                    label="First Name"
                    autocomplete="John"
                    locked={!this.state.editing}
                    value={this.state.first_name}
                    onChange={e => this.change(e)}
                    error={this.state.first_name_error}
                />
                <TextField
                    name="last_name"
                    type="text"
                    label="Last Name"
                    autocomplete="Doe"
                    locked={!this.state.editing}
                    value={this.state.last_name}
                    onChange={e => this.change(e)}
                    error={this.state.last_name_error}
                />
                <TextField
                    name="email"
                    type="email"
                    label="Email"
                    autocomplete="john.doe@gmail.com"
                    locked={!this.state.editing}
                    value={this.state.email}
                    onChange={e => this.change(e)}
                    error={this.state.email_error}
                />
                <TextField
                    name="phone"
                    type="text"
                    label="Phone Number"
                    autocomplete="555-867-5309"
                    locked={!this.state.editing}
                    value={this.state.phone}
                    onChange={e => this.change(e)}
                    error={this.state.phone_error}
                />
                <TextField
                    name="address"
                    type="text"
                    label="Delivery Address"
                    autocomplete="123 Fake Street Philadelphia PA"
                    locked={!this.state.editing}
                    value={this.state.address}
                    onChange={e => this.change(e)}
                    error={this.state.address_error}
                />
                <TextField
                    name="password"
                    type="password"
                    label="Password"
                    autocomplete="hunter123"
                    locked={!this.state.editing}
                    value={this.state.password}
                    onChange={e => this.change(e)}
                    error={this.state.password_error}
                />
                <TextField
                    name="confirm_password"
                    type="password"
                    label="Confirm Password"
                    autocomplete="hunter123"
                    locked={!this.state.editing}
                    value={this.state.confirm_password}
                    onChange={e => this.change(e)}
                    error={this.state.confirm_password_error}
                />
            </StyledProfilePage >
        );
    }
}

ProfilePage.propTypes = {

}

export default withRouter(ProfilePage);