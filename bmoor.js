var bmoor = Object.create( require('./src/core.js') );

bmoor.dom = require('./src/dom.js');
bmoor.data = require('./src/data.js');
bmoor.array = require('./src/array.js');
bmoor.object = require('./src/object.js');
bmoor.build = require('./src/build.js');
bmoor.string = require('./src/string.js');
bmoor.promise = require('./src/promise.js');

bmoor.interfaces = require('./src/interfaces.js');

module.exports = bmoor;