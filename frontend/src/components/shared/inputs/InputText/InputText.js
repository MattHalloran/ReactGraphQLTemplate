import React, { useState, useLayoutEffect } from "react";
import PropTypes from 'prop-types';
import _ from 'lodash';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { createIndexedAccessTypeNode } from "typescript";

const useStyledInputText = makeStyles({
    root: {
        minHeight: '10vh',
        display: 'flex',
        marginBottom: '2vh',
        '& .MuiOutlinedInput-root': {
            display: 'flex',
        }
    },
  });

function InputText(props) {
    const [value, setValue] = useState(props.value ? props.value : null);
    const [error, setError] = useState(null);
    const classes = useStyledInputText();

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
                props.errorFunc(err, createIndexedAccessTypeNode);
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
        <TextField
            className={classes.root}
            variant="outlined"
            { ..._.omit(props, ['valueFunc', 'valueRef', 'errorFunc', 'errorRef', 'validate', 'showErrors']) }
            error={error && error.length > 0}
            helperText={error}
            onChange={(e) => props.index ? updateValue(e, props.index) : updateValue(e)}
        >{props.children}</TextField>
    );
}

// index - Index of textbox, if created with a map
// valueFunc - updater function for TextField value
// errorFunc - updater function for TextField error
// validate - a function for validating the input string
InputText.propTypes = {
    index: PropTypes.func,
    valueFunc: PropTypes.func,
    errorFunc: PropTypes.func,
    validate: PropTypes.func,
    showErrors: PropTypes.bool,
}

export default InputText;