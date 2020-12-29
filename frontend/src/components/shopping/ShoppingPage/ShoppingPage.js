import React, { memo } from 'react'
import PropTypes from 'prop-types';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../SearchBar';
import ShoppingMenu from '../ShoppingMenu';
import ShoppingList from '../ShoppingList';

class ShoppingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: false,
        }
    }

    componentDidMount() {
        document.title = "Shop | New Life Nursery";
        this.checkAuth();
    }

    componentDidUpdate() {
        this.checkAuth();
    }

    checkAuth() {
        let auth; //TODO - do something similar to menu.js
        if (auth !== this.state.authenticated) {
            this.setState({ authenticated: auth });
        }
    }

    render() {
        let is_customer = false;
        let roles = this.props.user_roles;
        if (roles instanceof Array) {
            roles?.forEach(r => {
                if (r.title === "Customer") {
                    is_customer = true;
                }
            })
        }
        if (is_customer) {
            return (
                <StyledShoppingPage>
                    <ShoppingMenu />
                    <SearchBar />
                    <ShoppingList />
                </StyledShoppingPage >
            );
        } else {
            return (
                <StyledShoppingPage>
                    <h1>Not for u :(</h1>
                </StyledShoppingPage>
            );
        }
    }
}

ShoppingPage.propTypes = {
    user_roles: PropTypes.array,
}

export default memo(ShoppingPage);