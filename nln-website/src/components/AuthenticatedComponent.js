import React from 'react';
import * as actionCreators from '../actions/auth';
import { Redirect } from "react-router-dom";

export function requireAuthentication(Component) {
    class AuthenticatedComponent extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                loginUserSuccess: false,
                isAuthenticated: false,
                loaded_if_needed: false,
                redirect: null,
            }
        }

        componentDidMount() {
            this.checkAuth();
        }

        componentWillReceiveProps(nextProps) {
            this.checkAuth(nextProps);
        }

        checkAuth() {
            if (!this.state.isAuthenticated) {
                actionCreators.checkJWT().then(() => {
                    console.log('found jwt!')
                    this.setState({
                        loaded_if_needed: true,
                        isAuthenticated: true,
                    });
                }).catch(() => {
                    console.log('dang nabbit')
                    this.setState({ redirect: '/' })
                })
            }
            else {
                this.setState({ loaded_if_needed: true });
            }
        }

        render() {
            if (this.state.redirect) {
                return <Redirect to={this.state.redirect} />
            }
            if (this.state.isAuthenticated && this.state.loaded_if_needed) {
                return (
                    <Component {...this.props} />
                );
            }
            return null;

        }
    }

    return AuthenticatedComponent;
}