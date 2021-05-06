import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Image extends Model {
    static tableName = TABLES.Image;
}