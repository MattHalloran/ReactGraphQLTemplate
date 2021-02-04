import PropTypes from 'prop-types';
import { getTheme } from 'storage';
import { StyledButton } from './Button.styled';

function Button(props) {
    const theme = props.theme ?? getTheme();

    return (
        <StyledButton theme={theme} {...props}>{props.children}</StyledButton>
    );
}

Button.propTypes = {
    theme: PropTypes.object,
}

export default Button;