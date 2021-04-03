import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { getImages } from 'query/http_promises';
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
import { displayPrice } from 'utils/displayPrice';
import { NoImageIcon } from 'assets/img';
import { IconButton, Typography } from '@material-ui/core';
import { deleteArrayIndex } from 'utils/arrayTools';
import { updateObject } from 'utils/objectTools';
import CloseIcon from '@material-ui/icons/Close';
import { Paper, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DatePicker from '@material-ui/lab/DatePicker';
import Selector from 'components/inputs/Selector/Selector';
import AlertDialog from 'components/AlertDialog/AlertDialog';
import _ from 'underscore';
import PubSub from 'utils/pubsub';

const useStyles = makeStyles((theme) => ({
    tablePaper: {
        background: theme.palette.background.paper,
    },
    tableIcon: {
        color: theme.palette.primary.contrastText,
    },
    tableHead: {
        background: theme.palette.primary.main,
    },
    tableCol: {
        verticalAlign: 'middle',
        '& > *': {
            height: 'fit-content',
            color: theme.palette.primary.contrastText
        }
    }
}));

const DELIVERY_OPTIONS = [
    {
        label: 'Pickup',
        value: 0,
    },
    {
        label: 'Delivery',
        value: 1,
    },
]

function Cart({
    cart,
    onUpdate,
    ...props
}) {
    const classes = useStyles();
    const [cartState, setCartState] = useState({
        ...cart,
        items: cart?.items ?? [],
        is_delivery: cart?.is_delivery ?? true,
        desired_delivery_date: cart?.desired_delivery_date ?? +(new Date()),
        special_instructions: cart?.special_instructions,
    })
    // Thumbnail data for every SKU
    const [thumbnails, setThumbnails] = useState([]);
    let all_total = cartState.items.map(i => i.sku.price*i.quantity).reduce((a, b) => (a*1)+b, 0);

    useEffect(() => {
        onUpdate(cartState);
    }, [cartState, onUpdate])

    useEffect(() => {
        if (!cart) return;
        let ids = cart.items.map(it => it.sku.plant.display_id);
        getImages(ids, 'm').then(response => {
            setThumbnails(response.images);
        }).catch(err => {
            console.error(err);
        });
    }, [cart])

    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME.Short}`;
    })

    const setNotes = useCallback((notes) => {
        setCartState(c => updateObject(c, 'special_instructions', notes));
    }, [])

    const setDeliveryDate = useCallback((date) => {
        setCartState(c => updateObject(c, 'desired_delivery_date', +date));
    }, [])

    const handleDeliveryChange = useCallback((value) => {
        setCartState(c => updateObject(c, 'is_delivery', value));
    }, [])

    const updateItemQuantity = useCallback((sku, quantity) => {
        let index = cartState.items.findIndex(i => i.sku.sku === sku);
        if (index < 0 || index >= (cartState.items.length)) {
            PubSub.publish(PUBS.Snack, {message: 'Failed to update item quantity', severity: 'error'});
            console.log(index);
            return;
        }
        let cart_copy = { ...cartState };
        cart_copy.items[index].quantity = quantity;
        setCartState(cart_copy);
    }, [cartState])

    const deleteCartItem = useCallback((sku) => {
        let index = cartState.items.findIndex(i => i.sku.sku === sku.sku);
        if (index < 0) {
            PubSub.publish(PUBS.Snack, {message: `Failed to remove item for ${sku.sku}`, severity: 'error'});
            return;
        }
        setThumbnails(deleteArrayIndex(thumbnails, index));
        let changed_item_list = deleteArrayIndex(cartState.items, index);
        setCartState(updateObject(cartState, 'items', changed_item_list));
    }, [thumbnails, cartState])

    const cart_item_to_row = useCallback((data, key) => {
        let index = cartState.items.findIndex(i => i.sku.sku === data.sku.sku);
        let thumbnail;
        if (index >= 0 && index < thumbnails.length)
            thumbnail = thumbnails[index];
        let quantity = data.quantity;
        let price = parseInt(data.sku.price);
        let display_price;
        let display_total;
        let display_image;
        if (isNaN(price)) {
            display_price = 'TBD';
            display_total = 'TBD';
        } else {
            display_price = displayPrice(price);
            display_total = displayPrice(quantity * price);
        }
        if (thumbnail) {
            display_image = <img src={`data:image/jpeg;base64,${thumbnail}`} className="cart-image" alt="TODO" />
        } else {
            display_image = <NoImageIcon className="cart-image" />
        }

        return (
            <TableRow key={key}>
                <TableCell padding="checkbox">
                    <IconButton onClick={() => deleteCartItem(data.sku)}>
                        <CloseIcon />
                    </IconButton>
                </TableCell>
                <TableCell className={classes.tableCol} component="th" scope="row">
                    {display_image}
                    <Typography component="body2">{data.sku?.plant?.latin_name}</Typography>
                </TableCell>
                <TableCell className={classes.tableCol} align="right">{display_price}</TableCell>
                <TableCell className={classes.tableCol} align="right">
                    <QuantityBox
                        min_value={0}
                        max_value={data.sku?.quantity ?? 100}
                        initial_value={quantity}
                        valueFunc={(q) => updateItemQuantity(data.sku.sku, q)} />
                </TableCell>
                <TableCell className={classes.tableCol} align="right">{display_total}</TableCell>
            </TableRow>
        );
    }, [thumbnails, cartState])

    const headCells = [
        { id: 'close', align: 'left', disablePadding: true, label: '' },
        { id: 'product', align: 'left', disablePadding: true, label: 'Product' },
        { id: 'price', align: 'right', disablePadding: false, label: 'Price' },
        { id: 'quantity', align: 'right', disablePadding: false, label: 'Quantity' },
        { id: 'total', align: 'right', disablePadding: false, label: 'Total' },
    ]

    return (
        <div {...props} >
            <TableContainer className={classes.tablePaper} component={Paper}>
                <Table aria-label="cart table">
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            {headCells.map(({ id, align, disablePadding, label }, index) => (
                                <TableCell
                                    key={id}
                                    id={id}
                                    align={align}
                                    disablePadding={disablePadding}
                                >{label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cartState.items.map((c, index) => cart_item_to_row(c, index))}
                    </TableBody>
                </Table>
            </TableContainer>
            <p>Total: {displayPrice(all_total)}</p>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Selector
                        fullWidth
                        required
                        options={DELIVERY_OPTIONS}
                        selected={cartState.is_delivery ? DELIVERY_OPTIONS[1] : DELIVERY_OPTIONS[0]}
                        handleChange={(e) => handleDeliveryChange(e.target.value)}
                        inputAriaLabel='delivery-selector-label'
                        label="Shipping Method" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Delivery Date"
                            value={new Date(cartState.desired_delivery_date)}
                            onChange={(date) => {
                                setDeliveryDate(date)
                            }}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        id="special-instructions"
                        label="Special Instructions"
                        fullWidth
                        multiline
                        value={cartState.special_instructions}
                        onChange={e => setNotes(e.target.value)}
                    />
                </Grid>
            </Grid>
        </div>
    );
}

Cart.propTypes = {
    cart: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
}

export default Cart;
