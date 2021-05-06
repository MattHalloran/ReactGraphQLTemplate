import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Feedback extends Model {
    static tableName = TABLES.Feedback;
}