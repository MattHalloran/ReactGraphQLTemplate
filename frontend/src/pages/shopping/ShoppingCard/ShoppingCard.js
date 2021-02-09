import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledShoppingCard } from './ShoppingCard.styled';

function ShoppingCard({
    theme = getTheme(),
}) {
    return (
        <StyledShoppingCard theme={theme}>
            <h1>HELLO THERE</h1>
        </StyledShoppingCard >
    );
}

ShoppingCard.propTypes = {
    theme: PropTypes.object,
}

export default ShoppingCard;