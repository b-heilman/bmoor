
var bmoor = Object.assign({}, require('./core.js'));

bmoor.array = require('./array.js');
bmoor.data = require('./data.js');
bmoor.eventing = require('./eventing/index.js');
bmoor.flow = require('./flow/index.js');
bmoor.lib = require('./lib/index.js');
bmoor.object = require('./object.js');
bmoor.promise = require('./promise.js');
bmoor.string = require('./string.js');

module.exports = bmoor;
