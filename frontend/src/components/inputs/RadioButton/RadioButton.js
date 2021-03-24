import PropTypes from 'prop-types';
import { StyledRadioButton } from './RadioButton.styled';

function RadioButton({
    id,
    name,
    value,
    label,
    onChange,
    ...props
}) {

    return (
        <StyledRadioButton {...props}>
            <input type="radio" id={id} name={name} value="male" onChange={onChange} />
            <label for={name}>{label}</label>
        </StyledRadioButton>
    )
}

RadioButton.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.string,
}

export default RadioButton;