// Functions for manipulating arrays, especially state arrays

export const addToArray = (array, value) => {
    return [...array, value];
}

export const updateArray = (array, index, value) => {
    if (JSON.stringify(array[index]) === JSON.stringify(value)) return array;
    let copy = [...array];
    copy[index] = value;
    return copy;
}

export const deleteArrayIndex = (array, index) => {
    return array.filter((_, i) => i !== index);
}

export const findWithAttr = (array, attr, value) => {
    for(let i = 0; i < array.length; i += 1) {
        console.log('JUICE', array[i][attr], value)
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}