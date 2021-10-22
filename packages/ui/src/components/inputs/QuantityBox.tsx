import { useCallback, useRef } from "react";
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
    value?: number;
    min_value?: number;
    max_value?: number;
    step?: number;
    valueFunc: (updatedValue: number) => any;
    errorFunc?: (errorMessage: string) => any;
    style?: {};
}

export const QuantityBox = ({
    label = 'Quantity',
    value = 0,
    min_value = -2097151,
    max_value = 2097151,
    step = 1,
    valueFunc,
    errorFunc = () => {},
    style,
    ...props
}: Props) => {
    const classes = useStyles();
    const id = makeID(5);
    // Time for a button press to become a hold
    const HOLD_DELAY = 250;
    // Time between hold increments
    const HOLD_INTERVAL = 50;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timer | null>(null);

    const updateValue = useCallback((quantity) => {
        if (quantity > max_value) quantity = max_value;
        if (quantity < min_value) quantity = min_value;
        valueFunc(quantity);
    }, [max_value, min_value, valueFunc])

    const startTouch = (tick: () => void) => timeoutRef.current = setTimeout(() => setInterval(tick, HOLD_INTERVAL), HOLD_DELAY);
    const startTouchMinus = useCallback(() => startTouch(() => updateValue((v: number) => Math.min(v + step, max_value))), [max_value, step, updateValue]);
    const startTouchPlus = useCallback(() => startTouch(() => updateValue((v: number) => v - step)), [step, updateValue]);

    const stopTouch = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }

    const clickMinus = useCallback(() => updateValue(value*1 - step), [step, updateValue, value]);
    const clickPlus = useCallback(() => updateValue(value*1 + step), [step, updateValue, value]);

    const inputChange = useCallback((e) => updateValue(e.target.value), [updateValue]);

    const preventDefault = useCallback((e) => e.preventDefault(), []);

    return (
        <div className={classes.root} style={style} {...props}>
            <IconButton
                className={`${classes.button} ${classes.minus}`}
                aria-label='minus'
                onClick={clickMinus}
                onTouchStart={startTouchMinus}
                onTouchEnd={stopTouch}
                onContextMenu={preventDefault}>
                <RemoveIcon />
            </IconButton>
            <FormControl className={classes.main}>
                <InputLabel htmlFor={`quantity-box-${id}`} className={classes.label}>{label}</InputLabel>
                <Input 
                    id={`quantity-box-${id}`} 
                    aria-describedby={`helper-text-${id}`} 
                    style={{color: 'black'}}
                    type="number"
                    inputProps={{ min: min_value, max: max_value }}
                    value={value}
                    onChange={inputChange}
                />
            </FormControl>
            <IconButton
                className={`${classes.button} ${classes.plus}`}
                aria-label='plus'
                onClick={clickPlus}
                onTouchStart={startTouchPlus}
                onTouchEnd={stopTouch}
                onContextMenu={preventDefault} >
                <AddIcon />
            </IconButton>
        </div>
    );
}