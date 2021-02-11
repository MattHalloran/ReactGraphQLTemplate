import { useState, useLayoutEffect, useEffect } from 'react';
import { StyledCartPage } from './CartPage.styled';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { getTheme, getCart } from 'utils/storage';
import { PubSub } from 'utils/pubsub';
import Button from 'components/Button/Button';
import { XIcon } from 'assets/img';
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';

function CartPage() {
    const [theme, setTheme] = useState(getTheme());
    const [cart, setCart] = useState(getCart());
    console.log('ON CART PAGEEE', cart);

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(cartSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })

    let all_total = 0;
    const cart_item_to_row = (data) => {
        let quantity = data.quantity;
        let price = parseInt(data.sku.price);
        let display_price;
        let display_total;
        if (isNaN(price)) {
            display_price = 'TBD';
            display_total = 'TBD';
            all_total = 'TBD';
        } else {
            display_price = `$${price}`;
            display_total = `$${quantity * price}`;
            if (typeof(all_total) === 'number') all_total += (quantity * price);
        }
        return (
            <tr>
                <td><div className="product-row">
                    <XIcon width="30px" height="30px" /> 
                    <img className="cart-image" src={`data:image/jpeg;base64,${data.sku.display_image}`} />
                    <p>{data.sku?.plant?.latin_name}</p>
                    </div></td>
                <td>{display_price}</td>
                <td><QuantityBox
                            className="quant"
                            min_value={0}
                            max_value={data.sku?.quantity ?? 100}
                            initial_value={1}
                            value={quantity}
                            valueFunc={() => console.log('TODOOOOOOOO')} /></td>
                <td>{display_total}</td>
            </tr>
        );
    }

    return (
        <StyledCartPage className="page" theme={theme}>
            <h1>Cart</h1>
            <table class="cart-table">
                <thead>
                    <tr>
                        <th style={{width: '50%'}}>Product</th>
                        <th style={{width: '10%'}}>Price</th>
                        <th style={{width: '20%'}}>Quantity</th>
                        <th style={{width: '20%'}}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {cart?.items?.map(c => cart_item_to_row(c))}
                </tbody>
            </table>
            <p>Total: {all_total}</p>
            <Button>Update Cart</Button>
            <Button>Finalize Order</Button>
        </StyledCartPage>
    );
}

CartPage.propTypes = {
    
}

export default CartPage;