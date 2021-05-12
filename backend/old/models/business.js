import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Business extends Model {
    static tableName = TABLES.Business;
}