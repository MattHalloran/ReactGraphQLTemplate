import { TYPES } from './types';

export const TRAIT_NAME = {
    DroughtTolerance: 'Drought tolerance',
    GrownHeight: 'Grown height',
    GrownSpread: 'Grown spread',
    GrowthRate: 'Growth rate',
    JerseryNative: 'Jersey native',
    OptimalLight: 'Optimal light',
    PlantType: 'Plant type',
    SaltTolerance: 'Salt tolerance',
    AttractsPollinatorsAndWildlife: 'Attracts pollinators and wildlife',
    BloomTime: 'Bloom time',
    BloomColor: 'Bloom color',
    Zone: 'Zone',
    PhysiographicRegion: 'Physiographic region',
    SoilMoisture: 'Soil moisture',
    SoilPh: 'Soil PH',
    SoilType: 'Soil Type',
    LightRange: 'Light range'
}

export const createType = `
CREATE TABLE IF NOT EXISTS ${TYPES.ImageUse} as ENUM (
    ${Object.values(TRAIT_NAME).join(', ')}
)
`;