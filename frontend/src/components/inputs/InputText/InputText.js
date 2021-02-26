import { useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledInputText } from  './InputText.styled';
import makeID from 'utils/makeID';

function InputText({
    id = makeID(10),
    theme = getTheme(),
    type = 'text',
    index,
    label,
    value = '',
    valueFunc,
    error = '',
    errorFunc,
    validate,
    icon,
    showErrors,
    disabled = false,
    ...props
}) {
    const idRef = useRef(id);

    useEffect(() => {
        sendValueUpdate(value);
    }, [])

    const sendValueUpdate = (value) => {
        if (valueFunc) {
            if (index)
                valueFunc(value, index);
            else
                valueFunc(value);
        }
        if (validate && errorFunc) {
            let error = validate(value);
            if (index)
                errorFunc(error, index);
            else
                errorFunc(error);
        }
    }

    let displayed_label = label ?? '';
    if (error?.length > 0) {
        displayed_label += ' - ' + error;
    }

    return (
        <StyledInputText icon={icon} theme={theme}
            has_error={error?.length > 0}
            show_label={showErrors || value?.length > 0}
            disabled={disabled}
            {...props}>
          <input
            id={idRef.current}
            type={type}
            value={value}
            placeholder={label}
            onChange={(e) => sendValueUpdate(e.target.value)}
          />
          <label type={type} htmlFor={idRef.current}>
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
    disabled: PropTypes.bool,
}

export default InputText;