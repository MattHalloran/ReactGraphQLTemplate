import { Model } from 'objection';
import { TABLES } from '../tables';

export default class OrderItem extends Model {
    static get tableName() {
        return TABLES.OrderItem
    }
}