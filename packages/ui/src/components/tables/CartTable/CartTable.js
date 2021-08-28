import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    QuantityBox,
    Selector
} from 'components';
import { deleteArrayIndex, displayPrice, updateObject, PUBS, PubSub, getImageSrc } from 'utils';
import { NoImageIcon } from 'assets/img';
import { IconButton, Typography } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { Paper, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DatePicker from '@material-ui/lab/DatePicker';
import { IMAGE_USE, SERVER_URL } from '@local/shared';

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
    displayImage: {
        maxHeight: '8vh',
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

function CartTable({
    cart,
    onUpdate,
    ...props
}) {
    const classes = useStyles();
    const [cartState, setCartState] = useState({
        ...cart,
        items: cart?.items ?? [],
        isDelivery: cart?.isDelivery ?? true,
        desired_delivery_date: cart?.desired_delivery_date ?? +(new Date()),
        specialInstructions: cart?.specialInstructions,
    })
    let all_total = cartState.items.map(i => i.sku.price*i.availability).reduce((a, b) => (a*1)+b, 0);

    useEffect(() => {
        onUpdate(cartState);
    }, [cartState, onUpdate])

    const setNotes = useCallback((notes) => {
        setCartState(c => updateObject(c, 'specialInstructions', notes));
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
            PubSub.publish(PUBS.Snack, { message: 'Failed to update item quantity', severity: 'error', data: { index: index } });
            return;
        }
        let cart_copy = { ...cartState };
        cart_copy.items[index].quantity = quantity;
        setCartState(cart_copy);
    }, [cartState])

    const deleteCartItem = useCallback((sku) => {
        let index = cartState.items.findIndex(i => i.sku.sku === sku.sku);
        if (index < 0) {
            PubSub.publish(PUBS.Snack, { message: `Failed to remove item for ${sku.sku}`, severity: 'error', data: sku });
            return;
        }
        let changed_item_list = deleteArrayIndex(cartState.items, index);
        setCartState(updateObject(cartState, 'items', changed_item_list));
    }, [cartState])

    const cart_item_to_row = useCallback((data, key) => {
        let quantity = data.quantity;
        let price = parseInt(data.sku.price);
        let total;
        if (isNaN(price)) {
            price = 'TBD';
            total = 'TBD';
        } else {
            price = displayPrice(price);
            total = displayPrice(quantity * price);
        }

        console.log('CART TABLE DISPLAY DATA LOGIC', data)
        let display;
        let display_data = data.sku.plant.images.find(image => image.usedFor === IMAGE_USE.PlantDisplay)?.image;
        if (!display_data && data.sku.plant.images.length > 0) display_data = data.sku.plant.images[0].image;
        if (display_data) {
            display = <img src={`${SERVER_URL}/${getImageSrc(display_data)}`} className={classes.displayImage} alt={display_data.alt} title={data.sku.plant.latin_name} />
        } else {
            display = <NoImageIcon className={classes.displayImage} />
        }

        return (
            <TableRow key={key}>
                <TableCell padding="checkbox">
                    <IconButton onClick={() => deleteCartItem(data.sku)}>
                        <CloseIcon />
                    </IconButton>
                </TableCell>
                <TableCell className={classes.tableCol} padding="none" component="th" scope="row" align="center">
                    {display}
                    <Typography variant="body2">{data.sku?.plant?.latin_name}</Typography>
                </TableCell>
                <TableCell className={classes.tableCol} align="right">{price}</TableCell>
                <TableCell className={classes.tableCol} align="right">
                    <QuantityBox
                        min_value={0}
                        max_value={data.sku?.availability ?? 100}
                        initial_value={quantity}
                        valueFunc={(q) => updateItemQuantity(data.sku.sku, q)} />
                </TableCell>
                <TableCell className={classes.tableCol} align="right">{total}</TableCell>
            </TableRow>
        );
    }, [classes.displayImage, classes.tableCol, deleteCartItem, updateItemQuantity])

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
                        value={cartState.specialInstructions}
                        onChange={e => setNotes(e.target.value)}
                    />
                </Grid>
            </Grid>
        </div>
    );
}

CartTable.propTypes = {
    cart: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
}

export { CartTable };
