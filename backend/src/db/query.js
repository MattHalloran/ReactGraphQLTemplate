// Helper methods for building query strings that easily convert to JSON
// Examples
// ---------------------------------------------
// Object with a single one-to-many relationship:
// Parent query with 0 or more children
// `select p.*, 
// array_agg(json_build_object('name', c.name, 'id', c.id)) as children
// from parent p 
// left join child c on c.parent_id = p.id 
// group by p.id;`
// ---------------------------------------------
// Object with a single one-to-one relationship:
// Child query with one parent
// `select c.*, 
// json_build_object('name', p.name, 'id', p.id) as parent 
// from child c 
// left join parent p on c.parent_id = p.id;`
// ---------------------------------------------
// Object with a one-to-one relationship and a one-to-many relationship:
// Child query with one parent and 0 or more children (grandchildren in absolute terms)
// `select c.*, 
// json_build_object('name', p.name, 'id', p.id) as parent, 
// array_agg(json_build_object('name', g.name, 'id', g.id)) as children 
// from child c 
// left join parent p on c.parent_id = p.id 
// left join grandchild g on g.parent_id = c.id 
// group by c.id, p.id;`
// ---------------------------------------------
// Object with a single many-to-many relationship:
// Parent with 0 or more children, using a join table
// select p.*, 
// array_agg(json_build_object('name', c.name, 'id', c.id)) as children
// from parent p 
// left join joiner j on j.parent_id = p.id
// left join child c on j.child_id = c.id 
// group by p.id;

import getFieldNames from 'graphql-list-fields';
import { db } from './db';

// Returns true if the specified relationship was requested
export const inFields = (field, requested_fields) => requested_fields.some(f => f.includes(`${field}.`));

// Returns true if object is filled with nulls
export const isNull = (object) => {
    if (object === null || object === undefined) return true;
    if (Array.isArray(object)) {
        return !object.some(o => !isNull(o));
    }
    return !Object.values(object).some(v => v !== null)
}

// Creates a string representation of a map of the fields in a class
export const fieldsToString = (classLabel, fields) => {
    console.log('in fields to string', fields)
    return fields.map(f => `'${f}', "${classLabel}"."${f}"`).join(', ')
}

// Creates a string for an array_agg call (i.e. one-to-many relationship)
// ex: ('class', 'c', ['id', 'name']) => `array_agg(json_build_object('id', c.id, 'name', c.name)) as class`
export const createArrayAgg = (relName, classLabel, fields) => {
    console.log('in array agg')
    return ` array_agg(json_build_object(
        ${fieldsToString(classLabel, fields)}
    )) as ${relName}`;
}

// Creates a string for a json_build_object call (i.e. one-to-one relationship)
// ex: ('class', 'c', ['id', 'name']) => `json_build_object('id', c.id, 'name', c.name) as class`
export const createJsonBuildObject = (relName, classLabel, fields) => {
    console.log('in json build')
    return ` json_build_object(
        ${fieldsToString(classLabel, fields)}
    ) as ${relName}`;
}

// Returns both the array_agg and left join required for querying a one-to-one relationship
export const oneToOneStrings = (relName, rightClass, rightFields, rightForeign, rightLabel, leftLabel) => {
    console.log('one to one', relName, rightFields)
    return [
        createJsonBuildObject(relName, rightLabel, rightFields), 
        ` left join "${rightClass}" "${rightLabel}" on "${leftLabel}"."${rightForeign}" = "${rightLabel}"."id"`
    ];
}

// Returns both the array_agg and left join required for querying a one-to-many relationship
export const oneToManyStrings = (relName, rightClass, rightFields, rightForeign, rightLabel, leftLabel) => {
    console.log('one to many', relName)
    return [
        createArrayAgg(relName, rightLabel, rightFields), 
        ` left join "${rightClass}" "${rightLabel}" on "${rightLabel}"."${rightForeign}" = "${leftLabel}"."id"`
    ];
}

// Returns both the array_agg and left joins required for querying a many-to-many relationship
export const manyToManyStrings = (relName, rightClass, joinClass, rightFields, leftJoinForeign, rightJoinForeign, rightLabel, leftLabel, joinLabel) => {
    console.log('many to many', relName)
    return [
        createArrayAgg(relName, rightLabel, rightFields), 
        ` left join "${joinClass}" "${joinLabel}" on "${joinLabel}"."${leftJoinForeign}" = "${leftLabel}"."id"
          left join "${rightClass}" "${rightLabel}" on "${joinLabel}"."${rightJoinForeign}" = "${rightLabel}"."id"`
    ];
}

// Creates a string to select an object and its relationships
export const fullSelectQuery = async (info, ids, className, relTuples) => {
    const leftLabel = 'main';
    const rightLabels = 'abcdefghijkl';
    const joinLabels = 'mnopqrstuvwxyz'
    // Filter out relationships that weren't requested
    const requested_fields = getFieldNames(info);
    console.log('rel tuples: ', relTuples)
    const reqTuples = relTuples.filter(t => inFields(t[1], requested_fields));
    console.log('req tuples: ', reqTuples)
    // Start the query
    let query = `select "${leftLabel}".*`;
    // Grab all substrings for relationships
    let reqStrings = [];
    let groupBys = [];
    for(let i = 0; i < reqTuples.length; i++) {
        let curr = [...reqTuples[i]];
        let type = curr.shift();
        let rightLabel = rightLabels[i];
        let args = [...curr, rightLabel, leftLabel];
        if (type === 'one') {
            console.log('pushing one to one string', ...args)
            reqStrings.push(oneToOneStrings(...args));
            groupBys.push(rightLabel);
        } else if (type === 'many') {
            reqStrings.push(oneToManyStrings(...args));
            groupBys.push(rightLabel);
        } else if (type === 'many-many') {
            reqStrings.push(manyToManyStrings(...args, joinLabels[i]))
        } else throw Error('Invalid type passed into query builder. Expected, one, many, or many-many');
    }
    // Append arrays and jsons to query
    for (let i = 0; i < reqStrings.length; i++) {
        query += `,  ${reqStrings[i][0]}`;
    }
    query += ` from "${className}" "${leftLabel}"`;
    // Append joins to query
    for (let i = 0; i < reqStrings.length; i++) {
        query += reqStrings[i][1];
    }
    // Append where, if specific ids were selected
    if (ids !== null && ids !== undefined) {
        console.log('we made it this far')
        const id_string = ids.map(i => `'${i}'`).join(', ')
        console.log('we made it even further')
        query += ` where "${leftLabel}"."id" in (${id_string})`
    }
    // Append group bys
    // Note: the only columns in group by should be the parent id, and all array_agg ids
    query += ` group by "${leftLabel}"."id"`;
    for (let i = 0; i < groupBys.length; i++) {
        query += `, "${groupBys[i]}"."id"`;
    }
    query += ';';
    console.log('BUILT QUERY IS: ', query);
    const results = await db.raw(query);
    const rows = results.rows;
    // Format relationships
    // If null one-to-one relationships were added (i.e. {'prop1': null, 'prop2': null}), 
    // convert them to null
    // If one-to-many relationships are missing, make them an empty array
    for (let i = 0; i < relTuples.length; i++) {
        let rel_type = relTuples[i][0];
        let rel_field = relTuples[i][1];
        for (let j = 0; j < rows.length; j++) {
            let row = rows[j];
            console.log('yee', rel_field, isNull(row[rel_field]))
            if (isNull(row[rel_field])) {
                if (rel_type === 'one') delete row[rel_field];
                else row[rel_field] = [];
            }
        }
    }
    console.log('QUERY RESULTS: ', rows)
    return rows;
}
