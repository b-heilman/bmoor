var bmoor = require('../core.js');

export default function( to, from ){
	bmoor.iterate( from, function( val, key ){
		to[key] = val;
	});
}