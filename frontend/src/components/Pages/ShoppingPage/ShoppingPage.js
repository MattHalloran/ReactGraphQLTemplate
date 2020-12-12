import React from 'react'
import PropTypes from 'prop-types';
import { StyledShoppingPage } from './ShoppingPage.styled';
import SearchBar from '../../SearchBar';
import ShoppingList from '../../ShoppingList';

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
        let auth = this.props.user && this.props.user.token !== null;
        console.log("BOOBIESSSS", auth, this.props);
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
    user: PropTypes.object.isRequired,
}

export default ShoppingPage;