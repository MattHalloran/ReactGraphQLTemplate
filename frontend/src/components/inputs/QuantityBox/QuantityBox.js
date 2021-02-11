import { useState } from "react";
import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledQuantityBox } from './QuantityBox.styled';
import Button from 'components/Button/Button';

function QuantityBox({
    initial_value = 0,
    min_value,
    max_value,
    step = 1,
    valueFunc,
    errorFunc,
    validateFunc,
    ...props
}) {
    const [theme, setTheme] = useState(getTheme());
    const [value, setValue] = useState(initial_value ?? '');
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

    return (
        <StyledQuantityBox theme={theme} has_error={error?.length > 0} {...props}>
            <Button className="minus" data-field="quantity" onClick={() => updateValue(value - step)}>-</Button>
            <input
                type="number" 
                step={step} 
                min={min_value} 
                max={max_value} 
                value={value}
                className="quantity-field" 
                onChange={(e) => updateValue(e.target.value)}/>
            <Button className="plus" data-field="quantity" onClick={() => updateValue(value + step)}>+</Button>
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