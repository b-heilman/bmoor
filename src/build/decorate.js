var bmoor = require('../core.js');

function override( key, target, action ){
	var old = target[key];
	
	if ( old === undefined ){
		target[key] = action;
	} else {
		if ( bmoor.isFunction(action) ){
			if ( bmoor.isFunction(old) ){
				target[key] = function(){
					var backup = this.$old,
						rtn;

					this.$old = old;

					rtn = action.apply( this, arguments );

					this.$old = backup;

					return rtn;
				};
			} else {
				console.log( 'attempting to decorate '+key+' an instance of '+typeof(old) );
			}
		}else{
			console.log( 'attempting to decorate with '+key+' and instance of '+typeof(action) );
		}
	}
}

module.exports = function( to, from ){
	bmoor.iterate( from, function( val, key ){
		override( key, to, val );
	});
};