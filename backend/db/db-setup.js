import knex from 'knex';
import knexfile from './knexfile';
import { Model } from 'objection';

export default function setupDb() {
    const db = knex(knexfile.development);
    Model.knex(db);
}