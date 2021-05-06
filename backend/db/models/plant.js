import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Plant extends Model {
    static tableName = TABLES.Plant;
}