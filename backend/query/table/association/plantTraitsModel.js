import { TABLES } from '../tables';

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.PlantTaits} (
    plant_id INT NOT NULL references ${TABLES.Plant}(id) ON UPDATE CASCADE,
    trait_id INT NOT NULL references ${TABLES.Trait}(id) ON UPDATE CASCADE,
)
`;

export const insertInitialData = ``;