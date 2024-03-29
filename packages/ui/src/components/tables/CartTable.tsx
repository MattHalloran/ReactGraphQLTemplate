import { useCallback } from 'react';
import {
    QuantityBox,
    Selector
} from 'components';
import { deleteArrayIndex, showPrice, updateObject, PUBS, getImageSrc, updateArray } from 'utils';
import PubSub from 'pubsub-js';
import { NoImageIcon } from 'assets/img';
import { IconButton, TableCellProps, Theme } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { Paper, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DatePicker from '@material-ui/lab/DatePicker';
import { ImageUse, SERVER_URL } from '@local/shared';

const useStyles = makeStyles((theme: Theme) => ({
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
        value: false,
    },
    {
        label: 'Delivery',
        value: true,
    },
]

interface Props {
    cart: any;
    onUpdate: (data: any) => any;
    editable?: boolean;
    className?: string;
}

export const CartTable = ({
    cart,
    onUpdate,
    editable = true,
    className,
    ...props
}: Props) => {
    const classes = useStyles();
    let all_total = Array.isArray(cart?.items) ? cart.items.map(i => (+i.sku.price)*(+i.quantity)).reduce((a, b) => (+a)+(+b), 0) : -1;

    const updateCartField = useCallback((fieldName, value) => {
        onUpdate(updateObject(cart, fieldName, value));
    }, [cart, onUpdate])

    const onNotesChange = useCallback((e) => updateCartField('specialInstructions', e.target.value), [updateCartField]);
    const onDeliveryTypeChange = useCallback((e) => updateCartField('isDelivery', e.target.value), [updateCartField]);
    const onDeliveryDateChange = useCallback((date) => updateCartField('desiredDeliveryDate', +date), [updateCartField]);

    const updateItemQuantity = useCallback((sku, quantity) => {
        let index = cart.items.findIndex(i => i.sku.sku === sku);
        if (index < 0 || index >= (cart.items.length)) {
            PubSub.publish(PUBS.Snack, { message: 'Failed to update item quantity', severity: 'error', data: { index: index } });
            return;
        }
        onUpdate(updateObject(cart, 'items', updateArray(cart.items, index, updateObject(cart.items[index], 'quantity', quantity))))
    }, [cart, onUpdate])

    const deleteCartItem = useCallback((sku) => {
        let index = cart.items.findIndex(i => i.sku.sku === sku.sku);
        if (index < 0) {
            PubSub.publish(PUBS.Snack, { message: `Failed to remove item for ${sku.sku}`, severity: 'error', data: sku });
            return;
        }
        let changed_item_list = deleteArrayIndex(cart.items, index);
        updateCartField('items', changed_item_list);
    }, [cart, updateCartField])

    const cart_item_to_row = useCallback((data, key) => {
        const quantity = data.quantity;
        let price = data.sku.price;
        let total;
        if (isNaN(+price)) {
            total = 'TBD';
            price = 'TBD';
        } else {
            total = showPrice(quantity * +price);
            price = showPrice(price);
        }

        let display;
        let display_data = data.sku.product.images.find(image => image.usedFor === ImageUse.PRODUCT_DISPLAY)?.image;
        if (!display_data && data.sku.product.images.length > 0) display_data = data.sku.product.images[0].image;
        if (display_data) {
            display = <img src={`${SERVER_URL}/${getImageSrc(display_data)}`} className={classes.displayImage} alt={display_data.alt} title={data.sku.product?.name ?? ''} />
        } else {
            display = <NoImageIcon className={classes.displayImage} />
        }

        return (
            <TableRow key={key}>
                {editable ? (<TableCell padding="checkbox">
                    <IconButton onClick={() => deleteCartItem(data.sku)}>
                        <CloseIcon />
                    </IconButton>
                </TableCell>) : null}
                <TableCell className={classes.tableCol} padding="none" component="th" scope="row" align="center">
                    {display}
                </TableCell>
                <TableCell className={classes.tableCol} align="left">{data.sku.product?.name ?? ''}</TableCell>
                <TableCell className={classes.tableCol} align="right">{price}</TableCell>
                <TableCell className={classes.tableCol} align="right">
                    {editable ? (<QuantityBox
                        min_value={0}
                        max_value={data.sku?.availability ?? 100}
                        value={quantity}
                        valueFunc={(q) => updateItemQuantity(data.sku.sku, q)} />) : quantity}
                </TableCell>
                <TableCell className={classes.tableCol} align="right">{total}</TableCell>
            </TableRow>
        );
    }, [classes.displayImage, classes.tableCol, deleteCartItem, editable, updateItemQuantity])

    // [label, title, align, padding]
    type HeadCellData = [string, string, TableCellProps["align"], TableCellProps["padding"]];
    let headCells: HeadCellData[] = [
        ['productImage', 'Product', 'left', 'none'],
        ['productName', '', 'right', 'none'],
        ['price', 'Price', 'right', 'normal'],
        ['quantity', 'Quantity', 'right', 'normal'],
        ['total', 'Total', 'right', 'normal'],
    ];
    // Only show x button if cart is editable
    if (editable) headCells.unshift(['close', '', 'left', 'none']);

    return (
        <div className={className} {...props} >
            <TableContainer className={classes.tablePaper} component={Paper}>
                <Table aria-label="cart table">
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            {headCells.map(([id, label, align, padding]) => (
                                <TableCell
                                    key={id}
                                    id={id}
                                    align={align}
                                    padding={padding}
                                >{label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(cart?.items) ? cart.items.map((c, index) => cart_item_to_row(c, index)) : null}
                    </TableBody>
                </Table>
            </TableContainer>
            <p>Total: {showPrice(all_total) ?? 'N/A'}</p>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Selector
                        fullWidth
                        disabled={!editable}
                        required
                        options={DELIVERY_OPTIONS}
                        selected={cart?.isDelivery ? DELIVERY_OPTIONS[1].value : DELIVERY_OPTIONS[0].value}
                        handleChange={onDeliveryTypeChange}
                        inputAriaLabel='delivery-selector-label'
                        label="Productping Method" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Delivery Date"
                            disabled={!editable}
                            value={cart?.desiredDeliveryDate ? new Date(cart.desiredDeliveryDate) : +(new Date())}
                            onChange={onDeliveryDateChange}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        id="special-instructions"
                        label="Special Instructions"
                        disabled={!editable}
                        fullWidth
                        multiline
                        value={cart?.specialInstructions ?? ''}
                        onChange={onNotesChange}
                    />
                </Grid>
            </Grid>
        </div>
    );
}