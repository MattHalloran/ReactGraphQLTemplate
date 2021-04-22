import { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
    SearchBar,
    Selector
} from 'components';
import ShoppingList from '../ShoppingList/ShoppingList';
import { SORT_OPTIONS, LINKS, PUBS } from 'utils/consts';
import { getInventoryFilters, checkCookies } from "query/http_promises";
import PubSub from 'utils/pubsub';
import { Switch, Grid, Button, SwipeableDrawer, FormControlLabel } from '@material-ui/core';
import {
    Close as CloseIcon,
    FilterList as FilterListIcon,
    Print as PrintIcon,
    Restore as RestoreIcon
} from '@material-ui/icons';
import { printAvailability } from 'utils/printAvailability';
import { makeStyles } from '@material-ui/core/styles';

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
    cart,
}) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState(null);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const [searchString, setSearchString] = useState('');
    const [hideOutOfStock, setHideOutOfStock] = useState(false);
    let history = useHistory();

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.ArrowMenuOpen, (_, b) => {
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return (() => {
            PubSub.unsubscribe(openSub);
        })
    }, [])

    useEffect(() => {
        let mounted = true;
        checkCookies().then(() => {
            getInventoryFilters()
                .then((response) => {
                    if (!mounted) return;
                    // Add checked boolean to each filter
                    for (const [_, value] of Object.entries(response)) {
                        for (let i = 0; i < value.length; i++) {
                            value[i] = {
                                label: value[i],
                                value: i,
                                checked: false,
                            }
                        }
                    }
                    setFilters(response);
                })
                .catch((error) => {
                    console.error("Failed to load filters", error);
                });
        }).catch(() => {
            history.push(LINKS.LogIn);
        })

        return () => mounted = false;
    }, []);

    const handleFiltersChange = useCallback((group, value, checked) => {
        let modified_filters = { ...filters };
        modified_filters[group][value].checked = checked;
        setFilters(modified_filters)
    }, [filters])

    const handleHideChange = useCallback((event) => {
        setHideOutOfStock(event.target.checked);
    }, [filters])

    const filtersToSelector = (field, title, onChange) => {
        if (!filters) return;
        let options = filters[field];
        if (!options || !Array.isArray(options) || options.length <= 0) return null;
        let selected = options.filter(o => o.checked);
        return (
            <Selector
                className={`${classes.padBottom} ${classes.selector}`}
                fullWidth
                options={options}
                selected={selected}
                handleChange={(e) => handleFiltersChange(field, e.target.value, true)}
                inputAriaLabel={`${field}-selector-label`}
                label={title} />
        )
    }

    const resetSearchConstraints = () => {
        setSortBy(SORT_OPTIONS[0].value)
        setSearchString('')
        let copy = { ...filters };
        for (const key in copy) {
            let filter_group = copy[key];
            for (let i = 0; i < filter_group.length; i++) {
                filter_group[i].checked = false;
            }
        }
        setFilters(copy);
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

    let filterData = [
        ['size', 'Sizes'],
        ['optimal_light', 'Optimal Light'],
        ['drought_tolerance', 'Drought Tolerance'],
        ['grown_height', 'Grown Height'],
        ['grown_spread', 'Grown Spread'],
        ['growth_rate', 'Growth Rate'],
        ['salt_tolerance', 'Salt Tolerance'],
        ['attracts_polinators_and_wildlifes', 'Pollinator'],
        ['light_ranges', 'Light Range'],
        ['soil_moistures', 'Soil Moisture'],
        ['soil_phs', 'Soil PH'],
        ['soil_types', 'Soil Type'],
        ['zones', 'Zone'],
    ]

    return (
        <div id='page'>
            <SwipeableDrawer classes={{ paper: classes.drawerPaper }} anchor="left" open={open} onClose={() => PubSub.publish(PUBS.ArrowMenuOpen, false)}>
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
                    <SearchBar className={classes.padBottom} fullWidth onChange={(e) => setSearchString(e.target.value)} />
                    <h2>Filters</h2>
                    {filterData.map(d => filtersToSelector(...d))}
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
                    onClick={() => printAvailability(session)}
                >Print</Button>
            </div>
            <ShoppingList 
                session={session} 
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
    cart: PropTypes.object,
}

export default memo(ShoppingPage);