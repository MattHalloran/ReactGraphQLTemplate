import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Sku extends Model {
    static get tableName() {
        return TABLES.Sku
    }
}