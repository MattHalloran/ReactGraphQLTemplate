import { useState, useRef } from "react";
import { FormControl, IconButton, Input, InputLabel, Theme } from '@material-ui/core';
import {
    Add as AddIcon,
    Remove as RemoveIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { makeID } from "utils";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
    },
    main: {
        background: theme.palette.primary.contrastText,
        width: '60%',
        height: '100%',
        display: 'grid',
        "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            display: "none",
     }
    },
    label: {
        color: 'grey',
        paddingTop: '10px',
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

interface Props {
    label?: string;
    initial_value?: number;
    min_value?: number;
    max_value?: number;
    step?: number;
    valueFunc: (updatedValue: number) => any;
    errorFunc: (errorMessage: string) => any;
}

export const QuantityBox = ({
    label = 'Quantity',
    initial_value = 0,
    min_value = -2097151,
    max_value = 2097151,
    step = 1,
    valueFunc = () => {},
    errorFunc = () => {},
    ...props
}: Props) => {
    const classes = useStyles();
    const id = makeID(5);
    const [value, setValue] = useState(initial_value ?? '');
    // Time for a button press to become a hold
    const HOLD_DELAY = 250;
    // Time between hold increments
    const HOLD_INTERVAL = 50;
    let holdTimeout = useRef<NodeJS.Timeout | null>(null);
    let holdInterval = useRef<NodeJS.Timer | null>(null);

    const updateValue = (quantity) => {
        if (quantity > max_value) quantity = max_value;
        if (quantity < min_value) quantity = min_value;
        setValue(quantity);
        valueFunc(quantity);
    }

    const incTick = () => {
        updateValue(v => Math.min(v + step, max_value));
    }

    const decTick = () => {
        updateValue(v => v - step);
    }

    const startTouch = (adding: boolean) => {
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
            <FormControl className={classes.main}>
                <InputLabel htmlFor={`quantity-box-${id}`} className={classes.label}>{label}</InputLabel>
                <Input 
                    id={`quantity-box-${id}`} 
                    aria-describedby={`helper-text-${id}`} 
                    style={{color: 'black'}}
                    variant="filled"
                    type="number"
                    inputProps={{ min: min_value, max: max_value }}
                    value={value}
                    onChange={(e) => updateValue(e.target.value)}
                />
            </FormControl>
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