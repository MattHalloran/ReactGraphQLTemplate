import React, { memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../SearchBar/SearchBar';
import ShoppingList from '../ShoppingList/ShoppingList';
import ArrowMenu from 'components/shared/menus/ArrowMenu/ArrowMenu';
import Button from 'components/shared/Button/Button';
import { BUSINESS_NAME, USER_ROLES } from 'consts';
import { getInventoryFilters } from "query/http_promises";

function ShoppingPage(props) {
    const [filters, setFilters] = useState(null);

    useEffect(() => {
        document.title = `Shop | ${BUSINESS_NAME}`;
        let mounted = true;
        getInventoryFilters()
            .then((response) => {
                if (!mounted) return;
                setFilters(response);
                console.log('SETING FILTERSSSSSSSSSS', response);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });

        return () => mounted = false;
    }, []);

    const handleCheckboxChange = (title, value) => {
        console.log('YOOOOOOOOO', title, value)
    }

    const filters_to_checkbox = (list, title, onChange) => {
        if (!list || !Array.isArray(list) || list.length <= 0) return null;
        let filters = list.map((value, index) => (
            <tr key={index}>
                <td><input type="checkbox" value={value} name={title} onChange={(e) => handleCheckboxChange(title, e.target.value)} /> {value}</td>
            </tr>
        ))
        return <React.Fragment>
            <table className="checkbox-group" onChange={onChange}>
                <tbody>
                    <tr><td>{title}</td></tr>
                    {filters}
                </tbody>
            </table>
        </React.Fragment>
    }

    let display;
    let is_customer = false;
    let roles = props.user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            console.log('SHOPPING PAGE FOUND ROLEEEEE', r)
            if (r.title === USER_ROLES.Customer ||
                r.title === USER_ROLES.Admin) {
                is_customer = true;
            }
        })
    }
    if (is_customer) {
        display =
            <React.Fragment>
                <ArrowMenu >
                    <h2>Search</h2>
                    <SearchBar />
                    <h2>Filters</h2>
                    {filters_to_checkbox(filters?.sizes, 'Sizes')}
                    {filters_to_checkbox(filters?.optimal_lights, 'Optimal Light')}
                    {filters_to_checkbox(filters?.drought_tolerances, 'Drought Tolerance')}
                    {filters_to_checkbox(filters?.grown_heights, 'Grown Height')}
                    {filters_to_checkbox(filters?.grown_spreads, 'Grown Spread')}
                    {filters_to_checkbox(filters?.growth_rates, 'Growth Rate')}
                    {filters_to_checkbox(filters?.salt_tolerances, 'Salt Tolerance')}
                    {filters_to_checkbox(filters?.attracts_polinators_and_wildlife, 'Pollinator')}
                    {filters_to_checkbox(filters?.light_ranges, 'Light Range')}
                    {filters_to_checkbox(filters?.soil_moistures, 'Soil Moisture')}
                    {filters_to_checkbox(filters?.soil_phs, 'Soil PH')}
                    {filters_to_checkbox(filters?.soil_types, 'Soil Type')}
                    {filters_to_checkbox(filters?.zones, 'Zone')}
                    {filters_to_checkbox(['Yes', 'No'], 'Jersey Native')}
                    {filters_to_checkbox(['Yes', 'No'], 'Discountable')}
                </ArrowMenu>
                <ShoppingList session={props.session} />
            </React.Fragment >
    } else {
        display =
            <React.Fragment>
                <h1>Not for u :(</h1>
            </React.Fragment>
    }

    return (
        <StyledShoppingPage>
            { display}
        </StyledShoppingPage>
    );
}

ShoppingPage.propTypes = {
    user_roles: PropTypes.array,
    session: PropTypes.object,
}

export default memo(ShoppingPage);