import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import * as validation from 'utils/validations';
import TextField from 'components/shared/inputs/TextField/TextField';
import { StyledSignUpForm } from './SignUpForm.styled';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

function SignUpForm(props) {
  let history = useHistory();
  let ref = useRef({
    name: "",
    nameError: "",
    email: "",
    emailError: "",
    password: "",
    passwordError: "",
    confirmPassword: "",
    existingCustomer: null,
    existingCustomerError: "",
  })
  const [showErrors, setShowErrors] = useState(false);

  const toLogin = () => {
    history.replace('/login');
  }

  const register = () => {
    PubSub.publish('loading', true);
    let existing_customer_bool = ref.current.existingCustomer === "true";
    authQuery.registerUser(ref.current.name, ref.current.email, ref.current.password, existing_customer_bool).then(response => {
      console.log('woohoo registered!!!');
      console.log(response);
      PubSub.publish('loading', false);
      history.push('/profile');
    }).catch(error => {
      console.error(error);
      PubSub.publish('loading', false)
      alert(error.error);
    })
  }

  const submit = (event) => {
    event.preventDefault();
    setShowErrors(true);
    if (!ref.current.nameError && !ref.current.emailError && !ref.current.passwordError) {
      register();
    }
  }

  const handleRadioSelect = (event) => {
    ref.current.existingCustomer = event.target.value;
  }

  const change = (name, value) => {
    ref.current[name] = value;
  }

  return (
    <StyledSignUpForm onSubmit={props.onSubmit}>
      <div className="form-header">
        <h1 className="form-header-text">Sign Up</h1>
        <h5 className="form-header-text"
          onClick={toLogin}>&#8594;Log In</h5>
      </div>
      <div className="form-body">
        <TextField
          nameField="name"
          errorField="nameError"
          type="text"
          label="Name"
          onChange={change}
          validate={validation.nameValidation}
          showErrors={showErrors}
        />
        <TextField
          nameField="email"
          errorField="emailError"
          type="email"
          label="Email"
          autocomplete="username"
          onChange={change}
          validate={validation.emailValidation}
          showErrors={showErrors}
        />
        <TextField
          nameField="password"
          errorField="passwordError"
          type="password"
          label="Password"
          autocomplete="password"
          onChange={change}
          validate={validation.passwordValidation}
          showErrors={showErrors}
        />
        <TextField
          nameField="confirmPassword"
          type="password"
          label="Confirm Password"
          onChange={change}
        />
        <FormControl component="fieldset">
          <RadioGroup aria-label="existing-customer-check" name="existing-customer-check" value={ref.current.existingCustomer} onChange={handleRadioSelect}>
            <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
            <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
          </RadioGroup>
          <FormHelperText>{ref.current.existingCustomerError}</FormHelperText>
        </FormControl>
        <div className="form-group">
          <button className="primary submit" type="submit" onClick={submit}>
            Submit
     </button>
        </div>
      </div>
    </StyledSignUpForm>
  );
}

SignUpForm.propTypes = {
  onSubmit: PropTypes.func,
}

export default SignUpForm;