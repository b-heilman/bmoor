var bmoor = require('../core.js');

function override( key, target, action, plugin ){
	var old = target[key];
	
	if ( old === undefined ){
		if ( bmoor.isFunction(action) ){
			target[key] = function(){
				return action.apply( plugin, arguments );
			};
		} else {
			target[key] = action;
		}
	} else {
		if ( bmoor.isFunction(action) ){
			if ( bmoor.isFunction(old) ){
				target[key] = function(){
					var backup = plugin.$old,
						reference = plugin.$target,
						rtn;

					plugin.$target = target;
					plugin.$old = function(){
						return old.apply( target, arguments );
					};

					rtn = action.apply( plugin, arguments );

					plugin.$old = backup;
					plugin.$target = reference;

					return rtn;
				};
			}else{
				console.log( 'attempting to plug-n-play '+key+' an instance of '+typeof(old) );
			}
		}else{
			console.log( 'attempting to plug-n-play with '+key+' and instance of '+typeof(action) );
		}
	}
}

export default function( to, from, ctx ){
	bmoor.iterate( from, function( val, key ){
		override( key, to, val, ctx );
	});
}