import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Order extends Model {
    static get tableName() {
        return TABLES.Order
    }
}