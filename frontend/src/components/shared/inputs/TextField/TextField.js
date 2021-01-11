import React, { useState, useEffect, useLayoutEffect } from "react";
import PropTypes from 'prop-types';
import { StyledTextField } from "./TextField.styled";

function TextField(props) {
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);
    const [has_error, setHasError] = useState(false);
    const [ever_active, setEverActive] = useState(false);
    let [active, setActive] = useState(false);

    useLayoutEffect(() => {
        if (props.validate) updateError(value);
    })

    useEffect(() => {
        if (active) setEverActive(true);
    }, [active])

    const updateError = (value) => {
        function checkError(error) {
            if (props.showErrors && error) return true;
            if (!ever_active) return false;
            return error;
        }
        let err = props.validate(value);
        props.onChange(props.errorField, err);
        setError(err);
        setHasError(checkError(err))
    }

    const updateValue = (event) => {
        let e_value = event.target.value;
        setValue(e_value);
        props.onChange(props.nameField, e_value);
    }

    return (
        <StyledTextField large_placeholder={(value === null || value.length === 0) && !active} 
                         has_error={has_error} 
                         locked={props.locked}>
            <input
                name={props.nameField}
                type={props.type}
                autoComplete={props.autocomplete ?? 'auto'}
                onChange={updateValue}
                onFocus={() => !props.locked && setActive(true)}
                onBlur={() => !props.locked && setActive(false)}
                readOnly={props.locked}
            />
            <label className="text-label">{props.label}</label>
            <label className="error-label">{error}</label>
        </StyledTextField>
    );
}

TextField.propTypes = {
    nameField: PropTypes.string.isRequired,
    errorField: PropTypes.string,
    type: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    locked: PropTypes.bool,
    validate: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    showErrors: PropTypes.bool,
}

export default TextField;