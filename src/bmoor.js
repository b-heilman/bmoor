var bmoor = Object.create( require('./core.js') );

bmoor.dom = require('./dom.js');
bmoor.data = require('./data.js');
bmoor.array = require('./array.js');
bmoor.object = require('./object.js');
bmoor.build = require('./build.js');
bmoor.string = require('./string.js');
bmoor.promise = require('./promise.js');

bmoor.decorators = require('./decorators.js');

module.exports = bmoor;