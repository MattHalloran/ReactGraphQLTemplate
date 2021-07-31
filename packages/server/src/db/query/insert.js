import { CODE } from '@local/shared';
import getFieldNames from 'graphql-list-fields';
import { db } from './db';
import { CustomError, validateArgs } from './error';
import _ from 'lodash';
import { MODELS, REL_TYPE } from './relationships';