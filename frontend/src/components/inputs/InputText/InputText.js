import { useState, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledInputText } from  './InputText.styled';
import makeID from 'utils/makeID';

function InputText({
    id = makeID(10),
    theme = getTheme(),
    index,
    label,
    value = '',
    valueFunc,
    error = '',
    errorFunc,
    validate,
    icon,
    showErrors,
    ...props
}) {
    const [valueState, setValueState] = useState(value);
    const [errorString, setErrorString] = useState(validate ? (error) : null);
    const idRef = useRef(id);
    const focused = useRef(false);

    if (!focused.current && value !== valueState) {
        setValueState(value);
    }

    useEffect(() => {
        // Only show an error if form submit was clicked, or if a value was entered
        if (validate && (showErrors || valueState)) {
            setErrorString(validate(valueState));
        }
    }, [valueState])


    const sendValueUpdate = () => {
        if (valueFunc) {
            if (index)
                valueFunc(valueState, index);
            else
                valueFunc(valueState);
        }
        if (errorFunc) {
            if (index)
                errorFunc(error, index);
            else
                errorFunc(error);
        }
    }

    const checkKey = (e) => {
        if (e.key === 'Enter') sendValueUpdate();
    }

    let displayed_label = props.label ?? '';
    if (errorString?.length > 0) {
        displayed_label += ' - ' + error;
    }

    return (
        <StyledInputText icon={props.icon} theme={theme}
            has_error={errorString?.length > 0}
            show_label={value?.length > 0}
            disabled={props.disabled ?? false}
            {...props}>
          <input
            id={idRef.current}
            type={props.type ?? "text"}
            value={valueState}
            placeholder={label}
            onChange={(e) => setValueState(e.target.value)}
            onKeyPress={checkKey}
            onFocus={() => focused.current = true}
            onBlurCapture={() => focused.current = false}
            onBlur={sendValueUpdate}
          />
          <label type={props.type ?? "text"} htmlFor={idRef.current}>
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