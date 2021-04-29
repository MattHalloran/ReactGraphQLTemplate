import { ACCOUNT_STATUS } from '../../type/accountStatusType';
import { THEME } from '../../type/themeType';
import { TYPES } from '../../type/types';
import { TABLES } from '../tables';

const DEFAULTS = {
    Pronouns: 'they/them/theirs',
    Theme: THEME.Light,
    AccountApproved: false,
    AccountStatus: ACCOUNT_STATUS.WaitingEmailVerification
}

export const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
export const SOFT_LOCKOUT_DURATION_SECONDS = 15*60;
export const LOGIN_ATTEMPTS_TO_HARD_LOCKOUT = 10;

// Numbers should be stored without formatting
export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.User} (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(32) DEFAULT md5(random()::text) NOT NULL UNIQUE,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    pronouns VARCHAR(64) DEFAULT '${DEFAULTS.Pronouns}' NOT NULL,
    theme ${TYPES.Theme} DEFAULT '${DEFAULTS.Light}' NOT NULL,
    password VARCHAR(256) NOT NULL,
    login_attempts INT DEFAULT 0 NOT NULL,
    last_login_attempt BIGINT DEFAULT extract(epoch from now() at time zone 'utc' at time zone 'utc') NOT NULL,
    session_token VARCHAR(256),
    account_approved BOOLEAN DEFAULT ${DEFAULTS.AccountApproved} NOT NULL,
    account_status ${TYPES.AccountStatus} DEFAULT '${DEFAULTS.AccountStatus}' NOT NULL,
    business_id INT references ${TABLES.Business}(id)
)
`;