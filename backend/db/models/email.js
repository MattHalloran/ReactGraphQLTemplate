import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Email extends Model {
    static get tableName() {
        return TABLES.Email
    }
}