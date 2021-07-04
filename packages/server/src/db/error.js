import { ApolloError } from 'apollo-server-express';

export class CustomError extends ApolloError {
    constructor(error) {
        super(error.message, error.code);

        Object.defineProperty(this, 'name', { value: 'CustomError' });
    }
}