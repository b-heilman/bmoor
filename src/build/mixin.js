var bmoor = require('../core.js');

module.exports = function( to, from ){
	bmoor.iterate( from, function( val, key ){
		to[key] = val;
	});
};