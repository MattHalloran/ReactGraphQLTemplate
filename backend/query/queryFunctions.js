import { pool } from './pool';
import * as AllTypes from '../db/type';
import * as AllTables from '../db/type';
import { TABLES } from './models/tables';
import { ACCOUNT_STATUS } from '../db/type/accountStatusType';

export const executeQueryArray = async arr => new Promise(resolve => {
  const stop = arr.length;
  arr.forEach(async (q, index) => {
    await pool.query(q);
    if (index + 1 === stop) resolve();
  });
});

export const createTypes = () => executeQueryArray(Object.keys(AllTypes).map(t => AllTypes[t].createType));
export const dropTypes = () => executeQueryArray(Object.entries(TABLES).map(e => `DROP TYPE ${e[1]}`));

export const createTables = () => executeQueryArray(Object.keys(AllTables).map(t => AllTables[t].createTable));
export const dropTables = () => executeQueryArray(Object.entries(TABLES).map(e => `DROP TABLE ${e[1]}`));

export const initializeDatabase = () => new Promise(resolve => {
    await dropTables();
    await dropTypes();
    await createTables();
    await createTypes();
    await pool.query(`
        INSERT INTO ${TABLES.Role}(title, description) VALUES 
        ('Customer', 'This role allows a user to order products'),
        ('Admin', 'This role grants administrative access. This comes with the ability to \
        approve new customers, change customer information, modify inventory and \
        contact hours, and more.')
    `)
    // TODO hash password
    await pool.query(`
        INSERT INTO ${TABLES.User}(first_name, last_name, password, account_approved, account_status) VALUES 
        ('admin', 'account', '${process.env.ADMIN_PASSWORD}', true, '${ACCOUNT_STATUS.Unlocked}') RETURNING id;
    `)
    await pool.query(`
        INSERT INTO ${TABLES.Email}(email_address, receives_delivery_updates, user_id) VALUES 
        ('${process.env.ADMIN_EMAIL}', false, (SELECT id from ${TABLES.User} WHERE first_name='admin'))
    `)
    await pool.query(`
        INSERT INTO ${TABLES.UserRoles}(user_id, role_id) VALUES 
        ((SELECT id from ${TABLES.User} WHERE first_name='admin'), (SELECT id from ${TABLES.Role} WHERE title='Admin'))
    `)
    resolve();
})