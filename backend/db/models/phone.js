import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Phone extends Model {
    static tableName = TABLES.Phone;
}