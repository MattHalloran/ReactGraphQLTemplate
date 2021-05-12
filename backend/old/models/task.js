import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Task extends Model {
    static tableName = TABLES.Task;
}