import PropTypes from 'prop-types';
import { StyledRadioButton } from './RadioButton.styled';
import { getTheme } from 'utils/storage';

function RadioButton({
    theme=getTheme(),
    id,
    name,
    value,
    label,
    onChange,
    ...props
}) {

    return (
        <StyledRadioButton theme={theme} {...props}>
            <input type="radio" id={id} name={name} value="male" onChange={onChange} />
            <label for={name}>{label}</label>
        </StyledRadioButton>
    )
}

RadioButton.propTypes = {
    theme: PropTypes.object,
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.string,
}

export default RadioButton;