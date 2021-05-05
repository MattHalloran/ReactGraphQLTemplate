import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Address extends Model {
    static get tableName() {
        return TABLES.Address
    }
}