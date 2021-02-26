import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registerUser } from 'query/http_promises';
import * as validation from 'utils/validations';
import InputText from 'components/inputs/InputText/InputText';
import { useHistoryState } from 'utils/useHistoryState';
import { LINKS, DEFAULT_PRONOUNS } from 'utils/consts';
import Button from 'components/Button/Button';

function AddEmployeeForm() {
  let history = useHistory();
  const [firstName, setFirstName] = useHistoryState("su_first_name", "");
  const [firstNameError, setFirstNameError] = useHistoryState("su_first_name_error", null);
  const [lastName, setLastName] = useHistoryState("su_last_name", "");
  const [lastNameError, setLastNameError] = useHistoryState("su_last_name_error", null);
  const [pronouns, setPronouns] = useHistoryState("su_pronoun", DEFAULT_PRONOUNS[3]);
  const [pronounsError, setPronounsError] = useHistoryState("su_pronoun_error", null);
  const [customPronouns, setCustomPronouns] = useHistoryState("su_custom_pronoun", "");
  const [customPronounsError, setCustomPronounsError] = useHistoryState("su_custom_pronoun_error", null);
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
    registerUser(firstName, lastName, pronouns, email, password, existingCustomer).then(() => {
      history.push(LINKS.Shopping);
    }).catch(err => {
      console.error(err);
      alert(err.msg);
    })
  }

  const submit = (event) => {
    event.preventDefault();
    setShowErrors(true);
    console.log('PRONOUNSSSS', pronouns, pronounsError);
    return;
    if (validation.passedValidation(firstNameError, lastNameError, pronounsError, emailError,
    passwordError, existingCustomerError) && password === confirmPassword) {
      register();
    }
  }

  const handleRadioSelect = (event) => {
    setExistingCustomer(event.target.value);
  }

  return (
    <React.Fragment>
      <div className="horizontal-input-container">
        <InputText
          label="First Name"
          type="text"
          value={firstName}
          valueFunc={setFirstName}
          error={firstNameError}
          errorFunc={setFirstNameError}
          validate={validation.firstNameValidation}
          showErrors={showErrors}
        />
        <InputText
          label="Last Name"
          type="text"
          value={lastName}
          valueFunc={setLastName}
          error={lastNameError}
          errorFunc={setLastNameError}
          validate={validation.lastNameValidation}
          showErrors={showErrors}
        />
      </div>
      <div className="horizontal-input-container">
        <InputText
          label="Pronouns"
          value={pronouns}
          valueFunc={setPronouns}
          select
          SelectProps={{
            native: true,
          }} >
          {DEFAULT_PRONOUNS.map((pro) => (
            <option key={pro} value={pro}>
              {pro}
            </option>
          ))}
        </InputText>
        {pronouns === DEFAULT_PRONOUNS[0] ?
          <InputText
            label="Enter pronouns"
            type="text"
            value={customPronouns}
            valueFunc={setCustomPronouns}
            error={customPronounsError}
            errorFunc={setCustomPronounsError}
            validate={validation.pronounValidation}
            showErrors={showErrors}
          />
          : null}
      </div>
      <InputText
        label="Email"
        type="email"
        value={email}
        valueFunc={setEmail}
        error={emailError}
        errorFunc={setEmailError}
        validate={validation.emailValidation}
        showErrors={showErrors}
      />
      <InputText
        label="Password"
        type="password"
        value={password}
        valueFunc={setPassword}
        error={passwordError}
        errorFunc={setPasswordError}
        validate={validation.passwordValidation}
        showErrors={showErrors}
      />
      <InputText
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        valueFunc={setConfirmPassword}
      />
      <div className="form-group">
        <Button className="primary submit" type="submit" onClick={submit}>Submit</Button>
        <h5 className="form-header-text"
          onClick={toLogin}>&#8594;Log In</h5>
      </div>
    </React.Fragment>
  );
}

AddEmployeeForm.propTypes = {

}

export default AddEmployeeForm;