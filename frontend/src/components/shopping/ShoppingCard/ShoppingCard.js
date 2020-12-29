import React from 'react'
import { StyledShoppingCard } from './ShoppingCard.styled';

class ShoppingCard extends React.Component {
    render() {
        return (
            <StyledShoppingCard>
                <h1>HELLO THERE</h1>
            </StyledShoppingCard >
        );
    }
}

ShoppingCard.propTypes = {
    
}

export default ShoppingCard;