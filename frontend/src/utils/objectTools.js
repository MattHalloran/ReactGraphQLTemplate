// Functions for manipulating state objects

export const addToObject = (array, key, value) => {
    return {...array, [key]: value};
}

export const updateObject = (array, key, value) => {
    if (JSON.stringify(array.key) === JSON.stringify(value)) return array;
    console.log('IN UPDATE OBJECT', {...array, [key]: value})
    return {...array, [key]: value};
}

export const deleteObjectKey = (array, key) => {
    let copy = {...array};
    delete copy[key];
    return copy;
}