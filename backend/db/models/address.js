import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Address extends Model {
    static tableName = TABLES.Address;
}