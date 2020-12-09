import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenu } from './Menu.styled';
import { Link } from 'react-router-dom';
import ContactInfo from '../ContactInfo';
import PubSub from '../../utils/pubsub';
import * as actionCreator from '../../actions/auth';

class Menu extends React.Component {
  //const location = useLocation();
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      open: this.props.open,
      closeMenu: this.props.closeMenu,
      loggedIn: this.props.loggedIn,
    }
  }

  componentDidMount() {
    this.userSub = PubSub.subscribe('User', (_, data) => {
      if (this.state.user !== data) {
        this.setState({ user: data })
      }
    });
  }

  render() {
    let options;
    // Things displayed to users that are logged in
    if (this.state.user.token == null) {
      options = <React.Fragment>
        <Link to={{
          pathname: "/register"
        }}>Sign Up</Link>
        <Link to={{
          pathname: "/login"
        }}>Log In</Link>
      </React.Fragment>
    } 
    // Things displayed to users that are not logged in
    else {
      options = <React.Fragment>
        <a href="/" onClick={() => actionCreator.logout()}>Log Out</a>
      </React.Fragment>
    }

    return (
      <StyledMenu open={this.props.open}>
        {options}
        {/* Things displayed no matter the login status */}
        <ContactInfo />
      </StyledMenu>
    );
  }
}

Menu.propTypes = {
  open: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
}

export default Menu;