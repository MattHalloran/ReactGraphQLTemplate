import PropTypes from 'prop-types';
import { StyledCheckBox } from './CheckBox.styled';

function CheckBox({
    group = '',
    label = '',
    value = '',
    checked = false,
    onChange,
    ...props
}) {

    return (
        <StyledCheckBox {...props}>
            <div className="border" onClick={() => onChange(group, value ?? label, !checked)}>
                <div className={`indicator ${checked ? "checked" : ""}`}/>
            </div>
            <div className="label">{label}</div>
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
}

export default CheckBox;