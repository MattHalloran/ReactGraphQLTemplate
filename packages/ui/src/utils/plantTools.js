// Functions for easy manipulation of plant data

import { addToArray, updateArray } from "./arrayTools";
import { updateObject } from "./objectTools";

export const getPlantTrait = (traitName, plantData) => {
    if (!(typeof traitName === 'string')) return null;
    const lowered = traitName.toLowerCase();
    return plantData?.traits ? plantData.traits.find(t => t.name.toLowerCase() === lowered)?.value : null;
}

export const setPlantTrait = (traitName, value, plantData) => {
    if (!plantData?.traits) return null;
    if (!(typeof traitName === 'string')) return null;
    const lowered = traitName.toLowerCase();
    const traitIndex = plantData.traits.findIndex(t => t?.name?.toLowerCase() === lowered);
    const updatedTraits = traitIndex < 0 ?
        addToArray(plantData.traits, value):
        updateArray(plantData.traits, traitIndex, value);
    return updateObject(plantData, 'traits', updatedTraits);
}

export const getPlantSkuField = (fieldName, index, plantData) => {
    if (!Array.isArray(plantData?.skus)) return null;
    if (index < 0 || plantData.skus.length >= index) return null;
    return plantData.skus[index][fieldName];
}

export const setPlantSkuField = (fieldName, index, value, plantData) => {
    if (!Array.isArray(plantData?.skus)) return null;
    if (index < 0 || plantData.skus.length >= index) return null;
    const updatedSku = updateObject(plantData.skus[index], fieldName, value);
    const updatedSkus = updateArray(plantData.skus, index, updatedSku);
    return updateObject(plantData, 'skus', updatedSkus);
}