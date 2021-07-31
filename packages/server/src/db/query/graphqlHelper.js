
import { CODE } from '@local/shared';
import getFieldNames from 'graphql-list-fields';
import { db } from './db';
import { CustomError, validateArgs } from './error';
import _ from 'lodash';
import { MODELS, REL_TYPE } from './relationships';

// Wraps query builder calls with extra graphql functionality, such as automatic selection on inserts and updates

