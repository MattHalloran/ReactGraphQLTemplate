import { Model } from 'objection';
import { TABLES } from '../tables';

export default class User extends Model {
    static get tableName() {
        return TABLES.User
    }

    fullName() {
        return this.firstName + ' ' + this.lastName;
    }
}