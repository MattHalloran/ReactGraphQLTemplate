import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { BUSINESS_NAME } from 'utils/consts';
import { getImages } from 'query/http_promises';
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
import { displayPrice } from 'utils/displayPrice';
import { NoImageIcon } from 'assets/img';
import { Typography } from '@material-ui/core';
import { deleteArrayIndex } from 'utils/arrayTools';
import { updateObject } from 'utils/objectTools';
import { Paper, Grid, Checkbox, TableContainer, Table, TableRow, TableCell, TableBody, TextField } from '@material-ui/core';
import EnhancedTableHead from 'components/EnhancedTableHead/EnhancedTableHead';
import EnhancedTableToolbar from 'components/EnhancedTableToolbar/EnhancedTableToolbar';
import { makeStyles } from '@material-ui/core/styles';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DatePicker from '@material-ui/lab/DatePicker';
import Selector from 'components/Selector/Selector';
import _ from 'underscore';

const useStyles = makeStyles((theme) => ({
    tablePaper: {
        background: theme.palette.background.paper,
    },
    tableIcon: {
        color: theme.palette.primary.contrastText,
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
}) {
    const classes = useStyles();
    const [cartState, setCartState] = useState({
        items: cart?.items ?? [],
        is_delivery: cart?.is_delivery ?? true,
        desired_delivery_date: cart?.desired_delivery_date ?? +(new Date()),
        special_instructions: cart?.special_instructions ?? '',
    })

    const [selected, setSelected] = useState([]);
    // Thumbnail data for every SKU
    const [thumbnails, setThumbnails] = useState([]);



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
        document.title = `Cart | ${BUSINESS_NAME}`;
    })

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = cartState.items.map((i) => i.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

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
            alert('Error: Could not update item quantity!');
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
            alert(`Error: could not remove item for ${sku.sku}`);
            return;
        }
        setThumbnails(deleteArrayIndex(thumbnails, index));
        let changed_item_list = deleteArrayIndex(cartState.items, index);
        setCartState(updateObject(cartState, 'items', changed_item_list));
    }, [thumbnails, cartState])

    let all_total = 0;
    const cart_item_to_row = useCallback((data, isSelected, key) => {
        let index = cartState.items.findIndex(i => i.sku.sku === data.sku.sku);
        let thumbnail;
        if (index >= 0)
            thumbnail = thumbnails.length >= index ? thumbnails[index] : null
        let quantity = data.quantity;
        let price = parseInt(data.sku.price);
        let display_price;
        let display_total;
        let display_image;
        if (isNaN(price)) {
            display_price = 'TBD';
            display_total = 'TBD';
            all_total = 'TBD';
        } else {
            display_price = displayPrice(price);
            display_total = displayPrice(quantity * price);
            if (typeof (all_total) === 'number') all_total += (quantity * price);
        }
        if (thumbnail) {
            display_image = <img src={`data:image/jpeg;base64,${thumbnail}`} className="cart-image" alt="TODO" />
        } else {
            display_image = <NoImageIcon className="cart-image" />
        }

        const isItemSelected = isSelected(key);

        return (
            <TableRow key={key} onClick={() => handleClick(key)}>
                <TableCell padding="checkbox">
                    <Checkbox
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${key}` }}
                    />
                </TableCell>
                <TableCell className={classes.tableCol} component="th" scope="row">
                    {display_image}
                    <Typography component="body2">{data.sku?.plant?.latin_name}</Typography>
                </TableCell>
                <TableCell className={classes.tableCol} align="right">{display_price}</TableCell>
                <TableCell className={classes.tableCol} align="right">
                    <QuantityBox
                        className="quant"
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
        { id: 'product', align: 'left', disablePadding: true, label: 'Product' },
        { id: 'price', align: 'right', disablePadding: false, label: 'Price' },
        { id: 'quantity', align: 'right', disablePadding: false, label: 'Quantity' },
        { id: 'total', align: 'right', disablePadding: false, label: 'Total' },
    ]

    const isSelected = (key) => selected.indexOf(key) !== -1;

    const removeItems = () => {
        alert('TODO')
    }

    return (
        <div>
            <EnhancedTableToolbar
                title="Cart"
                numSelected={selected.length}
                onDelete={removeItems} />
            <TableContainer className={classes.tablePaper} component={Paper}>
                <Table aria-label="cart table">
                    <EnhancedTableHead
                        headCells={headCells}
                        numSelected={selected.length}
                        onSelectAllClick={handleSelectAllClick}
                        rowCount={cartState.items.length}
                    />
                    <TableBody>
                        {cartState.items.map((c, index) => cart_item_to_row(c, isSelected, index))}
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
