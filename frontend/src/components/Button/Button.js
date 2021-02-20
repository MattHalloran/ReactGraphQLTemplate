import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledButton } from './Button.styled';

function Button({
    theme = getTheme(),
    value,
    children,
    ...props
}) {

    return (
        <StyledButton theme={theme} {...props}>{value ?? children}</StyledButton>
    );
}

Button.propTypes = {
    theme: PropTypes.object,
    value: PropTypes.string,
    children: PropTypes.any,
}

export default Button;