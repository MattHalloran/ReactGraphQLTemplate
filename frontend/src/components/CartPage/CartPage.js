import React from 'react';
import { StyledCartPage } from './ContactPage.styled';

class CartPage extends React.Component {
    componentDidMount() {
        document.title = "Cart | New Life Nursery";
    }
    render() {
        return (
            <StyledCartPage></StyledCartPage>
        );
    }
}

CartPage.propTypes = {
    
}

export default CartPage;