import React, { memo, useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../../../components/SearchBar/SearchBar';
import ShoppingList from '../ShoppingList/ShoppingList';
import { BUSINESS_NAME, SORT_OPTIONS, LINKS, PUBS } from 'utils/consts';
import { getInventoryFilters, checkCookies } from "query/http_promises";
import Selector from 'components/Selector/Selector';
import PubSub from 'utils/pubsub';
import { Button, SwipeableDrawer, Checkbox, FormControlLabel } from '@material-ui/core';
import { printAvailability } from 'utils/printAvailability';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    drawerPaper: {
        background: theme.palette.primary.light,
        borderRight: `2px solid ${theme.palette.text.primary}`,
        minWidth: 400,
    }
}));

function ShoppingPage() {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState(null);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const [searchString, setSearchString] = useState('');
    const [showCurrentlyUnavailable, setShowCurrentlyUnavailable] = useState(false);
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

    const handleCurrentlyUnavailableChange = useCallback((event) => {
        setShowCurrentlyUnavailable(event.target.checked);
    }, [filters])

    const filters_to_checkbox = (field, title, onChange) => {
        if (!filters) return;
        let list = filters[field];
        if (!list || !Array.isArray(list) || list.length <= 0) return null;
        let options = list.map((item, index) => (
            <FormControlLabel control={
                <Checkbox key={index}
                    group={field}
                    value={item.value}
                    checked={filters[field][index].checked ?? false}
                    onChange={handleFiltersChange} />
            }
                label={item.label} />
        ))
        return <React.Fragment>
            <fieldset className="checkbox-group" onChange={onChange}>
                <legend>{title}</legend>
                {options}
            </fieldset>
        </React.Fragment>
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
        <div className="options-container">
            <Button color="secondary" onClick={resetSearchConstraints}>Reset</Button>
            <Button color="secondary" onClick={() => PubSub.publish(PUBS.ArrowMenuOpen, false)}>Close</Button>
        </div>
    );

    return (
        <StyledShoppingPage id='page'>
            <SwipeableDrawer classes={{ paper: classes.drawerPaper }} anchor="left" open={open} onClose={() => PubSub.publish(PUBS.ArrowMenuOpen, false)}>
                {optionsContainer}
                <div className="shopping-menu">
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
                    {filters_to_checkbox('size', 'Sizes')}
                    {filters_to_checkbox('optimal_light', 'Optimal Light')}
                    {filters_to_checkbox('drought_tolerance', 'Drought Tolerance')}
                    {filters_to_checkbox('grown_height', 'Grown Height')}
                    {filters_to_checkbox('grown_spread', 'Grown Spread')}
                    {filters_to_checkbox('growth_rate', 'Growth Rate')}
                    {filters_to_checkbox('salt_tolerance', 'Salt Tolerance')}
                    {filters_to_checkbox('attracts_polinators_and_wildlifes', 'Pollinator')}
                    {filters_to_checkbox('light_ranges', 'Light Range')}
                    {filters_to_checkbox('soil_moistures', 'Soil Moisture')}
                    {filters_to_checkbox('soil_phs', 'Soil PH')}
                    {filters_to_checkbox('soil_types', 'Soil Type')}
                    {filters_to_checkbox('zones', 'Zone')}
                    {/* {filters_to_checkbox(['Yes', 'No'], 'Jersey Native')}
                    {filters_to_checkbox(['Yes', 'No'], 'Discountable')} */}
                </div>
                {optionsContainer}
            </SwipeableDrawer>
            <FormControlLabel
                control={
                    <Checkbox className="unavailable-checkbox"
                        checked={showCurrentlyUnavailable}
                        onChange={handleCurrentlyUnavailableChange} />
                }
                label="Show Currently Unavailable" />
            <Button color="secondary" onClick={() => PubSub.publish(PUBS.ArrowMenuOpen, 'toggle')}>Filter Results</Button>
            <Button color="secondary" onClick={printAvailability}>Print Availability</Button>
            <ShoppingList sort={sortBy} filters={filters} searchString={searchString} showUnavailable={showCurrentlyUnavailable} />
        </StyledShoppingPage>
    );
}

ShoppingPage.propTypes = {

}

export default memo(ShoppingPage);