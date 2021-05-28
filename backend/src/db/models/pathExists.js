// Determines if a specific field is being requested in a GraphQL query or mutation
// Arguments:
// nodes: the field nodes of Apollo's info object
// path: an array of length 2, where the first index is
// a string of an object, and the second is a string of
// the field belonging to that object
export function pathExists(nodes, path) {
    if (!nodes) return false;
    const node = nodes.find(x => x.name.value === path[0]);
    if (!node) return false;
    return path.length === 1 || pathExists(node.selectionSet.selections, path.slice(1))
}