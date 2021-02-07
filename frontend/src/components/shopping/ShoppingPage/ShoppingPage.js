import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../SearchBar/SearchBar';
import ShoppingList from '../ShoppingList/ShoppingList';
import ArrowMenu from 'components/shared/menus/ArrowMenu/ArrowMenu';
import { BUSINESS_NAME, USER_ROLES, SORT_OPTIONS, LINKS } from 'consts';
import { getInventoryFilters } from "query/http_promises";
import DropDown from 'components/shared/inputs/DropDown/DropDown';
import CheckBox from 'components/shared/inputs/CheckBox/CheckBox';
import { getTheme } from 'storage';

function ShoppingPage({
    user_roles,
    session,
    theme = getTheme(),
}) {
    const [filters, setFilters] = useState(null);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    let history = useHistory();
    const authenticated = useRef(false);

    useEffect(() => {
        document.title = `Shop | ${BUSINESS_NAME}`;
        if (!authenticated.current) return;
        let mounted = true;
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
                console.log('SETING FILTERSSSSSSSSSS', response);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });

        return () => mounted = false;
    }, []);

    useEffect(() => {
        console.log("NEW FILTERSSS", filters);
    }, [filters])

    const handleCheckBoxChange = useCallback((group, value, checked) => {
        let modified_filters = {...filters};
        modified_filters[group][value].checked = checked;
        setFilters(modified_filters)
    }, [filters])

    const handleSortChange = (sort_item, _) => {
        setSortBy(sort_item.value);
    }

    const filters_to_checkbox = (field, title, onChange) => {
        if (!filters) return;
        let list = filters[field];
        if (!list || !Array.isArray(list) || list.length <= 0) return null;
        let options = list.map((item, index) => (
            <tr key={index}>
                <td><CheckBox group={field} label={item.label} value={item.value} checked={filters[field][index].checked ?? false} onChange={handleCheckBoxChange}/></td>
            </tr>
        ))
        return <React.Fragment>
            <table className="checkbox-group" onChange={onChange}>
                <tbody>
                    <tr><td>{title}</td></tr>
                    {options}
                </tbody>
            </table>
        </React.Fragment>
    }

    let is_customer = false;
    let roles = user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            console.log('SHOPPING PAGE FOUND ROLEEEEE', r)
            if (r.title === USER_ROLES.Customer ||
                r.title === USER_ROLES.Admin) {
                is_customer = true;
            }
        })
    }
    if (is_customer && session) {
        console.log('IS AUTHENTICATED')
        authenticated.current = true;
    } else {
        history.push(LINKS.LogIn);
    }

    return (
        <StyledShoppingPage theme={theme}>
            <ArrowMenu >
                    <h2>Sort</h2>
                    <DropDown className="sorter" options={SORT_OPTIONS} onChange={handleSortChange} initial_value={SORT_OPTIONS[0]} />
                    <h2>Search</h2>
                    <SearchBar />
                    <h2>Filters</h2>
                    {filters_to_checkbox('sizes', 'Sizes')}
                    {filters_to_checkbox('optimal_lights', 'Optimal Light')}
                    {filters_to_checkbox('drought_tolerances', 'Drought Tolerance')}
                    {filters_to_checkbox('grown_heights', 'Grown Height')}
                    {filters_to_checkbox('grown_spreads', 'Grown Spread')}
                    {filters_to_checkbox('growth_rates', 'Growth Rate')}
                    {filters_to_checkbox('salt_tolerances', 'Salt Tolerance')}
                    {filters_to_checkbox('attracts_polinators_and_wildlife', 'Pollinator')}
                    {filters_to_checkbox('light_ranges', 'Light Range')}
                    {filters_to_checkbox('soil_moistures', 'Soil Moisture')}
                    {filters_to_checkbox('soil_phs', 'Soil PH')}
                    {filters_to_checkbox('soil_types', 'Soil Type')}
                    {filters_to_checkbox('zones', 'Zone')}
                    {/* {filters_to_checkbox(['Yes', 'No'], 'Jersey Native')}
                    {filters_to_checkbox(['Yes', 'No'], 'Discountable')} */}
                </ArrowMenu>
                <ShoppingList session={session} sort={sortBy} filters={filters} />
        </StyledShoppingPage>
    );
}

ShoppingPage.propTypes = {
    user_roles: PropTypes.array,
    session: PropTypes.object,
    theme: PropTypes.object,
}

export default memo(ShoppingPage);