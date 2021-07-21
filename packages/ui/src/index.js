import ReactDOM from 'react-dom';
import { App } from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import { SERVER_QUERY_URL } from '@local/shared';
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
} from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

// GraphQL Setup
const client = new ApolloClient({
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

ReactDOM.render(
    <BrowserRouter>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </BrowserRouter>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
