import React from 'react';
import { useHistory } from 'react-router-dom';
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
                const token = localStorage.getItem('token');
                console.log(token);
                if (!token) {
                    this.setState({ redirect: '/'});
                } else {
                    fetch('/api/is_token_valid', {
                        method: 'post',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json', // eslint-disable-line quote-props
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token }),
                    })
                        .then(res => {
                            if (res.status === 200) {
                                actionCreators.loginUserSuccess(token);
                                this.setState({
                                    loaded_if_needed: true,
                                    isAuthenticated: true,
                                });

                            } else {
                                this.setState({ redirect: '/' })
                            }
                        });

                }
            } else {
                this.setState({
                    loaded_if_needed: true,
                });
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