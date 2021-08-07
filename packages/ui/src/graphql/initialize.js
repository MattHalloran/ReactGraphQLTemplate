import { useMemo } from 'react';
import { SERVER_QUERY_URL } from '@local/shared';
import {
    ApolloClient,
    InMemoryCache,
} from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

let apolloClient;

function createApolloClient() {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: createUploadLink({
            uri: SERVER_QUERY_URL,
            credentials: 'include'
        }),
        onError: ({ networkError, graphQLErrors }) => {
            // Only developers should see these error messages
            if (process.env.NODE_ENV === 'production') return;
            if (graphQLErrors) {
                graphQLErrors.forEach(({ message, location, path }) => {
                    console.error('GraphQL error occurred');
                    console.error(`Path: ${path}`);
                    console.error(`Location: ${location}`);
                    console.error(`Message: ${message}`);
                })
            }
            if (networkError) {
                console.error('GraphQL network error occurred', networkError);
            }
        }
    })
}

export function initializeApollo() {
    const _apolloClient = apolloClient ?? createApolloClient();
    if (!apolloClient) apolloClient = _apolloClient;

    return _apolloClient;
}

export function useApollo() {
    const store = useMemo(() => initializeApollo(), []);
    return store;
}