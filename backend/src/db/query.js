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

import { CODE } from '@local/shared';
import getFieldNames from 'graphql-list-fields';
import { db } from './db';
import { CustomError } from './error';

export class Label {
    constructor(right, join, left) {
        this.right = right;
        this.join = join;
        this.left = left;
    }
}

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
export const fieldsToString = (label, fields) => {
    console.log('fields tos tring', fields)
    return fields.map(f => `'${f}', "${label}"."${f}"`).join(', ')
}

// Creates a string for an array_agg call (i.e. one-to-many relationship)
// ex: `array_agg(json_build_object('id', c.id, 'name', c.name)) as class`
export const createArrayAgg = (rel, label) => {
    console.log('in array agg', rel.name, rel.exposedFields())
    return ` array_agg(json_build_object(
        ${fieldsToString(label, rel.exposedFields())}
    )) as ${rel.name}`;
}

// Creates a string for a json_build_object call (i.e. one-to-one relationship)
// ex: `json_build_object('id', c.id, 'name', c.name) as class`
export const createJsonBuildObject = (rel, label) => {
    return ` json_build_object(
        ${fieldsToString(label, rel.exposedFields())}
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
    console.log('one to many', rel.name, rel.exposedFields())
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
    console.log('many to many', rel.name)
    return [
        createArrayAgg(rel, labels.right), 
        ` left join "${rel.classNames[1]}" "${labels.join}" on "${labels.join}"."${rel.ids[0]}" = "${labels.left}"."id"
          left join "${rel.classNames[0]}" "${labels.right}" on "${labels.join}"."${rel.ids[1]}" = "${labels.right}"."id"`
    ];
}

// Creates a string to select an object and its relationships
// className - which table to query
// ids - which ids to query data for
// reqTuples - 2D array describing the table's requested relationships
export const fullSelectQuery = async (model, reqFields, ids) => {
    console.log('full select query');
    const leftLabel = 'main';
    const rightLabels = 'abcdefghijkl';
    const joinLabels = 'mnopqrstuvwxyz';
    const reqRels = model.relationships.filter(r => inFields(r.name, reqFields));
    // Start the query
    let query = `select "${leftLabel}".*`;
    // Grab all substrings for relationships
    let reqStrings = [];
    let groupBys = [];
    for(let i = 0; i < reqRels.length; i++) {
        let curr =reqRels[i];
        let args = [curr, new Label(rightLabels[i], joinLabels[i], leftLabel)]
        if (curr.type === 'one') {
            reqStrings.push(oneToOneStrings(...args));
            groupBys.push(rightLabels[i]);
        } else if (curr.type === 'many') {
            reqStrings.push(oneToManyStrings(...args));
            groupBys.push(rightLabels[i]);
        } else if (curr.type === 'many-many') {
            reqStrings.push(manyToManyStrings(...args))
        } else throw Error('Invalid type passed into query builder. Expected, one, many, or many-many');
    }
    // Append arrays and jsons to query
    for (let i = 0; i < reqStrings.length; i++) {
        query += `,  ${reqStrings[i][0]}`;
    }
    query += ` from "${model.name}" "${leftLabel}"`;
    // Append joins to query
    for (let i = 0; i < reqStrings.length; i++) {
        query += reqStrings[i][1];
    }
    // Append where, if specific ids were selected
    if (ids !== null && ids !== undefined) {
        console.log('yee', ids)
        const id_string = ids.map(i => `'${i}'`).join(', ');
        console.log('yye', id_string)
        query += ` where "${leftLabel}"."id" in (${id_string})`;
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
    for (let i = 0; i < reqRels.length; i++) {
        let curr = reqRels[i];
        for (let j = 0; j < rows.length; j++) {
            let row = rows[j];
            if (isNull(row[curr.name])) {
                if (curr.type === 'one') delete row[curr.name];
                else row[curr.name] = [];
            }
        }
    }
    //console.log('QUERY RESULTS: ', rows)
    return rows;
}

// Helps generate a full select query, using the GraphQL info object
export const fullSelectQueryHelper = async (model, info, ids) => {
    const requested_fields = info ? getFieldNames(info) : [];
    return fullSelectQuery(model, requested_fields, ids);
}

// Updates a model's exposed fields, except for those explicity excluded
// If the field is not in args, defaults to curr's field value
// If the model's id is not passed in, grabs from args
// If curr is not passed in, uses the id to query for it
// Returns the updated object
// Arguments:
// model - the model object
// args - GraphQL arguments
// curr - an object containing the value's current data, or null
// id - the id of the row being updated
// excluded - an array of strings of each exposed field you'd like to exclude
export const updateHelper = async (model, args, curr, id, excluded = []) => {
    // Find the updating row's id
    if (id === undefined || id === null) id = args.id;
    // Find model's current data
    if (curr === undefined || curr === null) curr = await db(table).where('id', id).first();
    // Create array of updatable fields
    const fields = model.exposedFields().filter(f => !excluded.includes(f) );
    // Create update object
    let update_data = {};
    for (let i = 0; i < fields.length; i++) {
        if (!curr.hasOwnProperty(fields[i])) continue;
        update_data[fields[i]] = args.hasOwnProperty(fields[i]) ? 
            args[fields[i]] : curr[fields[i]];
    }
    // Perform the update
    return await db(model.name).where('id', id).update(update_data).returning('*');
}

// Inserts joining table (many-to-many) rows
// **NOTE** - Only associates objects (i.e. only adds to the joining table)
// Arguments:
// model - the model object
// rel_name - the relationship's name
// main_id - id of main relationship object
// foreign_ids - array of foreign ids to be added
export const insertJoinRowsHelper = async (model, rel_name, main_id, foreign_ids) => {
    if (!Array.isArray(foreign_ids) || !foreign_ids.length) return;
    const relationship = model.getRelationship(rel_name);
    const rowData = foreign_ids.map(row_id => 
        ({ 
            [relationship.ids[0]]: main_id, 
            [relationship.ids[1]]: row_id 
        })); 
    await db(relationship.classNames[1]).insert(rowData);
}

// Deletes a list of rows from a table
// Returns a success or error message
// Arguments:
// table - a string of the table's name
// ids - an array of ids of the rows being deleted
export const deleteHelper = async (table, ids, column = 'id') => {
    const numDeleted = await db(table).delete().whereIn(column, ids);
    return new CustomError(numDeleted === ids.length ? CODE.Success : CODE.ErrorUnknown);
}