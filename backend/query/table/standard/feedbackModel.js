import { TABLES } from '../tables';

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Feedback} (
    id SERIAL PRIMARY KEY,
    text VARCHAR(5000) NOT NULL,
    user_id INT references ${TABLES.User}(id)
)
`;