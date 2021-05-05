import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Image extends Model {
    static get tableName() {
        return TABLES.Image
    }
}