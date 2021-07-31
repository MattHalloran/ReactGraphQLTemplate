import { CODE } from '@local/shared';
import getFieldNames from 'graphql-list-fields';
import { db } from './db';
import { CustomError, validateArgs } from './error';
import _ from 'lodash';
import { MODELS, REL_TYPE } from './relationships';

// Determines if a given query is authorized, using
// the security policy
// Arguments:
// queryType - 'select', 'insert', 'update', or 'delete'
// policy - the user's security policy
export const isAuthorized = (queryType, policy) => {
    //TODO
    return true;
}