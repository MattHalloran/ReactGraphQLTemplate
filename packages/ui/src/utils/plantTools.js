// Functions for easy manipulation of plant data

import { addToArray, updateArray } from "./arrayTools";
import { updateObject } from "./objectTools";

export const getPlantTrait = (traitName, plantData) => {
    if (!(typeof traitName === 'string')) return null;
    const lowered = traitName.toLowerCase();
    return plantData?.traits ? plantData.traits.find(t => t.name.toLowerCase() === lowered)?.value : null;
}

export const setPlantTrait = (name, value, plantData, createIfNotExists=false) => {
    if (!plantData?.traits) return null;
    if (!(typeof name === 'string')) return null;
    const lowered = name.toLowerCase();
    const traitIndex = plantData.traits.findIndex(t => t?.name?.toLowerCase() === lowered);
    if (traitIndex < 0 && !createIfNotExists) return null;
    const updatedTraits = traitIndex < 0 ?
        addToArray(plantData.traits, { name, value }):
        updateArray(plantData.traits, traitIndex, { name, value });
    return updateObject(plantData, 'traits', updatedTraits);
}

export const setPlantSkuField = (fieldName, index, value, plantData) => {
    if (!Array.isArray(plantData?.skus)) return null;
    if (index < 0 || index >= plantData.skus.length) return null;
    const updatedSku = updateObject(plantData.skus[index], fieldName, value);
    const updatedSkus = updateArray(plantData.skus, index, updatedSku);
    return updateObject(plantData, 'skus', updatedSkus);
}