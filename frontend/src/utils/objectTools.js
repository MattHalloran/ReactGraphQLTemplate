// Functions for manipulating state objects

export const addToObject = (object, key, value) => {
    return {...object, [key]: value};
}

export const updateObject = (object, key, value) => {
    if (JSON.stringify(object.key) === JSON.stringify(value)) return object;
    return {...object, [key]: value};
}

export const deleteObjectKey = (object, key) => {
    let copy = {...object};
    delete copy[key];
    return copy;
}