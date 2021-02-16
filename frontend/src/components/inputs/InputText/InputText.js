import { useState, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledInputText } from  './InputText.styled';
import makeID from 'utils/makeID';

function InputText(props) {
    const theme = props.theme ?? getTheme();
    const [value, setValue] = useState(props.value ?? '');
    const [error, setError] = useState(props.validate ? (props.error ?? '') : null);
    const id = useRef(props.id ?? makeID(10));

    useEffect(() => {
        // Only show an error if form submit was clicked, or if a value was entered
        if (props.validate && (props.showErrors || value)) {
            setError(props.validate(value));
        }
    }, [value])


    const sendValueUpdate = () => {
        if (props.valueFunc) {
            if (props.index)
                props.valueFunc(value, props.index);
            else
                props.valueFunc(value)
        }
        if (props.errorFunc) {
            if (props.index)
                props.errorFunc(error, props.index);
            else
                props.errorFunc(error);
        }
    }

    let displayed_label = props.label ?? '';
    if (error?.length > 0) {
        displayed_label += ' - ' + error;
    }

    return (
        <StyledInputText icon={props.icon} theme={theme} has_error={error?.length > 0} show_label={value?.length > 0} disabled={props.disabled ?? false}>
          <input
            id={id.current}
            type={props.type ?? "text"}
            value={value}
            placeholder={props.label}
            onChange={(e) => setValue(e.target.value)}
            onBlur={sendValueUpdate}
          />
          <label type={props.type ?? "text"} htmlFor={id.current}>
            {displayed_label}
          </label>
        </StyledInputText>
      );
}

// index - Index of textbox, if created with a map
// valueFunc - updater function for TextField value
// errorFunc - updater function for TextField error
// validate - a function for validating the input string
InputText.propTypes = {
    id: PropTypes.string,
    theme: PropTypes.object,
    index: PropTypes.func,
    label: PropTypes.string,
    valueFunc: PropTypes.func,
    errorFunc: PropTypes.func,
    validate: PropTypes.func,
    icon: PropTypes.func, // TODO!!!
    showErrors: PropTypes.bool,
}

export default InputText;