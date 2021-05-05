import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Trait extends Model {
    static get tableName() {
        return TABLES.Trait
    }
}