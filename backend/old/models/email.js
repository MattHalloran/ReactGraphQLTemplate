import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Email extends Model {
    static tableName = TABLES.Email;
}