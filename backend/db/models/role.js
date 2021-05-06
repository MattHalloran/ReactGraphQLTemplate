import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Role extends Model {
    static tableName = TABLES.Role;
}