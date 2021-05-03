import { pool } from './pool';

class Model {
    constructor(table) {
        this.pool = pool;
        this.table = table;
        this.pool.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
    }

    async query(input) {
        return this.pool.query(input);
    }

    // columns - array of requested columns, or an empty array for *
    async select(columns, clause) {
        let requested_columns = columns?.length === 0 ? columns.join(', ') : '*';
        let query = `SELECT ${requested_columns} FROM ${this.table} `;
        if (clause) query += clause;
        return this.pool.query(query);
    }

    // columns - array of all columns being set
    // values - array of values
    async create(columns, values) {
        let query = `INSERT INTO ${this.table}(${columns.join(', ')}) VALUES 
        (${values.map(v => `'${v}'`).join(', ')})`;
        return this.pool.query(query);
    }

    // ex: someModel.delete(`id = ${the_id}`)
    async delete(where) {
        let query = `DELETE FROM ${this.table} WHERE ${where}`;
        return this.pool.query(query);
    }

    // columns - array of requested columns
    async update(columns, values, where) {
        let query = `UPDATE ${this.table} SET (${columns.join(', ')}) = (${values.map(v => `'${v}'`).join(', ')}) WHERE ${where}`;
        return this.pool.query(query);
    }

    async fromId(id) {
        return this.pool.query(`SELECT * FROM ${this.table} WHERE id = ${id}`);
    }

    async fromValue(column, value) {
        return this.pool.query(`SELECT * FROM ${this.table} WHERE ${column} = '${value}'`);
    }

    async allIds(clause) {
        let query = `SELECT id FROM ${this.table} `;
        if (clause) query += clause;
        return this.pool.query(query);
    }

    async any(column, value) {
        return this.pool.query(`select exists(select 1 from ${this.table} where ${column} = '${value}') `);
    }
}

export default Model;