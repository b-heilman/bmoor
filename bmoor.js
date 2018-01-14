var bmoor = Object.create( require('./src/core.js') );

bmoor.dom = require('./src/dom.js');
bmoor.data = require('./src/data.js');
bmoor.flow = require('./src/flow.js');
bmoor.array = require('./src/array.js');
bmoor.build = require('./src/build.js');
bmoor.object = require('./src/object.js');
bmoor.string = require('./src/string.js');
bmoor.promise = require('./src/promise.js');

bmoor.Memory = require('./src/Memory.js');
bmoor.Eventing = require('./src/Eventing.js');

module.exports = bmoor;