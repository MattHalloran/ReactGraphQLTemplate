import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import PubSub from 'utils/pubsub';
import { resetPasswordRequest } from 'query/http_promises';
import * as validation from 'utils/validations';
import InputText from 'components/shared/inputs/InputText/InputText';
import { PUBS } from 'consts';
import Button from 'components/shared/Button/Button';

function ForgotPasswordForm() {
    let history = useHistory();
    const [email, setEmail] = useHistoryState("fp_email", "");
    const [emailError, setEmailError] = useHistoryState("fp_email", "");
    const [showErrors, setShowErrors] = useState(false);

    const forgotPassword = () => {
        PubSub.publish(PUBS.Loading, true);
        resetPasswordRequest(email).then(() => {
            PubSub.publish(PUBS.Loading, false);
            history.replace('/');
        }).catch(error => {
            console.error(error);
            PubSub.publish(PUBS.Loading, false);
        })
    }

    const submit = (event) => {
        event.preventDefault();
        setShowErrors(true);
        if (!emailError) {
            forgotPassword();
        }
    }

    return (
        <React.Fragment>
            <InputText
                label="Email"
                type="email"
                value={email}
                valueFunc={setEmail}
                errorFunc={setEmailError}
                validate={validation.emailValidation}
                showErrors={showErrors}
            />
            <div className="form-group">
                <Button className="primary submit" type="submit" onClick={submit}>
                    Submit
                </Button>
            </div>
        </React.Fragment>
    );
}

ForgotPasswordForm.propTypes = {
    
}

export default ForgotPasswordForm;