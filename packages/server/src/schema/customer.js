import {
    enumType,
} from 'nexus';
import { ACCOUNT_STATUS } from '@local/shared';

export const AccountStatus = enumType({
    name: 'AccountStatus',
    members: Object.values(ACCOUNT_STATUS),
})