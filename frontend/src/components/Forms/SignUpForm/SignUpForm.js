import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import TextField from 'components/shared/inputs/TextField';
import { StyledSignUpForm } from './SignUpForm.styled';
import { getTheme } from 'theme';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.toLogin = this.toLogin.bind(this);
    this.handleRadioSelect = this.handleRadioSelect.bind(this);
    this.state = {
      name: "",
      nameError: "",
      email: "",
      emailError: "",
      password: "",
      passwordError: "",
      confirmPassword: "",
      existingCustomer: null,
      existingCustomerError: "",
    }
  }

  componentDidMount() {
    let theme = getTheme();
    this.setState({ textFieldTheme: { color: theme.textSecondary } });
    this.themeSub = PubSub.subscribe('theme', (_, data) => {
      this.setState({ textFieldTheme: { color: data.textSecondary } });
    });
  }

  toLogin() {
    this.props.history.replace('/login');
  }

  register() {
    PubSub.publish('loading', true);
    let existing_customer_bool = this.state.existingCustomer === "true"
    authQuery.registerUser(this.state.name, this.state.email, this.state.password, existing_customer_bool).then(response => {
      console.log('woohoo registered!!!');
      console.log(response);
      PubSub.publish('loading', false);
      this.props.history.push('/profile');
    }).catch(error => {
      console.error(error);
      PubSub.publish('loading', false)
      alert(error.error);
    })
  }
  submit(event) {
    event.preventDefault();
    if (this.validate()) {
      this.register();
    }
  }
  handleRadioSelect(event) {
    this.setState({ existingCustomer: event.target.value });
    console.log(this.state, event.target.value);
  }
  change = e => {
    this.setState({ [e.target.name]: e.target.value });
  }
  validate() {
    let isError = false;
    const errors = {
      nameError: "",
      emailError: "",
      passwordError: "",
      existingCustomerError: "",
    }

    if (this.state.name === "") {
      isError = true;
      errors.nameError = "Name cannot be blank";
    }

    if (this.state.email.indexOf("@") === -1) {
      isError = true;
      errors.emailError = "Requires valid email"
    }

    if (this.state.password !== this.state.confirmPassword) {
      isError = true;
      errors.passwordError = "Passwords do not match"
    }

    if (this.state.password.length < 8) {
      isError = true;
      errors.passwordError = "Password must be at least 8 characters long"
    }

    if (this.state.existingCustomer === null) {
      isError = true;
      errors.existingCustomerError = "Please make a selection"
    }

    this.setState({
      ...this.state,
      ...errors
    });

    return !isError
  }
  render() {
    return (
      <StyledSignUpForm onSubmit={this.props.onSubmit}>
        <div className="form-header">
          <h1 className="form-header-text">Sign Up</h1>
          <h5 className="form-header-text"
            onClick={this.toLogin}>&#8594;Log In</h5>
        </div>
        <div className="form-body">
          <TextField
            name="name"
            type="text"
            label="Name"
            autocomplete="name"
            value={this.state.name}
            onChange={e => this.change(e)}
            error={this.state.nameError}
          />
          <TextField
            name="email"
            type="email"
            label="Email"
            autocomplete="username"
            value={this.state.email}
            onChange={e => this.change(e)}
            error={this.state.emailError}
          />
          <TextField
            name="password"
            type="password"
            label="Password"
            autocomplete="password"
            value={this.state.password}
            onChange={e => this.change(e)}
            error={this.state.passwordError}
          />
          <TextField
            name="comfirmPassword"
            type="password"
            label="Confirm Password"
            autocomplete="password"
            value={this.state.confirmPassword}
            onChange={e => this.change(e)}
            error={false}
          />
          <FormControl component="fieldset">
            <RadioGroup aria-label="existing-customer-check" name="existing-customer-check" value={this.state.existingCustomer} onChange={this.handleRadioSelect}>
              <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
              <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
            </RadioGroup>
            <FormHelperText>{this.state.existingCustomerError}</FormHelperText>
          </FormControl>
          <div className="form-group">
            <button className="primary submit" type="submit" onClick={this.submit}>
              Submit
     </button>
          </div>
        </div>
      </StyledSignUpForm>
    );
  }
}

SignUpForm.propTypes = {
  onSubmit: PropTypes.func,
  history: PropTypes.object,
}

export default withRouter(SignUpForm);