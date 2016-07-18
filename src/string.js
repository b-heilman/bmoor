var bmoor = require('./core.js');

/**
 * Array helper functions
 * @module bmoor.string
 **/

function trim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp('^'+chr+'+|'+chr+'+$','g'), '' );
}

function ltrim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp('^'+chr+'+','g'), '' );
}

function rtrim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp(chr+'+$','g'), '' );
}

// TODO : eventually I will make getCommands and getFormatter more complicated, but for now
//        they work by staying simple
function getCommands( str ){
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
		rtn,
		dex,
		line,
		getter,
		command,
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
				return '| no close |';
			};
		}else if ( dex === 0 ){
			// is looks like this {{}}
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
			command = commands.shift().command;
			remainder = line.substr(dex+2);
			getter = bmoor.makeGetter( command );

			if ( commands.length ){
				getter = stackFunctions( getter, doFilters(commands,getter) );
			}
		}

		//let's optimize this a bit
		if ( fn ){
			// we have a child method
			rtn = function( obj ){
				return getter(obj)+remainder+fn(obj);
			};
			rtn.$vars = fn.$vars;
		}else{
			// this is the last variable
			rtn = function( obj ){
				return getter(obj)+remainder;
			};
			rtn.$vars = [];
		}

		if ( command ){
			rtn.$vars.push(command);
		}

		return rtn;
	}
}

function getFormatter( str ){
	var fn,
		rtn,
		lines = str.split(/{{/g);

	if ( lines.length > 1 ){
		str = lines.shift();
		fn = doVariable( lines );
		rtn = function( obj ){
			return str + fn( obj );
		};
		rtn.$vars = fn.$vars;
	}else{
		rtn = function(){
			return str;
		};
		rtn.$vars = [];
	}

	return rtn;
}

getFormatter.filters = filters;

module.exports = {
	trim: trim,
	ltrim: ltrim,
	rtrim: rtrim,
	getCommands: getCommands,
	getFormatter: getFormatter
};