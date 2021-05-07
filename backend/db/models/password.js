import { Model } from 'objection';
import bcrypt from 'bcrypt';

export const HASHING_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;
const VALID_PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/;
const BCRYPT_HASH_REGEX = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;
const PASSWORD_FIELD = 'password';

// Checks if password follows validation rules, which are:
//  between min and max length
//  -Has at least one number
//  -Has at least one lower case letter
//  -Has at least one upper case letter
export function isPasswordValid(password) {
    return password.length >= MIN_PASSWORD_LENGTH && 
            password.length <= MAX_PASSWORD_LENGTH &&
            password.match(VALID_PASSWORD_REGEX);
}

export class Password extends Model {

    async $beforeInsert(...args) {
        await super.$beforeInsert(...args)

        return await this.generateHash()
    }

    async $beforeUpdate(queryOptions, ...args) {
        await super.$beforeUpdate(queryOptions, ...args)

        if (queryOptions.patch && this[PASSWORD_FIELD] === undefined) {
            return
        }

        return await this.generateHash()
    }

    // Compares a password to a bcrypt hash, returns whether or not the password was verified.
    async verifyPassword(password) {
        return await bcrypt.compare(password, this[PASSWORD_FIELD])
    }

    /* Sets the password field to a bcrypt hash of the password.
     * Only does so if the password is not already a bcrypt hash. */
    async generateHash() {
        const password = this[PASSWORD_FIELD]

        if (password) {
            if (this.constructor.isBcryptHash(password)) {
                throw new Error('bcrypt tried to hash another bcrypt hash')
            }

            const hash = await bcrypt.hash(password, HASHING_ROUNDS)
            this[PASSWORD_FIELD] = hash

            return hash
        }

        // Throw an error if password is empty
        throw new Error('password must not be empty')
    }

    /* Detect rehashing to avoid undesired effects.
     * Returns true if the string seems to be a bcrypt hash. */
    static isBcryptHash(str) {
        return BCRYPT_HASH_REGEX.test(str)
    }
}