import { TABLES } from '../tables';
import { TASK_STATUS } from '../../type/taskStatusType';
import { TYPES } from '../../type/types';

const DEFAULTS = {
    Status: TASK_STATUS.Active
}

// task_id - PID of the task
export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Task} (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    name VARCHAR(256) NOT NULL,
    status ${TYPES.TaskStatus} DEFAULT '${DEFAULTS.Status}' NOT NULL,
    description VARCHAR(1024),
    result VARCHAR(8192),
    result_code INT
)
`;