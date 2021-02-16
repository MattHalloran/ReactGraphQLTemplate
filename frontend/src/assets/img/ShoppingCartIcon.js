//TODO code is messy because of cart item bubble. Clean it up

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PubSub } from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import { getCart } from 'utils/storage';

function ShoppingCartIcon(props) {
    const [cart, setCart] = useState(getCart());

    useEffect(() => {
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        return (() => {
            PubSub.unsubscribe(cartSub);
        })
    }, [])

    let cart_bubble;
    if (cart?.items?.length > 0) {
        cart_bubble = <div style={{position: 'absolute',
                        border:'1px solid darkred',
                        borderRadius:'50px', 
                        backgroundColor:'red',
                        fontWeight:'bold',
                        width: '20px',
                        height: '20px',
                        textAlign: 'center',
                        right: '-10px'}}>{cart.items.length}</div>
    }

    return (
        <div style={{position: 'relative'}}>
            {cart_bubble}
            <svg xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className={props.className}
                style={{stroke: 'none', fill: '#F4F3EE'}}
                aria-labelledby="title"
                width={props.width}
                height={props.height}
                onClick={() => typeof props.onClick === 'function' && props.onClick()}>
                <title id="title">{props.iconTitle ?? 'My Cart'}</title>
                <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l.5 2H5V5H3.14zM6 5v2h2V5H6zm3 0v2h2V5H9zm3 0v2h1.36l.5-2H12zm1.11 3H12v2h.61l.5-2zM11 8H9v2h2V8zM8 8H6v2h2V8zM5 8H3.89l.5 2H5V8zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
            </svg>
        </div>
    )
}

ShoppingCartIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export default ShoppingCartIcon;