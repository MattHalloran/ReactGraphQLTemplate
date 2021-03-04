import React, { memo, useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../SearchBar/SearchBar';
import ShoppingList from '../ShoppingList/ShoppingList';
import ArrowMenu from 'components/menus/ArrowMenu/ArrowMenu';
import { BUSINESS_NAME, USER_ROLES, SORT_OPTIONS, LINKS, PUBS } from 'utils/consts';
import { getInventoryFilters, checkCookies } from "query/http_promises";
import DropDown from 'components/inputs/DropDown/DropDown';
import CheckBox from 'components/inputs/CheckBox/CheckBox';
import { getRoles, getSession, getTheme } from 'utils/storage';
import PubSub from 'utils/pubsub';

function ShoppingPage() {
    const [user_roles, setUserRoles] = useState(getRoles());
    const [session, setSession] = useState(getSession());
    const [theme, setTheme] = useState(getTheme());
    const [filters, setFilters] = useState(null);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const [searchString, setSearchString] = useState('');
    const [showCurrentlyUnavailable, setShowCurrentlyUnavailable] = useState(false);
    let history = useHistory();

    useEffect(() => {
        document.title = `Shop | ${BUSINESS_NAME}`;
        let userRolesSub = PubSub.subscribe(PUBS.Roles, (_, r) => setUserRoles(r));
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, s) => setSession(s));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, t) => setTheme(t ?? getTheme()));
        return (() => {
            PubSub.unsubscribe(userRolesSub);
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(themeSub);
        })
    }, [])

    useEffect(() => {
        let mounted = true;
        checkCookies().then(() => {
            getInventoryFilters()
                .then((response) => {
                    console.log("GOT INVENTORY FILTERS!!!!!!!!! BOOP", response)
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
                    console.log('SETING FILTERSSSSSSSSSS', response);
                })
                .catch((error) => {
                    console.error("Failed to load filters", error);
                });
        }).catch(() => {
            history.push(LINKS.LogIn);
        })

        return () => mounted = false;
    }, []);

    useEffect(() => {
        console.log("NEW FILTERSSS", filters);
    }, [filters])

    const handleFiltersChange = useCallback((group, value, checked) => {
        let modified_filters = { ...filters };
        modified_filters[group][value].checked = checked;
        setFilters(modified_filters)
    }, [filters])

    const handleCurrentlyUnavailableChange = useCallback((_group, _value, checked) => {
        setShowCurrentlyUnavailable(checked);
    }, [filters])

    const handleSortChange = (sort_item, _) => {
        setSortBy(sort_item.value);
    }

    const filters_to_checkbox = (field, title, onChange) => {
        if (!filters) return;
        let list = filters[field];
        if (!list || !Array.isArray(list) || list.length <= 0) return null;
        let options = list.map((item, index) => (
            <CheckBox key={index} 
                group={field} 
                label={item.label} 
                value={item.value} 
                checked={filters[field][index].checked ?? false} 
                onChange={handleFiltersChange} />
        ))
        return <React.Fragment>
            <fieldset className="checkbox-group" onChange={onChange}>
                <legend>{title}</legend>
                    {options}
            </fieldset>
        </React.Fragment>
    }

    const is_customer = useCallback(() => {
        if (!user_roles instanceof Array) return;
        user_roles?.forEach(r => {
            console.log('SHOPPING PAGE FOUND ROLEEEEE', r)
            if (r.title === USER_ROLES.Customer ||
                r.title === USER_ROLES.Admin) {
                return true;
            }
        })
        return false;
    }, [user_roles])

    return (
        <StyledShoppingPage theme={theme}>
            <ArrowMenu>
                <div className="shopping-menu">
                <h2>Sort</h2>
                <DropDown className="sorter" options={SORT_OPTIONS} onChange={handleSortChange} initial_value={SORT_OPTIONS[0]} />
                <h2>Search</h2>
                <SearchBar onChange={(s) => setSearchString(s)}/>
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
            </ArrowMenu>
            <CheckBox className="unavailable-checkbox"
                label='Show Currently Unavailable' 
                checked={showCurrentlyUnavailable} 
                onChange={handleCurrentlyUnavailableChange} />
            <ShoppingList sort={sortBy} filters={filters} searchString={searchString} showUnavailable={showCurrentlyUnavailable}/>
        </StyledShoppingPage>
    );
}

ShoppingPage.propTypes = {

}

export default memo(ShoppingPage);