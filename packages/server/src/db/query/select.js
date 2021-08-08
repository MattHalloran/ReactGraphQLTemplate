import { db } from './../db';
import { MODELS, REL_TYPE } from './../relationships';
import { manyToManyStrings, oneToManyStrings, oneToOneStrings } from './stringBuilder';

// Attempts to select the requested data from the database, in as little calls as possible.
// Examples:
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

class Label {
    constructor(right, join, left) {
        this.right = right;
        this.join = join;
        this.left = left;
    }
}

// Returns true if the specified relationship was requested
const inFields = (field, requested_fields) => requested_fields.some(f => f.includes(`${field}.`));

// Returns true if object is filled with nulls
const isNull = (object) => {
    if (object === null || object === undefined) return true;
    if (Array.isArray(object)) {
        return !object.some(o => !isNull(o));
    }
    return !Object.values(object).some(v => v !== null)
}

// Creates a string to select an object and its direct relationships
// className - which table to query
// ids - which ids to query data for
// reqTuples - 2D array describing the table's requested relationships
export const selectQuery = async (model, reqFields, ids) => {
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
    if (Array.isArray(ids)) {
        if (ids.length === 0) {
            console.warn('Requested an empty array of objects. Returning null');
            return [];
        }
        query += ` where "${leftLabel}"."id" in (${ids.map(i => `'${i}'`).join(', ')})`;
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

// Performs one or more select queries to retrieve all requested data.
// Attempts to make as little queries as possible.
// className - which table to query
// ids - which ids to query data for
// reqTuples - 2D array describing the table's requested relationships
export const select = (model, reqFields, ids) => {
    // TODO
    return selectQuery(model, reqFields, ids);
}