export const deepEqual = (a, b) => {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (a.prototype !== b.prototype) return false;
    let keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every(k => deepEqual(a[k], b[k]));
};

/// Returns true if both objects contain the same keys
export const matches = (obj, source) =>
  Object.keys(source).every(key => obj.hasOwnProperty(key) && obj[key] === source[key]);

// Returns true if an object is a string
// https://stackoverflow.com/a/24941988
export const isString = (obj) => {
    return (Object.prototype.toString.call(obj) === '[object String]');
}