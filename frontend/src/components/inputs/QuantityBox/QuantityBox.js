import { useState, useRef } from "react";
import PropTypes from 'prop-types';
import { StyledQuantityBox } from './QuantityBox.styled';
import Button from 'components/Button/Button';

function QuantityBox({
    initial_value = 0,
    min_value = -2097151,
    max_value = 2097151,
    step = 1,
    valueFunc,
    errorFunc,
    validateFunc,
    ...props
}) {
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
        <StyledQuantityBox has_error={error?.length > 0} {...props}>
            <Button className="minus" 
                data-field="quantity" 
                onClick={() => updateValue(value - step)}
                onTouchStart={() => startTouch(false)}
                onTouchEnd={stopTouch}
                onContextMenu={(e) => e.preventDefault()}>-</Button>
            <input
                type="number"
                pattern="[0-9]*"
                step={step}
                min={min_value}
                max={max_value}
                value={value}
                className="quantity-field"
                onChange={(e) => updateValue(e.target.value)}/>
            <Button className="plus" 
                data-field="quantity" 
                onClick={() => updateValue(value + step)}
                onTouchStart={() => startTouch(true)}
                onTouchEnd={stopTouch}
                onContextMenu={(e) => e.preventDefault()}>+</Button>
        </StyledQuantityBox>
    );
}

QuantityBox.propTypes = {
    initial_value: PropTypes.number,
    min_value: PropTypes.number,
    max_value: PropTypes.number,
    step: PropTypes.number,
    valueFunc: PropTypes.func,
    errorFunc: PropTypes.func,
    validateFunc: PropTypes.func,
}

export default QuantityBox;