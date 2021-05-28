import { ApolloError } from 'apollo-server-express';

export class CustomError extends ApolloError {
    constructor(error) {
        super(error.msg, error.code);

        Object.defineProperty(this, 'name', { value: 'CustomError' });
    }
}