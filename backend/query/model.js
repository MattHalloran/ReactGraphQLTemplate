import { pool } from './pool';

class Model {
    constructor(table) {
        this.pool = pool;
        this.table = table;
        this.pool.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
    }

    // columns - array of requested columns, or an empty array for *
    async select(columns, clause) {
        let requested_columns = columns.length === 0 ? '*' : columns.join(', ');
        let query = `SELECT ${requested_columns} FROM ${this.table}`;
        if (clause) query += clause;
        return this.pool.query(query);
    }

    // columns - array of all columns being set
    // values - array of values
    async create(columns, values) {
        let query = `INSERT INTO ${this.table}(${columns.join(', ')}) VALUES 
        (${values.join(', ')})`;
        this.pool.query(query);
    }

    // ex: someModel.delete(`id = ${the_id}`)
    async delete(where) {
        let query = `DELETE FROM ${this.table} WHERE ${where}`;
        this.pool.query(query);
    }

    // columns - array of requested columns
    async update(columns, values, where) {
        let query = `UPDATE ${this.table} SET (${columns.join(', ')}) = (${values.join(', ')}) WHERE ${where}`;
        this.pool.query(query);
    }
}

export default Model;