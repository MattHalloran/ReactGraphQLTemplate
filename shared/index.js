const api = require('./src/apiConsts');
const business = require('./src/businessConsts');
const model = require('./src/modelConsts');
const validation = require('./src/validation');
const status = require('./src/statusCodes.json');

module.exports = {
    ...api,
    ...business,
    ...model,
    ...validation,
    CODE: status
}