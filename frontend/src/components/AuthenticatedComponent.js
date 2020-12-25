import React from 'react';
import * as authQuery from '../query/auth';
import { Redirect } from "react-router-dom";

export function requireAuthentication(Component, token) {
    class AuthenticatedComponent extends React.Component {
        constructor(props) {
            super(props);
            this.checkAuth();
            this.state = {
                redirect: null,
            }
        }

        checkAuth() {
            if (token === null) {
                authQuery.checkCookies().then().catch(() => {
                    this.setState({ redirect: '/' })
                })
            }
        }

        render() {
            if (token !== null) {
                return (
                    <Component {...this.props} />
                );
            } else if (this.state.redirect != null) {
                return <Redirect to={this.state.redirect} />
            }
            return null;
        }
    }

    return AuthenticatedComponent;
}