import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Phone extends Model {
    static get tableName() {
        return TABLES.Phone
    }
}