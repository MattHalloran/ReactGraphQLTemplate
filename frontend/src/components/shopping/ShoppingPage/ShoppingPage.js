import React, { memo, useEffect } from 'react'
import PropTypes from 'prop-types';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../SearchBar/SearchBar';
import ShoppingMenu from '../ShoppingMenu/ShoppingMenu';
import ShoppingList from '../ShoppingList/ShoppingList';
import { BUSINESS_NAME, USER_ROLES } from 'consts';

function ShoppingPage(props) {

    useEffect(() => {
        document.title = `Shop | ${BUSINESS_NAME}`;
    }, [])

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
                <ShoppingMenu />
                <SearchBar />
                <ShoppingList />
            </React.Fragment >
    } else {
        display =
            <React.Fragment>
                <h1>Not for u :(</h1>
            </React.Fragment>
    }

    return (
        <StyledShoppingPage>
            { display }
        </StyledShoppingPage>
    );
}

ShoppingPage.propTypes = {
    user_roles: PropTypes.array,
}

export default memo(ShoppingPage);