import React, { useState, useRef } from "react";
import PropTypes from 'prop-types';
import { IconButton, TextField } from '@material-ui/core';
import {
    Add as AddIcon,
    Remove as RemoveIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    main: {
        background: theme.palette.primary.contrastText,
        width: '60%',
        "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            display: "none",
     }
    },
    button: {
        minWidth: 30,
        width: '20%',
        background: theme.palette.secondary.main,
        '&:hover': {
            background: theme.palette.secondary.dark,
        }
    },
    minus: {
        borderRadius: '5px 0 0 5px',
    },
    plus: {
        borderRadius: '0 5px 5px 0',
    },
}));

function QuantityBox({
    label = 'Quantity',
    initial_value = 0,
    min_value = -2097151,
    max_value = 2097151,
    step = 1,
    valueFunc,
    errorFunc,
    validateFunc,
    ...props
}) {
    const classes = useStyles();
    const [value, setValue] = useState(initial_value ?? '');
    // Time for a button press to become a hold
    const HOLD_DELAY = 250;
    // Time between hold increments
    const HOLD_INTERVAL = 50;
    let holdTimeout = useRef(null);
    let holdInterval = useRef(null);
    let error = null;

    if (validateFunc) {
        error = validateFunc(value);
        if (errorFunc) errorFunc(error);
    }

    const updateValue = (quantity) => {
        if (quantity > max_value) quantity = max_value;
        if (quantity < min_value) quantity = min_value;
        setValue(quantity);
        if (valueFunc) valueFunc(quantity);
    }

    const incTick = () => {
        updateValue(v => Math.min(v + step, max_value));
    }

    const decTick = () => {
        updateValue(v => v - step);
    }

    const startTouch = (adding) => {
        holdTimeout.current = setTimeout(() => {
            if (adding)
                holdInterval.current = setInterval(incTick, HOLD_INTERVAL);
            else
                holdInterval.current = setInterval(decTick, HOLD_INTERVAL);
        }, HOLD_DELAY)
    }

    const stopTouch = () => {
        clearTimeout(holdTimeout.current);
        clearInterval(holdInterval.current);
    }

    return (
        <div className={classes.root} {...props}>
            <IconButton
                className={`${classes.button} ${classes.minus}`}
                aria-label='minus'
                onClick={() => updateValue(value*1 - step)}
                onTouchStart={() => startTouch(false)}
                onTouchEnd={stopTouch}
                onContextMenu={(e) => e.preventDefault()}>
                <RemoveIcon />
            </IconButton>
            <TextField
                className={classes.main}
                type="number"
                variant="filled"
                size="small"
                inputProps={{ min: min_value, max: max_value }}
                label={label}
                value={value}
                onChange={(e) => updateValue(e.target.value)}
            />
            <IconButton
                className={`${classes.button} ${classes.plus}`}
                aria-label='plus'
                onClick={() => updateValue(value*1 + step)}
                onTouchStart={() => startTouch(true)}
                onTouchEnd={stopTouch}
                onContextMenu={(e) => e.preventDefault()} >
                <AddIcon />
            </IconButton>
        </div>
    );
}

QuantityBox.propTypes = {
    label: PropTypes.number,
    initial_value: PropTypes.number,
    min_value: PropTypes.number,
    max_value: PropTypes.number,
    step: PropTypes.number,
    valueFunc: PropTypes.func,
    errorFunc: PropTypes.func,
    validateFunc: PropTypes.func,
}

export { QuantityBox };