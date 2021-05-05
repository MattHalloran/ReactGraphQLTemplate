import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Discount extends Model {
    static get tableName() {
        return TABLES.Discount
    }
}