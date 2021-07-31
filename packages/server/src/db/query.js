
import { CODE } from '@local/shared';
import getFieldNames from 'graphql-list-fields';
import { db } from './db';
import { CustomError, validateArgs } from './error';
import _ from 'lodash';
import { MODELS, REL_TYPE } from './relationships';
import { selectQuery } from './query/select';


// Selects all requested data, including nested children, using the GraphQL info object
// Since a full select query only goes one child deep, we must combine the results
export const selectQueryHelper = async (model, info, ids) => {
    console.log('IN SELECT QUERY HELPERRRRRRRR');
    console.log(getFieldNames(info));
    const requested_fields = info ? getFieldNames(info) : [];
    return selectQuery(model, requested_fields, ids);
}

// Inserts joining table (many-to-many) rows
// **NOTE** - Only associates objects (i.e. only adds to the joining table)
// Arguments:
// model - the model object
// rel_name - the relationship's name
// main_id - id of main relationship object
// foreign_ids - array of foreign ids to be added
export const insertJoinRows = async (model, rel_name, main_id, foreign_ids) => {
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
export const deleteJoinRows = async (model, rel_name, main_id, foreign_ids) => {
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
    await insertJoinRows(model, rel_name, main_id, new_ids);
    // Determine and delete old rows
    const old_ids = existing_ids.filter(id => !foreign_ids.includes(id));
    await deleteJoinRows(model, rel_name, main_id, old_ids);
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

// // Creates a new row for an object, and handles associating it with a parent
// // Arguments
// // model - the model object
// // 
// export const insertChildRelationshipsHelper = async(args) {

// }

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
    if (args.info) return (await selectQueryHelper(args.model, args.info, base_id))[0];
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
                    //TODO
                    // await insertChildRelationshipsHelper({ model: rel_model, input: input });
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
    if (args.info) return (await selectQueryHelper(args.model, args.info, args.id))[0];
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