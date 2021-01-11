import React from 'react';
import * as authQuery from 'query/auth';

export function requireAuthentication(Component, token) {
    class AuthenticatedComponent extends React.Component {
        constructor(props) {
            super(props);
            this.checkAuth();
        }

        checkAuth() {
            if (token === null) {
                authQuery.checkCookies().then().catch(() => {
                    this.props.history.push('/');
                })
            }
        }

        render() {
            if (token !== null) {
                return (
                    <Component {...this.props} />
                );
            }
            return null;
        }
    }

    return AuthenticatedComponent;
}