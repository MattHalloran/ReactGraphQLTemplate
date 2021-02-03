import React, { useState, useLayoutEffect } from "react";
import PropTypes from 'prop-types';
import { getTheme } from 'storage';
import { StyledInputText } from  './InputText.styled';

function InputText(props) {
    let theme = props.theme ?? getTheme();
    const [value, setValue] = useState(props.value ? props.value : null);
    const [error, setError] = useState(null);

    useLayoutEffect(() => {
        if (props.validate) {
            if (props.index)
                updateError(value, props.index);
            else
                updateError(value);
        }
    })

    const updateError = (value) => {
        let err;
        // Only show an error if form submit was clicked, or if a value was entered
        if (props.validate && (props.showErrors || value)) {
            err = props.validate(value);
        }
        if (props.errorFunc) {
            if (props.index)
                props.errorFunc(err, props.index);
            else
                props.errorFunc(err);
        } 
        setError(err);
    }

    const updateValue = (event) => {
        let e_value = event.target.value;
        setValue(e_value);
        if (props.valueFunc) {
            if (props.index)
                props.valueFunc(e_value, props.index);
            else
                props.valueFunc(e_value)
        }
    }

    return (
        <StyledInputText icon={props.icon} theme={theme}>
          <input
            type={props.type ?? "text"}
            value={value}
            placeholder={props.label}
            onChange={(e) => props.index ? updateValue(e, props.index) : updateValue(e)}
          />
          <label htmlFor={1} className={error && "error"}>
            {error || props.label}
          </label>
        </StyledInputText>
      );
}

// index - Index of textbox, if created with a map
// valueFunc - updater function for TextField value
// errorFunc - updater function for TextField error
// validate - a function for validating the input string
InputText.propTypes = {
    theme: PropTypes.object,
    index: PropTypes.func,
    label: PropTypes.string,
    valueFunc: PropTypes.func,
    errorFunc: PropTypes.func,
    validate: PropTypes.func,
    icon: PropTypes.func, // TODO!!!
    showErrors: PropTypes.bool,
    locked: PropTypes.bool,
}

export default InputText;