import PropTypes from 'prop-types';
import { StyledButton } from './Button.styled';

function Button({
    value,
    children,
    ...props
}) {

    return (
        <StyledButton {...props}>{value ?? children}</StyledButton>
    );
}

Button.propTypes = {
    theme: PropTypes.object,
    value: PropTypes.string,
    children: PropTypes.any,
}

export default Button;