import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    SearchBar,
    Selector
} from 'components';
import { ShoppingList } from '../ShoppingList/ShoppingList';
import { SORT_OPTIONS, PUBS, PubSub } from 'utils';
import { traitOptionsQuery } from 'graphql/query';
import { useQuery } from '@apollo/client';
import { Switch, Grid, Button, SwipeableDrawer, FormControlLabel } from '@material-ui/core';
import {
    Close as CloseIcon,
    FilterList as FilterListIcon,
    Print as PrintIcon,
    Restore as RestoreIcon
} from '@material-ui/icons';
import { printAvailability } from 'utils';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    drawerPaper: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        borderRight: `2px solid ${theme.palette.text.primary}`,
        padding: theme.spacing(1),
    },
    formControl: {
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    padBottom: {
        marginBottom: theme.spacing(2),
    },
}));

function ShoppingPage({
    session,
    onSessionUpdate,
    business,
    cart,
}) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const { data: traitOptionsData } = useQuery(traitOptionsQuery);
    const [traitOptions, setTraitOptions] = useState({});
    const [filters, setFilters] = useState(null);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const [searchString, setSearchString] = useState('');
    const [hideOutOfStock, setHideOutOfStock] = useState(false);

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.ArrowMenuOpen, (_, b) => {
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return (() => {
            PubSub.unsubscribe(openSub);
        })
    }, [])

    useEffect(() => {
        let traitOptions = {};
        for (const option of traitOptionsData?.traitOptions ?? []) {
            traitOptions[option.name] = option.values;
        }
        setTraitOptions(traitOptions);
    }, [traitOptionsData])

    const handleFiltersChange = useCallback((name, value) => {
        let modified_filters = { ...filters };
        modified_filters[name] = value;
        setFilters(modified_filters)
    }, [filters])

    const handleHideChange = useCallback((event) => {
        setHideOutOfStock(event.target.checked);
    }, [])

    const traitOptionsToSelector = useCallback((field, title) => {
        if (!traitOptions) return;
        let options = traitOptions[field];
        if (!options || !Array.isArray(options) || options.length <= 0) return null;
        let selected = filters ? filters[field] : '';
        return (
            <Selector
                className={`${classes.padBottom} ${classes.selector}`}
                fullWidth
                options={options}
                selected={selected || ''}
                handleChange={(e) => handleFiltersChange(field, e.target.value)}
                inputAriaLabel={`${field}-selector-label`}
                label={title} />
        )
    }, [classes.padBottom, classes.selector, traitOptions, filters, handleFiltersChange])

    const resetSearchConstraints = () => {
        setSortBy(SORT_OPTIONS[0].value)
        setSearchString('')
        setFilters({});
    }

    let optionsContainer = (
        <Grid className={classes.padBottom} container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Button
                    fullWidth
                    color="secondary"
                    startIcon={<RestoreIcon />}
                    onClick={resetSearchConstraints}
                >Reset</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Button
                    fullWidth
                    color="secondary"
                    startIcon={<CloseIcon />}
                    onClick={() => PubSub.publish(PUBS.ArrowMenuOpen, false)}
                >Close</Button>
            </Grid>
        </Grid>
    );

    let traitList = [
        ['size', 'Sizes'],
        ['optimalLight', 'Optimal Light'],
        ['droughtTolerance', 'Drought Tolerance'],
        ['grownHeight', 'Grown Height'],
        ['grownSpread', 'Grown Spread'],
        ['growthRate', 'Growth Rate'],
        ['saltTolerance', 'Salt Tolerance'],
        ['attractsPolinatorsAndWildlifes', 'Pollinator'],
        ['lightRanges', 'Light Range'],
        ['soilMoistures', 'Soil Moisture'],
        ['soilPhs', 'Soil PH'],
        ['soilTypes', 'Soil Type'],
        ['zones', 'Zone'],
    ]

    return (
        <div id='page'>
            <SwipeableDrawer classes={{ paper: classes.drawerPaper }} anchor="left" open={open} onOpen={()=>{}} onClose={() => PubSub.publish(PUBS.ArrowMenuOpen, false)}>
                {optionsContainer}
                <div>
                    <Selector
                        fullWidth
                        options={SORT_OPTIONS}
                        selected={sortBy}
                        handleChange={(e) => setSortBy(e.target.value)}
                        inputAriaLabel='sort-selector-label'
                        label="Sort" />
                    <h2>Search</h2>
                    <SearchBar className={classes.padBottom} fullWidth debounce={300} onChange={(e) => setSearchString(e.target.value)} />
                    <h2>Filters</h2>
                    {traitList.map(d => traitOptionsToSelector(...d))}
                    {/* {filters_to_checkbox(['Yes', 'No'], 'Jersey Native')}
                    {filters_to_checkbox(['Yes', 'No'], 'Discountable')} */}
                </div>
                {optionsContainer}
            </SwipeableDrawer>
            <div className={classes.formControl}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={hideOutOfStock}
                            onChange={handleHideChange}
                            color="secondary"
                        />
                    }
                    label="Hide out of stock"
                />
                <Button
                    color="secondary"
                    startIcon={<FilterListIcon />}
                    onClick={() => PubSub.publish(PUBS.ArrowMenuOpen, 'toggle')}
                >Filter</Button>
                <Button
                    color="secondary"
                    startIcon={<PrintIcon />}
                    onClick={() => printAvailability(session, business?.BUSINESS_NAME?.Long)}
                >Print</Button>
            </div>
            <ShoppingList
                session={session}
                onSessionUpdate={onSessionUpdate}
                cart={cart}
                sort={sortBy}
                filters={filters}
                searchString={searchString}
                hideOutOfStock={hideOutOfStock}
            />
        </div>
    );
}

ShoppingPage.propTypes = {
    session: PropTypes.object,
    onSessionUpdate: PropTypes.func.isRequired,
    cart: PropTypes.object,
}

export { ShoppingPage };