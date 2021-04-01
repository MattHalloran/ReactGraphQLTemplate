import { memo, useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import SearchBar from '../../../components/SearchBar/SearchBar';
import ShoppingList from '../ShoppingList/ShoppingList';
import { BUSINESS_NAME, SORT_OPTIONS, LINKS, PUBS } from 'utils/consts';
import { getInventoryFilters, checkCookies } from "query/http_promises";
import Selector from 'components/Selector/Selector';
import PubSub from 'utils/pubsub';
import { Switch, Container, Button, SwipeableDrawer, FormControlLabel } from '@material-ui/core';
import { printAvailability } from 'utils/printAvailability';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    drawerPaper: {
        background: theme.palette.primary.light,
        borderRight: `2px solid ${theme.palette.text.primary}`,
        minWidth: 400,
    },
    formControl: {
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

function ShoppingPage() {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState(null);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const [searchString, setSearchString] = useState('');
    const [hideOutOfStock, setHideOutOfStock] = useState(false);
    let history = useHistory();

    useEffect(() => {
        document.title = `Shop | ${BUSINESS_NAME}`;
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
                fullWidth
                options={options}
                selected={selected}
                handleChange={(e) => handleFiltersChange(field, e.target.value, true)}
                inputAriaLabel={`${field}-selector-label`}
                label={title} />
        )
    }

    const resetSearchConstraints = () => {
        setSortBy(SORT_OPTIONS[0])
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
        <Container className={classes.formControl}>
            <Button color="secondary" onClick={resetSearchConstraints}>Reset</Button>
            <Button color="secondary" onClick={() => PubSub.publish(PUBS.ArrowMenuOpen, false)}>Close</Button>
        </Container>
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
                    <SearchBar onChange={(s) => setSearchString(s)} />
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
                <Button color="secondary" onClick={() => PubSub.publish(PUBS.ArrowMenuOpen, 'toggle')}>Filter Results</Button>
                <Button color="secondary" onClick={printAvailability}>Print Availability</Button>
            </div>
            <ShoppingList sort={sortBy} filters={filters} searchString={searchString} hideOutOfStock={hideOutOfStock} />
        </div>
    );
}

ShoppingPage.propTypes = {

}

export default memo(ShoppingPage);