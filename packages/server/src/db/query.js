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
import { CustomError, validateArgs } from './error';
import _ from 'lodash';
import { MODELS, REL_TYPE } from './relationships';

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
    console.log('fields to string', fields)
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

// Creates a string to select an object and its direct relationships
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
        if (curr.type === REL_TYPE.One) {
            reqStrings.push(oneToOneStrings(...args));
            groupBys.push(rightLabels[i]);
        } else if (curr.type === REL_TYPE.Many) {
            reqStrings.push(oneToManyStrings(...args));
            groupBys.push(rightLabels[i]);
        } else if (curr.type === REL_TYPE.ManyMany) {
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
    console.log('QUERY ROWS', rows);
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

// Selects all requested data, including nested children, using the GraphQL info object
// Since a full select query only goes one child deep, we must combine the results
export const fullSelectQueryHelper = async (model, info, ids) => {
    const requested_fields = info ? getFieldNames(info) : [];
    return fullSelectQuery(model, requested_fields, ids);
}

// Inserts joining table (many-to-many) rows
// **NOTE** - Only associates objects (i.e. only adds to the joining table)
// Arguments:
// model - the model object
// rel_name - the relationship's name
// main_id - id of main relationship object
// foreign_ids - array of foreign ids to be added
export const insertJoinRowsHelper = async (model, rel_name, main_id, foreign_ids) => {
    // If no foreign_ids, cancel
    if (!Array.isArray(foreign_ids) || !foreign_ids.length) return;
    const relationship = model.getRelationship(rel_name);
    const rowData = foreign_ids.map(row_id => 
        ({ 
            [relationship.ids[0]]: main_id, 
            [relationship.ids[1]]: row_id 
        })); 
    await db(relationship.classNames[1]).insert(rowData);
}

// Deletes joining table (many-to-many) rows
// **NOTE** - Only associates objects (i.e. only deletes from the joining table)
// Arguments:
// model - the model object
// rel_name - the relationship's name
// main_id - id of main relationship object
// foreign_ids - array of foreign ids to be removed
export const deleteJoinRowsHelper = async (model, rel_name, main_id, foreign_ids) => {
    // If no foreign_ids, cancel
    if (!Array.isArray(foreign_ids) || !foreign_ids.length) return;
    const relationship = model.getRelationship(rel_name);
    await db(relationship.classNames[1])
        .where(relationship.ids[0], main_id)
        .andWhere(relationship.ids[1], foreign_ids)
        .del();
}

// Updates joining table (many-to-many) rows
// **NOTE** - Only associates objects (i.e. only adds/deletes from the joining table)
// Arguments:
// model - the model object
// rel_name - the relationship's name
// main_id - id of main relationship object
// foreign_ids - array of foreign ids to be associated with the model
//               ids that are added and deleted are determined in this function
export const updateJoinRowsHelper = async (model, rel_name, main_id, foreign_ids) => {
    // Unlike add and delete, an empty array is fine
    if (!Array.isArray(foreign_ids)) return;
    const relationship = model.getRelationship(rel_name);
    // Determine existing ids in join table
    const existing_ids = await db(relationship.classNames[1])
                    .select(relationship.ids[1])
                    .where(relationship.ids[0], main_id);
    // Determine and add new rows
    const new_ids = foreign_ids.filter(id => !existing_ids.includes(id));
    await insertJoinRowsHelper(model, rel_name, main_id, new_ids);
    // Determine and delete old rows
    const old_ids = existing_ids.filter(id => !foreign_ids.includes(id));
    await deleteJoinRowsHelper(model, rel_name, main_id, old_ids);
}

// Adds children's foreign id in one-to-many relationship
// Arguments:
// model - the model object
// rel_name - the relationship's name
// parent_id - id of main relationship object
// child_ids - array of child ids
export const addChildRelationshipsHelper = async (model, rel_name, parent_id, child_ids) => {
    // If no foreign_ids, cancel
    if (!Array.isArray(child_ids) || !child_ids.length) return;
    const relationship = model.getRelationship(rel_name);
    await db(relationship.classNames[0])
        .whereIn(relationship.ids[0], child_ids)
        .update({ [relationship.ids[0]]: parent_id });
}

// Removes children's foreign id in one-to-many relationship
// Arguments:
// model - the model object
// rel_name - the relationship's name
// parent_id - id of main relationship object
// child_ids - array of child ids
export const removeChildRelationshipsHelper = async (model, rel_name, child_ids) => {
    // If no foreign_ids, cancel
    if (!Array.isArray(child_ids) || !child_ids.length) return;
    const relationship = model.getRelationship(rel_name);
    await db(relationship.classNames[0])
        .whereIn(relationship.ids[0], child_ids)
        .update({ [relationship.ids[0]]: null });
}

// Updates children's foreign id in one-to-one any one-to-many relationships
// Arguments:
// model - the model object
// rel_name - the relationship's name
// parent_id - id of main relationship object
// child_ids - array of child ids
export const updateChildRelationshipsHelper = async (model, rel_name, parent_id, child_ids) => {
    // Unlike add and delete, an empty array is fine
    if (!Array.isArray(child_ids)) return;
    const relationship = model.getRelationship(rel_name);
    // Determine existing child ids associated with parent
    const existing_ids = await db(relationship.classNames[0])
                    .select(relationship.ids[0])
                    .where(relationship.ids[0], parent_id);
    // Determine and add new relationships
    const new_ids = child_ids.filter(id => !existing_ids.includes(id));
    await addChildRelationshipsHelper(model, rel_name, parent_id, new_ids);
    // Determine and remove old relationships
    const old_ids = existing_ids.filter(id => !child_ids.includes(id));
    await removeChildRelationshipsHelper(model, rel_name, old_ids);
}

// Inserts a model into the database,
// while also handling its relationships
// Arguments:
// model - the model object
// info - GraphQL info
// input - the data being inserted into the model
//        can include relationship data
//          ex: {
//              name: 'boop',
//              age: 111
//              thingIds: [1, 2, 3],
//              otherThings: {
//                  name: 'nice'
//                  child: {
//                      bleep: 'blorp'    
//                  }
//              }
//          }
// defaults - default values for specified fields
//              ex: {
//                  name: 'default'
//                  otherThings.child.name: 'hello world'
//              }
export const insertHelper = async (args) => {
    console.log('IN INSERT HELPER')
    console.log(args.input);
    // Validate input format
    if (args.model.validationSchema) {
        const validateError = await validateArgs(args.model.validationSchema, args.input);
        if (validateError) return validateError;
    }
    // Find exposed fields of the main model being inserted (not any possible children)
    const base_fields = args.model.exposedFields().filter(f => f !== 'id' && f in args.input);
    console.log('GOT BASE FIELDS', base_fields)
    // Find defaults for the main model
    const base_defaults = args.defaults ? args.defaults.filter(f => !f.includes('.')) : {};
    console.log('GOT BASE DEFAULTS', base_defaults)
    // Combine data for exposed fields with defaults
    const base_data = _.merge(_.pick(args.input, base_fields), base_defaults);
    console.log('ABOT TO INSERT')
    console.log(base_data)
    // Create base model 
    const base_id = await db(args.model.name).returning('id').insert(base_data);

    // Handle model relationships
    // There are 3 scenarios:
    // 1: relationship is not included in data, so it is skipped
    // 2: relationship is a list of ids, which assigns each relationship id to an existing object
    //    (one-to-one ids are not included here, since they are part of the exposed fields)
    // 3: relationship is an object or lists of objects, which inserts each relationship object
    for (const relationship of args.model.relationships) {
        const id_name = `${relationship.classNames[0]}Ids`;
        const rel_defaults = args.defaults ? args.defaults.filter(f => f.includes(`.${relationship.name}`)).map(f => f.substring(f.indexOf('.')+1)) : {};
        const rel_model = MODELS.find(m => m.name === relationship.name);

        // Option 3
        if (relationship.name in args.input) {
            const rel_data = args.input[relationship.name];
            if (Array.isArray(rel_data)) {
                for (const curr_data of rel_data) {
                    await insertHelper({ model: rel_model, data: curr_data, defaults: rel_defaults })
                }
            } else {
                await insertHelper({ model: rel_model, data: rel_data, defaults: rel_defaults })
            }
            continue;
        }

        // Option 2
        if (id_name in args.input && relationship.type === REL_TYPE.Many) {
            await addChildRelationshipsHelper(rel_model, relationship.name, base_id, args.input[id_name]);
        } else if (id_name in args.input && relationship.type === REL_TYPE.ManyMany) {
            await insertJoinRowsHelper(rel_model, relationship.name, base_id, args.input[id_name]);
        }
    }

    // Return select query
    if (args.info) return (await fullSelectQueryHelper(args.model, args.info, base_id))[0];
}

// Updates a model's exposed fields, except for 'id' and those explicity excluded
// If the field is not in args, defaults to current field value
// If curr is not passed in, uses the id to query for it
// If a child does not have an ID, it is assumed that it will be inserted
// Returns the updated object
// Arguments:
// model - the model object, including its id
// info - GraphQL info
// validationSchema - format that data must be in
// input - the data being updated
// curr - an object containing the value's current data, or null
// deleteMissingRelationships - if true, deletes any relationships that are either set to null, or don't appear in their respective list
export const updateHelper = async (args) => {
    // Validate input format
    if (args.model.validationSchema) {
        const validateError = await validateArgs(args.model.validationSchema, args.input);
        if (validateError) return validateError;
    }
    // Find base id and current data
    const base_id = args.input.id || args.curr.id;
    if (!base_id) {
        console.error('ID must be passed into update helper, either explicitly or in data');
        return new CustomError(CODE.InvalidArgs);
    }
    const curr = args.curr || await db(args.model.name).where('id', base_id).first()
    console.log('IN UPDATE HELPER: CURR')
    console.log(curr);
    // Find exposed fields of the main model being inserted (not any possible children)
    const base_fields = args.model.exposedFields().filter(f => f !== 'id' && !(f in args.input));
    // Combine curr data with updating data
    const base_data = _.merge(curr, _.pick(args.input, base_fields));
    // Perform the base update
    await db(args.model.name).where('id', base_id).update(base_data);

    // Handle model relationships
    // There are 3 scenarios:
    // 1: relationship is an object or lists of objects, which updates each relationship object
    // 2: relationship is an id or list of ids, which assigns each relationship id to an existing object
    // 3: relationship is not included in data, so it is skipped
    for (const relationship of args.model.relationships) {
        const rel_model = relationship.getModel();
        console.log('REL MODEL ISSS');
        console.log(rel_model);

        // Option 1
        if (relationship.name in args.input) {
            const rel_data = args.input[relationship.name];
            // For security, query for valid ids
            let valid_ids;
            if (relationship.type === REL_TYPE.One) {
                valid_ids = [curr[`${relationship.classNames[0]}Id`]];
            } else if (relationship.type === REL_TYPE.Many) {
                valid_ids = (await db(relationship.classNames[0]).select('id').where(`${args.model.name}Id`, base_id)).filter(d => d.id);
            } else {
                valid_ids = (await db(relationship.classNames[1]).select(`${relationship.ids[1]}Id`).where(`${relationship.ids[0]}Id`, base_id)).filter(d => d[`${relationship.ids[1]}Id`]);
            }
            console.log('VALID IDS', valid_ids);

            // Helper for updating relationship object with field data
            // If not ID passed in, creates new object instead
            async function updateRelObject(input) {
                console.log("IN UPDATERELOBJECT");
                console.log(input);
                if (!input.id) {
                    await insertHelper({ model: rel_model, input: input });
                } else if (input.id in valid_ids) {
                    await updateHelper({ model: rel_model, input: input });
                } else {
                    console.error(`Failed to update child relationship for ${args.model.name} object: invalid ID`);
                }
            }

            if (Array.isArray(rel_data)) {
                for (const data of rel_data) {
                    await updateRelObject(data);
                }
            } else {
                await updateRelObject(rel_data);
            }
            continue;
        }

        // Option 2
        if (`${relationship.classNames[0]}Id` in args.input && relationship.type === REL_TYPE.One) {
            await updateChildRelationshipsHelper(rel_model, relationship.name, [args.input[`${relationship.classNames[0]}Id`]]);
        } else if (`${relationship.classNames[0]}Ids` in args.input && relationship.type === REL_TYPE.Many) {
            await updateChildRelationshipsHelper(rel_model, relationship.name, args.input[`${relationship.classNames[0]}Ids`]);
        } else if (`${relationship.classNames[0]}Ids` in args.input && relationship.type === REL_TYPE.ManyMany) {
            await updateJoinRowsHelper(rel_model, relationship.name, args.input[`${relationship.classNames[0]}Ids`]);
        }
    }


    // Return select query
    if (args.info) return (await fullSelectQueryHelper(args.model, args.info, args.id))[0];
}

// Deletes a list of rows from a table
// Returns a success or error message
// Arguments:
// table - a string of the table's name
// ids - an array of ids of the rows being deleted
export const deleteHelper = async (table, ids, column = 'id', ignoreDeleteCount = false) => {
    const numDeleted = await db(table).delete().whereIn(column, ids);
    return (ignoreDeleteCount || numDeleted === ids.length) ? 
        true : new CustomError(CODE.ErrorUnknown);
}