import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import * as validation from 'utils/validations';
import InputText from 'components/shared/inputs/InputText/InputText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { useHistoryState } from 'utils/useHistoryState';
import { PUBS, LINKS } from 'consts';

function SignUpForm() {
  let history = useHistory();
  const [name, setName] = useHistoryState("su_name", "");
  const [nameError, setNameError] = useHistoryState("su_name_error", null);
  const [email, setEmail] = useHistoryState("su_email", "");
  const [emailError, setEmailError] = useHistoryState("su_email_error", null);
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [existingCustomer, setExistingCustomer] = useHistoryState("su_existing", null);
  const [existingCustomerError, setExistingCustomerError] = useHistoryState("su_existing_error", null);
  const [showErrors, setShowErrors] = useState(false);

  const toLogin = () => {
    history.replace('/login');
  }

  const register = () => {
    PubSub.publish(PUBS.Loading, true);
    authQuery.registerUser(name, email, password, existingCustomer).then(() => {
      PubSub.publish(PUBS.Loading, false);
      history.push(LINKS.Profile);
    }).catch(error => {
      console.error(error);
      PubSub.publish(PUBS.Loading, false)
      alert(error.error);
    })
  }

  const submit = (event) => {
    event.preventDefault();
    setShowErrors(true);
    if (!nameError && !emailError && !passwordError && password === confirmPassword && !existingCustomerError) {
      register();
    }
  }

  const handleRadioSelect = (event) => {
    setExistingCustomer(event.target.value);
  }

  return (
    <React.Fragment>
      <InputText
        label="Name"
        type="text"
        value={name}
        valueFunc={setName}
        errorFunc={setNameError}
        validate={validation.nameValidation}
        showErrors={showErrors}
      />
      <InputText
        label="Email"
        type="email"
        value={email}
        valueFunc={setEmail}
        errorFunc={setEmailError}
        validate={validation.emailValidation}
        showErrors={showErrors}
      />
      <InputText
        label="Password"
        type="password"
        valueFunc={setPassword}
        errorFunc={setPasswordError}
        validate={validation.passwordValidation}
        showErrors={showErrors}
      />
      <InputText
        label="Confirm Password"
        type="password"
        valueFunc={setConfirmPassword}
      />
      <FormControl component="fieldset">
        <RadioGroup aria-label="existing-customer-check" name="existing-customer-check" value={existingCustomer} onChange={handleRadioSelect}>
          <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
          <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
        </RadioGroup>
        <FormHelperText>{existingCustomerError}</FormHelperText>
      </FormControl>
      <div className="form-group">
        <button className="primary submit" type="submit" onClick={submit}>
          Submit
     </button>
        <h5 className="form-header-text"
          onClick={toLogin}>&#8594;Log In</h5>
      </div>
    </React.Fragment>
  );
}

SignUpForm.propTypes = {

}

export default SignUpForm;