import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledCheckBox } from './CheckBox.styled';
import { getTheme } from 'storage';

function CheckBox(props) {
    const theme = props.theme ?? getTheme();

    return (
        <StyledCheckBox theme={theme}>
            <div className="border" onClick={() => props.onChange(props.group, props.value ?? props.label, !props.checked)}>
                <div className={`indicator ${props.checked ? "checked" : ""}`}/>
            </div>
            <div className="label">{props.label}</div>
        </StyledCheckBox>
    )
}

CheckBox.propTypes = {
    // The group this checkbox belongs to
    group: PropTypes.string,
    // What the user sees
    label: PropTypes.string.isRequired,
    // What the checkbox's value is (usually its index in the checkbox's group)
    value: PropTypes.any,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    theme: PropTypes.object,
}

export default CheckBox;