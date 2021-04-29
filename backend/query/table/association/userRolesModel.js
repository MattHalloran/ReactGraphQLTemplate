import { TABLES } from '../tables';

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.UserRoles} (
    user_id INT NOT NULL references ${TABLES.User}(id) ON UPDATE CASCADE,
    role_id INT NOT NULL references ${TABLES.Role}(id) ON UPDATE CASCADE,
)
`;

export const insertInitialData = ``;