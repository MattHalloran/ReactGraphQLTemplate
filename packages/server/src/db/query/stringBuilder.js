// Creates a string representation of a map of the fields in a class
export const fieldsToString = (label, fields) => {
    return fields.map(f => `'${f}', "${label}"."${f}"`).join(', ')
}

// =====================================================================
// -------------------------- Select -----------------------------------
// =====================================================================

// Creates a string for an array_agg call (i.e. one-to-many relationship)
// ex: `array_agg(json_build_object('id', c.id, 'name', c.name)) as class`
export const createArrayAgg = (rel, label) => {
    return ` array_agg(json_build_object(
        ${fieldsToString(label, ['id', ...rel.exposedFields()])}
    )) as ${rel.name}`;
}

// Creates a string for a json_build_object call (i.e. one-to-one relationship)
// ex: `json_build_object('id', c.id, 'name', c.name) as class`
export const createJsonBuildObject = (rel, label) => {
    return ` json_build_object(
        ${fieldsToString(label, ['id', ...rel.exposedFields()])}
    ) as ${rel.name}`;
}

// Returns both the array_agg and left join required for querying a one-to-one relationship
// rel - The relationship object
// className - The relationship's class name
// labels - [relationship's class label, main class label]
export const oneToOneStrings = (rel, labels) => {
    return [
        createJsonBuildObject(rel, labels.right), 
        ` left join "${rel.classNames[0]}" "${labels.right}" on "${labels.left}"."${rel.ids[0]}" = "${labels.right}"."id"`
    ];
}

// Returns both the array_agg and left join required for querying a one-to-many relationship
// rel - The relationship object
// className - The relationship's class name
// labels - [relationship's class label, main class label]
export const oneToManyStrings = (rel, labels) => {
    return [
        createArrayAgg(rel, labels.right), 
        ` left join "${rel.classNames[0]}" "${labels.right}" on "${labels.right}"."${rel.ids[0]}" = "${labels.left}"."id"`
    ];
}

// Returns both the array_agg and left joins required for querying a many-to-many relationship
// rel - The relationship object
// classNames - [relationship's class name, joining class name]
// labels - [relationship's class label, joining class label, main class label]
export const manyToManyStrings = (rel, labels) => {
    return [
        createArrayAgg(rel, labels.right), 
        ` left join "${rel.classNames[1]}" "${labels.join}" on "${labels.join}"."${rel.ids[0]}" = "${labels.left}"."id"
          left join "${rel.classNames[0]}" "${labels.right}" on "${labels.join}"."${rel.ids[1]}" = "${labels.right}"."id"`
    ];
}