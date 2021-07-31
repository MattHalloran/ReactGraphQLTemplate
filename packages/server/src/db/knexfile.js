const env1 = {
    client: 'pg',
    connection: {
        host: process.env.DB_CONN.split(':')[0],
        port: process.env.DB_CONN.split(':')[1],
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    pool: {
        min: 2,
        max: 10,
    },
    migrations: {
        directory: './migrations',
        tableName: 'knex_migrations',
    },
    seeds: {
        directory: './seeds',
    }
}

export default {
    development: env1,
    production: env1
}