var bmoor = require('./core.js');

export function trim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp('^'+chr+'+|'+chr+'+$','g'), '' );
}

export function ltrim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp('^'+chr+'+','g'), '' );
}

export function rtrim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp(chr+'+$','g'), '' );
}

// TODO : eventually I will make getCommands and getFormatter more complicated, but for now
//        they work by staying simple
export function getCommands( str ){
	var commands = str.split('|');

	commands.forEach(function( command, key ){
		var args = command.split(':');

		args.forEach(function( arg, k ){
			args[k] = trim( arg );
		});

		commands[key] = {
			command: command,
			method: args.shift(),
			args: args
		};
	});

	return commands;
}

function stackFunctions( newer, older ){
	return function( o ){
		return older( newer(o) );
	};
}

var filters = {
	precision: function( dec ){
		dec = parseInt(dec,10);

		return function ( num ){
			return parseFloat(num,10).toFixed( dec );
		};
	},
	currency: function(){
		return function( num ){
			return '$'+num;
		};
	}
};

function doFilters( ters ){
	var fn,
		command,
		filter;

	while( ters.length ){
		command = ters.pop();
		fn = filters[command.method].apply(null,command.args);

		if ( filter ){
			filter = stackFunctions( fn, filter );
		}else{
			filter = fn;
		}
	}

	return filter;
}

function doVariable( lines ){
	var fn,
		dex,
		line,
		getter,
		commands,
		remainder;

	if ( !lines.length ){
		return null;
	}else{
		line = lines.shift();
		dex = line.indexOf('}}');
		fn = doVariable(lines);
		
		if ( dex === -1 ){
			return function(){
				return '--no close--';
			};
		}else if ( dex === 0 ){
			remainder = line.substr(2);
			getter = function( o ){
				if ( bmoor.isObject(o) ){
					return JSON.stringify(o);
				}else{
					return o;
				}
			};
		}else{
			commands = getCommands( line.substr(0,dex) );
			remainder = line.substr(dex+2);
			getter = bmoor.makeGetter( commands.shift().command );

			if( commands.length ){
				getter = stackFunctions( getter, doFilters(commands,getter) );
			}
		}

		//let's optimize this a bit
		if ( fn ){
			// we have a child method
			return function( obj ){
				return getter(obj)+remainder+fn(obj);
			};
		}else{
			// this is the last variable
			return function( obj ){
				return getter(obj)+remainder;
			};
		}
	}
}

export function getFormatter( str ){
	var fn,
		lines = str.split(/{{/g);

	if ( lines.length > 1 ){
		str = lines.shift();
		fn = doVariable( lines );

		return function( obj ){
			return str + fn( obj );
		};
	}else{
		return function(){
			return str;
		};
	}
}
getFormatter.filters = filters;