import { TYPES } from './types';

export const IMAGE_USE = {
    Hero: 'Hero',
    Gallery: 'Gallery',
    PlantFlower: 'Plant Flower',
    PlantLeaf: 'Plant Leaf',
    PlantFruit: 'Plant Fruit',
    PlantBark: 'Plant Bark',
    PlantHabit: 'Plant Habit',
    Display: 'Display'
}

export const createType = `
CREATE TABLE IF NOT EXISTS ${TYPES.ImageUse} as ENUM (
    ${Object.values(IMAGE_USE).join(', ')}
)
`;