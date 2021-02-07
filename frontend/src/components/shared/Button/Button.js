import PropTypes from 'prop-types';
import { getTheme } from 'storage';
import { StyledButton } from './Button.styled';

function Button({
    theme = getTheme(),
    children,
    ...props
}) {

    return (
        <StyledButton theme={theme} {...props}>{children}</StyledButton>
    );
}

Button.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.any,
}

export default Button;