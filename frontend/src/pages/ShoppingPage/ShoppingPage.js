import React, { memo } from 'react'
import PropTypes from 'prop-types';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../../components/SearchBar';
import ShoppingList from '../../components/ShoppingList';

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
            this.setState({authenticated: auth});
        }
    }

    render() {
        if (this.state.authenticated) {
            return (
                <StyledShoppingPage>
                    <SearchBar />
                    <ShoppingList />
                </StyledShoppingPage >
            );
        } else {
            return (
                <h1>Not for u :(</h1>
            );
        }
    }
}

ShoppingPage.propTypes = {
    roles: PropTypes.object.isRequired,
}

export default memo(ShoppingPage);